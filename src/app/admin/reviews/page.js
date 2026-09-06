'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const json = await res.json();
      if (json.success) {
        setReviews(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setMsg('Review deleted successfully');
        setTimeout(() => setMsg(''), 3000);
        fetchReviews();
      }
    } catch {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-color)' }}>⭐ Customer Reviews Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real customer reviews submitted across all footwear products, persisted in MongoDB.</p>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '0.8rem 1.2rem', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: 600 }}>
          {msg}
        </div>
      )}

      <div className="admin-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '0.75rem' }}>Product ID</th>
              <th style={{ padding: '0.75rem' }}>Author</th>
              <th style={{ padding: '0.75rem' }}>Rating</th>
              <th style={{ padding: '0.75rem' }}>Headline & Message</th>
              <th style={{ padding: '0.75rem' }}>Date</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading reviews from database...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customer reviews recorded in MongoDB yet.</td></tr>
            ) : (
              reviews.map((r) => (
                <tr key={r._id || r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem' }}><code>{r.productId}</code></td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{r.author}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--accent-color)' }}>{'★'.repeat(r.rating || 5)}</td>
                  <td style={{ padding: '0.75rem', maxWidth: '350px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.body}</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.date}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                      onClick={() => handleDelete(r._id || r.id)}
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
  );
}
