import './admin.css';
import Link from 'next/link';

export const metadata = {
  title: {
    default: 'Admin Dashboard | SlideEase',
    template: '%s | SlideEase Admin'
  },
  robots: 'noindex, nofollow'
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-body">

      {/* SIDEBAR */}
      <aside className="admin-sidebar" id="admin-sidebar">
        <div className="admin-sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start', padding: '1.5rem 1.5rem 1.25rem 1.5rem' }}>
          <Link href="/" style={{ display: 'block', textDecoration: 'none' }}>
            <img src="/assets/logo.png" alt="SlideEase Logo" className="logo-img" style={{ height: '28px', width: 'auto', filter: 'brightness(0) invert(1)', display: 'block' }} />
          </Link>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-color)', letterSpacing: '0.15em', textTransform: 'uppercase', paddingLeft: '0.2rem', marginTop: '0.2rem' }}>Management Panel</span>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-item">
            <span>📊</span> Dashboard
          </Link>

          {/* CATALOG GROUP */}
          <div style={{ padding: '0.5rem 1.5rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.5rem' }}>Catalog</div>
          <Link href="/admin/categories" className="admin-nav-item">
            <span>🏷️</span> Categories
          </Link>
          <Link href="/admin/products" className="admin-nav-item">
            <span>📦</span> Products
          </Link>
          <Link href="/admin/inventory" className="admin-nav-item">
            <span>📈</span> Inventory
          </Link>
          <Link href="/admin/media" className="admin-nav-item">
            <span>🖼️</span> Media Library
          </Link>

          {/* ORDERS GROUP */}
          <div style={{ padding: '0.5rem 1.5rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.25rem' }}>Orders</div>
          <Link href="/admin/orders" className="admin-nav-item">
            <span>🛒</span> Orders
          </Link>
          <Link href="/admin/returns" className="admin-nav-item">
            <span>↩️</span> Returns &amp; Refunds
          </Link>
          <Link href="/admin/coupons" className="admin-nav-item">
            <span>🎟️</span> Coupons
          </Link>

          {/* CUSTOMERS GROUP */}
          <div style={{ padding: '0.5rem 1.5rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.25rem' }}>Customers</div>
          <Link href="/admin/customers" className="admin-nav-item">
            <span>👥</span> Customers
          </Link>
          <Link href="/admin/reviews" className="admin-nav-item">
            <span>⭐</span> Reviews
          </Link>
          <Link href="/admin/marketing" className="admin-nav-item">
            <span>📧</span> Newsletter
          </Link>

          {/* CONTENT GROUP */}
          <div style={{ padding: '0.5rem 1.5rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.25rem' }}>Content</div>
          <Link href="/admin/hero" className="admin-nav-item">
            <span>🎨</span> Hero Banners
          </Link>
          <Link href="/admin/cms" className="admin-nav-item">
            <span>📝</span> CMS Pages
          </Link>

          {/* CONFIG GROUP */}
          <div style={{ padding: '0.5rem 1.5rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.25rem' }}>Configuration</div>
          <Link href="/admin/shipping-tax" className="admin-nav-item">
            <span>🚚</span> Shipping &amp; Tax
          </Link>
          <Link href="/admin/settings" className="admin-nav-item">
            <span>⚙️</span> General Settings
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-item" style={{ color: 'var(--accent-color)' }}>
            <span>🌐</span> View Store
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="admin-main">
        <header className="admin-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="admin-page-title" style={{ margin: 0 }}>SlideEase Management Panel</h1>
          <div className="admin-topbar-actions">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Welcome, Administrator</span>
          </div>
        </header>

        {/* Child views */}
        <div style={{ padding: '2rem 0' }}>
          {children}
        </div>
      </main>

    </div>
  );
}
