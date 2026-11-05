import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { sendWelcomeNewsletterEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email;
    let customerName = (body.name || body.firstName || '').trim();

    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Reject excessively long inputs
    if (cleanEmail.length > 254) {
      return NextResponse.json({ success: false, error: 'Email address is invalid.' }, { status: 400 });
    }

    const db = await getDb();

    // If customer name wasn't provided directly in the form, check if this is an existing customer
    if (!customerName) {
      try {
        const existingUser = await db.collection('users').findOne({ email: cleanEmail });
        if (existingUser?.name) {
          customerName = existingUser.name.trim();
        }
      } catch (_) {}
    }

    // Idempotency: handle duplicate gracefully, do NOT re-send welcome email
    const existing = await db.collection('newsletter').findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ success: true, message: 'You are already subscribed! Use code SLIDEEASE10 for 10% off.' });
    }

    // Persist subscription
    await db.collection('newsletter').insertOne({
      email: cleanEmail,
      name: customerName || '',
      active: true,
      welcomeEmailSent: false,
      welcomeEmailStatus: 'queued',
      subscribedAt: new Date(),
    });

    // Send welcome email asynchronously — non-blocking for the UI response
    sendWelcomeNewsletterEmail(cleanEmail, customerName).then((result) => {
      const emailStatus = result?.simulated ? 'simulated' : (result?.success ? 'delivered' : 'failed');
      db.collection('newsletter').updateOne(
        { email: cleanEmail },
        { 
          $set: { 
            welcomeEmailSent: result?.success !== false, 
            welcomeEmailStatus: emailStatus,
            welcomeEmailSentAt: new Date(),
            messageId: result?.messageId || null,
          } 
        }
      ).catch(() => {});
    }).catch((err) => {
      console.warn('[newsletter] Welcome email non-fatal error:', err.message);
    });

    return NextResponse.json({
      success: true,
      message: '🎉 Welcome to Slideease! Your exclusive 10% off code SLIDEEASE10 is on its way to your inbox.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

