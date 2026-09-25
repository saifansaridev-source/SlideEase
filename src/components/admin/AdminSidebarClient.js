'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebarClient({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const isActive = (path) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="admin-body">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={closeSidebar}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 22, 40, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 99,
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} id="admin-sidebar">
        {/* Header */}
        <div className="admin-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <Link href="/admin" onClick={closeSidebar} style={{ display: 'block', textDecoration: 'none' }}>
              <img src="/assets/logo.png" alt="SlideEase Logo" className="logo-img" style={{ height: '28px', width: 'auto', filter: 'brightness(0) invert(1)', display: 'block' }} />
            </Link>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-color)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginTop: '0.35rem' }}>Management Suite</span>
          </div>
          {/* Close button on mobile */}
          <button 
            type="button" 
            onClick={closeSidebar} 
            className="admin-mobile-close-btn"
            aria-label="Close sidebar"
            style={{
              display: 'none',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="admin-nav" style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          <Link href="/admin" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
            <span>Dashboard</span>
          </Link>

          {/* CATALOG GROUP */}
          <div className="admin-nav-group-label" style={{ padding: '0.85rem 1.5rem 0.35rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Catalog</div>
          
          <Link href="/admin/categories" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/categories') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.85 8.62 4.6-4.6a2 2 0 0 1 2.83 0l8.1 8.09a2 2 0 0 1 0 2.83l-4.6 4.6a2 2 0 0 1-2.83 0l-8.1-8.09a2 2 0 0 1 0-2.83Z"></path><circle cx="8" cy="8" r="1.5"></circle></svg>
            <span>Categories</span>
          </Link>
          
          <Link href="/admin/products" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/products') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
            <span>Products</span>
          </Link>
          
          <Link href="/admin/inventory" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/inventory') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            <span>Inventory</span>
          </Link>
          
          <Link href="/admin/media" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/media') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
            <span>Media Library</span>
          </Link>

          {/* ORDERS GROUP */}
          <div className="admin-nav-group-label" style={{ padding: '0.85rem 1.5rem 0.35rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Orders &amp; Sales</div>
          
          <Link href="/admin/orders" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/orders') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
            <span>Orders</span>
          </Link>
          
          <Link href="/admin/returns" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/returns') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
            <span>Returns &amp; Refunds</span>
          </Link>
          
          <Link href="/admin/coupons" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/coupons') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
            <span>Coupons</span>
          </Link>

          {/* CUSTOMERS GROUP */}
          <div className="admin-nav-group-label" style={{ padding: '0.85rem 1.5rem 0.35rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Customers</div>
          
          <Link href="/admin/customers" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/customers') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Customers</span>
          </Link>
          
          <Link href="/admin/reviews" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/reviews') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>Reviews</span>
          </Link>
          
          <Link href="/admin/marketing" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/marketing') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            <span>Newsletter</span>
          </Link>

          {/* CONTENT GROUP */}
          <div className="admin-nav-group-label" style={{ padding: '0.85rem 1.5rem 0.35rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Visual Content CMS</div>
          
          <Link href="/admin/hero" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/hero') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
            <span>Visual CMS (Hero &amp; Sections)</span>
          </Link>
          
          <Link href="/admin/cms" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/cms') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
            <span>CMS Pages</span>
          </Link>

          <Link href="/admin/popups" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/popups') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="13" y2="13"></line><line x1="9" y1="17" x2="11" y2="17"></line></svg>
            <span>Promotional Popups</span>
          </Link>

          {/* CONFIG GROUP */}
          <div className="admin-nav-group-label" style={{ padding: '0.85rem 1.5rem 0.35rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Configuration</div>
          
          <Link href="/admin/shipping-tax" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/shipping-tax') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
            <span>Shipping &amp; Logistics</span>
          </Link>
          
          <Link href="/admin/settings" onClick={closeSidebar} className={`admin-nav-item ${isActive('/admin/settings') ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>General Settings</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1rem' }}>
          <Link href="/" target="_blank" className="admin-nav-item" style={{ color: 'var(--accent-color)', padding: '0.65rem 0.75rem', borderRadius: '6px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span style={{ fontWeight: 600 }}>View Live Store</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          {/* Mobile hamburger button */}
          <button 
            type="button" 
            onClick={toggleSidebar}
            className="admin-hamburger-btn"
            aria-label="Toggle navigation drawer"
            style={{
              display: 'none',
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              color: '#1e293b'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          <h1 className="admin-page-title" style={{ margin: 0 }}>SlideEase Management Suite</h1>
          
          <div className="admin-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Administrator</span>
            <Link 
              href="/" 
              className="btn btn-secondary" 
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Storefront
            </Link>
          </div>
        </header>

        {/* View Content */}
        <div style={{ padding: '1.5rem 2rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
