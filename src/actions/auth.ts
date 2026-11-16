'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();
  const expectedRole = (formData.get('expectedRole') as string)?.trim().toLowerCase();

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  const supabase = await createClient();

  // Authenticate with Supabase Auth
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  // Fetch authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication failed. Please try again.' };
  }

  // Fetch verified profile role from database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.role) {
    await supabase.auth.signOut();
    return { error: 'User profile not found. Please contact administration.' };
  }

  const actualRole = profile.role.toLowerCase();

  // Verify selected portal tab matches actual role
  if (expectedRole && expectedRole !== actualRole) {
    await supabase.auth.signOut();
    return {
      error: `Access denied. Your account is registered as ${actualRole}, not ${expectedRole}.`,
    };
  }

  // Navigate to appropriate portal
  switch (actualRole) {
    case 'admin':
      redirect('/admin/dashboard');
    case 'staff':
      redirect('/staff/dashboard');
    case 'parent':
      redirect('/parent/dashboard');
    default:
      redirect('/auth/login');
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}