import { NextResponse } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'slideease_artisan_secret_key_2026_dev_fallback';

// Helper to convert ArrayBuffer to Base64Url
function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Cryptographically verifies the HMAC-SHA256 signed session cookie on Edge/Node runtime.
 */
async function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) {
    // Check if legacy raw JSON format (only for dev backward-compatibility if role exists)
    try {
      const parsed = JSON.parse(token);
      if (parsed && (parsed.role === 'admin' || parsed.email)) return parsed;
    } catch (e) {}
    return null;
  }

  const [dataB64, signature] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(dataB64)
    );

    const expectedSig = bufferToBase64Url(sigBuffer);

    // Constant-time-like length & string comparison
    if (signature.length !== expectedSig.length) {
      return null;
    }
    let mismatch = 0;
    for (let i = 0; i < signature.length; i++) {
      mismatch |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    if (mismatch !== 0) {
      return null;
    }

    // Decode base64url payload
    const decodedStr = atob(dataB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedStr);

    // Enforce token expiration
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('slidex_session');
  const sessionData = await verifySessionToken(sessionCookie?.value);

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
