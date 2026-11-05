import { getDb } from './mongodb.js';

/**
 * Slideease Notification Engine
 * Handles WhatsApp & SMS transactional alerts for orders with idempotency tracking.
 * Supports WhatsApp Business API (Cloud API) & Indian SMS Gateway (Fast2SMS / Twilio)
 * with automatic dev/staging fallback simulation.
 */

const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || (WHATSAPP_PHONE_ID ? `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages` : null);
const SMS_API_KEY = process.env.SMS_API_KEY || process.env.FAST2SMS_API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'SLIDEX';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://slideease.in';

/**
 * Normalize Indian phone numbers to E.164 format without '+'
 * Example: '9876543210' -> '919876543210'
 */
export function normalizePhoneNumber(rawPhone) {
  if (!rawPhone) return '';
  const cleaned = String(rawPhone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  return cleaned;
}

/**
 * Extract 10-digit Indian mobile number for national SMS gateways
 */
export function extract10DigitPhone(rawPhone) {
  if (!rawPhone) return '';
  const cleaned = String(rawPhone).replace(/\D/g, '');
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  return cleaned.slice(-10);
}

/**
 * Low-level dispatch for WhatsApp with DB audit & idempotency
 */
export async function sendWhatsAppMessage({ to, text, type, orderNumber, metadata = {} }) {
  const recipient = normalizePhoneNumber(to);
  if (!recipient || recipient.length < 10) {
    console.warn(`[WhatsApp] Invalid phone number skipped: "${to}" for order ${orderNumber}`);
    return { success: false, reason: 'invalid_phone' };
  }

  let db;
  try {
    db = await getDb();
  } catch (e) {
    db = null;
  }

  // Idempotency check: don't send duplicate notification for same order + type on whatsapp channel
  if (db && orderNumber && type) {
    const existing = await db.collection('notifications').findOne({
      orderNumber,
      type,
      channel: 'whatsapp',
      recipient,
      status: { $in: ['sent', 'simulated'] },
    });
    if (existing) {
      console.log(`[WhatsApp] Notification already sent for ${orderNumber} (${type}), skipping.`);
      return { success: true, duplicate: true, status: existing.status };
    }
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'text',
    text: { preview_url: true, body: text },
  };

  let deliveryStatus = 'simulated';
  let providerResponse = null;

  if (WHATSAPP_API_KEY && WHATSAPP_API_URL) {
    try {
      const res = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      providerResponse = await res.json();
      if (res.ok) {
        deliveryStatus = 'sent';
      } else {
        deliveryStatus = 'failed';
        console.error('[WhatsApp Cloud API Error]:', providerResponse);
      }
    } catch (apiErr) {
      deliveryStatus = 'failed';
      providerResponse = { error: apiErr.message };
      console.error('[WhatsApp Network Error]:', apiErr.message);
    }
  } else {
    // Graceful simulation mode when credentials not yet configured
    console.log(`[WhatsApp Simulation Mode] To: +${recipient} | Type: ${type} | Order: ${orderNumber}`);
    console.log(`[WhatsApp Message Body]:\n${text}`);
    deliveryStatus = 'simulated';
    providerResponse = { note: 'Simulated dispatch. Set WHATSAPP_API_KEY and WHATSAPP_PHONE_ID in .env.local to enable live delivery.' };
  }

  // Log notification to database
  if (db) {
    try {
      await db.collection('notifications').insertOne({
        recipient,
        orderNumber: orderNumber || null,
        type: type || 'general',
        channel: 'whatsapp',
        text,
        metadata,
        status: deliveryStatus,
        providerResponse,
        createdAt: new Date(),
      });
    } catch (logErr) {
      console.warn('[WhatsApp] Failed to save notification log:', logErr.message);
    }
  }

  return { success: deliveryStatus !== 'failed', status: deliveryStatus };
}

/**
 * Low-level dispatch for SMS with DB audit & idempotency
 */
export async function sendSMSMessage({ to, text, type, orderNumber, metadata = {} }) {
  const recipient = extract10DigitPhone(to);
  if (!recipient || recipient.length !== 10) {
    console.warn(`[SMS] Invalid 10-digit Indian phone number: "${to}" for order ${orderNumber}`);
    return { success: false, reason: 'invalid_phone' };
  }

  let db;
  try {
    db = await getDb();
  } catch (e) {
    db = null;
  }

  // Idempotency check: don't send duplicate notification for same order + type on sms channel
  if (db && orderNumber && type) {
    const existing = await db.collection('notifications').findOne({
      orderNumber,
      type,
      channel: 'sms',
      recipient: `91${recipient}`,
      status: { $in: ['sent', 'simulated'] },
    });
    if (existing) {
      console.log(`[SMS] Notification already sent for ${orderNumber} (${type}), skipping.`);
      return { success: true, duplicate: true, status: existing.status };
    }
  }

  let deliveryStatus = 'simulated';
  let providerResponse = null;

  if (SMS_API_KEY && SMS_API_KEY.length > 8) {
    try {
      // Standard Fast2SMS API dispatch
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: text,
          language: 'english',
          flash: 0,
          numbers: recipient,
        }),
      });
      providerResponse = await res.json();
      if (res.ok && providerResponse.return) {
        deliveryStatus = 'sent';
      } else {
        deliveryStatus = 'failed';
        console.error('[SMS Gateway Error]:', providerResponse);
      }
    } catch (apiErr) {
      deliveryStatus = 'failed';
      providerResponse = { error: apiErr.message };
      console.error('[SMS Network Error]:', apiErr.message);
    }
  } else {
    // Graceful simulation mode when credentials not yet configured
    console.log(`[SMS Simulation Mode] To: +91${recipient} | Type: ${type} | Order: ${orderNumber}`);
    console.log(`[SMS Message Body]:\n${text}`);
    deliveryStatus = 'simulated';
    providerResponse = { note: 'Simulated SMS dispatch. Set SMS_API_KEY in .env.local to enable live delivery.' };
  }

  // Log notification to database
  if (db) {
    try {
      await db.collection('notifications').insertOne({
        recipient: `91${recipient}`,
        orderNumber: orderNumber || null,
        type: type || 'general',
        channel: 'sms',
        text,
        metadata,
        status: deliveryStatus,
        providerResponse,
        createdAt: new Date(),
      });
    } catch (logErr) {
      console.warn('[SMS] Failed to save notification log:', logErr.message);
    }
  }

  return { success: deliveryStatus !== 'failed', status: deliveryStatus };
}

