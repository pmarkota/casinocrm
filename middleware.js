import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // If no session and not accessing auth pages, redirect to login
  if (!session && 
      !req.nextUrl.pathname.startsWith('/login') && 
      !req.nextUrl.pathname.startsWith('/register') &&
      !req.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If session exists and trying to access auth pages, redirect to dashboard
  if (session && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
