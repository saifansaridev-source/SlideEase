/**
 * Centralized SlideEase Transactional Email Service.
 * Implements business email address roles, Resend API integration,
 * resilient failure handling, and branded responsive HTML templates.
 */

// ─── CENTRALIZED BUSINESS EMAIL ADDRESSES & ROLES ───────────────────────────
export const BUSINESS_EMAILS = {
  ADMIN: 'admin@slideease.in',     // Administrative order alerts, return requests, operational exceptions
  SUPPORT: 'support@slideease.in', // Customer support, returns & exchange communications
  CEO: 'ceo@slideease.in',         // Management summaries, high-priority business alerts
  INFO: 'Info@slideease.in',       // General information, business & brand enquiries
  CONTACT: 'contact@slideease.in', // Contact form submissions and general customer messages
};

const FROM_EMAIL = process.env.EMAIL_FROM || `SlideEase Footwear <${BUSINESS_EMAILS.SUPPORT}>`;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * Base email dispatch function using Resend API with safe simulated fallback.
 */
export async function sendEmail({ to, cc, bcc, replyTo, subject, html, text }) {
  if (!to) return { success: false, error: 'Recipient email required' };

  const recipients = Array.isArray(to) ? to : [to];
  const normalizedRecipients = recipients.map((e) => String(e).toLowerCase().trim());

  if (RESEND_API_KEY && !RESEND_API_KEY.startsWith('re_your_') && RESEND_API_KEY.length > 10) {
    try {
      const payload = {
        from: FROM_EMAIL,
        to: normalizedRecipients,
        subject,
        html,
        text: text || subject,
      };
      if (replyTo) payload.reply_to = replyTo;
      if (cc) payload.cc = Array.isArray(cc) ? cc : [cc];
      if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];

      let response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = await response.json();

      // If custom domain is not yet verified on Resend, gracefully fallback to onboarding@resend.dev
      if (!response.ok && response.status === 403 && data.message?.includes('not verified')) {
        console.warn('[EMAIL NOTICE] Custom domain unverified on Resend. Falling back to onboarding@resend.dev with reply-to:', replyTo || BUSINESS_EMAILS.SUPPORT);
        const fallbackPayload = {
          ...payload,
          from: 'SlideEase Footwear <onboarding@resend.dev>',
          reply_to: replyTo || BUSINESS_EMAILS.SUPPORT,
        };
        response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fallbackPayload),
        });
        data = await response.json();
      }

      if (!response.ok) {
        console.error('Resend API error:', data);
        return { success: false, error: data.message || 'Resend API failed' };
      }
      return { success: true, messageId: data.id, provider: 'resend' };
    } catch (err) {
      console.error('Email sending exception:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Safe fallback logger when external email credentials are not yet added
  console.log(`[TRANSACTIONAL_EMAIL_LOG] To: ${normalizedRecipients.join(', ')} | Subject: "${subject}"`);
  return { success: true, simulated: true, provider: 'simulated_logger' };
}

// ─── EMAIL TEMPLATE HELPERS ──────────────────────────────────────────────────
function baseEmailTemplate({ title, heading, bodyContent, footerNote }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #1a2421; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: 2px;">SLIDEEASE</h1>
          <p style="color: #d1d5db; font-size: 13px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Artisanal Handcrafted Footwear</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 32px 28px;">
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">${heading}</h2>
          ${bodyContent}
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #334155;">SlideEase Footwear &bull; Cruelty-Free Artisanal Craftsmanship</p>
          <p style="margin: 0 0 8px 0;">Need assistance? Reach our concierge at <a href="mailto:${BUSINESS_EMAILS.SUPPORT}" style="color: #b45309; text-decoration: none;">${BUSINESS_EMAILS.SUPPORT}</a></p>
          ${footerNote ? `<p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;">${footerNote}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

// ─── 1. ORDER CONFIRMATION EMAIL ─────────────────────────────────────────────
export async function sendOrderConfirmationEmail(order) {
  const customerName = `${order.customer?.firstName || 'Valued'} ${order.customer?.lastName || 'Patron'}`.trim();
  const orderNumber = order.orderNumber;
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0;">
            <div style="font-weight: 600; color: #0f172a;">${item.name}</div>
            <div style="font-size: 13px; color: #64748b;">Size: UK ${item.size} ${item.color ? `| Colour: ${item.color}` : ''}</div>
          </td>
          <td style="padding: 12px; text-align: center; color: #334155;">${item.quantity || item.qty || 1}</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #0f172a;">₹${item.lineTotal || (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1)}</td>
        </tr>
      `
    )
    .join('');

  const bodyContent = `
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Thank you for choosing SlideEase. Our master footwear artisans are now handcrafting and preparing your order for dispatch.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0;">
      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Order Reference</div>
      <div style="font-size: 20px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 4px;">${orderNumber}</div>
      <div style="margin-top: 10px; font-size: 13px; color: #475569;">
        Payment Method: <strong>${order.payment?.method || 'Online'}</strong> &bull; Status: <span style="color: #059669; font-weight: 700;">${order.payment?.status || 'Paid'}</span>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase;">
          <th style="padding-bottom: 8px;">Footwear Item</th>
          <th style="padding-bottom: 8px; text-align: center;">Qty</th>
          <th style="padding-bottom: 8px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="border-top: 2px solid #e2e8f0; padding-top: 16px; margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #475569; font-size: 14px;">
        <span>Subtotal:</span>
        <span>₹${order.pricing?.subtotal || 0}</span>
      </div>
      ${order.pricing?.discount ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #059669; font-size: 14px;">
        <span>Discount:</span>
        <span>-₹${order.pricing.discount}</span>
      </div>` : ''}
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #475569; font-size: 14px;">
        <span>Shipping:</span>
        <span>${order.pricing?.shipping === 0 ? 'FREE' : `₹${order.pricing?.shipping || 0}`}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 18px; font-weight: 700; color: #0f172a;">
        <span>Total Amount:</span>
        <span>₹${order.pricing?.total || 0}</span>
      </div>
    </div>

    <div style="margin-top: 28px; padding: 18px; background-color: #fafaf9; border-radius: 8px; border: 1px solid #e7e5e4;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1c1917; margin-bottom: 6px;">Delivery Address</div>
      <p style="margin: 0; color: #44403c; font-size: 14px; line-height: 1.5;">
        ${order.customer?.address || ''}<br>
        ${order.customer?.city || ''}, ${order.customer?.state || ''} ${order.customer?.zip || ''}<br>
        Phone: ${order.customer?.phone || ''}
      </p>
    </div>
  `;

  const html = baseEmailTemplate({
    title: `Order Confirmation - ${orderNumber}`,
    heading: 'Your Order Has Been Confirmed!',
    bodyContent,
  });

  // Also BCC admin@slideease.in for operational order visibility
  return await sendEmail({
    to: order.customer?.email,
    bcc: BUSINESS_EMAILS.ADMIN,
    subject: `Your SlideEase Order Confirmation [${orderNumber}]`,
    html,
  });
}

// ─── 2. PAYMENT FAILURE EMAIL ────────────────────────────────────────────────
export async function sendPaymentFailedEmail(order, reason = 'Payment declined or cancelled') {
  const customerName = `${order.customer?.firstName || 'Valued'} ${order.customer?.lastName || 'Customer'}`.trim();
  const orderNumber = order.orderNumber || 'Pending Order';

  const bodyContent = `
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">We noticed that your recent payment attempt for order <strong>${orderNumber}</strong> could not be completed.</p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <div style="font-size: 13px; color: #991b1b; font-weight: 700;">Reason Reported:</div>
      <div style="font-size: 14px; color: #7f1d1d; margin-top: 4px;">${reason}</div>
    </div>

    <p style="color: #334155; font-size: 14px; line-height: 1.6;">
      Your selected footwear items remain temporarily reserved. You can retry with an alternative card, UPI, or select Cash on Delivery at checkout.
    </p>

    <div style="margin-top: 24px;">
      <a href="https://slideease.in/cart" style="display: inline-block; background-color: #b45309; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px;">
        Retry Payment &rarr;
      </a>
    </div>
  `;

  const html = baseEmailTemplate({
    title: `Payment Incomplete - ${orderNumber}`,
    heading: 'Payment Could Not Be Processed',
    bodyContent,
  });

  return await sendEmail({
    to: order.customer?.email,
    subject: `SlideEase Order ${orderNumber} — Payment Incomplete`,
    html,
  });
}

// ─── 3. SHIPPING & TRACKING UPDATE EMAIL ─────────────────────────────────────
export async function sendShippingUpdateEmail(order, trackingInfo = {}) {
  const customerName = `${order.customer?.firstName || 'Valued'} ${order.customer?.lastName || 'Patron'}`.trim();
  const orderNumber = order.orderNumber;
  const courier = trackingInfo.courier || order.shipment?.courier || 'Express Courier Partner';
  const trackingNumber = trackingInfo.trackingNumber || order.shipment?.trackingNumber || 'Available Shortly';
  const trackingUrl = trackingInfo.trackingUrl || `https://www.delhivery.com/track/package/${trackingNumber}`;

  const bodyContent = `
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Great news! Your handcrafted footwear from order <strong>${orderNumber}</strong> has passed final quality inspection and has been dispatched.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Courier Partner</div>
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 2px;">${courier}</div>
      
      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-top: 14px;">Air Waybill (AWB) / Tracking Number</div>
      <div style="font-size: 18px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 2px;">${trackingNumber}</div>

      <div style="margin-top: 18px;">
        <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #b45309; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px;">
          Track Live Consignment &rarr;
        </a>
      </div>
    </div>
  `;

  const html = baseEmailTemplate({
    title: `Your Footwear Has Shipped - ${orderNumber}`,
    heading: 'Your Order Is On Its Way!',
    bodyContent,
  });

  return await sendEmail({
    to: order.customer?.email,
    subject: `Your SlideEase Order ${orderNumber} Has Dispatched!`,
    html,
  });
}

