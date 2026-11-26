-- ==============================================================================
-- Migration: 012_staff_communication.sql
-- Module: Staff & Admin – Communication (Module 12 / Module 6)
-- Purpose:
--   1. Create public.incident_reports table for student incident tracking with
--      strict foreign key references to students, classes, profiles, and staff.
--   2. Create public.notifications table for system and user alert messaging.
--   3. Create safe storage path parser function for incident attachment files.
--   4. Configure private 'incident-attachments' storage bucket with strict 10MB limit
--      and authorized MIME type allowlist.
--   5. Enable Row Level Security (RLS) and define granular security policies for
--      incident_reports, notifications, and storage.objects.
--   6. Create performance indexes for relational joins, filters, and timeline ordering.
--
-- Storage Path Convention:
--   incidents/<reporter_profile_id>/<file_uuid>.<extension>
-- ==============================================================================

-- 1. Create Incident Reports Table
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  class_id BIGINT NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  reporter_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  staff_id TEXT NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
  incident_date DATE NOT NULL,
  incident_type TEXT NOT NULL CHECK (
    incident_type IN ('Injury', 'Illness', 'Behavioral', 'Safety Concern', 'Other')
  ),
  description TEXT NOT NULL,
  action_taken TEXT,
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (
    status IN ('Submitted', 'Under Review', 'Resolved')
  ),
  admin_notes TEXT,
  attachment_path TEXT,
  attachment_name TEXT,
  attachment_size INTEGER CHECK (attachment_size IS NULL OR attachment_size > 0),
  attachment_mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Incident Reports
CREATE INDEX IF NOT EXISTS idx_incident_reports_student_id
  ON public.incident_reports(student_id);

CREATE INDEX IF NOT EXISTS idx_incident_reports_class_id
  ON public.incident_reports(class_id);

CREATE INDEX IF NOT EXISTS idx_incident_reports_reporter_profile_id
  ON public.incident_reports(reporter_profile_id);

CREATE INDEX IF NOT EXISTS idx_incident_reports_staff_id
  ON public.incident_reports(staff_id);

CREATE INDEX IF NOT EXISTS idx_incident_reports_incident_date
  ON public.incident_reports(incident_date DESC);

CREATE INDEX IF NOT EXISTS idx_incident_reports_status
  ON public.incident_reports(status);

CREATE INDEX IF NOT EXISTS idx_incident_reports_created_at
  ON public.incident_reports(created_at DESC);


-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (
    type IN ('info', 'warning', 'success', 'alert', 'announcement', 'incident')
  ),
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, is_read, created_at DESC);


-- 3. Storage Helper Functions

-- 3.1 Extract uploader profile UUID from path: incidents/<reporter_profile_id>/<file_uuid>.<ext>
CREATE OR REPLACE FUNCTION public.get_uploader_from_incident_path(object_path text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  matches text[];
BEGIN
  IF object_path IS NULL THEN
    RETURN NULL;
  END IF;

  matches := regexp_match(
    object_path,
    '^incidents/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/[^/]+$'
  );
  IF matches IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN matches[1]::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- 3.2 Check if an attachment path is referenced by any incident report.
-- Runs with SECURITY DEFINER to bypass table-level RLS on public.incident_reports,
-- preventing RLS visibility boundaries from hiding referencing reports from the uploader.
-- Enforces that the calling user (auth.uid()) is the uploader of the path before checking,
-- preventing unauthorized users from probing reference status of arbitrary paths.
CREATE OR REPLACE FUNCTION public.is_incident_attachment_referenced(object_path text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF object_path IS NULL OR object_path = '' THEN
    RETURN false;
  END IF;

  -- Verify path ownership: calling user must match the uploader extracted from the path
  IF public.get_uploader_from_incident_path(object_path) IS NULL
     OR auth.uid() IS NULL
     OR public.get_uploader_from_incident_path(object_path) <> auth.uid() THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.incident_reports ir
    WHERE ir.attachment_path = object_path
  );
END;
$$;

-- Restrict execution permissions: only authenticated users can check attachment reference status
REVOKE ALL ON FUNCTION public.is_incident_attachment_referenced(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_incident_attachment_referenced(text) TO authenticated;


-- 4. Create or Reconfigure Private Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'incident-attachments',
  'incident-attachments',
  false, -- Strictly private
  10485760, -- 10 MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];


-- 5. Row Level Security: public.incident_reports
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- 5.1 SELECT Policy:
-- Staff can view incident reports they submitted.
-- Admins can view all incident reports across all classes.
DROP POLICY IF EXISTS "Staff and Admin can view incident reports" ON public.incident_reports;
CREATE POLICY "Staff and Admin can view incident reports"
  ON public.incident_reports FOR SELECT
  TO authenticated
  USING (
    reporter_profile_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 5.2 INSERT Policy:
-- Staff can insert incident reports for active students enrolled in classes assigned to them.
-- Enforces:
--   1. reporter_profile_id matches authenticated user (auth.uid()).
--   2. Authenticated user profile has 'staff' role.
--   3. Institutional staff record links to auth.uid(), matches incident_reports.staff_id, and has status = 'Active'.
--   4. Staff member is the assigned teacher of incident_reports.class_id.
--   5. Target student belongs to incident_reports.class_id and has status = 'Active'.
-- Admin accounts retain full submission privileges.
DROP POLICY IF EXISTS "Staff and Admin can submit incident reports" ON public.incident_reports;
CREATE POLICY "Staff and Admin can submit incident reports"
  ON public.incident_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      -- Staff submission check
      reporter_profile_id = auth.uid()
      AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'staff'
      )
      AND
      EXISTS (
        SELECT 1 FROM public.classes c
        JOIN public.staff s ON c.teacher_id = s.id
        WHERE s.profile_id = auth.uid()
          AND s.id = incident_reports.staff_id
          AND s.status = 'Active'
          AND c.id = incident_reports.class_id
      )
      AND
      EXISTS (
        SELECT 1 FROM public.students st
        WHERE st.id = incident_reports.student_id
          AND st.class_id = incident_reports.class_id
          AND st.status = 'Active'
      )
    )
    OR
    (
      -- Admin submission check
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );

