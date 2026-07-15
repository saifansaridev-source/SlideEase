import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';

export const metadata = {
  title: 'My Account Dashboard'
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('slidex_session');
  
  if (!sessionCookie) {
    redirect('/login');
  }

  let sessionData;
  try {
    sessionData = JSON.parse(sessionCookie.value);
  } catch (e) {
    redirect('/login');
  }

  const client = await clientPromise;
  const db = client.db('startupbiz');

  // Fetch user information
  const user = await db.collection('users').findOne({ email: sessionData.email });
  if (!user) {
    // If cookie exists but user deleted, clear cookie and redirect
    redirect('/api/auth/logout');
  }

  // Fetch orders matching user email
  const orders = await db.collection('orders')
    .find({ 'customer.email': sessionData.email })
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 6rem 1.5rem' }}>
      
      {/* Dashboard Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>Welcome, {user.name}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Registered email: {user.email}</p>
        </div>
        <a href="/api/auth/logout" className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
          Sign Out
        </a>
      </div>

      {/* Overview Cards */}
      <div className="materials-grid" style={{ marginBottom: '4rem', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        <div className="material-card" style={{ padding: '1.5rem', textAlign: 'left', border: '1px solid var(--border-color)', display: 'block' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🏷️</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>Loyalty Points</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-color)' }}>{user.points || 0} pts</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Redeemable at next checkout (1 pt = ₹1)</span>
        </div>
        
        <div className="material-card" style={{ padding: '1.5rem', textAlign: 'left', border: '1px solid var(--border-color)', display: 'block' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📦</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>Orders Placed</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>{orders.length} orders</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Including completed and pending orders</span>
        </div>

        <div className="material-card" style={{ padding: '1.5rem', textAlign: 'left', border: '1px solid var(--border-color)', display: 'block' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🎫</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>Available Coupons</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-color)' }}>SLIDEEASE10 (10% OFF)</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied to all footwear categories</span>
        </div>
      </div>

      {/* Orders details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
        
        {/* Orders list */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>Order History</h2>
          
          {orders.length === 0 ? (
            <div style={{ padding: '3rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 600 }}>No orders placed yet.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Browse our latest artisan designs to place your first order!</p>
              <a href="/shop" className="btn btn-primary" style={{ padding: '0.5rem 2rem', fontSize: '0.9rem' }}>Go to Shop</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map((ord) => (
                <div key={ord.orderId} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'var(--bg-white)', boxShadow: 'var(--shadow-sm)' }}>
                  
                  {/* Order header details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Order ID:</span> <strong style={{ color: 'var(--text-dark)' }}>{ord.orderId}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Date:</span> <strong>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Status:</span> <span style={{ color: ord.status === 'completed' ? 'var(--success-color)' : 'var(--accent-color)', fontWeight: 700, textTransform: 'uppercase' }}>{ord.status}</span>
                    </div>
                  </div>

                  {/* Order items lists */}
                  <div style={{ marginBottom: '1rem' }}>
                    {ord.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.4rem 0' }}>
                        <span>{it.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({it.size})</span> × {it.qty}</span>
                        <span style={{ fontWeight: 600 }}>₹{(it.price * it.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order footer pricing */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span>Total Amount Paid:</span>
                    <span style={{ color: 'var(--accent-color)' }}>₹{ord.total.toLocaleString('en-IN')}</span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address and details */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>Shipping Profile</h2>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'var(--bg-light)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.8rem' }}>Primary Address</h4>
            {orders.length > 0 ? (
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                <strong>{orders[0].customer.firstname} {orders[0].customer.lastname}</strong><br />
                {orders[0].customer.address}<br />
                {orders[0].customer.city}, {orders[0].customer.state} - {orders[0].customer.zip}<br />
                📞 {orders[0].customer.phone}
              </p>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                No default shipping address on file. Please complete a checkout purchase to link your primary shipping profile.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

