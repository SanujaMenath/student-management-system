'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface StudentFilters {
  search?: string;
  classId?: number;
  status?: string;
}

export interface StudentRecord {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group?: string | null;
  allergies?: string | null;
  emergency_contact: string;
  class_id?: number | null;
  parent_id?: string | null;
  status: 'Active' | 'Inactive' | 'Graduated';
  created_at: string;
  classes?: {
    name: string;
  } | null;
  parent?: {
    full_name: string;
    phone: string | null;
  } | null;
}

// Fetch Students with Optional Filtering
export async function getStudents(filters?: StudentFilters) {
  const supabase = await createClient();

  let query = supabase
    .from('students')
    .select(
      `
      id,
      admission_number,
      first_name,
      last_name,
      date_of_birth,
      gender,
      blood_group,
      allergies,
      emergency_contact,
      class_id,
      parent_id,
      status,
      created_at,
      classes:class_id ( name ),
      parent:parent_id ( full_name, phone )
    `
    )
    .order('created_at', { ascending: false });

  if (filters?.search && filters.search.trim() !== '') {
    const term = `%${filters.search.trim()}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},admission_number.ilike.${term}`
    );
  }

  if (filters?.classId) {
    query = query.eq('class_id', filters.classId);
  }

  if (filters?.status && filters.status !== 'All') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching students:', error.message);
    return [];
  }

  return (data as unknown as StudentRecord[]) ?? [];
}

// Fetch Available Classes for Select Dropdowns
export async function getClasses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, room_number, capacity')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error.message);
    return [];
  }

  return data ?? [];
}

// Register a New Student
export async function createStudent(formData: FormData) {
  const supabase = await createClient();

  const firstName = (formData.get('first_name') as string)?.trim();
  const lastName = (formData.get('last_name') as string)?.trim();
  const dateOfBirth = formData.get('date_of_birth') as string;
  const gender = formData.get('gender') as string;
  const emergencyContact = (formData.get('emergency_contact') as string)?.trim();
  const bloodGroup = (formData.get('blood_group') as string)?.trim() || null;
  const allergies = (formData.get('allergies') as string)?.trim() || null;
  const rawClassId = formData.get('class_id') as string;
  const classId = rawClassId ? parseInt(rawClassId, 10) : null;
  const status = (formData.get('status') as string) ||'Active';

  if (!firstName || !lastName || !dateOfBirth || !gender || !emergencyContact) {
    return { error: 'Please provide all mandatory fields.' };
  }

  // Generate unique institute admission index: e.g. HDH-2026-XXXX
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const admissionNumber = `HDH-${new Date().getFullYear()}-${randomSuffix}`;

  const { data, error } = await supabase
    .from('students')
    .insert({
      admission_number: admissionNumber,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      gender,
      blood_group: bloodGroup,
      allergies,
      emergency_contact: emergencyContact,
      class_id: classId,
      status,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting student:', error.message);
    return { error: error.message };
  }

  revalidatePath('/admin/students');
  revalidatePath('/admin/dashboard');

  return { success: true, student: data };
}

// 4. Update an Existing Student Record
export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient();

  const rawClassId = formData.get('class_id') as string;
  const classId = rawClassId ? parseInt(rawClassId, 10) : null;

  const updates = {
    first_name: (formData.get('first_name') as string)?.trim(),
    last_name: (formData.get('last_name') as string)?.trim(),
    date_of_birth: formData.get('date_of_birth') as string,
    gender: formData.get('gender') as string,
    blood_group: (formData.get('blood_group') as string)?.trim() || null,
    allergies: (formData.get('allergies') as string)?.trim() || null,
    emergency_contact: (formData.get('emergency_contact') as string)?.trim(),
    class_id: classId,
    status: formData.get('status') as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating student:', error.message);
    return { error: error.message };
  }

  revalidatePath('/admin/students');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

// 5. Delete Student Record
export async function deleteStudent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting student:', error.message);
    return { error: error.message };
  }

  revalidatePath('/admin/students');
  revalidatePath('/admin/dashboard');

  return { success: true };
}