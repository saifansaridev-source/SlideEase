'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fallbackMsg, setFallbackMsg] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
        if (json.isFallback) {
          setFallbackMsg(json.fallbackNotice || 'MongoDB connection offline. Showing local mock fallback data.');
        } else {
          setFallbackMsg('');
        }
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>Loading administrative dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-color)' }}>
        <p style={{ fontWeight: 700 }}>Error: {error}</p>
        <button onClick={fetchStats} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
      </div>
    );
  }

  const { totalRevenue, totalOrders, totalCustomers, recentOrders, lowStock, topProducts } = stats;

  return (
    <>
      {fallbackMsg && (
        <div style={{ 
          backgroundColor: '#fef2f2', 
          borderLeft: '4px solid #ef4444', 
          padding: '1.25rem', 
          borderRadius: '6px', 
          marginBottom: '2rem', 
          color: '#991b1b', 
          fontSize: '0.9rem', 
          fontWeight: 600,
          lineHeight: '1.5'
        }}>
          ⚠️ {fallbackMsg}
        </div>
      )}
      {/* Stats Cards */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>💰</div>
          <div className="stat-info">
            <span className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>📦</div>
          <div className="stat-info">
            <span className="stat-value">{totalOrders}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>👥</div>
          <div className="stat-info">
            <span className="stat-value">{totalCustomers}</span>
            <span className="stat-label">Customers</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3', color: '#be185d' }}>📈</div>
          <div className="stat-info">
            <span className="stat-value">
              {totalOrders > 0 ? `₹${Math.round(totalRevenue / totalOrders)}` : '₹0'}
            </span>
            <span className="stat-label">Average Order Value</span>
          </div>
        </div>
      </section>

      {/* Chart & Recent Orders */}
      <section className="admin-grid-2col" style={{ marginTop: '2rem' }}>
        {/* Sales Chart Mockup */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Weekly Sales Overview</h3>
          </div>
          <div className="admin-chart" id="sales-chart" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '220px', padding: '1rem 0' }}>
            <div className="chart-bar" style={{ height: '65%' }} data-label="Mon" data-value="₹42K"></div>
            <div className="chart-bar" style={{ height: '45%' }} data-label="Tue" data-value="₹31K"></div>
            <div className="chart-bar" style={{ height: '80%' }} data-label="Wed" data-value="₹58K"></div>
            <div className="chart-bar" style={{ height: '55%' }} data-label="Thu" data-value="₹38K"></div>
            <div className="chart-bar" style={{ height: '90%' }} data-label="Fri" data-value="₹68K"></div>
            <div className="chart-bar" style={{ height: '70%' }} data-label="Sat" data-value="₹51K"></div>
            <div className="chart-bar" style={{ height: '95%' }} data-label="Sun" data-value="₹72K"></div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          <div className="admin-table-wrapper" style={{ maxHeight: '220px', overflowY: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No recent orders.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td><strong>{order.orderId}</strong></td>
                      <td>{order.customer.firstname} {order.customer.lastname}</td>
                      <td>₹{order.total}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Low Stock Alerts & Quick Actions */}
      <section className="admin-grid-2col" style={{ marginTop: '2rem' }}>
        {/* Low Stock alerts */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>⚠️ Low Stock Alerts</h3>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock State</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>All products are in healthy stock levels!</td>
                  </tr>
                ) : (
                  lowStock.map((prod) => (
                    <tr key={prod.id}>
                      <td>{prod.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{prod.category}</td>
                      <td>
                        <span className="status-badge pending" style={{ color: 'var(--danger-color)', backgroundColor: 'var(--danger-light)' }}>
                          Low Stock
                        </span>
                      </td>
                      <td>
                        <Link href="/admin/products" className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem' }}>
                          Edit Stock
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <Link href="/admin/products" className="quick-action-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--primary-color)' }}>
              <span style={{ fontSize: '1.4rem' }}>➕</span> Add Footwear
            </Link>
            <Link href="/admin/orders" className="quick-action-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--primary-color)' }}>
              <span style={{ fontSize: '1.4rem' }}>🛒</span> Manage Orders
            </Link>
            <Link href="/admin/customers" className="quick-action-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--primary-color)' }}>
              <span style={{ fontSize: '1.4rem' }}>👥</span> Customers List
            </Link>
            <Link href="/" className="quick-action-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--primary-color)' }}>
              <span style={{ fontSize: '1.4rem' }}>🌐</span> View Storefront
            </Link>
          </div>
        </div>
      </section>

      {/* Top selling products */}
      <section className="admin-card" style={{ marginTop: '2rem' }}>
        <div className="admin-card-header">
          <h3>🏆 Top Rated Footwear</h3>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Reviews Count</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((prod) => (
                <tr key={prod.id}>
                  <td><strong>{prod.name}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{prod.category}</td>
                  <td>₹{prod.price}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-color)' }}>★ {prod.rating}</td>
                  <td>{prod.reviews} reviews</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
