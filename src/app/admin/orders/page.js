'use client';

import React, { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
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
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Order status updated successfully to: ${newStatus}`);
        fetchOrders(); // Reload orders
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'pending', 'processing', 'shipped', 'delivered'].map((st) => (
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
              <th>Customer details</th>
              <th>Items list</th>
              <th>Date</th>
              <th>Total Paid</th>
              <th>Fulfillment Status</th>
              <th>Action Panel</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '4rem' }}>Fetching database orders list...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '4rem' }}>No orders found matching status: {filter}</td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.orderId}>
                  <td><strong>{ord.orderId}</strong></td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>{ord.customer.firstname} {ord.customer.lastname}</strong><br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer.email}</span><br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {ord.customer.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', maxHeight: '100px', overflowY: 'auto' }}>
                      {ord.items.map((it, idx) => (
                        <div key={idx} style={{ padding: '0.1rem 0' }}>
                          • {it.name} ({it.size}) × {it.qty}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-color)' }}>₹{ord.total}</td>
                  <td>
                    <span className={`status-badge ${ord.status}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {ord.status === 'pending' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => handleUpdateStatus(ord.orderId, 'processing')}
                        >
                          Process
                        </button>
                      )}
                      {(ord.status === 'pending' || ord.status === 'processing') && (
                        <button 
                          className="btn btn-accent" 
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => handleUpdateStatus(ord.orderId, 'shipped')}
                        >
                          Ship
                        </button>
                      )}
                      {ord.status === 'shipped' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', backgroundColor: 'var(--success-color)', borderColor: 'var(--success-color)' }}
                          onClick={() => handleUpdateStatus(ord.orderId, 'delivered')}
                        >
                          Deliver
                        </button>
                      )}
                      {ord.status === 'delivered' && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Archived</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