-- 5.3 UPDATE Policy:
-- Only administrators can update incident reports (e.g. status, admin_notes).
-- Staff cannot modify incident reports after submission.
DROP POLICY IF EXISTS "Admins and reporting staff can update incident reports" ON public.incident_reports;
DROP POLICY IF EXISTS "Admins can update incident reports" ON public.incident_reports;
CREATE POLICY "Admins can update incident reports"
  ON public.incident_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 6. Row Level Security: public.notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6.1 SELECT Policy: Users can view their own notifications; Admins can view all.
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 6.2 UPDATE Policy: Users can update their own notifications (e.g. mark as read).
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6.3 INSERT Policy: Admins can create notifications for any user; Staff only for themselves.
DROP POLICY IF EXISTS "Staff and Admins can create notifications" ON public.notifications;
CREATE POLICY "Staff and Admins can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admin can create notifications for any user
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    (
      -- Staff can create notifications only for themselves
      user_id = auth.uid()
      AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'staff'
      )
    )
  );


-- 7. Storage Row Level Security: storage.objects (incident-attachments bucket)

-- 7.1 Storage SELECT (Download / Read)
DROP POLICY IF EXISTS "Authorized users can read incident attachments" ON storage.objects;
CREATE POLICY "Authorized users can read incident attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'incident-attachments'
    AND (
      -- Admin full access
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
      OR
      -- Uploader access
      public.get_uploader_from_incident_path(name) = auth.uid()
      OR
      -- Associated incident report viewer access
      EXISTS (
        SELECT 1 FROM public.incident_reports ir
        WHERE ir.attachment_path = storage.objects.name
          AND (
            ir.reporter_profile_id = auth.uid()
            OR
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
          )
      )
    )
  );

-- 7.2 Storage INSERT (Upload)
-- Enforces that uploader UUID in path must match auth.uid(), and user must be staff or admin.
DROP POLICY IF EXISTS "Staff and Admin can upload incident attachments" ON storage.objects;
CREATE POLICY "Staff and Admin can upload incident attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'incident-attachments'
    AND
    public.get_uploader_from_incident_path(name) = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin')
    )
  );

-- 7.3 Storage DELETE (Rollback / Deletion)
-- Admins can delete any incident attachment.
-- Staff uploaders can delete an attachment ONLY if it is not referenced by any
-- incident report (enables atomic rollback during failed submissions while
-- preventing deletion of submitted attachments).
-- Uses SECURITY DEFINER helper to prevent RLS visibility masking.
DROP POLICY IF EXISTS "Staff and Admin can delete incident attachments" ON storage.objects;
CREATE POLICY "Staff and Admin can delete incident attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'incident-attachments'
    AND (
      -- Admin full deletion access
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
      OR
      (
        -- Original uploader can only delete unreferenced / orphaned files (e.g. failed submission rollback)
        public.get_uploader_from_incident_path(name) = auth.uid()
        AND
        NOT public.is_incident_attachment_referenced(name)
      )
    )
  );