// ─── 4. RETURN REQUEST RECEIVED EMAIL ────────────────────────────────────────
export async function sendReturnRequestedEmail(returnDoc) {
  const customerName = returnDoc.customerName || 'Valued Customer';
  const returnNumber = returnDoc.returnNumber || 'RET-Pending';
  const orderNumber = returnDoc.orderNumber;
  const isExchange = returnDoc.type === 'exchange';

  const bodyContent = `
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
      We have received your ${isExchange ? 'footwear size exchange' : 'return'} request for order <strong>${orderNumber}</strong>.
      Our concierge team is reviewing your submission.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0;">
      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Request Reference</div>
      <div style="font-size: 18px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 4px;">${returnNumber}</div>
      <div style="margin-top: 10px; font-size: 13px; color: #475569;">
        Request Type: <strong>${isExchange ? 'Size Exchange' : 'Return & Refund'}</strong><br>
        Reason: <strong>${returnDoc.reason}</strong>
      </div>
      ${isExchange && returnDoc.exchangeDetails ? `
      <div style="margin-top: 10px; font-size: 13px; color: #b45309; font-weight: 600;">
        Replacement Size: UK ${returnDoc.exchangeDetails.replacementSize}
      </div>` : ''}
    </div>

    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      Requests are typically reviewed within 24 business hours. Once approved, our courier partner will arrange a complimentary doorstep pickup.
    </p>
  `;

  const html = baseEmailTemplate({
    title: `${isExchange ? 'Exchange' : 'Return'} Request Received - ${returnNumber}`,
    heading: `${isExchange ? 'Size Exchange' : 'Return'} Request Received`,
    bodyContent,
  });

  // Notify customer and alert admin@slideease.in & support@slideease.in
  return await sendEmail({
    to: returnDoc.customerEmail,
    cc: BUSINESS_EMAILS.SUPPORT,
    bcc: BUSINESS_EMAILS.ADMIN,
    subject: `SlideEase ${isExchange ? 'Exchange' : 'Return'} Request Received [${returnNumber}]`,
    html,
  });
}

