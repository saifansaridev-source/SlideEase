import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import clientPromise from '@/lib/mongodb';
import { verifySession } from '@/lib/auth';

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

  const client = await clientPromise;
  const db = client.db('startupbiz');

  // Fetch user information
  const user = await db.collection('users').findOne({ email: sessionData.email.toLowerCase() });
  if (!user) {
    redirect('/api/auth/logout');
  }

  // Fetch orders matching user email
  const userEmail = sessionData.email.toLowerCase().trim();
  const orders = await db.collection('orders')
    .find({
      $or: [
        { 'customer.email': userEmail },
        { email: userEmail }
      ]
    })
    .sort({ createdAt: -1 })
    .toArray();

  const totalSpent = orders.reduce((sum, o) => sum + (o.pricing?.total || o.total || 0), 0);

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '85vh', padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Dashboard Top Header */}
        <div style={{
          backgroundColor: 'var(--bg-white)',
          padding: '2rem 2.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', margin: 0, color: 'var(--primary-color)' }}>
                  Welcome, {user.name}!
                </h1>
                <span style={{
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--primary-color)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  SlideEase Circle Member
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>
                {user.email} • Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2026'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-white)',
            padding: '1.8rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
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

          <div style={{
            backgroundColor: 'var(--bg-white)',
            padding: '1.8rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
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

          <div style={{
            backgroundColor: 'var(--bg-white)',
            padding: '1.8rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
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

          <div style={{
            backgroundColor: 'var(--bg-white)',
            padding: '1.8rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Order History Section */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '1.2rem' }}>
              Recent Orders
            </h2>

            {orders.length === 0 ? (
              <div style={{
                backgroundColor: 'var(--bg-white)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '4rem 2rem',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛍️</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>
                  No orders placed yet
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.8rem' }}>
                  Browse our handcrafted collections of vegan slides, loafers, and juttis.
                </p>
                <Link href="/shop" className="btn btn-primary" style={{ padding: '0.7rem 2rem' }}>
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map((ord) => {
                  const ordId = ord._id.toString();
                  const ordRef = ord.orderNumber || ord.orderId || ordId.slice(-8);
                  const items = ord.items || [];
                  const total = ord.pricing?.total || ord.total || 0;
                  const status = ord.status || 'Processing';
                  const paymentStatus = ord.payment?.status || 'Pending';
                  const orderDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'Recently placed';

                  return (
                    <div key={ordId} style={{
                      backgroundColor: 'var(--bg-white)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      padding: '1.8rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.8rem',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '1rem',
                        marginBottom: '1.2rem',
                        fontSize: '0.88rem'
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Order: </span>
                          <strong style={{ color: 'var(--primary-color)', fontFamily: 'monospace' }}>{ordRef}</strong>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>Placed: {orderDate}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          <span style={{
                            backgroundColor: status === 'Delivered' ? '#e8f5e9' : '#fff3e0',
                            color: status === 'Delivered' ? 'var(--success-color)' : '#e65100',
                            fontWeight: 700,
                            padding: '0.2rem 0.7rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem'
                          }}>
                            {status}
                          </span>
                          <span style={{
                            backgroundColor: paymentStatus === 'Paid' ? '#e8f5e9' : paymentStatus.includes('Pending') ? '#fff3e0' : '#ffebee',
                            color: paymentStatus === 'Paid' ? 'var(--success-color)' : paymentStatus.includes('Pending') ? '#e65100' : 'var(--danger-color)',
                            fontWeight: 700,
                            padding: '0.2rem 0.7rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem'
                          }}>
                            {paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.2rem' }}>
                        {items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--accent-light)' }}>
                                <img src={it.image || '/og_image.png'} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-color)' }}>{it.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Size {it.size} • Qty {it.qty}</div>
                              </div>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>₹{(it.price * it.qty).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {ord.trackingNumber && (
                        <div style={{ padding: '0.5rem 0.8rem', backgroundColor: '#f0fdf4', borderRadius: '6px', fontSize: '0.8rem', color: '#166534', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
                          🚚 Shipped via <strong>{ord.courierName || 'Courier'}</strong> — Tracking / AWB: <code style={{ backgroundColor: '#fff', padding: '0.1rem 0.4rem', borderRadius: '3px', border: '1px solid #86efac', fontWeight: 700 }}>{ord.trackingNumber}</code>
                        </div>
                      )}

                      {/* Total & Action */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px dashed var(--border-color)',
                        paddingTop: '1rem',
                        flexWrap: 'wrap',
                        gap: '0.8rem'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount: </span>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--accent-color)' }}>₹{total.toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link 
                            href={`/orders/${ordRef}/invoice`}
                            target="_blank"
                            className="btn btn-outline"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                          >
                            📄 Invoice
                          </Link>
                          <Link 
                            href={`/order-confirmation?orderId=${ordId}`}
                            className="btn btn-outline"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Account Info Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '1.8rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--primary-color)', margin: '0 0 1rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                Account Details
              </h3>
              <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--text-color)' }}>
                <div><strong>Full Name:</strong> {user.name}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Phone:</strong> {user.phone || 'Not provided'}</div>
                <div><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role || 'Customer'}</span></div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '1.8rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--primary-color)', margin: '0 0 1rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
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
