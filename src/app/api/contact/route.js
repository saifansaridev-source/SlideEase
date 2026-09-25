import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message exceeds maximum allowed character length (5000).' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanMessage = message.trim();

    const db = await getDb();

    const inquiry = {
      name: cleanName,
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: cleanMessage,
      status: 'unread',
      createdAt: new Date(),
    };

    const result = await db.collection('inquiries').insertOne(inquiry);

    // Send acknowledgement email safely
    try {
      await sendEmail({
        to: cleanEmail,
        subject: 'We Received Your Message — SlideEase Footwear Concierge',
        html: `
          <div style="font-family: sans-serif; padding: 24px; color: #1f2937;">
            <h2 style="color: #111827;">Namaste ${cleanName},</h2>
            <p>Thank you for contacting SlideEase. We have received your inquiry regarding <strong>"${inquiry.subject}"</strong>.</p>
            <p>Our footwear concierge team will review your message and respond within 24 business hours.</p>
            <blockquote style="border-left: 4px solid #d97706; padding-left: 12px; margin: 16px 0; color: #4b5563;">
              ${cleanMessage}
            </blockquote>
            <p style="font-size: 13px; color: #6b7280;">SlideEase Footwear &bull; Mumbai, India</p>
          </div>
        `,
        text: `Thank you for contacting SlideEase. We have received your inquiry: "${cleanMessage}". We will respond shortly.`
      });
    } catch (e) {
      console.warn('Contact acknowledgement email non-fatal error:', e.message);
    }

    return NextResponse.json({
      success: true,
      inquiryId: result.insertedId.toString(),
      message: 'Thank you! Your inquiry has been submitted to SlideEase concierge team.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDb();

    const inquiries = await db
      .collection('inquiries')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      inquiries: inquiries.map((i) => ({ ...i, _id: i._id.toString() })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
