'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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
        setOrders(json.data || []);
      } else {
        setError(json.error || 'Failed to fetch orders.');
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

  // Client-side search filtering across order number, customer name, email, phone, city
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(ord => {
      const orderKey = String(ord.orderNumber || ord.orderId || ord._id || '').toLowerCase();
      const customerName = `${ord.customer?.firstName || ''} ${ord.customer?.lastName || ''}`.toLowerCase();
      const email = String(ord.customer?.email || '').toLowerCase();
      const phone = String(ord.customer?.phone || '').toLowerCase();
      const city = String(ord.customer?.city || '').toLowerCase();
      return orderKey.includes(q) || customerName.includes(q) || email.includes(q) || phone.includes(q) || city.includes(q);
    });
  }, [orders, searchQuery]);

  // Status counts for pills
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => {
      const st = (o.status || 'pending').toLowerCase();
      if (counts[st] !== undefined) counts[st]++;
    });
    return counts;
  }, [orders]);

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
        alert('Update failed: ' + (data.error || 'Server rejected changes.'));
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
    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
      
      {/* ── CARD HEADER & METRICS SUMMARY ────────────────────────── */}
      <div style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Orders Management</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
              {filteredOrders.length} {filteredOrders.length === 1 ? 'Record' : 'Records'}
            </span>
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Authoritative order lifecycle, live customer fulfillment, courier tracking, and tax invoice operations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => { setLoading(true); fetchOrders(); }}
            className="btn btn-outline" 
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ──────────────────────────────────── */}
      <div className="orders-filter-bar">
        {/* Search */}
        <div className="orders-search-wrapper">
          <svg className="orders-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search by Order ID, customer, email, phone..." 
            className="orders-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
            >
              &times;
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="orders-status-pills">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button 
              key={st}
              onClick={() => {
                setLoading(true);
                setFilter(st);
              }}
              className={`orders-status-pill ${filter === st ? 'active' : ''}`}
            >
              <span style={{ textTransform: 'capitalize' }}>{st}</span>
              <span className="orders-pill-count">{statusCounts[st] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderBottom: '1px solid #fecaca', fontSize: '0.85rem', fontWeight: 600 }}>
          Error: {error}
        </div>
      )}

      {/* ── 1. DESKTOP & LAPTOP ORDERS TABLE ─────────────────────── */}
      <div className="admin-orders-table-wrapper" style={{ minHeight: '320px' }}>
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Order Ref</th>
              <th style={{ width: '18%' }}>Customer</th>
              <th style={{ width: '23%' }}>Items</th>
              <th style={{ width: '13%' }}>Total &amp; Payment</th>
              <th style={{ width: '12%' }}>Fulfillment</th>
              <th style={{ width: '11%' }}>Logistics / AWB</th>
              <th style={{ width: '8%', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Loading orders database...
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                  <div style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '0.5rem' }}>📭</div>
                  <strong style={{ display: 'block', color: '#1e293b' }}>No orders found</strong>
                  <span style={{ fontSize: '0.8rem' }}>
                    {searchQuery ? `No orders matching "${searchQuery}"` : `No orders in status: ${filter}`}
                  </span>
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const payStatus = ord.payment?.status || (ord.status === 'Paid' ? 'Paid' : 'Pending');
                const isPaid = payStatus === 'Paid';
                const isPending = payStatus.includes('Pending');
                const orderKey = ord.orderNumber || ord.orderId || ord._id;
                const itemsCount = (ord.items || []).reduce((acc, it) => acc + (it.qty || 1), 0);

                return (
                  <tr key={ord.orderId || ord._id}>
                    {/* Order Ref & Placed Date */}
                    <td>
                      <button 
                        type="button"
                        onClick={() => openOrderDetail(ord)}
                        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column' }}
                        title="Click to view full order dossier"
                      >
                        <span style={{ color: 'var(--accent-dark)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{orderKey}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </button>
                    </td>

                    {/* Customer */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong style={{ color: '#0f172a', fontSize: '0.82rem' }}>
                          {ord.customer?.firstName || ord.customer?.firstname || 'Guest'} {ord.customer?.lastName || ord.customer?.lastname || ''}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ord.customer?.email || 'No email'}
                        </span>
                        {ord.customer?.city && (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{ord.customer.city}</span>
                        )}
                      </div>
                    </td>

                    {/* Items & Sizes */}
                    <td>
                      <div className="order-items-preview">
                        {(ord.items || []).slice(0, 2).map((it, idx) => (
                          <span key={idx} className="order-item-line" title={`${it.name} - UK ${it.size} × ${it.qty || 1}`}>
                            • <strong>{it.name}</strong> <span style={{ color: '#64748b' }}>(UK {it.size}) × {it.qty || 1}</span>
                          </span>
                        ))}
                        {(ord.items || []).length > 2 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer' }} onClick={() => openOrderDetail(ord)}>
                            + {(ord.items.length - 2)} more items ({itemsCount} units total)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total & Payment */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                          ₹{(ord.pricing?.total || ord.total || 0).toLocaleString('en-IN')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            backgroundColor: isPaid ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                            color: isPaid ? '#15803d' : isPending ? '#b45309' : '#b91c1c',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            display: 'inline-block'
                          }}>
                            {payStatus}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                            {ord.payment?.method || ord.paymentMethod || 'Prepaid'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Fulfillment */}
                    <td>
                      <span className={`status-badge ${(ord.status || 'pending').toLowerCase()}`}>
                        {ord.status || 'pending'}
                      </span>
                    </td>

                    {/* Logistics / Courier & AWB */}
                    <td>
                      {ord.trackingNumber ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>
                            {ord.courierName || 'Delhivery'}
                          </span>
                          <a 
                            href={ord.trackingUrl || `https://www.delhivery.com/track/package/${ord.trackingNumber}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--accent-color)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                            title="Open external tracking"
                          >
                            <span>{ord.trackingNumber}</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          </a>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button"
                        onClick={() => openOrderDetail(ord)}
                        className="btn btn-outline" 
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', whiteSpace: 'nowrap' }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── 2. MOBILE & TABLET ORDER CARDS VIEW ──────────────────── */}
      <div className="orders-mobile-view">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            Loading orders list...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            No orders match the current filter.
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const payStatus = ord.payment?.status || (ord.status === 'Paid' ? 'Paid' : 'Pending');
            const isPaid = payStatus === 'Paid';
            const isPending = payStatus.includes('Pending');
            const orderKey = ord.orderNumber || ord.orderId || ord._id;

            return (
              <div key={ord.orderId || ord._id} className="admin-order-card">
                {/* Header */}
                <div className="admin-order-card-header">
                  <div>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.9rem' }}>
                      {orderKey}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`status-badge ${(ord.status || 'pending').toLowerCase()}`}>
                    {ord.status || 'pending'}
                  </span>
                </div>

                {/* Customer */}
                <div style={{ fontSize: '0.82rem' }}>
                  <strong style={{ color: '#0f172a' }}>
                    {ord.customer?.firstName || 'Guest'} {ord.customer?.lastName || ''}
                  </strong>
                  <div style={{ color: '#64748b', fontSize: '0.76rem' }}>
                    {ord.customer?.email} {ord.customer?.phone ? `• ${ord.customer.phone}` : ''}
                  </div>
                </div>

                {/* Items */}
                <div className="admin-order-card-items">
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Items ({(ord.items || []).length}):
                  </div>
                  {(ord.items || []).map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: i < (ord.items || []).length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                      <span><strong>{it.name}</strong> <span style={{ color: '#64748b' }}>(UK {it.size}) × {it.qty || 1}</span></span>
                      <strong style={{ color: '#0f172a' }}>₹{((it.price || 0) * (it.qty || 1)).toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>

                {/* Total & Payment */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Total Amount</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                      ₹{(ord.pricing?.total || ord.total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      backgroundColor: isPaid ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                      color: isPaid ? '#15803d' : isPending ? '#b45309' : '#b91c1c',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      display: 'inline-block'
                    }}>
                      {payStatus}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                      {ord.payment?.method || 'Prepaid'}
                    </span>
                  </div>
                </div>

                {/* Courier info if available */}
                {ord.trackingNumber && (
                  <div style={{ fontSize: '0.75rem', background: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: '6px', color: '#166534', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{ord.courierName || 'Courier'}:</strong> {ord.trackingNumber}</span>
                    <a href={ord.trackingUrl || `https://www.delhivery.com/track/package/${ord.trackingNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', fontWeight: 600 }}>Track ↗</a>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="admin-order-card-footer">
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {ord.status === 'pending' && (
                      <button 
                        type="button" 
                        onClick={() => handleQuickStatus(ord.orderId, 'processing')}
                        className="btn btn-primary"
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                      >
                        Process
                      </button>
                    )}
                    {ord.status === 'processing' && (
                      <button 
                        type="button" 
                        onClick={() => handleQuickStatus(ord.orderId, 'shipped')}
                        className="btn btn-accent"
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                      >
                        Mark Shipped
                      </button>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => openOrderDetail(ord)}
                    className="btn btn-outline" 
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem' }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 3. EXECUTIVE ORDER DOSSIER MODAL ─────────────────────── */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 22, 40, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.25rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(201, 169, 97, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-color)', fontWeight: 700 }}>
                  Order Dossier
                </span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.35rem', color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                  {selectedOrder.orderNumber || selectedOrder.orderId || selectedOrder._id}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <Link 
                  href={`/orders/${selectedOrder.orderNumber || selectedOrder.orderId || selectedOrder._id}/invoice`}
                  target="_blank"
                  className="btn btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  GST Invoice ↗
                </Link>
                <button 
                  onClick={closeOrderDetail}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
            </div>

            {modalMsg && (
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.85rem', border: '1px solid #bbf7d0' }}>
                {modalMsg}
              </div>
            )}

            {/* Split Details: Customer + Ordered Items */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Customer Box */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                  Customer &amp; Delivery Destination
                </div>
                <div style={{ lineHeight: 1.6 }}>
                  <div><strong>Name:</strong> {selectedOrder.customer?.firstName || 'Guest'} {selectedOrder.customer?.lastName || ''}</div>
                  <div><strong>Email:</strong> {selectedOrder.customer?.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {selectedOrder.customer?.phone || 'N/A'}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Shipping Address:</strong><br />
                    {selectedOrder.customer?.address || selectedOrder.address}<br />
                    {selectedOrder.customer?.city || selectedOrder.city} {selectedOrder.customer?.zip || selectedOrder.zip}, {selectedOrder.customer?.state || 'India'}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Payment Method:</strong> {selectedOrder.paymentMethod || selectedOrder.payment?.method || 'Prepaid'} ({selectedOrder.payment?.status || selectedOrder.status})
                  </div>
                </div>
              </div>

              {/* Items Box */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                  Ordered Items ({selectedOrder.items?.length || 0})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(selectedOrder.items || []).map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{it.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Size: UK {it.size} • Qty: {it.qty || 1}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        ₹{((it.price || 0) * (it.qty || 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.85rem', marginTop: '0.5rem', fontWeight: 800, fontSize: '1rem', borderTop: '1px solid #cbd5e1' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--accent-color)' }}>
                    ₹{(selectedOrder.pricing?.total || selectedOrder.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. COURIER & TRACKING AWB SECTION */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#ffffff' }}>
              <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.92rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Logistics, Courier Partner &amp; AWB Dispatch
              </h4>
              <div className="admin-courier-grid">
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Courier Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Delhivery, Blue Dart, Shiprocket"
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    style={{ padding: '0.55rem', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Tracking Number / AWB</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. AWB-DLH-99882211"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    style={{ padding: '0.55rem', fontSize: '0.85rem' }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  onClick={() => handleUpdateOrder({ courierName: courierInput, trackingNumber: trackingInput }, 'Logistics tracking synced with customer!')}
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Logistics'}
                </button>
              </div>
            </div>

            {/* 2. ORDER FULFILLMENT STATUS TRANSITIONS */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', background: '#ffffff' }}>
              <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.92rem', color: '#0f172a' }}>
                Fulfillment Status Transition
              </h4>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select 
                  value={statusSelect} 
                  onChange={(e) => setStatusSelect(e.target.value)}
                  className="form-control"
                  style={{ width: 'auto', minWidth: '180px', padding: '0.55rem', fontSize: '0.85rem' }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={isSubmitting || statusSelect === selectedOrder.status}
                  onClick={() => handleUpdateOrder({ status: statusSelect }, `Order status updated to ${statusSelect}!`)}
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Update Status
                </button>
              </div>

              {/* Cancellation Reason if cancelled */}
              {statusSelect === 'cancelled' && (
                <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#b91c1c', marginBottom: '0.3rem' }}>
                      Reason for Cancellation
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. Customer requested cancellation / Out of stock"
                      value={cancelReasonInput}
                      onChange={(e) => setCancelReasonInput(e.target.value)}
                      style={{ padding: '0.55rem', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                    onClick={() => handleUpdateOrder({ status: 'cancelled', cancelReason: cancelReasonInput }, 'Order cancelled.')}
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' }}
                  >
                    Confirm Cancellation
                  </button>
                </div>
              )}
            </div>

            {/* 3. INTERNAL STAFF NOTES */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', background: '#ffffff' }}>
              <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.92rem', color: '#0f172a' }}>
                Internal Artisan &amp; Staff Notes
              </h4>
              <textarea 
                rows="2"
                className="form-control"
                placeholder="Add confidential warehouse notes or custom sizing instructions..."
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', resize: 'vertical' }}
              />
              <button
                type="button"
                className="btn btn-outline"
                disabled={isSubmitting}
                onClick={() => handleUpdateOrder({ adminNotes: adminNotesInput }, 'Admin notes updated!')}
                style={{ marginTop: '0.6rem', fontSize: '0.8rem', padding: '0.45rem 1rem' }}
              >
                Save Notes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
