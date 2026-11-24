import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient as createSupabaseServer } from '@/lib/supabase/server';
import { careerApplicationTextSchema, validateCareerCv } from '@/lib/validations/careers';

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return profile?.role === 'admin' ? user : null;
}

export async function POST(request: NextRequest) {
  try {
    if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Submit the application as multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const textResult = careerApplicationTextSchema.safeParse({
      full_name: String(formData.get('full_name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      position: String(formData.get('position') ?? ''),
      cover_message: String(formData.get('cover_message') ?? ''),
    });

    if (!textResult.success) {
      return NextResponse.json(
        { error: textResult.error.issues[0]?.message || 'Invalid application details' },
        { status: 400 }
      );
    }

    const { full_name: fullName, email, phone, position, cover_message: coverMessage } =
      textResult.data;
    const cv = formData.get('cv');

    if (!(cv instanceof File)) {
      return NextResponse.json({ error: 'A CV file is required' }, { status: 400 });
    }

    const cvError = validateCareerCv(cv);
    if (cvError) {
      return NextResponse.json({ error: cvError }, { status: 400 });
    }

    const lowerName = cv.name.toLowerCase();
    const admin = getAdminClient();
    const { data: application, error: insertError } = await admin
      .from('career_applications')
      .insert({
        full_name: fullName,
        email,
        phone,
        position,
        cover_message: coverMessage,
        cv_original_name: cv.name,
        cv_mime_type: cv.type,
        cv_size_bytes: cv.size,
      })
      .select('id')
      .single();

    if (insertError || !application) {
      console.error('Career application insert failed:', insertError);
      return NextResponse.json({ error: 'Unable to save the application' }, { status: 500 });
    }

    const extension = lowerName.endsWith('.docx')
      ? 'docx'
      : lowerName.endsWith('.doc')
        ? 'doc'
        : 'pdf';
    const storagePath = `applications/${application.id}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from('career-cvs')
      .upload(storagePath, cv, {
        contentType: cv.type,
        upsert: false,
      });

    if (uploadError) {
      await admin.from('career_applications').delete().eq('id', application.id);
      console.error('Career CV upload failed:', uploadError);
      return NextResponse.json({ error: 'Unable to upload the CV' }, { status: 500 });
    }

    const { error: updateError } = await admin
      .from('career_applications')
      .update({ cv_storage_path: storagePath, updated_at: new Date().toISOString() })
      .eq('id', application.id);

    if (updateError) {
      await admin.storage.from('career-cvs').remove([storagePath]);
      await admin.from('career_applications').delete().eq('id', application.id);
      console.error('Career application update failed:', updateError);
      return NextResponse.json({ error: 'Unable to complete the application' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, application_id: application.id, message: 'Application submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Career application API error:', error);
    return NextResponse.json({ error: 'Invalid request or server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  }

  const url = request.nextUrl;
  const search = url.searchParams.get('search')?.trim() ?? '';
  const status = url.searchParams.get('status')?.trim() ?? '';
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') ?? '10', 10) || 10));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const admin = getAdminClient();
  let query = admin
    .from('career_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    const escapedSearch = search.replace(/[%_]/g, '\\$&').replace(/,/g, ' ');
    query = query.or(
      `full_name.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%,phone.ilike.%${escapedSearch}%,position.ilike.%${escapedSearch}%,cover_message.ilike.%${escapedSearch}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Career applications fetch failed:', error);
    return NextResponse.json({ error: 'Unable to fetch applications' }, { status: 500 });
  }

  const applications = await Promise.all(
    (data ?? []).map(async (application) => {
      if (!application.cv_storage_path) {
        return { ...application, cv_url: null };
      }

      const { data: signed, error: signedError } = await admin.storage
        .from('career-cvs')
        .createSignedUrl(application.cv_storage_path, 3600);

      return {
        ...application,
        cv_url: signedError ? null : (signed?.signedUrl ?? null),
      };
    })
  );

  const total = count ?? 0;
  return NextResponse.json({
    applications,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  });
}