// ─── 5. RETURN STATUS UPDATED (APPROVED / REJECTED) ──────────────────────────
export async function sendReturnStatusEmail(returnDoc, newStatus, reason = '') {
  const customerName = returnDoc.customerName || 'Valued Customer';
  const returnNumber = returnDoc.returnNumber;
  const isApproved = newStatus === 'approved';

  const bodyContent = `
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
      Your request <strong>${returnNumber}</strong> for order <strong>${returnDoc.orderNumber}</strong> has been updated.
    </p>

    <div style="background-color: ${isApproved ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isApproved ? '#bbf7d0' : '#fecaca'}; border-radius: 8px; padding: 18px; margin: 24px 0;">
      <div style="font-size: 12px; color: ${isApproved ? '#166534' : '#991b1b'}; text-transform: uppercase; font-weight: 700;">Status</div>
      <div style="font-size: 18px; font-weight: 800; color: ${isApproved ? '#15803d' : '#b91c1c'}; margin-top: 4px;">
        ${isApproved ? 'Approved' : 'Request Not Approved'}
      </div>
      ${reason ? `
      <div style="margin-top: 10px; font-size: 13px; color: #334155;">
        <strong>Notes from Concierge:</strong> ${reason}
      </div>` : ''}
    </div>

    ${isApproved ? `
    <p style="color: #334155; font-size: 14px; line-height: 1.6;">
      Our logistics partner will schedule a doorstep reverse pickup within 1 to 2 business days.
      Please ensure footwear is placed in its original packaging.
    </p>` : `
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      If you have questions regarding this decision, please reply to this email or contact our support team at <a href="mailto:${BUSINESS_EMAILS.SUPPORT}">${BUSINESS_EMAILS.SUPPORT}</a>.
    </p>`}
  `;

  const html = baseEmailTemplate({
    title: `Return Request Status Update - ${returnNumber}`,
    heading: isApproved ? 'Your Request Has Been Approved' : 'Update on Your Return Request',
    bodyContent,
  });

  return await sendEmail({
    to: returnDoc.customerEmail,
    replyTo: BUSINESS_EMAILS.SUPPORT,
    subject: `SlideEase Request ${returnNumber} — ${isApproved ? 'Approved' : 'Status Update'}`,
    html,
  });
}

