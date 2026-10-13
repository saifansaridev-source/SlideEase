import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signSession } from '@/lib/auth';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * POST /api/auth/google
 *
 * Accepts a Google ID token (credential) from Google Identity Services,
 * validates it server-side using google-auth-library (cryptographic signature,
 * issuer, audience, and expiry), then upserts the customer user in MongoDB
 * and issues an HTTP-only signed session cookie.
 */
export async function POST(request) {
  try {
    // ── 1. Parse and validate request body ─────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { credential } = body || {};

    if (!credential || typeof credential !== 'string' || credential.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Google ID token (credential) is required.' },
        { status: 400 }
      );
    }

    // ── 2. Verify Google client ID configuration ────────────────────────────
    if (!GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID / NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.');
      return NextResponse.json(
        { success: false, error: 'Google Sign-In is not configured on the server. Please check environment configuration.' },
        { status: 500 }
      );
    }

    // ── 3. Cryptographically verify the Google ID token server-side ────────
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (verifyErr) {
      console.error('Google ID token verification failed:', verifyErr.message);
      return NextResponse.json(
        { success: false, error: 'Google authentication failed: invalid or expired token. Please try again.' },
        { status: 401 }
      );
    }

    const payload = ticket.getPayload();

    // ── 4. Validate claims and email verification ─────────────────────────
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Google token payload is empty.' },
        { status: 401 }
      );
    }

    if (!payload.email_verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your Google account email is not verified. Please verify your Google email and try again.',
        },
        { status: 401 }
      );
    }

    const googleEmail = payload.email.toLowerCase().trim();
    const googleName = payload.name || googleEmail.split('@')[0];
    const googleSub = payload.sub; // Unique immutable Google user identifier

    // ── 5. Upsert the user in MongoDB ──────────────────────────────────────
    // Security policy: Never promote role to admin via Google OAuth.
    // Preserve existing role if already present; new users always get 'customer'.
    const db = await getDb();
    let user = await db.collection('users').findOne({ email: googleEmail });

    if (user) {
      if (!user.googleSub || user.googleSub !== googleSub) {
        await db.collection('users').updateOne(
          { _id: user._id },
          {
            $set: {
              googleSub,
              ...(user.name ? {} : { name: googleName }),
              updatedAt: new Date(),
            },
          }
        );
        user = await db.collection('users').findOne({ _id: user._id });
      }
    } else {
      const newUser = {
        name: googleName,
        email: googleEmail,
        googleSub,
        passwordHash: null,
        role: 'customer',   // Enforce customer role
        points: 100,        // Welcome loyalty bonus
        cart: [],
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insertResult = await db.collection('users').insertOne(newUser);
      user = { _id: insertResult.insertedId, ...newUser };
    }

    // ── 6. Create session cookie ───────────────────────────────────────────
    const sessionToken = signSession({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'customer',
    });

    const cookieStore = await cookies();
    cookieStore.set('slidex_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Signed in with Google successfully!',
      user: {
        name: user.name,
        email: user.email,
        points: user.points || 0,
        role: user.role || 'customer',
      },
    });
  } catch (error) {
    console.error('Google auth route error:', error.message);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during Google Sign-In.' },
      { status: 500 }
    );
  }
}
