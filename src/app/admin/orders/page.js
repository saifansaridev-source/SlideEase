'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [courierInput, setCourierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [statusSelect, setStatusSelect] = useState('');
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [refundAmountInput, setRefundAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError('Failed to fetch orders from database.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openOrderDetail = (ord) => {
    setSelectedOrder(ord);
    setCourierInput(ord.courierName || 'Delhivery');
    setTrackingInput(ord.trackingNumber || '');
    setAdminNotesInput(ord.adminNotes || '');
    setStatusSelect(ord.status || 'pending');
    setCancelReasonInput(ord.cancelReason || '');
    setRefundAmountInput(ord.refundAmount ? String(ord.refundAmount) : '');
    setModalMsg('');
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setModalMsg('');
  };

  const handleUpdateOrder = async (updatePayload, successText) => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    setModalMsg('');

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.orderId || selectedOrder.orderNumber || selectedOrder._id,
          ...updatePayload
        })
      });
      const data = await res.json();

      if (data.success) {
        setModalMsg(`✓ ${successText}`);
        // Refresh local selected order object
        setSelectedOrder(prev => ({
          ...prev,
          ...updatePayload,
          timeline: [
            ...(prev.timeline || []),
            ...(updatePayload.status ? [{
              status: updatePayload.status,
              timestamp: new Date().toISOString(),
              note: updatePayload.cancelReason ? `Cancelled: ${updatePayload.cancelReason}` : `Updated to ${updatePayload.status}`
            }] : [])
          ]
        }));
        fetchOrders();
      } else {
        alert('Update failed: ' + data.error);
      }
    } catch (err) {
      alert('Network error during update: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        fetchOrders();
      } else {
        alert('Update failed: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Status update failed.');
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>🛒 Order Management ({orders.length} Records)</h3>
        
        {/* Status Tab Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button 
              key={st}
              onClick={() => {
                setLoading(true);
                setFilter(st);
              }}
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: filter === st ? 'var(--primary-color)' : 'var(--bg-white)',
                color: filter === st ? 'var(--bg-white)' : 'var(--text-dark)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrapper" style={{ minHeight: '300px' }}>
        {error && <div style={{ padding: '1rem', color: 'var(--danger-color)', textAlign: 'center' }}>Error: {error}</div>}
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th>Courier & AWB</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '4rem' }}>Fetching database orders list...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '4rem' }}>No orders found matching status: {filter}</td>
              </tr>
            ) : (
              orders.map((ord) => {
                const payStatus = ord.payment?.status || (ord.status === 'Paid' ? 'Paid' : 'Pending');
                const isPaid = payStatus === 'Paid';
                const isPending = payStatus.includes('Pending');
                const orderKey = ord.orderNumber || ord.orderId || ord._id;

                return (
                  <tr key={ord.orderId || ord._id}>
                    <td>
                      <button 
                        onClick={() => openOrderDetail(ord)}
                        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent-color)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                        title="Click to view full Order Details, Tracking, and GST Invoice"
                      >
                        {orderKey}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong>{ord.customer?.firstName || ord.customer?.firstname} {ord.customer?.lastName || ord.customer?.lastname}</strong><br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer?.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', maxHeight: '80px', overflowY: 'auto' }}>
                        {(ord.items || []).map((it, idx) => (
                          <div key={idx}>
                            • {it.name} (UK {it.size}) × {it.qty}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color)' }}>₹{ord.pricing?.total || ord.total || 0}</td>
                    <td>
                      <span style={{
                        backgroundColor: isPaid ? '#e8f5e9' : isPending ? '#fff3e0' : '#ffebee',
                        color: isPaid ? 'var(--success-color)' : isPending ? '#e65100' : 'var(--danger-color)',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        display: 'inline-block'
                      }}>
                        {payStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${ord.status || 'processing'}`}>
                        {ord.status || 'processing'}
                      </span>
                    </td>
                    <td>
                      {ord.trackingNumber ? (
                        <div style={{ fontSize: '0.75rem' }}>
                          <strong>{ord.courierName || 'Courier'}:</strong><br />
                          <code>{ord.trackingNumber}</code>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No tracking</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => openOrderDetail(ord)}
                        >
                          Details 🔍
                        </button>
                        {ord.status === 'pending' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }}
                            onClick={() => handleQuickStatus(ord.orderId, 'processing')}
                          >
                            Process
                          </button>
                        )}
                        {ord.status === 'processing' && (
                          <button 
                            className="btn btn-accent" 
                            style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }}
                            onClick={() => handleQuickStatus(ord.orderId, 'shipped')}
                          >
                            Ship
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── ORDER DETAIL MODAL ────────────────────────────────────── */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                  Order Details — {selectedOrder.orderNumber || selectedOrder.orderId || selectedOrder._id}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Link 
                  href={`/orders/${selectedOrder.orderNumber || selectedOrder.orderId || selectedOrder._id}/invoice`}
                  target="_blank"
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                >
                  📄 GST Tax Invoice ↗
                </Link>
                <button 
                  onClick={closeOrderDetail}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', padding: '0 0.5rem' }}
                >
                  &times;
                </button>
              </div>
            </div>

            {modalMsg && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '6px', marginBottom: '1.2rem', fontWeight: 600, fontSize: '0.85rem' }}>
                {modalMsg}
              </div>
            )}

            {/* Grid 2 Column: Customer & Items */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Customer Box */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>Customer & Shipping:</div>
                <div><strong>Name:</strong> {selectedOrder.customer?.firstName || selectedOrder.customer?.firstname} {selectedOrder.customer?.lastName || selectedOrder.customer?.lastname}</div>
                <div><strong>Email:</strong> {selectedOrder.customer?.email}</div>
                <div><strong>Phone:</strong> {selectedOrder.customer?.phone}</div>
                <div style={{ marginTop: '0.4rem' }}><strong>Address:</strong> {selectedOrder.customer?.address || selectedOrder.address}, {selectedOrder.customer?.city || selectedOrder.city} {selectedOrder.customer?.zip || selectedOrder.zip}</div>
                <div style={{ marginTop: '0.4rem' }}><strong>Payment:</strong> {selectedOrder.paymentMethod || selectedOrder.payment?.method} ({selectedOrder.payment?.status || selectedOrder.status})</div>
              </div>

              {/* Items Box */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>Ordered Items ({selectedOrder.items?.length || 0}):</div>
                {(selectedOrder.items || []).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span>{it.name} (UK {it.size}) × {it.qty}</span>
                    <strong>₹{((it.price || 0) * (it.qty || 1)).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--accent-color)' }}>₹{(selectedOrder.pricing?.total || selectedOrder.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 1. COURIER & TRACKING AWB SECTION */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.2rem' }}>
              <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.95rem', color: '#0f172a' }}>
                🚚 Logistics & Courier Tracking
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr auto', gap: '0.8rem', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Courier Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Delhivery, BlueDart"
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    style={{ padding: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>AWB / Tracking Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. AWB-DL998822451"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    style={{ padding: '0.5rem' }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  onClick={() => handleUpdateOrder({ courierName: courierInput, trackingNumber: trackingInput }, 'Tracking details updated and synced with customer view!')}
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                >
                  Save Tracking
                </button>
              </div>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                This tracking number will immediately display on the customer&apos;s /order-confirmation page and their dashboard.
              </p>
            </div>

            {/* 2. ORDER STATUS & CANCELLATION / REFUND */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.2rem' }}>
              <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.95rem', color: '#0f172a' }}>
                ⚡ Status Transition & Cancellation / Refund
              </h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Change Order Status</label>
                  <select 
                    value={statusSelect} 
                    onChange={(e) => setStatusSelect(e.target.value)}
                    className="filter-select"
                    style={{ padding: '0.5rem', minWidth: '150px' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {statusSelect === 'cancelled' && (
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', color: '#dc2626' }}>
                      Cancellation Reason *
                    </label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Customer requested size change before dispatch"
                      value={cancelReasonInput}
                      onChange={(e) => setCancelReasonInput(e.target.value)}
                      style={{ padding: '0.5rem' }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  className={statusSelect === 'cancelled' ? 'btn btn-outline' : 'btn btn-accent'}
                  disabled={isSubmitting}
                  onClick={() => {
                    const payload = { status: statusSelect };
                    if (statusSelect === 'cancelled') {
                      payload.cancelReason = cancelReasonInput || 'Administrative cancellation';
                    }
                    handleUpdateOrder(payload, `Order status updated to: ${statusSelect}`);
                  }}
                  style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
                >
                  Update Status
                </button>
              </div>
            </div>

            {/* 3. INTERNAL ADMIN-ONLY NOTES */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.2rem' }}>
              <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.95rem', color: '#0f172a' }}>
                🔒 Internal Admin-Only Notes
              </h4>
              <textarea 
                className="form-input"
                rows={2}
                placeholder="Private notes (not visible to customer), e.g. Customer verified via phone call, packed with eco gift box..."
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem', marginBottom: '0.5rem' }}
              />
              <button
                type="button"
                className="btn btn-outline"
                disabled={isSubmitting}
                onClick={() => handleUpdateOrder({ adminNotes: adminNotesInput }, 'Internal admin notes saved to order record!')}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
              >
                Save Notes
              </button>
            </div>

            {/* 4. TIMESTAMPED STATUS TIMELINE */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.2rem' }}>
              <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.95rem', color: '#0f172a' }}>
                ⏱️ Order Status History & Transition Timeline
              </h4>
              {(!selectedOrder.timeline || selectedOrder.timeline.length === 0) ? (
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Initial order created on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}. Status changes will be logged here with timestamps.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {selectedOrder.timeline.map((entry, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.82rem' }}>
                      <span style={{ color: '#3b82f6', marginTop: '2px' }}>●</span>
                      <div style={{ flex: 1 }}>
                        <strong style={{ textTransform: 'capitalize' }}>{entry.status}</strong>
                        {entry.note && <span style={{ color: '#475569' }}> — {entry.note}</span>}
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(entry.timestamp).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close modal footer */}
            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={closeOrderDetail}
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
