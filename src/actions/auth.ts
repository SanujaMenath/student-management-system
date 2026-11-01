'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const expectedRole = formData.get('expectedRole') as string;

  const supabase = await createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  // Fetch verified profile role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication failed' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const actualRole = profile?.role || 'parent';

  // Optional: Enforce that selected tab matches actual database role
  if (expectedRole && expectedRole !== actualRole) {
    return {
      error: `Access denied. Your account is registered as a ${actualRole}, not an ${expectedRole}.`,
    };
  }

  // Redirect to corresponding role route
  switch (actualRole) {
    case 'admin':
      redirect('/admin/dashboard');
    case 'staff':
      redirect('/staff/dashboard');
    case 'parent':
    default:
      redirect('/parent/dashboard');
  }
}