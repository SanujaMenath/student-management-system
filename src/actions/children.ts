'use server';

import { createClient } from '@/lib/supabase/server';

export interface ChildRecord {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string | null;
  allergies: string | null;
  emergency_contact: string;
  status: string;
  classes: {
    name: string;
    room_number: string | null;
    teacher: { full_name: string } | null;
  } | null;
  parent: {
    full_name: string;
    phone: string | null;
    email: string | null;
  } | null;
}

// Returns the children linked to the logged-in parent
export async function getMyChildren(): Promise<ChildRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('students')
    .select(
      `id, admission_number, first_name, last_name, date_of_birth, gender,
       blood_group, allergies, emergency_contact, status,
       classes:class_id ( name, room_number, teacher:teacher_id ( full_name ) ),
       parent:parent_id ( full_name, phone, email )`
    )
    .eq('parent_id', user.id)
    .order('first_name', { ascending: true });

  if (error) {
    console.error('Error fetching children:', error.message);
    return [];
  }
  return (data as unknown as ChildRecord[]) ?? [];
}