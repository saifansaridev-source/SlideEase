/**
 * Centralized SlideEase Transactional Email Service.
 * Supports Resend API when RESEND_API_KEY is configured,
 * with safe error handling, structured HTML templates, and non-blocking delivery.
 */

const FROM_EMAIL = process.env.EMAIL_FROM || 'SlideEase Footwear <orders@slideease.in>';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendEmail({ to, subject, html, text }) {
  if (!to) return { success: false, error: 'Recipient email required' };

  if (RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text: text || subject,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Resend API error:', data);
        return { success: false, error: data.message || 'Resend API failed' };
      }
      return { success: true, messageId: data.id };
    } catch (err) {
      console.error('Email sending exception:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Safe fallback logger when external email credentials are not yet added
  console.log(`[TRANSACTIONAL_EMAIL_LOG] To: ${to} | Subject: "${subject}"`);
  return { success: true, simulated: true };
}

/**
 * Sends order confirmation email with complete order breakdown and items.
 */
export async function sendOrderConfirmationEmail(order) {
  const customerName = `${order.customer?.firstName || 'Valued'} ${order.customer?.lastName || 'Patron'}`.trim();
  const orderNumber = order.orderNumber;
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0;">
            <div style="font-weight: 600; color: #111827;">${item.name}</div>
            <div style="font-size: 13px; color: #6b7280;">Size: UK ${item.size} ${item.color ? `| Colour: ${item.color}` : ''}</div>
          </td>
          <td style="padding: 12px; text-align: center; color: #374151;">${item.quantity}</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #111827;">₹${item.lineTotal || item.unitPrice * item.quantity}</td>
        </tr>
      `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Order Confirmation - ${orderNumber}</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
        <div style="background-color: #1c1917; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: 2px;">SLIDEEASE</h1>
          <p style="color: #d6d3d1; font-size: 14px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Artisanal Handcrafted Footwear</p>
        </div>
        
        <div style="padding: 32px;">
          <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0;">Order Confirmed!</h2>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">Dear ${customerName},</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">Thank you for your order. Our master artisans are now preparing your handcrafted footwear. Below are your order details:</p>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <div style="font-size: 13px; color: #6b7280; text-transform: uppercase;">Order Number</div>
            <div style="font-size: 18px; font-weight: 700; color: #111827; font-family: monospace;">${orderNumber}</div>
            <div style="margin-top: 8px; font-size: 13px; color: #6b7280;">Payment Method: <strong>${order.payment?.method || 'Online'}</strong> (${order.payment?.status || 'Paid'})</div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; text-align: left; font-size: 13px; color: #6b7280; text-transform: uppercase;">
                <th style="padding-bottom: 8px;">Footwear Item</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #4b5563; font-size: 14px;">
              <span>Subtotal:</span>
              <span>₹${order.pricing?.subtotal || 0}</span>
            </div>
            ${order.pricing?.discount ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #059669; font-size: 14px;">
              <span>Discount Applied:</span>
              <span>-₹${order.pricing.discount}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #4b5563; font-size: 14px;">
              <span>Shipping:</span>
              <span>${order.pricing?.shipping === 0 ? 'FREE' : `₹${order.pricing?.shipping || 0}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 18px; font-weight: 700; color: #111827;">
              <span>Total Paid:</span>
              <span>₹${order.pricing?.total || 0}</span>
            </div>
          </div>

          <div style="margin-top: 32px; padding: 20px; background-color: #fafaf9; border-radius: 8px; border: 1px solid #e7e5e4;">
            <h4 style="margin: 0 0 8px 0; color: #1c1917; font-size: 14px; text-transform: uppercase;">Shipping Address</h4>
            <p style="margin: 0; color: #57534e; font-size: 14px; line-height: 1.4;">
              ${order.customer?.address || ''}<br>
              ${order.customer?.city || ''}, ${order.customer?.state || ''} ${order.customer?.zip || ''}<br>
              Phone: ${order.customer?.phone || ''}
            </p>
          </div>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          SlideEase Footwear &bull; Handcrafted Perfection &bull; Need help? Contact support@slideease.in
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: order.customer?.email,
    subject: `Your SlideEase Order Confirmation [${orderNumber}]`,
    html,
  });
}

/**
 * Sends order fulfillment and shipment tracking email.
 */
export async function sendShippingUpdateEmail(order, trackingInfo = {}) {
  const customerName = `${order.customer?.firstName || 'Valued'} ${order.customer?.lastName || 'Patron'}`.trim();
  const orderNumber = order.orderNumber;
  const courier = trackingInfo.courier || order.shipment?.courier || 'Express Courier';
  const trackingNumber = trackingInfo.trackingNumber || order.shipment?.trackingNumber || 'Available Shortly';
  const trackingUrl = trackingInfo.trackingUrl || `https://www.delhivery.com/track/package/${trackingNumber}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Your Footwear Has Shipped - ${orderNumber}</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
        <div style="background-color: #1c1917; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: 2px;">SLIDEEASE</h1>
          <p style="color: #d6d3d1; font-size: 14px; margin: 8px 0 0 0; text-transform: uppercase;">Handcrafted Indian Footwear</p>
        </div>
        
        <div style="padding: 32px;">
          <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0;">Your Order is On Its Way!</h2>
          <p style="color: #4b5563; font-size: 15px;">Dear ${customerName},</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">Great news! Your handcrafted footwear from order <strong>${orderNumber}</strong> has been carefully packed and dispatched.</p>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <div style="font-size: 13px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Courier Partner</div>
            <div style="font-size: 16px; font-weight: 600; color: #111827;">${courier}</div>
            
            <div style="font-size: 13px; color: #6b7280; text-transform: uppercase; margin-top: 12px; margin-bottom: 4px;">AWB / Tracking Number</div>
            <div style="font-size: 18px; font-weight: 700; color: #111827; font-family: monospace;">${trackingNumber}</div>

            <div style="margin-top: 16px;">
              <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px;">Track Consignment &rarr;</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: order.customer?.email,
    subject: `Your SlideEase Order ${orderNumber} Has Been Shipped!`,
    html,
  });
}
