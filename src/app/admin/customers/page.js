'use client';

import React, { useState, useEffect } from 'react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError('Failed to fetch customers directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`User role updated successfully to: ${newRole}`);
        fetchCustomers(); // Refresh list
      } else {
        alert('Failed to update role: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to permanently delete the user account "${userName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        alert('User account deleted successfully!');
        fetchCustomers(); // Refresh list
      } else {
        alert('Failed to delete user: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Failed to delete user.');
    }
  };

  const filteredCustomers = customers.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesName = user.name && user.name.toLowerCase().includes(term);
    const matchesEmail = user.email && user.email.toLowerCase().includes(term);
    return matchesName || matchesEmail;
  });

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h3 style={{ margin: 0 }}>👥 Registered Customers & User Accounts</h3>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {filteredCustomers.length} Accounts Found
          </span>
        </div>

        {/* User Search Input */}
        <input 
          type="text" 
          placeholder="Search users by name or email address..." 
          className="form-input"
          style={{ width: '100%' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="admin-table-wrapper" style={{ minHeight: '300px' }}>
        {error && <div style={{ padding: '1rem', color: 'var(--danger-color)', textAlign: 'center' }}>Error: {error}</div>}
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer Name</th>
              <th>Email Address</th>
              <th>Registered Date</th>
              <th>Access Level / Role</th>
              <th>Points Balance</th>
              <th>Action Panel</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '4rem' }}>Fetching registered user accounts...</td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '4rem' }}>No user accounts matched your search terms.</td>
              </tr>
            ) : (
              filteredCustomers.map((user, idx) => (
                <tr key={user._id ? user._id.toString() : idx}>
                  <td>{idx + 1}</td>
                  <td><strong>{user.name || 'Unnamed User'}</strong></td>
                  <td><code>{user.email}</code></td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                  <td>
                    <select
                      value={user.role || 'customer'}
                      onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                      className="filter-select"
                      style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.3rem 0.5rem', 
                        width: '120px',
                        border: '1px solid var(--border-color)',
                        textTransform: 'capitalize'
                      }}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--success-color)' }}>{user.points || 0} pts</td>
                  <td>
                    <button 
                      className="btn btn-outline" 
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                      onClick={() => handleDeleteUser(user._id, user.name || user.email)}
                    >
                      Remove Account
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
