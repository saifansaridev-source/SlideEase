import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('slidex_session');
  const { pathname } = request.nextUrl;

  // Protect administrative dashboard pages (/admin and nested subpaths)
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), request.url));
    }

    try {
      const sessionData = JSON.parse(session.value);
      if (sessionData.role !== 'admin') {
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect administrative dashboard API routes (/api/admin and nested subpaths)
  if (pathname.startsWith('/api/admin')) {
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication session required.' }, { status: 401 });
    }

    try {
      const sessionData = JSON.parse(session.value);
      if (sessionData.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized administrative access.' }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid authentication session.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
