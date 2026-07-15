'use client';

import React, { useState, useEffect } from 'react';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form input states
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [minOrder, setMinOrder] = useState('0');
  const [active, setActive] = useState(true);
  
  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const json = await res.json();
      if (json.success) {
        setCoupons(json.data);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError('Failed to fetch coupons list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setFormMsg('');
    setFormError('');

    if (!code || !discountPercent) {
      setFormError('Please enter coupon code and discount percentage.');
      return;
    }

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discount: parseFloat(discountPercent) / 100, // convert percentage (e.g. 10) to decimal (e.g. 0.1)
          minOrder: parseFloat(minOrder || 0),
          active
        }),
      });
      const data = await res.json();

      if (data.success) {
        setFormMsg(`Coupon ${code.toUpperCase()} added successfully!`);
        setCode('');
        setDiscountPercent('10');
        setMinOrder('0');
        setActive(true);
        fetchCoupons(); // Reload table
      } else {
        setFormError(data.error);
      }
    } catch (err) {
      setFormError('Network error. Failed to add coupon.');
    }
  };

  const handleToggleActive = async (couponCode, currentStatus) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, active: !currentStatus }),
      });
      const data = await res.json();

      if (data.success) {
        fetchCoupons(); // Reload table
      } else {
        alert('Failed to update status: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Update status failed.');
    }
  };

  const handleDeleteCoupon = async (couponCode) => {
    if (!confirm(`Are you sure you want to delete the coupon code "${couponCode}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?code=${couponCode}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        alert('Coupon deleted successfully!');
        fetchCoupons(); // Reload table
      } else {
        alert('Failed to delete: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Delete failed.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '3rem' }}>
      
      {/* Coupon Add Form */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>🎟️ Create Discount Coupon</h3>
        </div>
        
        {formMsg && <div style={{ padding: '0.8rem', backgroundColor: 'var(--success-light)', color: 'var(--success-color)', fontSize: '0.85rem', fontWeight: 600, borderRadius: '4px', marginBottom: '1rem' }}>{formMsg}</div>}
        {formError && <div style={{ padding: '0.8rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)', fontSize: '0.85rem', fontWeight: 600, borderRadius: '4px', marginBottom: '1rem' }}>{formError}</div>}

        <form onSubmit={handleAddCoupon} className="contact-form" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Coupon Code</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. FESTIVE20"
              style={{ textTransform: 'uppercase' }}
              required 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Discount Percentage (%)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="e.g. 15 for 15% off"
              min="1"
              max="100"
              required 
              value={discountPercent} 
              onChange={(e) => setDiscountPercent(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Order Amount (₹)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="e.g. 999"
              min="0"
              value={minOrder} 
              onChange={(e) => setMinOrder(e.target.value)} 
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="active" style={{ cursor: 'pointer', fontWeight: 600 }}>Active Immediately</label>
          </div>

          <button type="submit" className="btn btn-accent" style={{ padding: '0.8rem', width: '100%', marginTop: '1rem' }}>
            Generate Coupon
          </button>
        </form>
      </div>

      {/* Coupon List */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>🎟️ Coupon Codes Directory</h3>
        </div>

        <div className="admin-table-wrapper" style={{ minHeight: '300px' }}>
          {error && <div style={{ padding: '1rem', color: 'var(--danger-color)', textAlign: 'center' }}>Error: {error}</div>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Promo Code</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Loading active coupons...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No coupon codes generated yet.</td>
                </tr>
              ) : (
                coupons.map((c, idx) => (
                  <tr key={c.code || idx}>
                    <td><code><strong>{c.code}</strong></code></td>
                    <td>{Math.round(c.discount * 100)}% OFF</td>
                    <td>₹{c.minOrder || 0}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(c.code, c.active)}
                        className={`status-badge ${c.active ? 'delivered' : 'pending'}`}
                        style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}
                      >
                        {c.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                        onClick={() => handleDeleteCoupon(c.code)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
