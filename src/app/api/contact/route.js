import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('startupbiz');

    const inquiry = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      status: 'unread',
      createdAt: new Date(),
    };

    const result = await db.collection('inquiries').insertOne(inquiry);

    return NextResponse.json({
      success: true,
      inquiryId: result.insertedId.toString(),
      message: 'Thank you! Your inquiry has been submitted to SlideEase support team.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('startupbiz');

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