/**
 * 1. Order Confirmation WhatsApp Alert
 */
export async function sendOrderConfirmationWhatsApp(order) {
  if (!order || !order.customer?.phone) return { success: false, reason: 'missing_data' };

  const firstName = order.customer.firstName || 'Valued Customer';
  const orderNumber = order.orderNumber || 'SE-ORDER';
  const total = order.pricing?.total?.toLocaleString('en-IN') || order.pricing?.finalTotal?.toLocaleString('en-IN') || '0';
  const isCod = order.payment?.method === 'COD';
  const trackingUrl = `${SITE_URL}/orders/${order.orderNumber || order._id}/tracking`;

  const text = `Hey ${firstName}! 🎉 Your order for Slideease shoes is confirmed (Order ID: #${orderNumber}). We are getting your pair ready for peak performance. We will message you again as soon as it ships! Track your journey here: ${trackingUrl} - Team Slideease`;

  return sendWhatsAppMessage({
    to: order.customer.phone,
    text,
    type: 'order_confirmation',
    orderNumber,
    metadata: { orderId: order._id?.toString(), total, isCod },
  });
}

/**
 * 1b. Order Confirmation SMS Alert
 */
export async function sendOrderConfirmationSMS(order) {
  if (!order || !order.customer?.phone) return { success: false, reason: 'missing_data' };

  const firstName = order.customer.firstName || 'Customer';
  const orderNumber = order.orderNumber || 'SE-ORDER';
  const trackingUrl = `${SITE_URL}/orders/${order.orderNumber || order._id}/tracking`;

  const text = `Hey ${firstName}! Your Slideease shoes order #${orderNumber} is confirmed! We will message you when it ships. Track: ${trackingUrl} - Slideease`;

  return sendSMSMessage({
    to: order.customer.phone,
    text,
    type: 'order_confirmation',
    orderNumber,
    metadata: { orderId: order._id?.toString() },
  });
}

/**
 * 2. Order Shipped WhatsApp Alert
 */
export async function sendOrderShippedWhatsApp(order, trackingInfo = {}) {
  if (!order || !order.customer?.phone) return { success: false, reason: 'missing_data' };

  const firstName = order.customer.firstName || 'Valued Customer';
  const orderNumber = order.orderNumber || 'SE-ORDER';
  const courier = trackingInfo.courier || order.courierName || 'Express Courier Partner';
  const trackingNumber = trackingInfo.trackingNumber || order.trackingNumber || '';
  const trackingUrl = trackingInfo.trackingUrl || (trackingNumber ? `https://shiprocket.co/tracking/${trackingNumber}` : `${SITE_URL}/orders/${orderNumber}/tracking`);

  const text = `Great news, ${firstName}! 🚚 Your Slideease shoes have been shipped via ${courier}. Get ready to step in and slide on without the hassle of laces. Track your live delivery here: ${trackingUrl}. - Team Slideease`;

  return sendWhatsAppMessage({
    to: order.customer.phone,
    text,
    type: 'order_shipped',
    orderNumber,
    metadata: { orderId: order._id?.toString(), courier, trackingNumber },
  });
}

