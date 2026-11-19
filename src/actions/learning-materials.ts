'use server';

import { createClient } from '@/lib/supabase/server';

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
 * Retrieves the classes assigned to the currently authenticated staff member.
 * 
 * Identity and Assignment Resolution Chain:
 * 1. Authenticated User (auth.users.id) via Supabase Auth session
 * 2. User Profile (public.profiles.id) verifying role = 'staff'
 * 3. Staff Entity (public.staff.id) via staff.profile_id = user.id
 * 4. Assigned Classes (public.classes) via classes.teacher_id = staff.id
 */
export async function getStaffAssignedClasses(): Promise<GetAssignedClassesResponse> {
  const supabase = await createClient();

  // 1. Authenticate user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      classes: [],
      error: 'Authentication required. Please log in to view assigned classes.',
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
      success: false,
      classes: [],
      error: 'User profile not found. Please contact administration.',
    };
  }

  if (profile.role !== 'staff') {
    return {
      success: false,
      classes: [],
      error: 'Access denied. Only staff members can view assigned classes.',
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
      success: false,
      classes: [],
      error: `Failed to query staff record: ${staffError.message}`,
    };
  }

  if (!staff) {
    return {
      success: false,
      classes: [],
      error:
        'Your account is not yet linked to an institutional staff profile. Please contact the administrator to complete your assignment.',
    };
  }

  if (staff.status !== 'Active') {
    return {
      success: false,
      classes: [],
      staff: {
        id: staff.id,
        full_name: staff.full_name,
        profile_id: user.id,
      },
      error: `Your staff account is currently marked as "${staff.status}". Only active teachers can manage learning materials.`,
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
      success: false,
      classes: [],
      error: `Failed to retrieve assigned classes: ${classesError.message}`,
    };
  }

  const mappedClasses: AssignedClass[] = (classes ?? []).map((c) => ({
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
      id: staff.id,
      full_name: staff.full_name,
      profile_id: user.id,
    },
    error: null,
  };
}

