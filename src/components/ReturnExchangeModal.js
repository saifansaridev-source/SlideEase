'use client';

import React, { useState } from 'react';

const SIZES = ['5', '6', '7', '8', '9', '10', '11'];

export default function ReturnExchangeModal({ order, onClose, onSuccess }) {
  const [type, setType] = useState('exchange'); // 'exchange' | 'return'
  const [selectedItem, setSelectedItem] = useState(order.items?.[0] || null);
  const [replacementSize, setReplacementSize] = useState('8');
  const [reason, setReason] = useState('Fit: Size too small (Footwear)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id || order.orderNumber,
          type,
          itemId: selectedItem?.id || selectedItem?.productId,
          size: selectedItem?.size,
          replacementSize: type === 'exchange' ? replacementSize : null,
          reason,
          notes,
          customerEmail: order.customer?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccessResult(data);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        maxWidth: '540px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        padding: '2rem',
      }}>
        {successResult ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>
              Request Submitted Successfully!
            </h3>
            <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {successResult.message}
            </p>
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '12px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              Reference: {successResult.returnNumber}
            </div>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Return or Footwear Size Exchange
              </h3>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}
              >
                &times;
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              Order Reference: <strong style={{ color: '#111827' }}>{order.orderNumber}</strong>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.2rem'
              }}>
                {error}
              </div>
            )}

            {/* Type selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setType('exchange')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: type === 'exchange' ? '2px solid #b45309' : '1px solid #d1d5db',
                  backgroundColor: type === 'exchange' ? '#fef3c7' : '#ffffff',
                  color: type === 'exchange' ? '#92400e' : '#374151',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                🔄 Size Exchange (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setType('return')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: type === 'return' ? '2px solid #b45309' : '1px solid #d1d5db',
                  backgroundColor: type === 'return' ? '#fef3c7' : '#ffffff',
                  color: type === 'return' ? '#92400e' : '#374151',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                ↩️ Return & Refund
              </button>
            </div>

            {/* Item selector if multiple items */}
            {order.items && order.items.length > 1 && (
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Select Footwear Item
                </label>
                <select
                  value={selectedItem?.id}
                  onChange={(e) => setSelectedItem(order.items.find(i => (i.id || i.productId) === e.target.value))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  {order.items.map((i, idx) => (
                    <option key={idx} value={i.id || i.productId}>
                      {i.name} — Size UK {i.size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Exchange replacement size */}
            {type === 'exchange' && (
              <div style={{ marginBottom: '1.2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
                  Select Replacement Size (UK)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {SIZES.map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => setReplacementSize(sz)}
                      style={{
                        padding: '0.5rem 0.9rem',
                        borderRadius: '6px',
                        border: replacementSize === sz ? '2px solid #b45309' : '1px solid #d1d5db',
                        backgroundColor: replacementSize === sz ? '#b45309' : '#ffffff',
                        color: replacementSize === sz ? '#ffffff' : '#374151',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      UK {sz}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Current size: <strong>UK {selectedItem?.size || '7'}</strong>. Replacement size inventory will be authoritatively reserved upon submission.
                </div>
              </div>
            )}

            {/* Reason */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                Reason for {type === 'exchange' ? 'Size Exchange' : 'Return'}
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
              >
                <option value="Fit: Size too small (Footwear)">Fit: Size too small</option>
                <option value="Fit: Size too loose / large (Footwear)">Fit: Size too loose / large</option>
                <option value="Sole / Cushioning not comfortable">Sole / Cushioning not as expected</option>
                <option value="Defective / Damaged product received">Defective / Damaged product received</option>
                <option value="Wrong size or color dispatched">Wrong size or color dispatched</option>
                <option value="Changed mind / Dislike style">Changed mind / Dislike style</option>
              </select>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe any fit details or condition of the footwear..."
                rows={3}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#b45309',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Submitting...' : type === 'exchange' ? 'Request Size Exchange' : 'Request Return'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
