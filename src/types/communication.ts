/**
 * Type definitions for the Staff & Admin Communication module (Module 12 / Module 6)
 */

export type IncidentType =
  | 'Injury'
  | 'Illness'
  | 'Behavioral'
  | 'Safety Concern'
  | 'Other';

export type IncidentStatus = 'Submitted' | 'Under Review' | 'Resolved';

export type NotificationType =
  | 'info'
  | 'warning'
  | 'success'
  | 'alert'
  | 'announcement'
  | 'incident';

/**
 * Standard Incident Report item retrieved from database with enriched student/class/staff details
 */
export interface IncidentReportItem {
  id: string;
  student_id: string;
  student_name: string;
  student_admission_number?: string;
  class_id: number;
  class_name?: string;
  reporter_profile_id: string;
  staff_id: string;
  staff_name?: string;
  incident_date: string;
  incident_type: IncidentType;
  description: string;
  action_taken?: string | null;
  status: IncidentStatus;
  admin_notes?: string | null;
  attachment_path?: string | null;
  attachment_name?: string | null;
  attachment_size?: number | null;
  attachment_mime_type?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input for submitting an incident report
 */
export interface SubmitIncidentReportInput {
  studentId: string;
  classId: number;
  incidentDate: string;
  incidentType: IncidentType;
  description: string;
  actionTaken?: string;
  attachment?: File;
}

/**
 * Result returned by incident report server actions
 */
export interface IncidentActionResult {
  success: boolean;
  data?: IncidentReportItem | null;
  error?: string | null;
  fieldErrors?: Record<string, string>;
}

/**
 * Student selectable by a staff member for incident reporting
 */
export interface AssignedStudentOption {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  class_id: number;
  class_name: string;
}

/**
 * Announcement item displayed in the Staff Communication Announcements tab
 */
export interface StaffAnnouncementItem {
  id: string;
  title: string;
  category: string;
  content: string;
  target_class: string | null;
  published_by: string | null;
  published_at: string | null;
  is_important: boolean;
}

/**
 * Notice item displayed in the Staff Communication Notices tab
 */
export interface StaffNoticeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  target_class: string | null;
  published_by: string | null;
  published_at: string | null;
  is_important: boolean;
}

/**
 * Personal/system notification item displayed in the Notifications tab
 */
export interface StaffNotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

/**
 * Responses returned by server actions
 */
export interface GetStaffAnnouncementsResponse {
  success: boolean;
  announcements: StaffAnnouncementItem[];
  error?: string | null;
}

export interface GetStaffNoticesResponse {
  success: boolean;
  notices: StaffNoticeItem[];
  error?: string | null;
}

export interface GetStaffNotificationsResponse {
  success: boolean;
  notifications: StaffNotificationItem[];
  unreadCount: number;
  error?: string | null;
}

export interface GetAssignedStudentsResponse {
  success: boolean;
  students: AssignedStudentOption[];
  error?: string | null;
}

export interface GetStaffIncidentReportsResponse {
  success: boolean;
  reports: IncidentReportItem[];
  error?: string | null;
}

export interface SignedUrlResult {
  success: boolean;
  signedUrl: string | null;
  fileName?: string | null;
  error?: string | null;
}
