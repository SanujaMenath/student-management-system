-- 1. Classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    room_number TEXT,
    capacity INTEGER CHECK (capacity >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_number TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    blood_group TEXT,
    allergies TEXT,
    emergency_contact TEXT NOT NULL,
    class_id BIGINT REFERENCES public.classes(id)
        ON DELETE SET NULL,
    parent_id UUID REFERENCES public.profiles(id)
        ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Active'
        CHECK (status IN (
            'Active',
            'Needs attention',
            'Inactive',
            'Graduated'
        )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. Classes: authenticated users can view
CREATE POLICY "Authenticated users can view classes"
ON public.classes
FOR SELECT TO authenticated
USING (true);

-- 5. Classes: admin can manage
CREATE POLICY "Admins can manage classes"
ON public.classes
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

-- 6. Students: admin and staff can manage
CREATE POLICY "Admin and staff can manage students"
ON public.students
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role IN ('admin', 'staff')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role IN ('admin', 'staff')
    )
);

-- 7. Parents can view their own children
CREATE POLICY "Parents can view own children"
ON public.students
FOR SELECT TO authenticated
USING (
    parent_id = (SELECT auth.uid())
);