// ─── 6. REVERSE PICKUP SCHEDULED EMAIL ───────────────────────────────────────
export async function sendReturnPickupEmail(returnDoc, pickupDetails = {}) {
  const customerName = returnDoc.customerName || 'Valued Customer';
  const returnNumber = returnDoc.returnNumber;
  const courier = pickupDetails.courier || 'Delhivery Reverse Logistics';
  const awbCode = pickupDetails.awbCode || pickupDetails.trackingNumber || 'REV-DLH-PENDING';

  const bodyContent = `
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
      A doorstep reverse pickup has been scheduled for request <strong>${returnNumber}</strong>.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Logistics Partner</div>
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 2px;">${courier}</div>
      
      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-top: 12px;">Reverse AWB Code</div>
      <div style="font-size: 18px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 2px;">${awbCode}</div>
    </div>

    <div style="padding: 16px; background-color: #fffbeb; border-radius: 8px; border: 1px solid #fef3c7; font-size: 13px; color: #92400e; line-height: 1.5;">
      <strong>Handover Instructions:</strong> Please place the clean, unworn footwear inside the SlideEase shoebox. Hand over the package to the courier executive upon verification of the AWB code.
    </div>
  `;

  const html = baseEmailTemplate({
    title: `Reverse Pickup Scheduled - ${returnNumber}`,
    heading: 'Doorstep Pickup Scheduled',
    bodyContent,
  });

  return await sendEmail({
    to: returnDoc.customerEmail,
    replyTo: BUSINESS_EMAILS.SUPPORT,
    subject: `Reverse Pickup Scheduled for SlideEase Request [${returnNumber}]`,
    html,
  });
}

