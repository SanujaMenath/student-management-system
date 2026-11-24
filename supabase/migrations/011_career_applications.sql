BEGIN;

CREATE TABLE IF NOT EXISTS public.career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  cover_message TEXT NOT NULL,
  cv_storage_path TEXT,
  cv_original_name TEXT,
  cv_mime_type TEXT,
  cv_size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'Pending Review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT career_applications_status_check
    CHECK (status IN ('Pending Review', 'In Review', 'Interview Scheduled', 'Approved', 'Rejected'))
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'career_applications'
      AND policyname = 'Admins can manage career applications'
  ) THEN
    CREATE POLICY "Admins can manage career applications"
      ON public.career_applications
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'career-cvs',
  'career-cvs',
  false,
  5242880,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can access career CV files'
  ) THEN
    CREATE POLICY "Admins can access career CV files"
      ON storage.objects
      FOR ALL
      TO authenticated
      USING (
        bucket_id = 'career-cvs'
        AND EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
      )
      WITH CHECK (
        bucket_id = 'career-cvs'
        AND EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

COMMIT;
