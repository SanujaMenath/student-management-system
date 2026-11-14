'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ClassRecord {
  id: number;
  name: string;
  age_group: string | null;
  room_number: string | null;
  capacity: number;
  schedule: string | null;
  teacher_id: string | null;
  teacher?: { full_name: string } | null;
  students?: { count: number }[];
}

export async function getClassOverview(): Promise<ClassRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classes')
    .select(
      `id, name, age_group, room_number, capacity, schedule, teacher_id,
       teacher:teacher_id ( full_name ),
       students ( count )`
    )
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error.message);
    return [];
  }
  return (data as unknown as ClassRecord[]) ?? [];
}

// Teachers come from the staff table (classes.teacher_id -> staff.id)
export async function getTeacherOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff')
    .select('id, full_name')
    .eq('status', 'Active')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching teachers:', error.message);
    return [];
  }
  return data ?? [];
}

export async function createClass(formData: FormData) {
  const supabase = await createClient();

  const name = (formData.get('name') as string)?.trim();
  const ageGroup = (formData.get('ageGroup') as string)?.trim();
  const room = (formData.get('room') as string)?.trim();
  const schedule = (formData.get('schedule') as string)?.trim() || null;
  const teacherId = (formData.get('teacherId') as string) || null;
  const capacity = parseInt(formData.get('capacity') as string, 10);

  if (!name || !ageGroup || !room || !capacity || capacity < 1) {
    return { error: 'Please provide all mandatory fields.' };
  }

  const { error } = await supabase.from('classes').insert({
    name,
    age_group: ageGroup,
    room_number: room,
    schedule,
    teacher_id: teacherId,
    capacity,
  });

  if (error) {
    console.error('Error creating class:', error.message);
    return { error: error.message };
  }

  revalidatePath('/admin/classes');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function updateClass(id: number, formData: FormData) {
  const supabase = await createClient();

  const capacity = parseInt(formData.get('capacity') as string, 10);
  if (!capacity || capacity < 1) {
    return { error: 'Capacity must be at least 1.' };
  }

  const { error } = await supabase
    .from('classes')
    .update({
      name: (formData.get('name') as string)?.trim(),
      age_group: (formData.get('ageGroup') as string)?.trim(),
      room_number: (formData.get('room') as string)?.trim(),
      schedule: (formData.get('schedule') as string)?.trim() || null,
      teacher_id: (formData.get('teacherId') as string) || null,
      capacity,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating class:', error.message);
    return { error: error.message };
  }

  revalidatePath('/admin/classes');
  return { success: true };
}