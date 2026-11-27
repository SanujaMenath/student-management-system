'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  MAX_INCIDENT_ATTACHMENT_SIZE,
  resolveIncidentAttachmentMimeType,
  uploadIncidentAttachmentFile,
  deleteIncidentAttachmentFile,
  getIncidentAttachmentSignedUrl,
} from '@/lib/incident-attachments-storage';
import type {
  IncidentType,
  IncidentReportItem,
  IncidentActionResult,
  AssignedStudentOption,
  StaffAnnouncementItem,
  StaffNoticeItem,
  StaffNotificationItem,
  GetStaffAnnouncementsResponse,
  GetStaffNoticesResponse,
  GetStaffNotificationsResponse,
  GetAssignedStudentsResponse,
  GetStaffIncidentReportsResponse,
  SignedUrlResult,
} from '@/types/communication';

const VALID_INCIDENT_TYPES: readonly IncidentType[] = [
  'Injury',
  'Illness',
  'Behavioral',
  'Safety Concern',
  'Other',
];

interface RawJoinedStudent {
  id: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
}

interface RawJoinedClass {
  id: number;
  name: string;
}

interface RawIncidentReportRow {
  id: string;
  student_id: string;
  class_id: number;
  reporter_profile_id: string;
  staff_id: string;
  incident_date: string;
  incident_type: IncidentType;
  description: string;
  action_taken: string | null;
  status: 'Submitted' | 'Under Review' | 'Resolved';
  admin_notes: string | null;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_size: number | null;
  attachment_mime_type: string | null;
  created_at: string;
  updated_at: string;
  students?: RawJoinedStudent | RawJoinedStudent[] | null;
  classes?: RawJoinedClass | RawJoinedClass[] | null;
  staff?: { full_name?: string } | { full_name?: string }[] | null;
}

/**
 * Safely escapes a search term for use in PostgREST .or() filter expressions.
 * Encloses the pattern in double quotes and escapes backslashes and double quotes,
 * ensuring commas, parentheses, colons, and special characters remain literal string values
 * without altering the PostgREST boolean filter AST structure.
 */
function escapePostgrestFilterPattern(term: string): string {
  const sanitized = term
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
  return `"%${sanitized}%"`;
}

/**
 * Validates that an incident date string:
 * 1. Strictly conforms to the 'YYYY-MM-DD' format.
 * 2. Represents a valid, real calendar date (rejecting impossible dates like 2026-02-30).
 * 3. Does not represent a future date.
 */
function validateIncidentDate(dateStr: string): { valid: boolean; error?: string } {
  if (!dateStr) {
    return { valid: false, error: 'Incident date is required.' };
  }

  // 1. Strict YYYY-MM-DD format check
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return { valid: false, error: 'Incident date must be in YYYY-MM-DD format.' };
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10); // 1 - 12
  const day = parseInt(match[3], 10);   // 1 - 31

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid incident date format.' };
  }

  // 2. Reject impossible calendar dates (e.g. 2026-02-30, leap years, 30-day months)
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return { valid: false, error: 'Invalid calendar date.' };
  }

  // 3. Reject future incident dates
  const now = new Date();
  const todayEndUtc = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  );
  if (utcDate > todayEndUtc) {
    return { valid: false, error: 'Incident date cannot be in the future.' };
  }

  return { valid: true };
}

/**
 * Resolves the authenticated staff context and their assigned classes.
 *
 * Identity and Assignment Resolution Chain:
 * 1. Authenticated User (auth.users.id) via Supabase Auth session
 * 2. User Profile (public.profiles.id) verifying role = 'staff'
 * 3. Staff Entity (public.staff.id) via staff.profile_id = user.id (status = 'Active')
 * 4. Assigned Classes (public.classes) via classes.teacher_id = staff.id
 */
