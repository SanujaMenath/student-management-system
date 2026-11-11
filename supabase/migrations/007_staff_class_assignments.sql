-- 1. Staff-to-Class Assignments
CREATE TABLE IF NOT EXISTS public.staff_class_assignments (
    id BIGSERIAL PRIMARY KEY,

    staff_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    class_id BIGINT NOT NULL
        REFERENCES public.classes(id)
        ON DELETE CASCADE,

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (staff_id, class_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.staff_class_assignments
ENABLE ROW LEVEL SECURITY;

-- 3. Admins can manage staff-class assignments
CREATE POLICY "Admins can manage staff assignments"
ON public.staff_class_assignments
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
);

-- 4. Staff can view their own assignments
CREATE POLICY "Staff can view own assignments"
ON public.staff_class_assignments
FOR SELECT TO authenticated
USING (
    staff_id = (SELECT auth.uid())
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'staff'
    )
);

-- 5. Remove the old unrestricted student policy
DROP POLICY IF EXISTS "Admin and staff can manage students"
ON public.students;

-- 6. Admins can manage all students
CREATE POLICY "Admins can manage all students"
ON public.students
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
);

-- 7. Staff can view students in assigned classes
CREATE POLICY "Staff can view assigned students"
ON public.students
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.staff_class_assignments
        WHERE staff_id = (SELECT auth.uid())
        AND class_id = students.class_id
    )
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'staff'
    )
);

-- 8. Validate staff role before assigning a class
CREATE OR REPLACE FUNCTION public.validate_staff_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = NEW.staff_id
          AND role = 'staff'
    ) THEN
        RAISE EXCEPTION
            'Only users with the staff role can be assigned to classes';
    END IF;

    RETURN NEW;
END;
$$;

-- 9. Run validation before inserting or updating
CREATE TRIGGER validate_staff_assignment_trigger
BEFORE INSERT OR UPDATE OF staff_id
ON public.staff_class_assignments
FOR EACH ROW
EXECUTE FUNCTION public.validate_staff_assignment();

-- 10. Ensure new users receive the parent role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role
    )
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            'New User'
        ),
        NEW.email,
        'parent'::public.user_role
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- 11. Prevent unauthorized profile role changes
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF current_user NOT IN ('postgres', 'service_role') THEN
            RAISE EXCEPTION
                'Only privileged database roles can change user roles';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 12. Protect the profile role column
CREATE TRIGGER prevent_unauthorized_role_change_trigger
BEFORE UPDATE OF role
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_unauthorized_role_change();

-- 13. Prevent changing the role of assigned staff
CREATE OR REPLACE FUNCTION public.prevent_assigned_staff_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF OLD.role = 'staff'
       AND NEW.role IS DISTINCT FROM OLD.role
       AND EXISTS (
           SELECT 1
           FROM public.staff_class_assignments
           WHERE staff_id = OLD.id
       )
    THEN
        RAISE EXCEPTION
            'Remove staff class assignments before changing this user role';
    END IF;

    RETURN NEW;
END;
$$;

-- 14. Validate role changes against existing assignments
CREATE TRIGGER prevent_assigned_staff_role_change_trigger
BEFORE UPDATE OF role
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_assigned_staff_role_change();
