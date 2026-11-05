import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { processDeliveredReviewReminders } from '@/lib/notifications';

async function verifyAuth(request) {
  // Allow authorization via Bearer token (for cron / external webhooks)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.NOTIFICATION_CRON_KEY;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Otherwise check admin session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('slidex_session');
  if (sessionCookie) {
    const session = verifySession(sessionCookie.value);
    if (session?.role === 'admin') {
      return true;
    }
  }

  return false;
}

export async function POST(request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const report = await processDeliveredReviewReminders();

    return NextResponse.json({
      success: true,
      message: `Processed ${report.processedCount} review reminder(s)`,
      report,
    });
  } catch (error) {
    console.error('Error processing delivery review reminders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  return POST(request);
}
