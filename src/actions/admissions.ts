'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type AdmissionStatus =
  | 'Pending Review'
  | 'Interview Scheduled'
  | 'Approved'
  | 'Rejected';

export interface AdmissionRecord {
  id: number;
  child_name: string;
  date_of_birth: string;
  program: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  status: AdmissionStatus;
  created_at: string;
}

export async function getAdmissions(): Promise<AdmissionRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('admissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admissions:', error.message);
    return [];
  }
  return (data as AdmissionRecord[]) ?? [];
}

export async function updateAdmissionStatus(id: number, status: AdmissionStatus) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('admissions')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating admission:', error.message);
    return { error: error.message };
  }

  revalidatePath('/admin/admissions');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

// For the public admissions form on the website
export async function submitAdmission(formData: FormData) {
  const supabase = await createClient();

  const childName = (formData.get('child_name') as string)?.trim();
  const dateOfBirth = formData.get('date_of_birth') as string;
  const program = (formData.get('program') as string)?.trim();
  const parentName = (formData.get('parent_name') as string)?.trim();
  const parentPhone = (formData.get('parent_phone') as string)?.trim();
  const parentEmail = (formData.get('parent_email') as string)?.trim() || null;

  if (!childName || !dateOfBirth || !program || !parentName || !parentPhone) {
    return { error: 'Please provide all mandatory fields.' };
  }

  const { error } = await supabase.from('admissions').insert({
    child_name: childName,
    date_of_birth: dateOfBirth,
    program,
    parent_name: parentName,
    parent_phone: parentPhone,
    parent_email: parentEmail,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/admissions');
  return { success: true };
}