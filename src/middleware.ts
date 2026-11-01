import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Allow public website and auth assets without restriction
  if (path.startsWith('/auth') || path.startsWith('/(public)') || path === '/') {
    return response;
  }

  // Redirect unauthenticated users hitting private portals
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', path);
    return NextResponse.redirect(loginUrl);
  }

  // Fetch user role to guard portals
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role;

  // Role boundary restrictions
  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
  }
  if (path.startsWith('/staff') && role !== 'staff' && role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
  }
  if (path.startsWith('/parent') && role !== 'parent' && role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/parent/:path*', '/api/protected/:path*'],
};