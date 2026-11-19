/**
 * TypeScript Type Definitions for Staff – Learning Management Module
 * Handahamy Educational Institute Student Management System (IS5109)
 *
 * Aligned with database schema: supabase/migrations/010_staff_learning_management.sql
 */

/**
 * Permitted file categories for educational materials
 * Enforced by CHECK constraint in database migration 010
 */
export type LearningMaterialFileType =
  | 'PDF'
  | 'Document'
  | 'Video'
  | 'Image'
  | 'Other';

/**
 * Standard curriculum subjects for Handahamy Educational Institute
 * Allows string literal expansion while maintaining standard autocomplete
 */
export type LearningMaterialSubject =
  | 'English'
  | 'Mathematics'
  | 'Environmental Studies'
  | 'General Knowledge'
  | 'Art and Craft'
  | (string & {});

/**
 * Direct representation of a record in `public.learning_materials`
 */
export interface LearningMaterialRecord {
  id: string; // UUID
  title: string;
  description: string | null;
  subject: string;
  class_id: number; // BIGINT primary key of public.classes
  storage_path: string; // classes/<class_id>/<uploader_profile_id>/<file_uuid>.<ext>
  file_name: string; // Original human-readable filename
  file_size: number; // Positive size in bytes
  file_type: LearningMaterialFileType;
  uploaded_by: string; // UUID referencing public.profiles(id)
  created_at: string; // ISO 8601 timestamp string
  updated_at: string; // ISO 8601 timestamp string
}

/**
 * Payload required to upload a new learning material
 */
export interface UploadLearningMaterialPayload {
  title: string;
  description?: string | null;
  subject: string;
  classId: number;
}

/**
 * Input structure when uploading via client or form
 */
export interface UploadLearningMaterialInput extends UploadLearningMaterialPayload {
  file: File;
}

/**
 * Structure of a learning material returned with joined relational metadata
 * Used for displaying material cards, class associations, uploader info, and signed URLs
 */
export interface LearningMaterialItem extends LearningMaterialRecord {
  class_name?: string | null;
  uploader_name?: string | null;
  download_url?: string | null; // Signed time-limited URL for secure access
}

/**
 * Query filter criteria for searching and browsing learning materials
 */
export interface LearningMaterialsFilter {
  classId?: number;
  subject?: string;
  fileType?: LearningMaterialFileType | 'All';
  searchQuery?: string;
}

/**
 * Result returned by learning material server actions
 */
export interface LearningMaterialActionResult {
  success: boolean;
  error?: string;
  material?: LearningMaterialRecord;
}

/**
 * Result returned when generating a signed download URL
 */
export interface SignedUrlResult {
  signedUrl: string | null;
  error?: string;
}

