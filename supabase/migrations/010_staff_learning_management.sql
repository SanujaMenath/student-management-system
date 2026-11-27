-- ==============================================================================
-- Migration: 010_staff_learning_management.sql
-- Module: Staff – Learning Management (IS5109 Community Project)
-- Purpose: 
--   1. Add profile_id bridge to public.staff referencing public.profiles(id).
--   2. Add partial unique index on staff.profile_id (preserves existing unlinked records).
--   3. Create public.learning_materials table with RESTRICT constraint on class deletion.
--   4. Define safe storage path parser functions supporting up to 19-digit BIGINTs with overflow guards.
--   5. Enforce path-metadata consistency constraints on public.learning_materials.
--   6. Enable RLS and define scoped policies for public.learning_materials.
--   7. Create/configure private 'learning-materials' storage bucket (with safe conflict update).
--   8. Define scoped Storage RLS policies for storage.objects enforcing strict path validation,
--      database-record-backed read security, and uploader-level deletion.
--
-- Storage Path Convention:
--   classes/<class_id>/<uploader_profile_id>/<file_uuid>.<extension>
-- ==============================================================================

-- 1. Bridge public.staff to public.profiles (Auth User ID)
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Partial unique index: allows multiple NULLs, enforces 1-to-1 once linked
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_profile_id
  ON public.staff(profile_id)
  WHERE profile_id IS NOT NULL;

-- 3. Create public.learning_materials Table
-- Note: class_id uses ON DELETE RESTRICT to prevent physical storage files from being orphaned.
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  class_id BIGINT NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  file_type TEXT NOT NULL CHECK (file_type IN ('PDF', 'Document', 'Video', 'Image', 'Other')),
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_materials_class_id 
  ON public.learning_materials(class_id);

CREATE INDEX IF NOT EXISTS idx_learning_materials_subject 
  ON public.learning_materials(subject);

CREATE INDEX IF NOT EXISTS idx_learning_materials_uploaded_by 
  ON public.learning_materials(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_learning_materials_storage_path 
  ON public.learning_materials(storage_path);

-- 4. Safe Storage Path Parser Functions
-- Convention: classes/<class_id>/<uploader_profile_id>/<file_uuid>.<extension>

-- 4.1 Extract Class ID (BIGINT)
-- Supports valid 19-digit BIGINTs (up to 9,223,372,036,854,775,807) while safely catching overflows.
CREATE OR REPLACE FUNCTION public.get_class_id_from_storage_path(object_path text)
RETURNS bigint
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  matches text[];
  parsed_id bigint;
BEGIN
  IF object_path IS NULL THEN
    RETURN NULL;
  END IF;

  -- Match 'classes/<1_to_19_digits>/<uuid>/<filename>'
  matches := regexp_match(
    object_path, 
    '^classes/([0-9]{1,19})/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[^/]+$'
  );
  IF matches IS NULL THEN
    RETURN NULL;
  END IF;

  BEGIN
    parsed_id := matches[1]::bigint;
    RETURN parsed_id;
  EXCEPTION
    WHEN numeric_value_out_of_range OR invalid_text_representation THEN
      RETURN NULL;
  END;
END;
$$;

-- 4.2 Extract Uploader Profile ID (UUID)
CREATE OR REPLACE FUNCTION public.get_uploader_id_from_storage_path(object_path text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  matches text[];
  parsed_uuid uuid;
BEGIN
  IF object_path IS NULL THEN
    RETURN NULL;
  END IF;

  -- Match 'classes/<digits>/<uuid>/<filename>'
  matches := regexp_match(
    object_path, 
    '^classes/[0-9]{1,19}/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/[^/]+$'
  );
  IF matches IS NULL THEN
    RETURN NULL;
  END IF;

  BEGIN
    parsed_uuid := matches[1]::uuid;
    RETURN parsed_uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN NULL;
  END;
END;
$$;

-- 5. Enforce Consistency Between Database Metadata and Storage Path
-- Malformed paths return NULL from the parser functions and are explicitly rejected by IS NOT NULL.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_storage_path_class_id'
  ) THEN
    ALTER TABLE public.learning_materials
      ADD CONSTRAINT check_storage_path_class_id
      CHECK (
        public.get_class_id_from_storage_path(storage_path) IS NOT NULL 
        AND public.get_class_id_from_storage_path(storage_path) = class_id
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_storage_path_uploader_id'
  ) THEN
    ALTER TABLE public.learning_materials
      ADD CONSTRAINT check_storage_path_uploader_id
      CHECK (
        public.get_uploader_id_from_storage_path(storage_path) IS NOT NULL 
        AND public.get_uploader_id_from_storage_path(storage_path) = uploaded_by
      );
  END IF;
END$$;

-- 6. Enable Row Level Security (RLS) on learning_materials
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;

-- Policy 6.1: SELECT
-- Admins can view all; Staff can view materials for assigned classes; Parents can view for enrolled classes
DROP POLICY IF EXISTS "Staff and Parents can view class learning materials" ON public.learning_materials;
CREATE POLICY "Staff and Parents can view class learning materials"
ON public.learning_materials FOR SELECT TO authenticated
USING (
  -- Admin access
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
  OR
  -- Staff access (teacher of assigned class)
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.staff st ON st.id = c.teacher_id
    WHERE c.id = learning_materials.class_id
      AND st.profile_id = auth.uid()
  )
  OR
  -- Parent access (child enrolled in this class)
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.parent_id = auth.uid()
      AND s.class_id = learning_materials.class_id
  )
);

