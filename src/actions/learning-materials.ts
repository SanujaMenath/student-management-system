'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  LearningMaterialItem,
  LearningMaterialsFilter,
  LearningMaterialFileType,
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

/**
 * Retrieves the classes assigned to the currently authenticated staff member.
 */
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

/**
 * Retrieves learning materials belonging to classes assigned to the currently authenticated staff member.
 * 
 * - Enforces authentication, staff role verification, and active status.
 * - Restricts results strictly to the teacher's assigned classes.
 * - Orders results by newest upload first (created_at DESC).
 * - Joins class name and uploader display name.
 */
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
