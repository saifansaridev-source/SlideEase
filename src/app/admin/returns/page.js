'use client';

import React, { useState, useEffect, useCallback } from 'react';

const STATUS_COLORS = {
  pending:  { bg: '#fef3c7', color: '#92400e' },
  approved: { bg: '#d1fae5', color: '#065f46' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
  refunded: { bg: '#dbeafe', color: '#1e40af' },
};

export default function AdminReturns() {
  const [returns, setReturns]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [selected, setSelected]   = useState(null);   // for detail modal
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmt, setRefundAmt] = useState('');
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/returns?status=${filter}`);
      const json = await res.json();
      if (json.success) setReturns(json.data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const openDetail = (ret) => {
    setSelected(ret);
    setAdminNotes(ret.adminNotes || '');
    setRefundAmt(String(ret.refundAmount || ''));
  };

  const handleUpdate = async (newStatus) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:          selected._id,
          status:      newStatus,
          refundAmount: parseFloat(refundAmt) || 0,
          adminNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg(`Return marked as ${newStatus}`);
        setTimeout(() => setMsg(''), 3000);
        setSelected(null);
        fetchReturns();
      } else {
        alert(json.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this return request permanently?')) return;
    await fetch(`/api/admin/returns?id=${id}`, { method: 'DELETE' });
    fetchReturns();
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
          ↩️ Returns &amp; Refunds Management
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {returns.length} request{returns.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {msg && (
        <div style={{ padding: '0.8rem 1.2rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 600 }}>
          ✓ {msg}
        </div>
      )}

      {/* Filter tabs */}
      <div className="admin-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected', 'refunded'].map(st => (
            <button
              key={st}
              onClick={() => { setFilter(st); }}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: `1.5px solid ${filter === st ? 'var(--accent-color)' : 'var(--border-color)'}`,
                background: filter === st ? 'var(--accent-color)' : 'transparent',
                color: filter === st ? '#fff' : 'var(--text-dark)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Refund (₹)</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>Loading return requests...</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No return requests for status: {filter}
                </td></tr>
              ) : (
                returns.map((ret) => {
                  const sc = STATUS_COLORS[ret.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={ret._id?.toString()}>
                      <td><code style={{ fontSize: '0.75rem' }}>{ret._id?.toString().slice(-8).toUpperCase()}</code></td>
                      <td><strong>{ret.orderId}</strong></td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <strong>{ret.customerName}</strong><br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ret.customerEmail}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{ret.reason}</td>
                      <td style={{ fontWeight: 700 }}>
                        {ret.refundAmount > 0 ? `₹${ret.refundAmount}` : '—'}
                      </td>
                      <td>
                        <span style={{
                          background: sc.bg,
                          color: sc.color,
                          padding: '0.2rem 0.7rem',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                        }}>
                          {ret.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {ret.createdAt ? new Date(ret.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-outline"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                            onClick={() => openDetail(ret)}
                          >
                            Review
                          </button>
                          <button
                            className="btn btn-outline"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                            onClick={() => handleDelete(ret._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Update Modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', maxWidth: '540px', width: '100%',
            padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Review Return Request</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <div style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              <p style={{ margin: '0.2rem 0' }}><strong>Order ID:</strong> {selected.orderId}</p>
              <p style={{ margin: '0.2rem 0' }}><strong>Customer:</strong> {selected.customerName} ({selected.customerEmail})</p>
              <p style={{ margin: '0.2rem 0' }}><strong>Reason:</strong> {selected.reason}</p>
              {selected.notes && <p style={{ margin: '0.2rem 0' }}><strong>Customer Notes:</strong> {selected.notes}</p>}
              {selected.items?.length > 0 && (
                <p style={{ margin: '0.2rem 0' }}>
                  <strong>Items:</strong> {selected.items.map(it => `${it.name} ×${it.qty}`).join(', ')}
                </p>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Refund Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={refundAmt}
                onChange={e => setRefundAmt(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Admin Notes (internal)</label>
              <textarea
                className="form-input"
                rows={3}
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Notes visible only to admin..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={() => handleUpdate('approved')}
                style={{ background: '#059669', borderColor: '#059669' }}
              >
                ✓ Approve
              </button>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={() => handleUpdate('refunded')}
                style={{ background: '#2563eb', borderColor: '#2563eb' }}
              >
                💳 Mark Refunded
              </button>
              <button
                className="btn btn-outline"
                disabled={saving}
                onClick={() => handleUpdate('rejected')}
                style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
              >
                ✕ Reject
              </button>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
