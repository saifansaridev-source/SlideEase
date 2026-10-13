'use client';

import React, { useState, useEffect, useCallback } from 'react';

const STATUS_BADGES = {
  requested:        { bg: '#fef3c7', color: '#92400e', label: 'Requested' },
  under_review:     { bg: '#e0e7ff', color: '#3730a3', label: 'Under Review' },
  approved:         { bg: '#d1fae5', color: '#065f46', label: 'Approved' },
  pickup_scheduled: { bg: '#e0f2fe', color: '#0369a1', label: 'Pickup Scheduled' },
  received:         { bg: '#f3e8ff', color: '#6b21a8', label: 'Received at Hub' },
  refund_pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Refund Pending' },
  refunded:         { bg: '#dbeafe', color: '#1e40af', label: 'Refunded' },
  completed:        { bg: '#dcfce7', color: '#166534', label: 'Completed' },
  rejected:         { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // Detail modal

  // Action states inside modal
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundAmt, setRefundAmt] = useState('');
  const [refundMethod, setRefundMethod] = useState('Manual Bank Transfer (NEFT/IMPS)');
  const [refundUtr, setRefundUtr] = useState('');
  const [inspectionPassed, setInspectionPassed] = useState(true);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Enlarge photo preview modal
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/admin/returns?status=${filter}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setReturns(json.data || []);
    } catch (err) {
      console.error('Fetch returns error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const openDetail = (ret) => {
    setSelected(ret);
    setAdminNotes(ret.adminNotes || '');
    setRejectionReason(ret.rejectionReason || '');
    setRefundAmt(String(ret.refundAmount || ret.refundEligibility?.maxRefundable || '0'));
    setRefundMethod(ret.refundRecord?.method || 'Manual Bank Transfer (NEFT/IMPS)');
    setRefundUtr(ret.refundRecord?.reference || '');
    setInspectionPassed(ret.inspectionResult?.passed !== false);
    setInspectionNotes(ret.inspectionResult?.notes || '');
  };

  const handleUpdateStatus = async (newStatus, extraPayload = {}) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected._id,
          status: newStatus,
          refundAmount: parseFloat(refundAmt) || 0,
          adminNotes,
          rejectionReason: newStatus === 'rejected' ? (rejectionReason || adminNotes || 'Item ineligible under policy') : undefined,
          ...extraPayload,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg(`Return ${selected.returnNumber} updated to: ${newStatus}`);
        setTimeout(() => setMsg(''), 4000);
        setSelected(null);
        fetchReturns();
      } else {
        alert(json.error || 'Failed to update return request.');
      }
    } catch (err) {
      alert('Network error while updating return.');
    } finally {
      setSaving(false);
    }
  };

  // Dispatch Shiprocket Reverse Pickup
  const handleScheduleReversePickup = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/returns/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnId: selected._id }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg(`Reverse pickup dispatched! Courier: ${json.pickupDetails.courier} | AWB: ${json.pickupDetails.awbCode}`);
        setTimeout(() => setMsg(''), 5000);
        setSelected(null);
        fetchReturns();
      } else {
        alert(json.error || 'Failed to dispatch reverse pickup.');
      }
    } catch (err) {
      alert('Network error during pickup dispatch.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this return record?')) return;
    await fetch(`/api/admin/returns?id=${id}`, { method: 'DELETE' });
    fetchReturns();
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>
            ↩️ Returns, Exchanges &amp; Reverse Logistics
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage customer return authorizations, Shiprocket reverse pickups, quality inspections, and refund settlements.
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Total requests: <strong>{returns.length}</strong>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>
          ✓ {msg}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Status filter tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'requested', 'approved', 'pickup_scheduled', 'received', 'refunded', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  border: `1.5px solid ${filter === st ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  background: filter === st ? 'var(--accent-color)' : 'transparent',
                  color: filter === st ? '#fff' : 'var(--text-dark)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search return #, order #, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                minWidth: '260px',
              }}
            />
          </div>
        </div>

        {/* Returns Table */}
        <div className="admin-table-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '8px' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ minWidth: '110px' }}>Return ID</th>
                <th style={{ minWidth: '100px' }}>Order #</th>
                <th style={{ minWidth: '160px' }}>Customer</th>
                <th style={{ minWidth: '150px' }}>Item / Type</th>
                <th style={{ minWidth: '150px' }}>Reason</th>
                <th style={{ minWidth: '80px' }}>Evidence</th>
                <th style={{ minWidth: '95px' }}>Refund (₹)</th>
                <th style={{ minWidth: '125px' }}>Status</th>
                <th style={{ minWidth: '95px' }}>Date</th>
                <th style={{ minWidth: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading return requests...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No return requests matching criteria.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => {
                  const badge = STATUS_BADGES[ret.status] || STATUS_BADGES.requested;
                  const firstItem = ret.items?.[0];
                  return (
                    <tr key={ret._id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#b45309' }}>
                          {ret.returnNumber || ret._id.slice(-8).toUpperCase()}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.85rem' }}>{ret.orderNumber || ret.orderId}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <strong>{ret.customerName}</strong><br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ret.customerEmail}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: ret.type === 'exchange' ? '#fef3c7' : '#f1f5f9',
                            color: ret.type === 'exchange' ? '#92400e' : '#334155',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            marginBottom: '2px',
                          }}>
                            {ret.type === 'exchange' ? '🔄 Exchange' : '↩️ Return'}
                          </span><br />
                          {firstItem?.name || ret.productName || 'Footwear item'} (UK {firstItem?.size || ret.productSize || 'Standard'}) &bull; Qty {firstItem?.quantity || ret.quantity || 1}
                        </div>
                      </td>
                      <td style={{ maxWidth: '160px', fontSize: '0.8rem', color: '#334155' }}>
                        {ret.reason}
                      </td>
                      <td>
                        {ret.evidencePhotos && ret.evidencePhotos.length > 0 ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {ret.evidencePhotos.slice(0, 2).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt="Evidence"
                                onClick={() => setPreviewPhoto(url)}
                                style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #cbd5e1' }}
                              />
                            ))}
                            {ret.evidencePhotos.length > 2 && (
                              <span style={{ fontSize: '0.7rem', color: '#64748b', alignSelf: 'center' }}>
                                +{ret.evidencePhotos.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {ret.refundAmount > 0 ? `₹${ret.refundAmount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td>
                        <span style={{
                          background: badge.bg,
                          color: badge.color,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {ret.createdAt ? new Date(ret.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-outline"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                            onClick={() => openDetail(ret)}
                          >
                            Review &amp; Action
                          </button>
                          <button
                            className="btn btn-outline"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                            onClick={() => handleDelete(ret._id)}
                          >
                            &times;
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

      {/* ── DETAIL & WORKFLOW MODAL ────────────────────────────────────── */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '14px', maxWidth: '720px', width: '100%',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            {/* 1. STICKY MODAL HEADER */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.2rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff',
              flexShrink: 0,
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Return Authorization &bull; {selected.returnNumber}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Original Order: <strong>{selected.orderNumber}</strong> &bull; Customer: <strong>{selected.customerName}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* 2. SCROLLABLE MODAL BODY */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Request Summary Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.2rem', fontSize: '0.88rem', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ color: '#64748b' }}>Customer:</span>
                  <strong style={{ wordBreak: 'break-all' }}>{selected.customerName} ({selected.customerEmail})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ color: '#64748b' }}>Item to Return:</span>
                  <span>{selected.items?.[0]?.name || selected.productName || 'Footwear item'} (UK {selected.items?.[0]?.size || selected.productSize || 'Standard'}) &bull; Qty {selected.items?.[0]?.quantity || selected.quantity || 1}</span>
                </div>
                {selected.type === 'exchange' && selected.exchangeDetails && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#b45309', fontWeight: 700, flexWrap: 'wrap', gap: '4px' }}>
                    <span>Replacement Size:</span>
                    <span>UK {selected.exchangeDetails.replacementSize} (Stock available: {selected.exchangeDetails.stockAvailable})</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ color: '#64748b' }}>Reason:</span>
                  <span style={{ maxWidth: '65%', textAlign: 'right', wordBreak: 'break-word' }}>{selected.reason}</span>
                </div>
                {selected.notes && (
                  <div style={{ marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '6px', color: '#475569', fontSize: '0.84rem', wordBreak: 'break-word' }}>
                    <strong>Customer Explanation:</strong> &quot;{selected.notes}&quot;
                  </div>
                )}

                {/* Photos Gallery */}
                {selected.evidencePhotos && selected.evidencePhotos.length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                      Uploaded Photo Evidence ({selected.evidencePhotos.length}):
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selected.evidencePhotos.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Evidence"
                          onClick={() => setPreviewPhoto(url)}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #cbd5e1' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reverse Logistics / Pickup Details Card */}
              {selected.pickupDetails && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                    🚚 Reverse Pickup Dispatched
                  </div>
                  <div>Courier: <strong>{selected.pickupDetails.courier}</strong></div>
                  <div>AWB Code: <code style={{ fontWeight: 800, background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #86efac' }}>{selected.pickupDetails.awbCode}</code></div>
                  {selected.pickupDetails.trackingUrl && (
                    <div style={{ marginTop: '6px' }}>
                      <a href={selected.pickupDetails.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', fontWeight: 700 }}>
                        Track Live Reverse Consignment &rarr;
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Existing Refund Record Card */}
              {selected.refundRecord && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                    💳 Refund Settled
                  </div>
                  <div>Amount: <strong>₹{selected.refundRecord.amount?.toLocaleString('en-IN')}</strong></div>
                  <div>Method: <strong>{selected.refundRecord.method}</strong></div>
                  <div>UTR / Ref: <code style={{ wordBreak: 'break-all' }}>{selected.refundRecord.reference}</code></div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    Processed by {selected.refundRecord.processedBy} on {new Date(selected.refundRecord.processedAt).toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              {/* Action Form Inputs */}
              <div style={{ padding: '1.2rem', background: '#fafafa', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.9rem', color: '#111827', fontWeight: 700 }}>
                  Administrative Authorization &amp; Settlement Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '3px' }}>
                      Refund Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={refundAmt}
                      onChange={(e) => setRefundAmt(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '3px' }}>
                      Refund Mode
                    </label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Manual Bank Transfer (NEFT/IMPS)">Manual Bank Transfer (NEFT/IMPS)</option>
                      <option value="UPI Direct Transfer">UPI Direct Transfer</option>
                      <option value="Razorpay Online Refund">Razorpay Online Refund</option>
                      <option value="SlideEase Store Credit">SlideEase Store Credit</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '3px' }}>
                    Bank UTR / Transaction Reference (For manual refund records)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-20260413009218 or RZP-REF-9921"
                    value={refundUtr}
                    onChange={(e) => setRefundUtr(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '3px' }}>
                    Rejection Reason (Required if rejecting)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Item shows outdoor sole wear; exceeds policy window"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '3px' }}>
                    Internal Admin Notes (Private audit trail)
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notes visible only in administrative audit trail..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Audit History Timeline */}
              {selected.statusHistory && selected.statusHistory.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Status History &amp; Audit Trail
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                    {selected.statusHistory.map((h, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '4px', flexWrap: 'wrap', gap: '4px' }}>
                        <span><strong>{h.status?.toUpperCase()}</strong> &bull; {h.notes}</span>
                        <span style={{ color: '#94a3b8' }}>{new Date(h.timestamp).toLocaleString('en-IN')} ({h.actor || 'System'})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. STICKY MODAL FOOTER */}
            <div style={{
              display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end',
              padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
              flexShrink: 0, alignItems: 'center',
            }}>
              {/* 1. Review / Under Review */}
              {selected.status === 'requested' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleUpdateStatus('under_review')}
                  style={{ padding: '0.55rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Mark Under Review
                </button>
              )}

              {/* 2. Approve Request */}
              {['requested', 'under_review'].includes(selected.status) && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleUpdateStatus('approved')}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '6px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ✓ Approve Return
                </button>
              )}

              {/* 3. Dispatch Shiprocket Reverse Pickup */}
              {['approved', 'under_review'].includes(selected.status) && !selected.pickupDetails && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleScheduleReversePickup}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  🚚 Schedule Reverse Pickup
                </button>
              )}

              {/* 4. Mark Received & Quality Checked */}
              {['pickup_scheduled', 'approved'].includes(selected.status) && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleUpdateStatus('received', {
                    inspectionResult: { passed: inspectionPassed, notes: inspectionNotes || 'Passed artisanal unworn inspection' }
                  })}
                  style={{ padding: '0.55rem 1rem', borderRadius: '6px', border: '1px solid #7c3aed', background: '#f5f3ff', color: '#6d28d9', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  🔍 Mark Received &amp; Inspected
                </button>
              )}

              {/* 5. Process / Record Refund */}
              {['received', 'approved', 'refund_pending'].includes(selected.status) && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    const amt = parseFloat(refundAmt);
                    if (isNaN(amt) || amt <= 0) {
                      alert('Please specify a valid refund amount greater than 0.');
                      return;
                    }
                    handleUpdateStatus('refunded', {
                      refundDetails: {
                        method: refundMethod,
                        reference: refundUtr || `REF-${Date.now().toString().slice(-8)}`,
                        notes: adminNotes,
                      }
                    });
                  }}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '6px', border: 'none', background: '#b45309', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  💳 Record &amp; Complete Refund
                </button>
              )}

              {/* 6. Reject Return */}
              {selected.status !== 'rejected' && selected.status !== 'completed' && selected.status !== 'refunded' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      alert('Please provide a rejection reason to inform the customer before rejecting.');
                      return;
                    }
                    handleUpdateStatus('rejected');
                  }}
                  style={{ padding: '0.55rem 0.9rem', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ✕ Reject
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ padding: '0.55rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTO ENLARGE MODAL ────────────────────────────────────── */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000, padding: '2rem', cursor: 'zoom-out',
          }}
        >
          <img
            src={previewPhoto}
            alt="Enlarged evidence"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </div>
  );
}
