import { NextResponse } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'slideease_artisan_secret_key_2026';

function safeParseSession(cookieVal) {
  if (!cookieVal) return null;
  try {
    // If signed token: "base64payload.signature"
    if (cookieVal.includes('.')) {
      const parts = cookieVal.split('.');
      if (parts.length === 2) {
        const payloadJson = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(payloadJson);
      }
    }
    // Fallback: raw JSON cookie if legacy
    return JSON.parse(cookieVal);
  } catch (e) {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('slidex_session');
  const sessionData = safeParseSession(sessionCookie?.value);

  // Allow admin login page without redirect loops
  if (pathname === '/admin/login') {
    if (sessionData && sessionData.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Protect administrative dashboard pages (/admin and subpaths)
  if (pathname.startsWith('/admin')) {
    if (!sessionData) {
      return NextResponse.redirect(
        new URL('/admin/login?redirect=' + encodeURIComponent(pathname), request.url)
      );
    }

    if (sessionData.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
    }
  }

  // Protect administrative API routes (/api/admin and subpaths)
  if (pathname.startsWith('/api/admin')) {
    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Authentication session required.' },
        { status: 401 }
      );
    }

    if (sessionData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized administrative access. Admin privileges required.' },
        { status: 403 }
      );
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