async function getAuthenticatedStaffContext() {
  const supabase = await createClient();

  // 1. Authenticate user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: 'Authentication required. Please log in to continue.',
      status: 401,
    };
  }

  // 2. Verify user profile and role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      error: 'User profile not found. Please contact administration.',
      status: 404,
    };
  }

  if (profile.role !== 'staff') {
    return {
      error: 'Access denied. Only staff members can perform this action.',
      status: 403,
    };
  }

  // 3. Resolve institutional staff identity linked to this profile
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('id, full_name, role, status')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (staffError) {
    return {
      error: `Failed to query staff record: ${staffError.message}`,
      status: 500,
    };
  }

  if (!staff) {
    return {
      error:
        'Your account is not yet linked to an institutional staff profile. Please contact the administrator to complete your assignment.',
      status: 404,
    };
  }

  if (staff.status !== 'Active') {
    return {
      error: `Your staff account is currently marked as "${staff.status}". Only active teachers can perform communication operations.`,
      status: 403,
    };
  }

  // 4. Retrieve classes assigned to this teacher
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('id, name, room_number, age_group, schedule')
    .eq('teacher_id', staff.id)
    .order('name', { ascending: true });

  if (classesError) {
    return {
      error: `Failed to retrieve assigned classes: ${classesError.message}`,
      status: 500,
    };
  }

  return {
    supabase,
    user,
    profile,
    staff,
    classes: classes ?? [],
  };
}

/**
 * 1. Fetch Staff Announcements (Tab 1: Announcements)
 * Scoped to announcements for 'All Classes', 'Staff', or the teacher's assigned classes.
 */
export async function getStaffAnnouncements(filter?: {
  category?: string;
  search?: string;
}): Promise<GetStaffAnnouncementsResponse> {
  const context = await getAuthenticatedStaffContext();
  if ('error' in context) {
    return {
      success: false,
      announcements: [],
      error: context.error,
    };
  }

  const { supabase, classes } = context;
  const assignedClassNames = classes.map((c) => c.name);

  try {
    let query = supabase
      .from('announcements')
      .select('id, title, category, content, target_class, published_by, published_at, is_important')
      .order('is_important', { ascending: false })
      .order('published_at', { ascending: false });

    // Optional category filter
    if (filter?.category && filter.category !== 'all') {
      query = query.eq('category', filter.category);
    }

    // Optional search term filter across title and content (safely quoted and escaped)
    if (filter?.search?.trim()) {
      const pattern = escapePostgrestFilterPattern(filter.search.trim());
      query = query.or(`title.ilike.${pattern},content.ilike.${pattern}`);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        announcements: [],
        error: `Failed to load announcements: ${error.message}`,
      };
    }

    // Audience filter: Staff members see announcements targeted to All Classes, Staff, or their assigned classes
    // Normalized using trim() and case-insensitive matching
    const staffAnnouncements: StaffAnnouncementItem[] = (data || []).filter((item) => {
      const normalizedTarget = (item.target_class || '').trim().toLowerCase();
      if (!normalizedTarget || normalizedTarget === 'all classes' || normalizedTarget === 'staff') {
        return true;
      }
      return assignedClassNames.some(
        (className) => className.trim().toLowerCase() === normalizedTarget
      );
    });

    return {
      success: true,
      announcements: staffAnnouncements,
    };
  } catch (err) {
    return {
      success: false,
      announcements: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred while fetching announcements.',
    };
  }
}

/**
 * 2. Fetch Staff Notices (Tab 2: Notices)
 * Official administrative circulars, guidelines, term dates, and policy notices.
 */
export async function getStaffNotices(filter?: {
  category?: string;
  search?: string;
}): Promise<GetStaffNoticesResponse> {
  const context = await getAuthenticatedStaffContext();
  if ('error' in context) {
    return {
      success: false,
      notices: [],
      error: context.error,
    };
  }

  const { supabase, classes } = context;
  const assignedClassNames = classes.map((c) => c.name);

  try {
    let query = supabase
      .from('announcements')
      .select('id, title, category, content, target_class, published_by, published_at, is_important')
      .order('is_important', { ascending: false })
      .order('published_at', { ascending: false });

    // Category filter: applied if explicitly provided by caller
    if (filter?.category && filter.category !== 'all') {
      query = query.eq('category', filter.category);
    }

    // Search filter across title and content (safely quoted and escaped)
    if (filter?.search?.trim()) {
      const pattern = escapePostgrestFilterPattern(filter.search.trim());
      query = query.or(`title.ilike.${pattern},content.ilike.${pattern}`);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        notices: [],
        error: `Failed to load notices: ${error.message}`,
      };
    }

    // Audience filter: normalized using trim() and case-insensitive matching
    const staffNotices: StaffNoticeItem[] = (data || []).filter((item) => {
      const normalizedTarget = (item.target_class || '').trim().toLowerCase();
      if (!normalizedTarget || normalizedTarget === 'all classes' || normalizedTarget === 'staff') {
        return true;
      }
      return assignedClassNames.some(
        (className) => className.trim().toLowerCase() === normalizedTarget
      );
    });

    return {
      success: true,
      notices: staffNotices,
    };
  } catch (err) {
    return {
      success: false,
      notices: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred while fetching notices.',
    };
  }
}

