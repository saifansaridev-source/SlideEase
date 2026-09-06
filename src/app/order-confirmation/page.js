'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('No order ID was provided.');
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Unable to retrieve order details from the database.');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Network error while retrieving order record.');
        setLoading(false);
      });
  }, [orderId]);

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '85vh', paddingBottom: '5rem' }}>

      {/* Breadcrumb navigation */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ padding: '1rem 0', backgroundColor: 'var(--bg-white)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
          <ol className="breadcrumb-list" style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '0.5rem', fontSize: '0.85rem' }}>
            <li><Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link></li>
            <li>/</li>
            <li><Link href="/cart" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Cart</Link></li>
            <li>/</li>
            <li style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Order Confirmed</li>
          </ol>
        </div>
      </nav>

      {/* Step Tracker */}
      <section className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem 0.5rem 1.5rem' }}>
        <div className="step-tracker" style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
          <div className="step-item completed">✓<span className="step-label">Cart</span></div>
          <div className="step-item completed">✓<span className="step-label">Checkout</span></div>
          <div className="step-item active" style={{ backgroundColor: 'var(--success-color)', borderColor: 'var(--success-color)' }}>
            ✓<span className="step-label" style={{ color: 'var(--success-color)' }}>Confirmed</span>
          </div>
        </div>
      </section>

      <section className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: 'var(--text-muted)' }}>Retrieving your order from MongoDB records...</p>
          </div>
        ) : error || !order ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>Order Record Notice</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || 'Order record could not be loaded.'}</p>
            <Link href="/shop" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Success Card */}
            <div className="order-success-card" style={{
              backgroundColor: 'var(--bg-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>

              <h1 className="order-success-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>
                Order Confirmed!
              </h1>
              <p className="order-success-subtitle" style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                Thank you for shopping with <strong style={{ color: 'var(--primary-color)' }}>SlideEase</strong>
              </p>

              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                gap: '0.2rem',
                backgroundColor: 'var(--bg-light)',
                border: '1px solid var(--border-color)',
                padding: '0.8rem 2rem',
                borderRadius: '6px',
                marginTop: '1.5rem'
              }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Order Reference
                </span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary-color)', fontFamily: 'monospace' }}>
                  {order.orderNumber || order._id}
                </strong>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '1.5rem', maxWidth: '480px', margin: '1.5rem auto 0 auto', lineHeight: 1.5 }}>
                A confirmation with invoice and tracking details has been sent to <strong>{order.customer?.email}</strong>.
              </p>
            </div>

            {/* Order Items & Summary */}
            <div style={{
              backgroundColor: 'var(--bg-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', margin: '0 0 1.2rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {(order.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--accent-light)' }}>
                        <img src={item.image || '/og_image.png'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Size: {item.size} • Qty: {item.qty}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>₹{(order.pricing?.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger-color)', fontWeight: 600 }}>
                    <span>Discount</span>
                    <span>-₹{order.pricing.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {order.pricing?.giftWrap > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Artisan Gift Wrapping</span>
                    <span>₹{order.pricing.giftWrap}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shipping</span>
                  <span style={{ color: order.pricing?.shipping === 0 ? 'var(--success-color)' : 'inherit', fontWeight: 600 }}>
                    {order.pricing?.shipping === 0 ? 'FREE' : `₹${order.pricing.shipping}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-color)', paddingTop: '0.8rem', marginTop: '0.4rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                  <span>{order.payment?.status === 'Paid' ? 'Total Paid' : 'Total Amount'}</span>
                  <span style={{ color: 'var(--accent-color)' }}>₹{(order.pricing?.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div style={{
              backgroundColor: 'var(--bg-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', margin: '0 0 1.2rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                Delivery & Payment Details
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', letterSpacing: '0.5px' }}>
                    Shipping Address
                  </h3>
                  <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                    {order.customer?.firstName} {order.customer?.lastName}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '0.3rem' }}>
                    {order.customer?.address}<br />
                    {order.customer?.city}, {order.customer?.state} - {order.customer?.zip}<br />
                    Phone: {order.customer?.phone}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', letterSpacing: '0.5px' }}>
                    Payment Information
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary-color)', lineHeight: 1.6 }}>
                    <div><strong>Method:</strong> {order.payment?.method || 'Razorpay Online'}</div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span style={{
                        color: order.payment?.status === 'Paid'
                          ? 'var(--success-color)'
                          : order.payment?.status?.includes('Pending')
                            ? '#e65100'
                            : 'var(--danger-color)',
                        fontWeight: 700
                      }}>
                        {order.payment?.status || 'Pending'}
                      </span>
                    </div>
                    {order.payment?.razorpayPaymentId && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Payment ID: {order.payment.razorpayPaymentId}
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div style={{ marginTop: '0.8rem', padding: '0.8rem 1rem', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                          📦 Shipment Tracking Active:
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#14532d', marginTop: '0.2rem' }}>
                          Courier: <strong>{order.courierName || 'Delhivery'}</strong> • AWB Number: <code style={{ backgroundColor: '#fff', padding: '0.15rem 0.4rem', borderRadius: '3px', border: '1px solid #86efac', fontWeight: 700 }}>{order.trackingNumber}</code>
                        </div>
                      </div>
                    )}
                    <div style={{ marginTop: '0.6rem' }}>
                      <strong>Estimated Delivery:</strong> 4–6 Business Days
                    </div>
                  </div>
                </div>
              </div>

              {order.giftWrapMessage && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-light)', borderRadius: '6px', borderLeft: '4px solid var(--accent-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.2rem' }}>
                    🎁 Handwritten Gift Message:
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--text-color)' }}>
                    &quot;{order.giftWrapMessage}&quot;
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <Link href="/shop" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                Continue Shopping
              </Link>
              <Link
                href={`/orders/${order.orderNumber || order.orderId || order._id}/invoice`}
                target="_blank"
                className="btn btn-outline"
                style={{ padding: '0.8rem 2rem' }}
              >
                📄 GST Tax Invoice
              </Link>
              <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>
                View in Dashboard
              </Link>
            </div>

          </div>
        )}
      </section>

    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>Loading order confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
