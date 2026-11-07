import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import { verifySession } from '@/lib/auth';
import DashboardOrderList from '@/components/DashboardOrderList';

export const metadata = {
  title: 'My Account Dashboard | SlideEase',
  description: 'Manage your SlideEase orders, loyalty rewards, and delivery addresses.',
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('slidex_session');
  
  if (!sessionCookie) {
    redirect('/login?redirect=/dashboard');
  }

  const sessionData = verifySession(sessionCookie.value);
  if (!sessionData || !sessionData.email) {
    redirect('/login?redirect=/dashboard');
  }

  const db = await getDb();

  // Fetch user information
  const user = await db.collection('users').findOne({ email: sessionData.email.toLowerCase() });
  if (!user) {
    redirect('/api/auth/logout');
  }

  // Fetch orders matching user email
  const userEmail = sessionData.email.toLowerCase().trim();
  const rawOrders = await db.collection('orders')
    .find({
      $or: [
        { 'customer.email': userEmail },
        { email: userEmail }
      ]
    })
    .sort({ createdAt: -1 })
    .toArray();

  const orders = rawOrders.map(o => ({
    ...o,
    _id: o._id.toString(),
    createdAt: o.createdAt ? o.createdAt.toISOString() : null,
    updatedAt: o.updatedAt ? o.updatedAt.toISOString() : null,
  }));

  const totalSpent = orders.reduce((sum, o) => sum + (o.pricing?.total || o.total || 0), 0);

  return (
    <div className="dashboard-page-wrapper">
      <div className="dashboard-container">
        
        {/* Dashboard Top Header */}
        <div className="dashboard-header-card">
          <div className="dashboard-user-meta">
            <div className="dashboard-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="dashboard-user-info">
              <div className="dashboard-user-title-row">
                <h1 className="dashboard-user-name">
                  Welcome, {user.name}!
                </h1>
                <span className="dashboard-user-badge">
                  SlideEase Circle Member
                </span>
              </div>
              <p className="dashboard-user-email">
                {user.email} • Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2026'}
              </p>
            </div>
          </div>

          <div className="dashboard-header-actions">
            {user.role === 'admin' && (
              <Link href="/admin" className="btn btn-accent" style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}>
                🛡️ Admin Panel
              </Link>
            )}
            <a href="/api/auth/logout" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}>
              Sign Out
            </a>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
            <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Artisan Reward Points
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-color)', margin: '0.4rem 0' }}>
              {user.points || 0} pts
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              1 pt = ₹1 credit on next purchase
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
            <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Orders Completed
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', margin: '0.4rem 0' }}>
              {orders.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total Lifetime Spend: ₹{totalSpent.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎟️</div>
            <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Exclusive Coupon
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-color)', margin: '0.6rem 0 0.4rem 0' }}>
              SLIDEEASE10
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Flat 10% discount on all artisan footwear
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
            <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Saved Wishlist
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', margin: '0.4rem 0' }}>
              {(user.wishlist || []).length} items
            </div>
            <Link href="/wishlist" style={{ fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>
              View Saved Favorites →
            </Link>
          </div>
        </div>

        {/* Main Dashboard Layout: Orders & Profile */}
        <div className="dashboard-main-grid">
          
          {/* Order History Section */}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '1.2rem' }}>
              Recent Orders
            </h2>

            <DashboardOrderList initialOrders={orders} />
          </div>

          {/* User Account Info Sidebar */}
          <div className="dashboard-sidebar-panels">
            <div className="dashboard-panel-card">
              <h3 className="dashboard-panel-title">
                Account Details
              </h3>
              <div className="dashboard-details-list">
                <div><strong>Full Name:</strong> {user.name}</div>
                <div style={{ wordBreak: 'break-all' }}><strong>Email:</strong> {user.email}</div>
                <div><strong>Phone:</strong> {user.phone || 'Not provided'}</div>
                <div><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role || 'Customer'}</span></div>
              </div>
            </div>

            <div className="dashboard-panel-card">
              <h3 className="dashboard-panel-title">
                Quick Assistance
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Have questions about your artisan order or need an exchange?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/contact" className="btn btn-outline" style={{ fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }}>
                  Contact Artisan Concierge
                </Link>
                <Link href="/size-guide" className="btn btn-outline" style={{ fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }}>
                  View Sizing Guide
                </Link>
                <Link href="/shipping-returns" className="btn btn-outline" style={{ fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }}>
                  Shipping & Returns Policy
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