/**
 * 3. Fetch Staff Personal / System Notifications (Tab 3: Notifications)
 * Includes graceful fallback if public.notifications has not yet been applied.
 */
export async function getStaffNotifications(): Promise<GetStaffNotificationsResponse> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      error: 'Authentication required. Please log in to view notifications.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, title, message, type, is_read, link, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      // Graceful fallback for unapplied migration (Postgres 42P01: relation does not exist)
      if (error.code === '42P01' || error.message?.includes('relation "public.notifications" does not exist')) {
        return {
          success: true,
          notifications: [],
          unreadCount: 0,
        };
      }
      return {
        success: false,
        notifications: [],
        unreadCount: 0,
        error: `Failed to load notifications: ${error.message}`,
      };
    }

    const notifications: StaffNotificationItem[] = (data || []).map((item) => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      message: item.message,
      type: item.type,
      is_read: item.is_read,
      link: item.link,
      created_at: item.created_at,
    }));

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (err) {
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      error: err instanceof Error ? err.message : 'An unexpected error occurred while loading notifications.',
    };
  }
}

/**
 * 4. Mark a specific notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Authentication required.' };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      if (error.code === '42P01') {
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    revalidatePath('/staff/communication');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update notification.',
    };
  }
}

/**
 * 5. Mark all user notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  error?: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Authentication required.' };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      if (error.code === '42P01') {
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    revalidatePath('/staff/communication');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update notifications.',
    };
  }
}

/**
 * 6. Get Students Enrolled in the Staff Member's Assigned Classes
 * For populating the student selection dropdown in the Incident Reporting form.
 */
export async function getStaffAssignedStudentsForIncidents(): Promise<GetAssignedStudentsResponse> {
  const context = await getAuthenticatedStaffContext();
  if ('error' in context) {
    return {
      success: false,
      students: [],
      error: context.error,
    };
  }

  const { supabase, classes } = context;
  if (!classes || classes.length === 0) {
    return {
      success: true,
      students: [],
    };
  }

  const classIds = classes.map((c) => c.id);
  const classMap = new Map(classes.map((c) => [c.id, c.name]));

  try {
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, admission_number, first_name, last_name, class_id')
      .in('class_id', classIds)
      .eq('status', 'Active')
      .order('first_name', { ascending: true });

    if (studentsError) {
      return {
        success: false,
        students: [],
        error: `Failed to load students: ${studentsError.message}`,
      };
    }

    const studentOptions: AssignedStudentOption[] = (students || []).map((s) => ({
      id: s.id,
      admission_number: s.admission_number,
      first_name: s.first_name,
      last_name: s.last_name,
      full_name: `${s.first_name} ${s.last_name}`,
      class_id: s.class_id,
      class_name: classMap.get(s.class_id) || 'Assigned Class',
    }));

    return {
      success: true,
      students: studentOptions,
    };
  } catch (err) {
    return {
      success: false,
      students: [],
      error: err instanceof Error ? err.message : 'Failed to load students for incident reporting.',
    };
  }
}

/**
 * 7. Submit Incident Report
 * Server action validating inputs, verifying teacher assignment, uploading attachment with rollback guard,
 * and recording the incident report.
 */
