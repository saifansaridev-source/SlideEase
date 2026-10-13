import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { createReversePickup } from '@/lib/logistics';
import { sendReturnPickupEmail } from '@/lib/email';

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('slidex_session');
  if (!sessionCookie) return null;
  const session = verifySession(sessionCookie.value);
  return session?.role === 'admin' ? session : null;
}

export async function POST(request) {
  try {
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized administrative access.' },
        { status: 401 }
      );
    }

    const { returnId, preferredCourier = 'Delhivery Surface Reverse' } = await request.json();

    if (!returnId) {
      return NextResponse.json({ success: false, error: 'returnId is required.' }, { status: 400 });
    }

    const db = await getDb();
    const returnDoc = await db.collection('returns').findOne({ _id: new ObjectId(returnId) });

    if (!returnDoc) {
      return NextResponse.json({ success: false, error: 'Return request not found.' }, { status: 404 });
    }

    // Find original order for shipping addresses and customer details
    const order = await db.collection('orders').findOne({
      $or: [
        { _id: new ObjectId(returnDoc.orderId) },
        { orderNumber: returnDoc.orderNumber },
      ]
    });

    const pickupAddress = returnDoc.pickupAddress || order?.customer || {};

    const orderPayload = {
      orderNumber: returnDoc.returnNumber,
      customer: {
        firstName: returnDoc.customerName?.split(' ')[0] || pickupAddress.firstName || 'Valued',
        lastName: returnDoc.customerName?.split(' ').slice(1).join(' ') || pickupAddress.lastName || 'Customer',
        address: pickupAddress.address || '',
        city: pickupAddress.city || '',
        state: pickupAddress.state || 'Maharashtra',
        zip: pickupAddress.zip || '',
        phone: returnDoc.customerPhone || pickupAddress.phone || '',
      },
      items: returnDoc.items || [],
    };

    // Call logistics integration
    const pickupResult = await createReversePickup(orderPayload, returnDoc.items, returnDoc.reason);

    if (!pickupResult || !pickupResult.success) {
      return NextResponse.json({
        success: false,
        error: pickupResult?.error || 'Failed to dispatch reverse pickup via courier partner.'
      }, { status: 500 });
    }

    const now = new Date();
    const pickupDetails = {
      courier: pickupResult.courier || preferredCourier,
      awbCode: pickupResult.awbCode || pickupResult.trackingNumber,
      returnId: pickupResult.returnId,
      trackingUrl: pickupResult.trackingUrl || `https://www.delhivery.com/track/package/${pickupResult.awbCode}`,
      provider: pickupResult.provider,
      scheduledAt: now,
    };

    // Update return request status and timeline
    await db.collection('returns').updateOne(
      { _id: new ObjectId(returnId) },
      {
        $set: {
          status: 'pickup_scheduled',
          pickupDetails,
          updatedAt: now,
        },
        $push: {
          statusHistory: {
            status: 'pickup_scheduled',
            timestamp: now,
            actor: adminSession.name || 'Admin Operations',
            notes: `Reverse pickup scheduled via ${pickupDetails.courier} (AWB: ${pickupDetails.awbCode})`,
          }
        }
      }
    );

    // Update order return status
    if (order) {
      await db.collection('orders').updateOne(
        { _id: order._id },
        {
          $set: {
            returnStatus: 'Pickup Scheduled',
            returnAwb: pickupDetails.awbCode,
            updatedAt: now,
          }
        }
      );
    }

    // Dispatch email notification to customer
    try {
      await sendReturnPickupEmail(returnDoc, pickupDetails);
    } catch (mailErr) {
      console.warn('Reverse pickup notification email warning:', mailErr.message);
    }

    return NextResponse.json({
      success: true,
      pickupDetails,
      message: `Reverse pickup successfully dispatched! AWB: ${pickupDetails.awbCode}`
    });
  } catch (error) {
    console.error('Reverse pickup dispatch exception:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
