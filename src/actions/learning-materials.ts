'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  uploadLearningMaterialFile,
  deleteLearningMaterialFile,
  getLearningMaterialSignedUrl,
} from '@/lib/learning-materials-storage';
import type {
  LearningMaterialItem,
  LearningMaterialsFilter,
  LearningMaterialFileType,
  LearningMaterialActionResult,
  SignedUrlResult,
} from '@/types/learning-materials';

/**
 * Information about a class assigned to a staff member
 */
export interface AssignedClass {
  id: number;
  name: string;
  room_number: string | null;
  age_group: string | null;
  schedule: string | null;
}

/**
 * Return response for fetching assigned classes
 */
export interface GetAssignedClassesResponse {
  success: boolean;
  classes: AssignedClass[];
  staff?: {
    id: string; // e.g. 'STF-018'
    full_name: string;
    profile_id: string; // Auth User UUID
  } | null;
  error?: string | null;
}

/**
 * Return response for fetching learning materials
 */
export interface GetLearningMaterialsResponse {
  success: boolean;
  materials: LearningMaterialItem[];
  error?: string | null;
}

/**
 * Resolves appropriate LearningMaterialFileType from filename and MIME type
 */
function resolveFileType(fileName: string, mimeType?: string): LearningMaterialFileType {
  const mime = (mimeType || '').toLowerCase();
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (mime.includes('pdf') || ext === 'pdf') {
    return 'PDF';
  }
  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)
  ) {
    return 'Image';
  }
  if (
    mime.startsWith('video/') ||
    ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)
  ) {
    return 'Video';
  }
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    mime.includes('text') ||
    mime.includes('presentation') ||
    mime.includes('sheet') ||
    [
      'doc',
      'docx',
      'txt',
      'rtf',
      'odt',
      'ppt',
      'pptx',
      'xls',
      'xlsx',
      'csv',
    ].includes(ext)
  ) {
    return 'Document';
  }
  return 'Other';
}

/**
 * Internal helper to resolve the authenticated staff member and their assigned classes.
 * 
 * Identity and Assignment Resolution Chain:
 * 1. Authenticated User (auth.users.id) via Supabase Auth session
 * 2. User Profile (public.profiles.id) verifying role = 'staff'
 * 3. Staff Entity (public.staff.id) via staff.profile_id = user.id
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

  // 3. Resolve institutional staff identity linked to this authenticated profile
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
      error: `Your staff account is currently marked as "${staff.status}". Only active teachers can manage learning materials.`,
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

export async function getStaffAssignedClasses(): Promise<GetAssignedClassesResponse> {
  const context = await getAuthenticatedStaffContext();

  if ('error' in context) {
    return {
      success: false,
      classes: [],
      error: context.error,
    };
  }

  const mappedClasses: AssignedClass[] = context.classes.map((c) => ({
    id: Number(c.id),
    name: c.name,
    room_number: c.room_number ?? null,
    age_group: c.age_group ?? null,
    schedule: c.schedule ?? null,
  }));

  return {
    success: true,
    classes: mappedClasses,
    staff: {
      id: context.staff.id,
      full_name: context.staff.full_name,
      profile_id: context.user.id,
    },
    error: null,
  };
}

/**
 * Interface representing the relational row returned from Supabase for learning_materials
 */
interface RawMaterialRow {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  class_id: number | string;
  storage_path: string;
  file_name: string;
  file_size: number | string;
  file_type: LearningMaterialFileType;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  classes?: {
    name: string;
  } | null;
  uploader?: {
    full_name: string;
  } | null;
}

export async function getStaffLearningMaterials(
  filters?: LearningMaterialsFilter
): Promise<GetLearningMaterialsResponse> {
  const context = await getAuthenticatedStaffContext();

  if ('error' in context) {
    return {
      success: false,
      materials: [],
      error: context.error,
    };
  }

  const assignedClassIds = context.classes.map((c) => Number(c.id));

  // If the staff member is not assigned to any class, return an empty list gracefully
  if (assignedClassIds.length === 0) {
    return {
      success: true,
      materials: [],
      error: null,
    };
  }

  // If a specific class filter is requested, verify the teacher is assigned to it
  if (filters?.classId) {
    const requestedClassId = Number(filters.classId);
    if (!assignedClassIds.includes(requestedClassId)) {
      return {
        success: false,
        materials: [],
        error: 'Access denied. You are not assigned to the requested class.',
      };
    }
  }

  // Build the query to fetch learning materials
  let query = context.supabase
    .from('learning_materials')
    .select(`
      id,
      title,
      description,
      subject,
      class_id,
      storage_path,
      file_name,
      file_size,
      file_type,
      uploaded_by,
      created_at,
      updated_at,
      classes:class_id (
        name
      ),
      uploader:uploaded_by (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  // Apply class scoping: either specific assigned class or all assigned classes
  if (filters?.classId) {
    query = query.eq('class_id', filters.classId);
  } else {
    query = query.in('class_id', assignedClassIds);
  }

  // Apply optional subject filter
  if (filters?.subject && filters.subject !== 'All') {
    query = query.eq('subject', filters.subject);
  }

  // Apply optional file type filter
  if (filters?.fileType && filters.fileType !== 'All') {
    query = query.eq('file_type', filters.fileType);
  }

  // Apply optional text search
  if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
    const term = `%${filters.searchQuery.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term},file_name.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    return {
      success: false,
      materials: [],
      error: `Failed to retrieve learning materials: ${error.message}`,
    };
  }

  const mappedMaterials: LearningMaterialItem[] = (
    (data as unknown as RawMaterialRow[]) ?? []
  ).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    subject: row.subject,
    class_id: Number(row.class_id),
    storage_path: row.storage_path,
    file_name: row.file_name,
    file_size: Number(row.file_size),
    file_type: row.file_type,
    uploaded_by: row.uploaded_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    class_name: row.classes?.name ?? null,
    uploader_name: row.uploader?.full_name ?? null,
  }));

  return {
    success: true,
    materials: mappedMaterials,
    error: null,
  };
}

