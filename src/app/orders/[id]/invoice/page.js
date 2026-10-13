'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderInvoicePage() {
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [storeSettings, setStoreSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;

    Promise.all([
      fetch(`/api/orders/${orderId}`).then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()).catch(() => null),
    ])
      .then(([orderRes, settingsRes]) => {
        if (orderRes?.success && (orderRes.data || orderRes.order)) {
          setOrder(orderRes.data || orderRes.order);
        } else {
          setError(orderRes?.error || 'Order not found');
        }
        if (settingsRes?.success && settingsRes.data) {
          setStoreSettings(settingsRes.data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', fontFamily: 'sans-serif' }}>
        <p>Generating Tax Invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#ef4444' }}>Unable to load invoice</h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={() => window.history.back()} style={{ color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
          <Link href="/dashboard" style={{ color: '#2563eb', fontWeight: 600 }}>My Account</Link>
          <Link href="/shop" style={{ color: '#64748b', fontWeight: 500 }}>Return to Store</Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const subtotal = order.pricing?.subtotal || order.subtotal || items.reduce((acc, it) => {
    const q = it.quantity || it.qty || 1;
    const p = it.unitPrice !== undefined ? it.unitPrice : (it.price || 0);
    return acc + (it.lineTotal || (p * q));
  }, 0);
  const discount = order.pricing?.discount || order.discount || 0;
  const shipping = order.pricing?.shipping ?? order.shipping ?? 0;
  const codCharge = order.pricing?.codCharge ?? order.codCharge ?? 0;
  const total = order.pricing?.total || order.total || Math.max(0, subtotal - discount + shipping + codCharge);

  const customer = order.customer || {};
  const customerName = `${customer.firstName || customer.firstname || ''} ${customer.lastName || customer.lastname || ''}`.trim() || order.firstName || 'Valued Customer';
  const customerEmail = customer.email || order.email || order.userEmail || '';
  const customerPhone = customer.phone || order.phone || '';
  const customerAddress = customer.address || order.address || '';
  const customerCity = customer.city || order.city || '';
  const customerState = customer.state || order.state || 'Maharashtra';
  const customerZip = customer.zip || order.zip || '';

  // Inter-State vs Intra-State GST Compliance (Origin: Maharashtra, State Code 27)
  const isInterState = customerState && customerState.toLowerCase().trim() !== 'maharashtra';
  // 18% Total GST (Footwear standard rate):
  // Intra-State: 9% CGST + 9% SGST
  // Inter-State: 18% IGST
  const taxableValue = Math.round(total / 1.18);
  const totalGst = total - taxableValue;
  const cgst = isInterState ? 0 : Math.round(totalGst / 2);
  const sgst = isInterState ? 0 : (totalGst - cgst);
  const igst = isInterState ? totalGst : 0;

  const isCancelled = order.status?.toLowerCase() === 'cancelled';
  const isFailed = order.payment?.status?.toLowerCase() === 'failed';
  const isCancelledOrFailed = isCancelled || isFailed;
  const isCod = (order.payment?.method === 'COD' || order.paymentMethod === 'COD');
  const isPaid = order.payment?.status === 'Paid';
  const isUnpaidOnline = !isPaid && !isCod && !isCancelledOrFailed;

  const invoiceNum = `INV-2026-${order.orderNumber || order.orderId || String(order._id).slice(-6)}`;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : 'N/A';

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '2rem 1rem' }}>
      
      {/* Top action toolbar (hidden on print) */}
      <div className="no-print" style={{ maxWidth: '820px', margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
          ← Back to Account
        </Link>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button 
            onClick={() => window.print()}
            style={{
              backgroundColor: isCancelledOrFailed ? '#ef4444' : isUnpaidOnline ? '#d97706' : '#1e293b',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            🖨️ {isUnpaidOnline ? 'Print Proforma Invoice' : 'Print / Save as PDF'}
          </button>
        </div>
      </div>

      {/* INVOICE PAPER CONTAINER */}
      <div 
        id="invoice-paper"
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '3rem 3.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: '#1e293b',
          lineHeight: 1.5,
          position: 'relative',
        }}
      >
        {/* VOID WATERMARK IF CANCELLED OR FAILED */}
        {isCancelledOrFailed && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
            fontSize: '5.5rem',
            fontWeight: 900,
            color: 'rgba(239, 68, 68, 0.14)',
            pointerEvents: 'none',
            letterSpacing: '10px',
            textTransform: 'uppercase',
            zIndex: 1,
            userSelect: 'none',
          }}>
            VOID / CANCELLED
          </div>
        )}

        {/* UNPAID PROFORMA WATERMARK IF PENDING ONLINE PAYMENT */}
        {isUnpaidOnline && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
            fontSize: '4.5rem',
            fontWeight: 900,
            color: 'rgba(217, 119, 6, 0.12)',
            pointerEvents: 'none',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            zIndex: 1,
            userSelect: 'none',
          }}>
            PROFORMA / UNPAID
          </div>
        )}

        {/* Warning banner for cancelled / failed orders */}
        {isCancelledOrFailed && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            color: '#991b1b',
            padding: '0.85rem 1.2rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}>
            <span>⚠️</span>
            <span>
              <strong>NOTICE:</strong> This order has been {isCancelled ? 'cancelled' : 'marked with failed payment'}. This document is void and does NOT represent an active invoice or receipt of payment.
            </span>
          </div>
        )}

        {/* Warning banner for unpaid online orders */}
        {isUnpaidOnline && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '2px solid #f59e0b',
            color: '#92400e',
            padding: '0.85rem 1.2rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}>
            <span>⏳</span>
            <span>
              <strong>PROFORMA NOTICE:</strong> Payment for this order is pending verification. This document is a proforma invoice and does not certify completed payment.
            </span>
          </div>
        )}

        {/* Header: Company & Tax Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0f172a', letterSpacing: '-0.5px' }}>
              {(storeSettings?.storeName || 'SlideEase Footwear').toUpperCase()}
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{storeSettings?.storeTagline || 'Handcrafted Heritage & Vegan Orthotic Footwear'}</p>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#475569' }}>
              {storeSettings?.address || 'Unit 402, Heritage Crafts Complex, Lower Parel, Mumbai, Maharashtra - 400013'}<br />
              <strong>GSTIN:</strong> {storeSettings?.gstNumber || '27AABCS1429B1Z8'} | <strong>State Code:</strong> 27 (Maharashtra)
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: isCancelledOrFailed ? '#fee2e2' : isUnpaidOnline ? '#fef3c7' : '#f8fafc',
              border: isCancelledOrFailed ? '1px solid #f87171' : isUnpaidOnline ? '1px solid #fbbf24' : '1px solid #e2e8f0',
              padding: '0.3rem 0.8rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: isCancelledOrFailed ? '#b91c1c' : isUnpaidOnline ? '#b45309' : '#3b82f6',
              letterSpacing: '0.5px',
              marginBottom: '0.5rem'
            }}>
              {isCancelledOrFailed ? 'VOID / CANCELLED DOCUMENT' : isUnpaidOnline ? 'PROFORMA INVOICE (UNPAID)' : isPaid ? 'TAX INVOICE / PAID' : 'TAX INVOICE — COD'}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{invoiceNum}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Date: <strong>{orderDate}</strong></div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Order ID: <strong>{order.orderNumber || order.orderId}</strong></div>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '1.5rem 0' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.2rem', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.4rem' }}>Billed & Shipped To:</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{customerName}</div>
            <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.2rem' }}>
              {customerAddress && <div>{customerAddress}</div>}
              {(customerCity || customerZip) && <div>{customerCity} {customerZip ? `- ${customerZip}` : ''}</div>}
              {customerState && <div>{customerState}, India</div>}
              {customerPhone && <div style={{ marginTop: '0.3rem' }}>📞 {customerPhone}</div>}
              {customerEmail && <div>✉️ {customerEmail}</div>}
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.2rem', borderRadius: '6px', fontSize: '0.85rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.4rem' }}>Order & Logistics Details:</div>
            <div><strong>Payment Mode:</strong> {isCod ? 'Cash on Delivery (COD)' : (order.paymentMethod || order.payment?.method || 'Razorpay Online')}</div>
            <div style={{ marginTop: '0.3rem' }}>
              <strong>Payment Status:</strong>{' '}
              <span style={{
                fontWeight: 700,
                color: isCancelledOrFailed ? '#b91c1c' : isPaid ? '#15803d' : '#b45309'
              }}>
                {isCancelled ? 'Cancelled' : isFailed ? 'Failed' : isPaid ? 'Paid Online' : isCod ? `Pending (Due upon delivery: ₹${total.toLocaleString('en-IN')})` : (order.payment?.status || 'Pending Verification')}
              </span>
            </div>
            <div style={{ marginTop: '0.3rem' }}><strong>Courier:</strong> {order.courierName || 'Delhivery Express'}</div>
            <div style={{ marginTop: '0.3rem' }}><strong>AWB / Tracking #:</strong> {order.trackingNumber || 'Pending Dispatch'}</div>
            <div style={{ marginTop: '0.3rem' }}><strong>Place of Supply:</strong> {customerState}</div>
          </div>
        </div>

        {/* Itemized Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1.5rem 0', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '0.6rem 0.8rem' }}>#</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>Product Description</th>
              <th style={{ padding: '0.6rem 0.8rem' }}>HSN</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Size</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Rate (₹)</th>
              <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const q = it.quantity || it.qty || 1;
              const unitPrice = it.unitPrice !== undefined ? it.unitPrice : (it.price !== undefined ? it.price : 0);
              const lineTotal = it.lineTotal !== undefined ? it.lineTotal : (unitPrice * q);
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.7rem 0.8rem', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '0.7rem 0.8rem' }}>
                    <strong>{it.name}</strong>
                    {it.color && <span style={{ color: '#64748b', fontSize: '0.78rem' }}> • {it.color}</span>}
                  </td>
                  <td style={{ padding: '0.7rem 0.8rem', color: '#64748b' }}>6404</td>
                  <td style={{ padding: '0.7rem 0.8rem', textAlign: 'center' }}>UK {it.size}</td>
                  <td style={{ padding: '0.7rem 0.8rem', textAlign: 'center' }}>{q}</td>
                  <td style={{ padding: '0.7rem 0.8rem', textAlign: 'right' }}>₹{unitPrice.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.7rem 0.8rem', textAlign: 'right', fontWeight: 600 }}>
                    ₹{lineTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals & Tax Calculation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginTop: '1.5rem', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem' }}>
          {/* Left: GST Details */}
          <div style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
              GST Breakdown (18% Total — {isInterState ? 'Inter-State Supply' : 'Intra-State Supply'}):
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
              <span>Taxable Goods Value:</span>
              <span>₹{taxableValue.toLocaleString('en-IN')}</span>
            </div>
            {isInterState ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                <span>Integrated GST (IGST @ 18%):</span>
                <span>₹{igst.toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                  <span>Central GST (CGST @ 9%):</span>
                  <span>₹{cgst.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                  <span>State GST (SGST @ 9%):</span>
                  <span>₹{sgst.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}
            <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '0.4rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total Tax Component:</span>
              <span>₹{totalGst.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Right: Summary Figures */}
          <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Items Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 600 }}>
                <span>Coupon Discount:</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Shipping Charges:</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            {codCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>COD Handling Fee:</span>
                <span>₹{codCharge}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '0.6rem', marginTop: '0.4rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              <span>Grand Total:</span>
              <span style={{ color: '#2563eb' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
              (Inclusive of ₹{totalGst.toLocaleString('en-IN')} Total GST)
            </div>
          </div>
        </div>

        {/* Footer Declaration & Signature */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.78rem', color: '#64748b' }}>
          <div>
            <strong>Terms & Conditions:</strong>
            <div>1. Goods once sold can be exchanged within 30 days as per company policy.</div>
            <div>2. This is a computer-generated invoice and requires no physical signature.</div>
            <div>3. Subject to Mumbai jurisdiction only.</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '160px' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '2.5rem' }}>For {storeSettings?.storeName || 'SlideEase Footwear'}</div>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.3rem' }}>Authorised Signatory</div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: #fff !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          #invoice-paper {
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
