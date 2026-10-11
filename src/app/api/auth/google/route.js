import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signSession } from '@/lib/auth';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

/**
 * POST /api/auth/google
 *
 * Accepts a Google ID token (credential) from the frontend, validates it
 * server-side using google-auth-library, then upserts the user in MongoDB
 * and issues a signed session cookie — exactly like the email/password flow.
 *
 * Body: { credential: "<google_id_token>" }
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

    // ── 2. Verify Google credentials are configured ─────────────────────────
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured.');
      return NextResponse.json(
        { success: false, error: 'Google Sign-In is not configured on the server. Contact support.' },
        { status: 500 }
      );
    }

    // ── 3. Verify the Google ID token server-side ──────────────────────────
    //    Uses google-auth-library OAuth2Client — validates signature, issuer,
    //    audience, and expiration. Never trust a bare email from the browser.
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

    // ── 4. Validate required claims ────────────────────────────────────────
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Google token payload is empty.' },
        { status: 401 }
      );
    }

    // Require a verified email address from Google
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
    const googleSub = payload.sub; // Unique Google user ID

    // ── 5. Upsert the user in MongoDB ──────────────────────────────────────
    //    Policy:
    //    a) If a user with this email already exists → link (update googleSub)
    //    b) If no user → create a new customer-role account
    //    Never elevate role to admin from Google data.
    const db = await getDb();

    let user = await db.collection('users').findOne({ email: googleEmail });

    if (user) {
      // Existing account: update Google sub if not already stored.
      // Keep existing role — do NOT promote any account via Google login.
      if (!user.googleSub || user.googleSub !== googleSub) {
        await db.collection('users').updateOne(
          { _id: user._id },
          {
            $set: {
              googleSub,
              // Update name only if not already set
              ...(user.name ? {} : { name: googleName }),
              updatedAt: new Date(),
            },
          }
        );
        // Refresh user object
        user = await db.collection('users').findOne({ _id: user._id });
      }
    } else {
      // New account: create customer record (no passwordHash — Google-only)
      const newUser = {
        name: googleName,
        email: googleEmail,
        googleSub,
        passwordHash: null, // Not a password account
        role: 'customer',   // Always customer — never admin from Google
        points: 100,        // Welcome bonus
        cart: [],
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insertResult = await db.collection('users').insertOne(newUser);
      user = { _id: insertResult.insertedId, ...newUser };
    }

    // ── 6. Create session cookie ───────────────────────────────────────────
    //    Reuse the same signSession / cookie format as email/password login.
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