export async function submitIncidentReport(
  formData: FormData
): Promise<IncidentActionResult> {
  const context = await getAuthenticatedStaffContext();
  if ('error' in context) {
    return {
      success: false,
      error: context.error,
    };
  }

  const { supabase, user, staff, classes } = context;

  // Extract Form Fields
  const studentId = (formData.get('studentId') as string || '').trim();
  const classIdRaw = (formData.get('classId') as string || '').trim();
  const incidentDate = (formData.get('incidentDate') as string || '').trim();
  const incidentTypeRaw = (formData.get('incidentType') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  const actionTaken = (formData.get('actionTaken') as string || '').trim();
  const attachment = formData.get('attachment') as File | null;

  // Field validation dictionary
  const fieldErrors: Record<string, string> = {};

  // 1. Student ID validation
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!studentId) {
    fieldErrors.studentId = 'Please select a student.';
  } else if (!uuidRegex.test(studentId)) {
    fieldErrors.studentId = 'Invalid student ID format.';
  }

  // 2. Class ID validation (Strict positive integer: rejects '1abc', '1.5', empty, negative numbers)
  const positiveIntRegex = /^[1-9]\d*$/;
  if (!classIdRaw || !positiveIntRegex.test(classIdRaw)) {
    fieldErrors.classId = 'Please select a valid class.';
  }
  const classId = positiveIntRegex.test(classIdRaw) ? Number(classIdRaw) : 0;

  // 3. Incident Date validation (Strict YYYY-MM-DD, impossible calendar date rejection, no future dates)
  const dateValidation = validateIncidentDate(incidentDate);
  if (!dateValidation.valid && dateValidation.error) {
    fieldErrors.incidentDate = dateValidation.error;
  }

  // 4. Incident Type validation
  if (!incidentTypeRaw) {
    fieldErrors.incidentType = 'Please select an incident type.';
  } else if (!VALID_INCIDENT_TYPES.includes(incidentTypeRaw as IncidentType)) {
    fieldErrors.incidentType = `Incident type must be one of: ${VALID_INCIDENT_TYPES.join(', ')}.`;
  }

  // 5. Description validation
  if (!description) {
    fieldErrors.description = 'Incident description is required.';
  } else if (description.length < 10) {
    fieldErrors.description = 'Description must be at least 10 characters long.';
  } else if (description.length > 4000) {
    fieldErrors.description = 'Description cannot exceed 4000 characters.';
  }

  // 6. Action Taken validation
  if (actionTaken && actionTaken.length > 2000) {
    fieldErrors.actionTaken = 'Action taken cannot exceed 2000 characters.';
  }

  // 7. Optional Attachment Validation
  const hasAttachment = attachment && attachment.size > 0 && attachment.name;
  let canonicalMime: string | null = null;
  if (hasAttachment) {
    if (attachment.size > MAX_INCIDENT_ATTACHMENT_SIZE) {
      fieldErrors.attachment = 'Attachment file size exceeds the 10 MB limit.';
    } else {
      const mimeResult = resolveIncidentAttachmentMimeType(attachment.name, attachment.type);
      if (!mimeResult.valid || !mimeResult.canonicalMime) {
        fieldErrors.attachment = mimeResult.error || 'Unsupported attachment file format.';
      } else {
        canonicalMime = mimeResult.canonicalMime;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: 'Please correct the highlighted errors before submitting.',
      fieldErrors,
    };
  }

  // Authorization Check: Confirm class is assigned to this teacher
  const isAssignedClass = classes.some((c) => c.id === classId);
  if (!isAssignedClass) {
    return {
      success: false,
      error: 'Unauthorized: You are not assigned to teach this class.',
    };
  }

  // Student verification: Confirm student belongs to this class and is Active
  const { data: studentRecord, error: studentError } = await supabase
    .from('students')
    .select('id, first_name, last_name, admission_number, class_id, status')
    .eq('id', studentId)
    .eq('class_id', classId)
    .maybeSingle();

  if (studentError || !studentRecord) {
    return {
      success: false,
      error: 'The selected student is not enrolled in this class or could not be verified.',
    };
  }

  if (studentRecord.status !== 'Active') {
    return {
      success: false,
      error: `Cannot report incident for student with status "${studentRecord.status}". Only active students can be selected.`,
    };
  }

  // Step A: Storage Upload (if attachment provided)
  let uploadedStoragePath: string | null = null;
  let attachmentFileName: string | null = null;
  let attachmentFileSize: number | null = null;

  if (hasAttachment && canonicalMime) {
    const uploadResult = await uploadIncidentAttachmentFile({
      supabase,
      reporterProfileId: user.id,
      file: attachment,
      fileName: attachment.name,
      contentType: canonicalMime,
    });

    if (!uploadResult.success || !uploadResult.storagePath) {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload attachment file.',
      };
    }

    uploadedStoragePath = uploadResult.storagePath;
    attachmentFileName = attachment.name;
    attachmentFileSize = attachment.size;
  }

  // Step B: Database Insert with Atomic Rollback Guard
  try {
    const insertPayload = {
      student_id: studentId,
      class_id: classId,
      reporter_profile_id: user.id,
      staff_id: staff.id,
      incident_date: incidentDate,
      incident_type: incidentTypeRaw as IncidentType,
      description,
      action_taken: actionTaken || null,
      status: 'Submitted',
      attachment_path: uploadedStoragePath,
      attachment_name: attachmentFileName,
      attachment_size: attachmentFileSize,
      attachment_mime_type: canonicalMime,
    };

    const { data: insertedReport, error: insertError } = await supabase
      .from('incident_reports')
      .insert(insertPayload)
      .select('*, students(first_name, last_name, admission_number), classes(name)')
      .single();

    if (insertError) {
      // Atomic rollback: Delete uploaded storage file if database insert failed
      if (uploadedStoragePath) {
        await deleteIncidentAttachmentFile(supabase, uploadedStoragePath);
      }

      if (insertError.code === '42P01') {
        return {
          success: false,
          error: 'The incident reporting database table is pending migration. Please apply migration 012_staff_communication.sql.',
        };
      }

      return {
        success: false,
        error: `Failed to save incident report: ${insertError.message}`,
      };
    }

    // Step C: Automated confirmation notification for reporting teacher (best-effort)
    try {
      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Incident Report Submitted',
        message: `Your incident report for ${studentRecord.first_name} ${studentRecord.last_name} (${incidentTypeRaw}) has been submitted to administration.`,
        type: 'incident',
        is_read: false,
      });

      if (notificationError) {
        console.error(
          'Best-effort incident notification insert failed:',
          notificationError.message
        );
      }
    } catch (notificationErr) {
      console.error(
        'Best-effort incident notification exception:',
        notificationErr instanceof Error ? notificationErr.message : 'Unknown error'
      );
    }

    revalidatePath('/staff/communication');
    revalidatePath('/admin/communication');

    const rawReport = insertedReport as RawIncidentReportRow;
    const student = Array.isArray(rawReport.students) ? rawReport.students[0] : rawReport.students;
    const assignedClass = Array.isArray(rawReport.classes) ? rawReport.classes[0] : rawReport.classes;

    const formattedReport: IncidentReportItem = {
      id: rawReport.id,
      student_id: rawReport.student_id,
      student_name: student ? `${student.first_name} ${student.last_name}` : `${studentRecord.first_name} ${studentRecord.last_name}`,
      student_admission_number: student?.admission_number || studentRecord.admission_number,
      class_id: rawReport.class_id,
      class_name: assignedClass?.name || 'Class',
      reporter_profile_id: rawReport.reporter_profile_id,
      staff_id: rawReport.staff_id,
      staff_name: staff.full_name,
      incident_date: rawReport.incident_date,
      incident_type: rawReport.incident_type,
      description: rawReport.description,
      action_taken: rawReport.action_taken,
      status: rawReport.status,
      admin_notes: rawReport.admin_notes,
      attachment_path: rawReport.attachment_path,
      attachment_name: rawReport.attachment_name,
      attachment_size: rawReport.attachment_size,
      attachment_mime_type: rawReport.attachment_mime_type,
      created_at: rawReport.created_at,
      updated_at: rawReport.updated_at,
    };

    return {
      success: true,
      data: formattedReport,
    };
  } catch (err) {
    if (uploadedStoragePath) {
      await deleteIncidentAttachmentFile(supabase, uploadedStoragePath);
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred while saving the incident report.',
    };
  }
}