-- Policy 6.2: INSERT
-- Admins and assigned staff can upload
DROP POLICY IF EXISTS "Staff can insert learning materials for assigned class" ON public.learning_materials;
CREATE POLICY "Staff can insert learning materials for assigned class"
ON public.learning_materials FOR INSERT TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.staff st ON st.id = c.teacher_id
      WHERE c.id = learning_materials.class_id
        AND st.profile_id = auth.uid()
    )
  )
);

-- Policy 6.3: DELETE
-- Admins and the original staff uploader (if still assigned) can delete
DROP POLICY IF EXISTS "Staff can delete own learning materials" ON public.learning_materials;
CREATE POLICY "Staff can delete own learning materials"
ON public.learning_materials FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
  OR
  (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.staff st ON st.id = c.teacher_id
      WHERE c.id = learning_materials.class_id
        AND st.profile_id = auth.uid()
    )
  )
);

-- 7. Create or Reconfigure Private Supabase Storage Bucket
-- Uses ON CONFLICT DO UPDATE to ensure existing buckets cannot retain insecure public settings.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'learning-materials',
  'learning-materials',
  false, -- Strictly private
  26214400, -- 25 MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'text/rtf',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'text/rtf',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ];

-- 8. Storage RLS Policies (storage.objects)

-- Policy 8.1: Storage READ (SELECT)
-- Requires matching database record in public.learning_materials (evaluated with user's table RLS)
-- Prevents unlisted or orphaned storage files from being read.
DROP POLICY IF EXISTS "Authenticated users can read authorized learning materials" ON storage.objects;
CREATE POLICY "Authenticated users can read authorized learning materials"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'learning-materials'
  AND (
    -- Admin full access
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    -- Regular user must have access to a matching database record
    EXISTS (
      SELECT 1 FROM public.learning_materials lm
      WHERE lm.storage_path = storage.objects.name
    )
  )
);

-- Policy 8.2: Storage UPLOAD (INSERT)
-- Both Admins and Staff MUST satisfy common path and uploader validation:
-- 1. Path uploader ID must equal auth.uid() (admins cannot forge uploader ID)
-- 2. Path class ID must exist in public.classes
-- Then: Admins can upload to any existing class; Staff only to assigned classes.
DROP POLICY IF EXISTS "Staff can upload learning materials to assigned class" ON storage.objects;
CREATE POLICY "Staff can upload learning materials to assigned class"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'learning-materials'
  AND
  -- Common Requirement 1: Uploader UUID in path must strictly match authenticated user
  public.get_uploader_id_from_storage_path(storage.objects.name) = auth.uid()
  AND
  -- Common Requirement 2: Class ID in path must exist in public.classes
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = public.get_class_id_from_storage_path(storage.objects.name)
  )
  AND
  -- Authorization: Admin can upload to any existing class; Staff only to assigned classes
  (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.staff st ON st.id = c.teacher_id
      WHERE st.profile_id = auth.uid()
        AND c.id = public.get_class_id_from_storage_path(storage.objects.name)
    )
  )
);

-- Policy 8.3: Storage DELETE
-- Staff can delete ONLY files uploaded under their own profile ID in their assigned class.
-- Crucial: Does NOT depend on the existence of a learning_materials row, enabling clean
-- two-step deletion (DB row deleted first, then storage object removed).
DROP POLICY IF EXISTS "Staff can delete own class learning materials" ON storage.objects;
CREATE POLICY "Staff can delete own class learning materials"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'learning-materials'
  AND (
    -- Admin access
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    (
      -- Path uploader ID must strictly match current user
      public.get_uploader_id_from_storage_path(storage.objects.name) = auth.uid()
      AND
      -- User must be the assigned teacher for the class ID in the path
      EXISTS (
        SELECT 1 FROM public.classes c
        JOIN public.staff st ON st.id = c.teacher_id
        WHERE st.profile_id = auth.uid()
          AND c.id = public.get_class_id_from_storage_path(storage.objects.name)
      )
    )
  )
);
