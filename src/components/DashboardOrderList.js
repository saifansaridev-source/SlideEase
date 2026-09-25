'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ReturnExchangeModal from '@/components/ReturnExchangeModal';

export default function DashboardOrderList({ initialOrders = [] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeModalOrder, setActiveModalOrder] = useState(null);

  if (orders.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-white)',
        border: '1px dashed var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛍️</span>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>
          No orders placed yet
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.8rem' }}>
          Browse our handcrafted collections of vegan slides, loafers, and juttis.
        </p>
        <Link href="/shop" className="btn btn-primary" style={{ padding: '0.7rem 2rem' }}>
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {orders.map((ord) => {
        const ordId = ord._id ? ord._id.toString() : ord.id;
        const ordRef = ord.orderNumber || ord.orderId || ordId.slice(-8);
        const items = ord.items || [];
        const total = ord.pricing?.total || ord.total || 0;
        const status = ord.status || 'Processing';
        const paymentStatus = ord.payment?.status || 'Pending';
        const orderDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) : 'Recently placed';

        return (
          <div key={ordId} style={{
            backgroundColor: 'var(--bg-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '1.8rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.8rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem',
              marginBottom: '1.2rem',
              fontSize: '0.88rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Order: </span>
                <strong style={{ color: 'var(--primary-color)', fontFamily: 'monospace' }}>{ordRef}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>Placed: {orderDate}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <span style={{
                  backgroundColor: status === 'Delivered' ? '#e8f5e9' : '#fff3e0',
                  color: status === 'Delivered' ? 'var(--success-color)' : '#e65100',
                  fontWeight: 700,
                  padding: '0.2rem 0.7rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem'
                }}>
                  {status}
                </span>
                <span style={{
                  backgroundColor: paymentStatus === 'Paid' ? '#e8f5e9' : paymentStatus.includes('Pending') ? '#fff3e0' : '#ffebee',
                  color: paymentStatus === 'Paid' ? 'var(--success-color)' : paymentStatus.includes('Pending') ? '#e65100' : 'var(--danger-color)',
                  fontWeight: 700,
                  padding: '0.2rem 0.7rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem'
                }}>
                  {paymentStatus}
                </span>
                {ord.returnStatus && (
                  <span style={{
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    fontWeight: 700,
                    padding: '0.2rem 0.7rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem'
                  }}>
                    {ord.returnStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.2rem' }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--accent-light)' }}>
                      <img src={it.image || '/og_image.png'} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-color)' }}>{it.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Size UK {it.size} {it.color ? `• ${it.color}` : ''} • Qty {it.quantity || it.qty || 1}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    ₹{(it.lineTotal || (it.unitPrice || it.price || 0) * (it.quantity || it.qty || 1)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {ord.trackingNumber && (
              <div style={{ padding: '0.5rem 0.8rem', backgroundColor: '#f0fdf4', borderRadius: '6px', fontSize: '0.8rem', color: '#166534', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
                🚚 Shipped via <strong>{ord.courierName || 'Courier Partner'}</strong> — Tracking / AWB: <code style={{ backgroundColor: '#fff', padding: '0.1rem 0.4rem', borderRadius: '3px', border: '1px solid #86efac', fontWeight: 700 }}>{ord.trackingNumber}</code>
              </div>
            )}

            {/* Total & Action */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px dashed var(--border-color)',
              paddingTop: '1rem',
              flexWrap: 'wrap',
              gap: '0.8rem'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount: </span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-color)' }}>₹{total.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActiveModalOrder(ord)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: '#fff',
                    border: '1px solid #d97706',
                    color: '#b45309',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🔄 Exchange / Return
                </button>
                <Link 
                  href={`/orders/${ordRef}/invoice`}
                  target="_blank"
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                >
                  📄 Tax Invoice
                </Link>
                <Link 
                  href={`/order-confirmation?orderId=${ordId}`}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {activeModalOrder && (
        <ReturnExchangeModal
          order={activeModalOrder}
          onClose={() => setActiveModalOrder(null)}
          onSuccess={() => {
            // Update order return status in state
            setOrders(prev => prev.map(o => o._id === activeModalOrder._id ? { ...o, returnStatus: 'Return Requested' } : o));
          }}
        />
      )}
    </div>
  );
}