/**
 * 8. Fetch Staff Incident Reports
 * Retrieves all incident reports submitted by this staff member.
 */
export async function getStaffIncidentReports(): Promise<GetStaffIncidentReportsResponse> {
  const context = await getAuthenticatedStaffContext();
  if ('error' in context) {
    return {
      success: false,
      reports: [],
      error: context.error,
    };
  }

  const { supabase, user, staff } = context;

  try {
    const { data, error } = await supabase
      .from('incident_reports')
      .select(`
        id,
        student_id,
        class_id,
        reporter_profile_id,
        staff_id,
        incident_date,
        incident_type,
        description,
        action_taken,
        status,
        admin_notes,
        attachment_path,
        attachment_name,
        attachment_size,
        attachment_mime_type,
        created_at,
        updated_at,
        students ( id, first_name, last_name, admission_number ),
        classes ( id, name )
      `)
      .eq('reporter_profile_id', user.id)
      .order('incident_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation "public.incident_reports" does not exist')) {
        return {
          success: true,
          reports: [],
        };
      }
      return {
        success: false,
        reports: [],
        error: `Failed to load incident reports: ${error.message}`,
      };
    }

    const reports: IncidentReportItem[] = ((data as unknown as RawIncidentReportRow[]) || []).map((row) => {
      const student = Array.isArray(row.students) ? row.students[0] : row.students;
      const assignedClass = Array.isArray(row.classes) ? row.classes[0] : row.classes;

      return {
        id: row.id,
        student_id: row.student_id,
        student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student',
        student_admission_number: student?.admission_number,
        class_id: row.class_id,
        class_name: assignedClass?.name || 'Class',
        reporter_profile_id: row.reporter_profile_id,
        staff_id: row.staff_id,
        staff_name: staff.full_name,
        incident_date: row.incident_date,
        incident_type: row.incident_type,
        description: row.description,
        action_taken: row.action_taken,
        status: row.status,
        admin_notes: row.admin_notes,
        attachment_path: row.attachment_path,
        attachment_name: row.attachment_name,
        attachment_size: row.attachment_size,
        attachment_mime_type: row.attachment_mime_type,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    return {
      success: true,
      reports,
    };
  } catch (err) {
    return {
      success: false,
      reports: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred while fetching incident reports.',
    };
  }
}

/**
 * 9. Secure Download Workflow for Incident Attachment
 * Generates a temporary signed URL with authorization verification.
 */
export async function getIncidentAttachmentDownloadUrl(
  reportId: string
): Promise<SignedUrlResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      signedUrl: null,
      error: 'Authentication required to download attachments.',
    };
  }

  // Retrieve user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  // Retrieve report metadata
  const { data: report, error: reportError } = await supabase
    .from('incident_reports')
    .select('id, reporter_profile_id, attachment_path, attachment_name')
    .eq('id', reportId)
    .maybeSingle();

  if (reportError || !report) {
    return {
      success: false,
      signedUrl: null,
      error: 'Incident report not found.',
    };
  }

  // Authorization check: User must be either the reporting staff or an administrator
  const isReporter = report.reporter_profile_id === user.id;
  const isAdmin = profile?.role === 'admin';

  if (!isReporter && !isAdmin) {
    return {
      success: false,
      signedUrl: null,
      error: 'Unauthorized: You do not have permission to view this attachment.',
    };
  }

  if (!report.attachment_path) {
    return {
      success: false,
      signedUrl: null,
      error: 'This incident report does not contain an attachment.',
    };
  }

  const result = await getIncidentAttachmentSignedUrl(
    supabase,
    report.attachment_path,
    3600
  );

  if (!result.signedUrl) {
    return {
      success: false,
      signedUrl: null,
      error: result.error || 'Failed to generate signed download URL.',
    };
  }

  return {
    success: true,
    signedUrl: result.signedUrl,
    fileName: report.attachment_name,
  };
}

