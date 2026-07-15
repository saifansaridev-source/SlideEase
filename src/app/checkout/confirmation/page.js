'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConfirmationPage() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const storedOrder = sessionStorage.getItem('slidex_last_order');
    if (storedOrder) {
      try {
        setOrder(JSON.parse(storedOrder));
      } catch (e) {
        setOrder(null);
      }
    }
  }, []);

  // Delivery date estimate helper
  const getDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!order) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No recent order found.</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Check your account details to view past orders.</p>
        <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 6rem 1.5rem', maxWidth: '800px' }}>
      
      {/* Thank you card */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--success-color)', marginBottom: '0.5rem' }}>Order Placed Successfully!</h1>
        <p style={{ color: 'var(--text-muted)' }}>Thank you for shopping with us. Your order reference ID is <strong style={{ color: 'var(--text-dark)' }} id="order-id-value">{order.orderId}</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
        
        {/* Order review details */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Items Ordered</h3>
          <div id="order-confirmation-items">
            {order.items.map((item, index) => (
              <div key={index} className="checkout-product-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px dashed var(--border-color)', fontSize: '0.9rem' }}>
                <div>
                  <span className="checkout-product-title" style={{ fontWeight: 600 }}>{item.name}</span><br />
                  <span className="checkout-product-qty" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size: {item.size} × {item.qty}</span>
                </div>
                <span className="checkout-product-price" style={{ fontWeight: 600 }}>
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem', marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-light)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)' }}>
                <span>Discount:</span>
                <span>-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping Charges:</span>
              <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', fontSize: '1rem', fontWeight: 700 }}>
              <span>Amount Paid:</span>
              <span style={{ color: 'var(--accent-color)' }}>₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping details */}
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>Estimated Delivery</h3>
            <p style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{getDeliveryDate()}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Standard shipping carrier tracker updates will be sent via SMS.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>Shipping Address</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <strong>{order.customer.firstname} {order.customer.lastname}</strong><br />
              {order.customer.address}, {order.customer.city}<br />
              {order.customer.state} - {order.customer.zip}<br />
              📞 {order.customer.phone}
            </p>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>Payment Method</h3>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay Secure UPI / Card'}
            </p>
          </div>
        </div>

      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link href="/shop" className="btn btn-accent" style={{ padding: '0.8rem 3rem' }}>
          Back to Shop
        </Link>
      </div>

    </div>
  );
}