export async function uploadLearningMaterial(
  formData: FormData
): Promise<LearningMaterialActionResult> {
  const context = await getAuthenticatedStaffContext();

  if ('error' in context) {
    return {
      success: false,
      error: context.error,
    };
  }

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const subject = (formData.get('subject') as string)?.trim();
  const rawClassId = formData.get('classId') as string;
  const file = formData.get('file') as File | null;

  if (!title || !subject || !rawClassId || !file) {
    return {
      success: false,
      error: 'Please provide all mandatory fields (title, subject, class, and file).',
    };
  }

  const classId = parseInt(rawClassId, 10);
  if (isNaN(classId)) {
    return {
      success: false,
      error: 'Invalid class ID provided.',
    };
  }

  // Verify that the teacher is assigned to this class
  const assignedClassIds = context.classes.map((c) => Number(c.id));
  if (!assignedClassIds.includes(classId)) {
    return {
      success: false,
      error: 'Access denied. You are not assigned to the selected class.',
    };
  }

  // Validate file size (max 25 MB)
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  if (file.size <= 0) {
    return {
      success: false,
      error: 'The uploaded file is empty.',
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: 'File size exceeds the maximum limit of 25 MB.',
    };
  }

  const fileType = resolveFileType(file.name, file.type);

  const storageResult = await uploadLearningMaterialFile({
    supabase: context.supabase,
    classId,
    uploaderProfileId: context.user.id,
    file,
    fileName: file.name,
    contentType: file.type || undefined,
  });

  if (!storageResult.success || !storageResult.storagePath) {
    return {
      success: false,
      error: storageResult.error || 'Failed to upload file to storage.',
    };
  }

  const { data: inserted, error: insertError } = await context.supabase
    .from('learning_materials')
    .insert({
      title,
      description,
      subject,
      class_id: classId,
      storage_path: storageResult.storagePath,
      file_name: file.name,
      file_size: file.size,
      file_type: fileType,
      uploaded_by: context.user.id,
    })
    .select()
    .single();

  if (insertError) {
    // Atomic rollback: purge uploaded storage file if metadata creation fails
    await deleteLearningMaterialFile(context.supabase, storageResult.storagePath);
    return {
      success: false,
      error: `Failed to save learning material metadata: ${insertError.message}`,
    };
  }

  revalidatePath('/staff/learning-materials');
  revalidatePath('/parent/learning-management');

  return {
    success: true,
    material: inserted,
  };
}

export async function deleteLearningMaterial(
  materialId: string
): Promise<{ success: boolean; error?: string }> {
  const context = await getAuthenticatedStaffContext();

  if ('error' in context) {
    return {
      success: false,
      error: context.error,
    };
  }

  if (!materialId || materialId.trim() === '') {
    return {
      success: false,
      error: 'Material ID is required for deletion.',
    };
  }

  const { data: material, error: fetchError } = await context.supabase
    .from('learning_materials')
    .select('id, class_id, storage_path, uploaded_by')
    .eq('id', materialId)
    .single();

  if (fetchError || !material) {
    return {
      success: false,
      error: 'Learning material not found.',
    };
  }

  if (material.uploaded_by !== context.user.id) {
    return {
      success: false,
      error: 'Access denied. You can only delete materials that you uploaded.',
    };
  }

  const assignedClassIds = context.classes.map((c) => Number(c.id));
  if (!assignedClassIds.includes(Number(material.class_id))) {
    return {
      success: false,
      error: 'Access denied. You are no longer assigned to this class.',
    };
  }

  // Authoritative database record is deleted first to preserve metadata consistency
  const { error: dbDeleteError } = await context.supabase
    .from('learning_materials')
    .delete()
    .eq('id', materialId);

  if (dbDeleteError) {
    return {
      success: false,
      error: `Failed to delete material record: ${dbDeleteError.message}`,
    };
  }

  const storageResult = await deleteLearningMaterialFile(
    context.supabase,
    material.storage_path
  );

  if (!storageResult.success) {
    console.error(
      `Warning: Database row deleted, but storage object deletion returned: ${storageResult.error}`
    );
  }

  revalidatePath('/staff/learning-materials');
  revalidatePath('/parent/learning-management');

  return {
    success: true,
  };
}

export async function getMaterialDownloadUrl(
  materialId: string
): Promise<SignedUrlResult> {
  const context = await getAuthenticatedStaffContext();

  if ('error' in context) {
    return {
      signedUrl: null,
      error: context.error,
    };
  }

  const { data: material, error: fetchError } = await context.supabase
    .from('learning_materials')
    .select('id, class_id, storage_path')
    .eq('id', materialId)
    .single();

  if (fetchError || !material) {
    return {
      signedUrl: null,
      error: 'Learning material not found.',
    };
  }

  // Verify class assignment
  const assignedClassIds = context.classes.map((c) => Number(c.id));
  if (!assignedClassIds.includes(Number(material.class_id))) {
    return {
      signedUrl: null,
      error: 'Access denied. You are not assigned to this class.',
    };
  }

  const result = await getLearningMaterialSignedUrl(
    context.supabase,
    material.storage_path,
    3600
  );

  return {
    signedUrl: result.signedUrl,
    error: result.error || undefined,
  };
}