/**
 * 10. Admin Incident Reports Retrieval (For Admin Communication & Review Module)
 * Allows administrators to review all incident reports across all classes.
 */
export async function getAdminIncidentReports(): Promise<GetStaffIncidentReportsResponse> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      reports: [],
      error: 'Authentication required.',
    };
  }

  // Verify admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return {
      success: false,
      reports: [],
      error: 'Access denied: Administrator privileges required.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('incident_reports')
      .select(`
        id,
        student_id,
        class_id,
        reporter_profile_id,
        staff_id,
        incident_date,
        incident_type,
        description,
        action_taken,
        status,
        admin_notes,
        attachment_path,
        attachment_name,
        attachment_size,
        attachment_mime_type,
        created_at,
        updated_at,
        students ( id, first_name, last_name, admission_number ),
        classes ( id, name ),
        staff ( full_name )
      `)
      .order('incident_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          reports: [],
        };
      }
      return {
        success: false,
        reports: [],
        error: `Failed to load admin incident reports: ${error.message}`,
      };
    }

    const reports: IncidentReportItem[] = ((data as unknown as RawIncidentReportRow[]) || []).map((row) => {
      const student = Array.isArray(row.students) ? row.students[0] : row.students;
      const assignedClass = Array.isArray(row.classes) ? row.classes[0] : row.classes;
      const staffEntity = Array.isArray(row.staff) ? row.staff[0] : row.staff;

      return {
        id: row.id,
        student_id: row.student_id,
        student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student',
        student_admission_number: student?.admission_number,
        class_id: row.class_id,
        class_name: assignedClass?.name || 'Class',
        reporter_profile_id: row.reporter_profile_id,
        staff_id: row.staff_id,
        staff_name: staffEntity?.full_name || row.staff_id,
        incident_date: row.incident_date,
        incident_type: row.incident_type,
        description: row.description,
        action_taken: row.action_taken,
        status: row.status,
        admin_notes: row.admin_notes,
        attachment_path: row.attachment_path,
        attachment_name: row.attachment_name,
        attachment_size: row.attachment_size,
        attachment_mime_type: row.attachment_mime_type,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    return {
      success: true,
      reports,
    };
  } catch (err) {
    return {
      success: false,
      reports: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}
