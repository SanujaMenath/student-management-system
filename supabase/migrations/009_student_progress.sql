-- Student Progress Records
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL
        REFERENCES public.students(id) ON DELETE CASCADE,

    staff_id UUID NOT NULL
        REFERENCES public.profiles(id) ON DELETE RESTRICT,

    learning_area TEXT NOT NULL
        CHECK (learning_area IN (
            'Language and literacy',
            'Numeracy',
            'Creative activities',
            'Social development',
            'Physical development'
        )),

    progress_level TEXT NOT NULL
        CHECK (progress_level IN (
            'Excellent progress',
            'Developing well',
            'Needs reading support'
        )),

    teacher_note TEXT,

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_id
    ON public.student_progress(student_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_staff_id
    ON public.student_progress(staff_id);

ALTER TABLE public.student_progress
    ENABLE ROW LEVEL SECURITY;

-- Admins can manage all student progress records
DROP POLICY IF EXISTS "Admins can manage student progress" ON public.student_progress;
CREATE POLICY "Admins can manage student progress"
ON public.student_progress
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    )
);

-- Staff can view progress for students in assigned classes
DROP POLICY IF EXISTS "Staff can view assigned student progress" ON public.student_progress;
CREATE POLICY "Staff can view assigned student progress"
ON public.student_progress
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.students s
        JOIN public.classes c ON c.id = s.class_id
        JOIN public.staff st ON st.id = c.teacher_id
        WHERE s.id = student_progress.student_id
          AND st.profile_id = auth.uid()
    )
);

-- Staff can record progress for students in assigned classes
DROP POLICY IF EXISTS "Staff can record assigned student progress" ON public.student_progress;
CREATE POLICY "Staff can record assigned student progress"
ON public.student_progress
FOR INSERT
TO authenticated
WITH CHECK (
    staff_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'staff'
    )
    AND EXISTS (
        SELECT 1
        FROM public.students s
        JOIN public.classes c ON c.id = s.class_id
        JOIN public.staff st ON st.id = c.teacher_id
        WHERE s.id = student_progress.student_id
          AND st.profile_id = auth.uid()
    )
);

-- Parents can view progress for their own children
DROP POLICY IF EXISTS "Parents can view own children progress" ON public.student_progress;
CREATE POLICY "Parents can view own children progress"
ON public.student_progress
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.students s
        WHERE s.id = student_progress.student_id
          AND s.parent_id = auth.uid()
    )
);


DROP POLICY IF EXISTS "Admin and staff can manage students" ON public.students;
DROP POLICY IF EXISTS "Admin and staff manage students" ON public.students;

DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;
CREATE POLICY "Admins can manage all students"
ON public.students
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Staff can view assigned students" ON public.students;
CREATE POLICY "Staff can view assigned students"
ON public.students
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.classes c
        JOIN public.staff st ON st.id = c.teacher_id
        WHERE c.id = students.class_id
          AND st.profile_id = auth.uid()
    )
);