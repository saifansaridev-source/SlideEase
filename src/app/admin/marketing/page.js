'use client';

import React, { useState, useEffect } from 'react';

export default function AdminMarketing() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [msg, setMsg]                 = useState('');

  const fetchSubscribers = async (q = '') => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/marketing?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) setSubscribers(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubscribers(search);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this subscriber from the mailing list?')) return;
    const res  = await fetch(`/api/admin/marketing?id=${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      setMsg('Subscriber removed.');
      setTimeout(() => setMsg(''), 3000);
      fetchSubscribers(search);
    } else {
      alert(json.error);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const header = 'Email,Subscribed On\n';
    const rows   = subscribers.map(s =>
      `${s.email},${s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('en-IN') : 'N/A'}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `slideease-subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
            📧 Marketing &amp; Newsletter
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage newsletter subscribers captured from the storefront signup widget.
          </p>
        </div>
        <button
          className="btn btn-accent"
          onClick={handleExportCSV}
          disabled={subscribers.length === 0}
          style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
        >
          ⬇ Export CSV
        </button>
      </div>

      {msg && (
        <div style={{ padding: '0.8rem 1.2rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 600 }}>
          ✓ {msg}
        </div>
      )}

      {/* Stats banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '1.2rem' }}>📬</div>
          <div className="stat-info">
            <span className="stat-value" style={{ fontSize: '1.5rem' }}>{subscribers.length}</span>
            <span className="stat-label">Total Subscribers</span>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '1.5rem' }}>
        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by email address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}>
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setSearch(''); fetchSubscribers(''); }}
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email Address</th>
                <th>Subscribed On</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>Loading subscribers list...</td></tr>
              ) : subscribers.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No subscribers found{search ? ` matching "${search}"` : ''}.
                </td></tr>
              ) : (
                subscribers.map((sub, idx) => (
                  <tr key={sub._id?.toString()}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{idx + 1}</td>
                    <td>
                      <a href={`mailto:${sub.email}`} style={{ fontWeight: 600, color: 'var(--accent-color)', textDecoration: 'none' }}>
                        {sub.email}
                      </a>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                        onClick={() => handleDelete(sub._id)}
                      >
                        Unsubscribe
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