// ─── 7. QUALITY INSPECTION COMPLETED EMAIL ──────────────────────────────────
export async function sendReturnInspectionEmail(returnDoc, inspectionResult = {}) {
  const customerName = returnDoc.customerName || 'Valued Customer';
  const returnNumber = returnDoc.returnNumber;
  const passed = inspectionResult.passed !== false;

  const bodyContent = `
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
      Your returned footwear has arrived at our Powai workshop and undergone artisanal quality inspection.
    </p>

    <div style="background-color: ${passed ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${passed ? '#bbf7d0' : '#fecaca'}; border-radius: 8px; padding: 18px; margin: 24px 0;">
      <div style="font-size: 12px; color: ${passed ? '#166534' : '#991b1b'}; text-transform: uppercase; font-weight: 700;">Inspection Result</div>
      <div style="font-size: 18px; font-weight: 800; color: ${passed ? '#15803d' : '#b91c1c'}; margin-top: 4px;">
        ${passed ? 'Verified & Accepted' : 'Inspection Exception'}
      </div>
      ${inspectionResult.notes ? `
      <div style="margin-top: 8px; font-size: 13px; color: #334155;">${inspectionResult.notes}</div>` : ''}
    </div>

    ${passed ? `
    <p style="color: #334155; font-size: 14px; line-height: 1.6;">
      ${returnDoc.type === 'exchange'
        ? 'Your replacement pair is now being packaged for express dispatch.'
        : 'Your refund has been queued for immediate processing.'}
    </p>` : `
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      Our concierge will reach out to discuss the details regarding this item.
    </p>`}
  `;

  const html = baseEmailTemplate({
    title: `Inspection Complete - ${returnNumber}`,
    heading: 'Item Received & Inspected',
    bodyContent,
  });

  return await sendEmail({
    to: returnDoc.customerEmail,
    replyTo: BUSINESS_EMAILS.SUPPORT,
    subject: `SlideEase Request ${returnNumber} — Inspection Update`,
    html,
  });
}

// ─── 8. REFUND COMPLETED EMAIL ──────────────────────────────────────────────
export async function sendRefundCompletedEmail(returnDoc, refundRecord = {}) {
  const customerName = returnDoc.customerName || 'Valued Customer';
  const refundAmount = refundRecord.amount || returnDoc.refundAmount || 0;
  const refundMethod = refundRecord.method || 'Original Payment Mode';
  const refundRef = refundRecord.reference || refundRecord.utr || 'REF-PROCESSED';

  const bodyContent = `
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
      We have processed the refund for your return request <strong>${returnDoc.returnNumber}</strong> (Order <strong>${returnDoc.orderNumber}</strong>).
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <div style="font-size: 12px; color: #166534; text-transform: uppercase; font-weight: 700;">Refund Amount</div>
      <div style="font-size: 24px; font-weight: 800; color: #15803d; margin-top: 4px;">₹${refundAmount.toLocaleString('en-IN')}</div>

      <div style="margin-top: 12px; font-size: 13px; color: #334155;">
        Method: <strong>${refundMethod}</strong><br>
        Transaction / UTR Reference: <code style="font-weight: 700;">${refundRef}</code>
      </div>
    </div>

    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      Depending on your bank or card issuer, funds typically reflect in your account within 3 to 5 business days.
    </p>
  `;

  const html = baseEmailTemplate({
    title: `Refund Processed - ${returnDoc.returnNumber}`,
    heading: 'Refund Processed Successfully',
    bodyContent,
  });

  return await sendEmail({
    to: returnDoc.customerEmail,
    bcc: BUSINESS_EMAILS.ADMIN,
    subject: `SlideEase Refund Confirmed: ₹${refundAmount} [${returnDoc.returnNumber}]`,
    html,
  });
}

// ─── 9. CONTACT FORM ENQUIRY EMAIL ──────────────────────────────────────────
export async function sendContactInquiryNotification(inquiry) {
  const adminHtml = baseEmailTemplate({
    title: `New Inquiry from ${inquiry.name}`,
    heading: 'New Customer Message Received',
    bodyContent: `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0;"><strong>Customer Name:</strong> ${inquiry.name}</p>
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
        <p style="margin: 0 0 8px 0;"><strong>Phone:</strong> ${inquiry.phone || 'Not provided'}</p>
        <p style="margin: 0 0 8px 0;"><strong>Subject:</strong> ${inquiry.subject}</p>
      </div>
      <div style="border-left: 4px solid #b45309; padding-left: 14px; margin: 16px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        ${inquiry.message}
      </div>
    `,
  });

  return await sendEmail({
    to: BUSINESS_EMAILS.CONTACT,
    cc: BUSINESS_EMAILS.INFO,
    replyTo: inquiry.email,
    subject: `[SlideEase Inquiry] ${inquiry.subject} — from ${inquiry.name}`,
    html: adminHtml,
  });
}