/**
 * 2b. Order Shipped SMS Alert
 */
export async function sendOrderShippedSMS(order, trackingInfo = {}) {
  if (!order || !order.customer?.phone) return { success: false, reason: 'missing_data' };

  const firstName = order.customer.firstName || 'Customer';
  const orderNumber = order.orderNumber || 'SE-ORDER';
  const courier = trackingInfo.courier || order.courierName || 'Courier';
  const trackingNumber = trackingInfo.trackingNumber || order.trackingNumber || '';
  const trackingUrl = trackingInfo.trackingUrl || (trackingNumber ? `https://shiprocket.co/tracking/${trackingNumber}` : `${SITE_URL}/orders/${orderNumber}/tracking`);

  const text = `Great news ${firstName}! Your Slideease shoes #${orderNumber} have shipped via ${courier}. Track live delivery: ${trackingUrl} - Slideease`;

  return sendSMSMessage({
    to: order.customer.phone,
    text,
    type: 'order_shipped',
    orderNumber,
    metadata: { orderId: order._id?.toString(), courier, trackingNumber },
  });
}

/**
 * 3. Order Delivered WhatsApp Alert
 */
export async function sendOrderDeliveredWhatsApp(order) {
  if (!order || !order.customer?.phone) return { success: false, reason: 'missing_data' };

  const firstName = order.customer.firstName || 'Valued Customer';
  const orderNumber = order.orderNumber || 'SE-ORDER';

  const text = `Delivered! 🎉\n\nHello ${firstName}, your Slideease order #${orderNumber} has been successfully delivered! We hope you love your new hands-free shoes with zero-bending ease and wide-toe comfort.\n\nNeed a size exchange within 7 days? Reach us at ${SITE_URL}/shipping-returns\n\nStep effortlessly,\nTeam Slideease`;

  return sendWhatsAppMessage({
    to: order.customer.phone,
    text,
    type: 'order_delivered',
    orderNumber,
    metadata: { orderId: order._id?.toString() },
  });
}

/**
 * 4. 48-Hour Post-Delivery Review Request WhatsApp Alert
 */
export async function sendDeliveryReviewWhatsApp(order) {
  if (!order || !order.customer?.phone) return { success: false, reason: 'missing_data' };

  const firstName = order.customer.firstName || 'Valued Customer';
  const orderNumber = order.orderNumber || 'SE-ORDER';
  const firstItem = (order.items && order.items[0]) ? order.items[0] : null;
  const reviewUrl = firstItem ? `${SITE_URL}/shop/${firstItem.id || firstItem.slug}#reviews` : `${SITE_URL}/shop`;

  const text = `Hi ${firstName}! Your Slideease pair was delivered recently. Are you enjoying the effortless comfort? If our shoes have helped your daily hustle or made life easier for a family member, please share your review here: ${reviewUrl}. Your feedback keeps us moving forward! - Team Slideease`;

  return sendWhatsAppMessage({
    to: order.customer.phone,
    text,
    type: 'review_reminder_48h',
    orderNumber,
    metadata: { orderId: order._id?.toString() },
  });
}

/**
 * Batch processor for 48-Hour Review Reminders
 * Scans for delivered orders that were delivered at least 48 hours ago and have not received a review reminder,
 * and excludes cancelled or returned orders.
 */
export async function processDeliveredReviewReminders() {
  const db = await getDb();
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const eligibleOrders = await db.collection('orders').find({
    status: 'delivered',
    returnRequested: { $ne: true },
    returnStatus: { $exists: false },
    deliveredAt: { $lte: twoDaysAgo },
    reviewReminderSent: { $ne: true },
  }).limit(25).toArray();

  const results = [];

  for (const order of eligibleOrders) {
    try {
      const res = await sendDeliveryReviewWhatsApp(order);
      await db.collection('orders').updateOne(
        { _id: order._id },
        {
          $set: {
            reviewReminderSent: true,
            reviewReminderSentAt: new Date(),
            reviewReminderStatus: res.status,
          }
        }
      );
      results.push({ orderNumber: order.orderNumber, success: true, status: res.status });
    } catch (err) {
      console.error(`[Review Reminder] Failed for order ${order.orderNumber}:`, err.message);
      results.push({ orderNumber: order.orderNumber, success: false, error: err.message });
    }
  }

  return {
    processedCount: results.length,
    results,
  };
}
