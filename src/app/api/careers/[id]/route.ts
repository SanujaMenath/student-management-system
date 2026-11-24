import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient as createSupabaseServer } from '@/lib/supabase/server';

const ALLOWED_STATUSES = new Set([
  'Pending Review',
  'In Review',
  'Interview Scheduled',
  'Approved',
  'Rejected',
]);

async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return profile?.role === 'admin' ? user : null;
}

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  if (!ALLOWED_STATUSES.has(body.status)) {
    return NextResponse.json({ error: 'Invalid application status' }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('career_applications')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('Career application status update failed:', error);
    return NextResponse.json({ error: 'Unable to update application status' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, application: data });
}
