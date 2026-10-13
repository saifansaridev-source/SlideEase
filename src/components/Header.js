'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from './CartDrawer';
import PromoBar from './PromoBar';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { getCartCount, isCartOpen, setIsCartOpen, isMenuOpen, setIsMenuOpen, wishlist = [] } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  // Dynamic categories from database
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const mensSubcategories = useMemo(() => {
    const fromApi = categories.filter(c => c.parent === 'mens');
    if (fromApi.length > 0) return fromApi;
    return [
      { name: 'Artisan Loafers', slug: 'mens-loafers', typeMapping: 'loafers' },
      { name: 'Ergonomic Slides', slug: 'mens-slides', typeMapping: 'slides' },
      { name: 'Strappy Sandals', slug: 'mens-sandals', typeMapping: 'sandals' },
      { name: 'Casual Footwear', slug: 'mens-casual', typeMapping: 'casual' },
    ];
  }, [categories]);

  const womensSubcategories = useMemo(() => {
    const fromApi = categories.filter(c => c.parent === 'womens');
    if (fromApi.length > 0) return fromApi;
    return [
      { name: 'Kutch Juttis & Mojris', slug: 'womens-juttis', typeMapping: 'sandals' },
      { name: 'Ikat Slip-on Loafers', slug: 'womens-loafers', typeMapping: 'loafers' },
      { name: 'Paisley Comfort Sandals', slug: 'womens-sandals', typeMapping: 'sandals' },
      { name: 'Floral Cork Slides', slug: 'womens-slides', typeMapping: 'slides' },
    ];
  }, [categories]);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close account dropdown on route change
  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* SECTION 1: PROMO BANNER BAR */}
      <PromoBar />

      {/* SECTION 2: STICKY HEADER NAVIGATION */}
      <header className="main-header" id="header-navigation-section">
        <div className="header-container">
          
          {/* Mobile Hamburger Button */}
          <button 
            className="mobile-menu-toggle" 
            aria-label="Open navigation menu" 
            id="hamburger-menu-btn"
            onClick={() => setIsMenuOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Brand Logo */}
          <Link href="/" className="logo-link" id="brand-logo-link">
            <img src="/assets/logo.png" alt="SlideEase Logo" className="logo-img" />
          </Link>

          {/* Desktop Navigation with Mega-Menus */}
          <nav className="desktop-nav" id="desktop-navbar">
            <ul className="nav-list">
              <li><Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Home</Link></li>
              
              {/* Men's Mega Menu */}
              <li className="nav-item-dropdown">
                <Link href="/shop?category=mens" className="nav-link">Men</Link>
                <div className="mega-menu">
                  <div className="mega-menu-grid">
                    <div className="mega-menu-col">
                      <h4>Categories</h4>
                      <ul>
                        {mensSubcategories.map(sub => (
                          <li key={sub.slug}>
                            <Link href={`/shop?category=mens&subcategory=${sub.slug}${sub.typeMapping ? `&type=${sub.typeMapping}` : ''}`}>
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mega-menu-col">
                      <h4>Summer Styles</h4>
                      <ul>
                        <li><Link href="/shop?category=mens&type=slides">Mandala Cork Slides</Link></li>
                        <li><Link href="/shop?category=mens&type=sandals">Woven Cross Sandals</Link></li>
                        <li><Link href="/shop?category=mens&type=loafers">Velvet Royal Loafers</Link></li>
                        <li><Link href="/shop?category=mens&material=cork">Natural Cork Footbed</Link></li>
                      </ul>
                    </div>
                    <div className="mega-menu-featured">
                      <img src="/assets/slides.png" alt="Men's Collection" style={{ objectFit: 'contain' }} />
                      <span>New Men's Arrivals</span>
                    </div>
                  </div>
                </div>
              </li>

              {/* Women's Mega Menu */}
              <li className="nav-item-dropdown">
                <Link href="/shop?category=womens" className="nav-link">Women</Link>
                <div className="mega-menu">
                  <div className="mega-menu-grid">
                    <div className="mega-menu-col">
                      <h4>Categories</h4>
                      <ul>
                        {womensSubcategories.map(sub => (
                          <li key={sub.slug}>
                            <Link href={`/shop?category=womens&subcategory=${sub.slug}${sub.typeMapping ? `&type=${sub.typeMapping}` : ''}`}>
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mega-menu-col">
                      <h4>Collections</h4>
                      <ul>
                        <li><Link href="/shop?category=womens&collection=artisan">Heritage Embroidery</Link></li>
                        <li><Link href="/shop?category=womens&collection=festive">Festive Splendor</Link></li>
                        <li><Link href="/shop?category=womens&collection=summer">Breezy Linen Comfort</Link></li>
                        <li><Link href="/shop?category=womens&pattern=kutch">Mirror-work Specials</Link></li>
                      </ul>
                    </div>
                    <div className="mega-menu-featured">
                      <img src="/assets/mojris.png" alt="Women's Collection" style={{ objectFit: 'contain' }} />
                      <span>Artisan Juttis Collection</span>
                    </div>
                  </div>
                </div>
              </li>

              {/* Collections Mega Menu */}
              <li className="nav-item-dropdown">
                <Link href="/shop" className="nav-link">Collections</Link>
                <div className="mega-menu">
                  <div className="mega-menu-grid">
                    <div className="mega-menu-col">
                      <h4>Curated Lines</h4>
                      <ul>
                        <li><Link href="/shop?tag=Best%20Seller">Best Sellers</Link></li>
                        <li><Link href="/shop?tag=New%20Launch">New Arrivals</Link></li>
                        <li><Link href="/shop?tag=Trending">Trending Heritage</Link></li>
                      </ul>
                    </div>
                    <div className="mega-menu-col">
                      <h4>Craft Specials</h4>
                      <ul>
                        <li><Link href="/shop?pattern=ikat">Pochampally Ikat</Link></li>
                        <li><Link href="/shop?pattern=kutch">Kutch Mirror Work</Link></li>
                        <li><Link href="/shop?pattern=mandala">Royal Mandala</Link></li>
                      </ul>
                    </div>
                    <div className="mega-menu-featured">
                      <img src="/assets/loafers.png" alt="Trending Collections" style={{ objectFit: 'contain' }} />
                      <span>Ascend with Heritage</span>
                    </div>
                  </div>
                </div>
              </li>
              <li><Link href="/shop?sale=true" className="nav-link" style={{ color: 'var(--danger-color)', fontWeight: 700 }}>Sale</Link></li>
              <li><Link href="/about" className="nav-link">About</Link></li>
              <li><Link href="/contact" className="nav-link">Contact</Link></li>
            </ul>
          </nav>

          {/* Action Utilities */}
          <div className="header-actions">
            {/* Search bar */}
            <div className="search-bar-container" id="header-search-box">
              <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
                <input 
                  type="text" 
                  name="q" 
                  placeholder="Search footwear..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit' }} aria-label="Search">
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
            </div>

            {/* Account Link / Dropdown */}
            {user ? (
              <div ref={accountMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="action-icon-btn"
                  id="account-btn"
                  aria-label="User Account Menu"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px',
                  }}
                >
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary-color) 0%, #1a2a44 100%)',
                      color: 'var(--accent-color)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid var(--accent-color)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isAccountMenuOpen && (
                  <div
                    id="account-dropdown-menu"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '230px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 12px 30px -5px rgba(0,0,0,0.15)',
                      padding: '1rem',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-color)' }}>
                        {user.name}
                      </p>
                      <p style={{ margin: '2px 0 6px 0', fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </p>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' }}>
                        ✨ {user.points || 0} Reward Pts
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      className="account-menu-link"
                      onClick={() => setIsAccountMenuOpen(false)}
                      style={{ fontSize: '0.85rem', color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px' }}
                    >
                      📦 My Orders & Returns
                    </Link>

                    <Link
                      href="/dashboard"
                      className="account-menu-link"
                      onClick={() => setIsAccountMenuOpen(false)}
                      style={{ fontSize: '0.85rem', color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px' }}
                    >
                      👑 Account Dashboard
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="account-menu-link"
                        onClick={() => setIsAccountMenuOpen(false)}
                        style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px' }}
                      >
                        🛡️ Admin Console
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          logout();
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '6px 4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="action-icon-btn" aria-label="Go to login page" id="account-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            )}

            {/* Wishlist Link */}
            <Link href="/wishlist" className="action-icon-btn" aria-label="View Wishlist" id="wishlist-btn" style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlist.length > 0 && <span className="cart-count" style={{ backgroundColor: 'var(--accent-color)' }}>{wishlist.length}</span>}
            </Link>

            {/* Cart Trigger */}
            <button 
              className="action-icon-btn cart" 
              aria-label="Open shopping cart" 
              id="cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {getCartCount() > 0 && <span className="cart-count">{getCartCount()}</span>}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Overlay Navigation Drawer */}
      <div className={`mobile-nav-drawer ${isMenuOpen ? 'open' : ''}`} id="mobile-nav-menu-drawer">
        <div className="drawer-header">
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary-color)' }}>MENU</span>
          <button 
            className="drawer-close" 
            aria-label="Close menu" 
            id="mobile-drawer-close-btn"
            onClick={() => setIsMenuOpen(false)}
          >
            &times;
          </button>
        </div>
        <ul className="mobile-nav-list">
          <li><Link href="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
          <li><Link href="/shop" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Shop All</Link></li>
          <li><Link href="/shop?category=mens" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Men's Collection</Link></li>
          {mensSubcategories.map(sub => (
            <li key={sub.slug} style={{ paddingLeft: '1.2rem' }}>
              <Link href={`/shop?category=mens&subcategory=${sub.slug}`} className="mobile-nav-link" style={{ fontSize: '0.9rem', color: '#64748b' }} onClick={() => setIsMenuOpen(false)}>
                ↳ {sub.name}
              </Link>
            </li>
          ))}
          <li><Link href="/shop?category=womens" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Women's Collection</Link></li>
          {womensSubcategories.map(sub => (
            <li key={sub.slug} style={{ paddingLeft: '1.2rem' }}>
              <Link href={`/shop?category=womens&subcategory=${sub.slug}`} className="mobile-nav-link" style={{ fontSize: '0.9rem', color: '#64748b' }} onClick={() => setIsMenuOpen(false)}>
                ↳ {sub.name}
              </Link>
            </li>
          ))}
          <li><Link href="/shop?sale=true" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--danger-color)', fontWeight: 700 }}>Summer Sale</Link></li>
          <li><Link href="/blog" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Blog & Guides</Link></li>
          <li><Link href="/contact" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Contact Us</Link></li>
          {user ? (
            <>
              <li style={{ padding: '0.75rem 0 0.25rem 0', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  👋 Hi, {user.name} ({user.points || 0} Pts)
                </span>
              </li>
              <li><Link href="/dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>My Orders & Dashboard</Link></li>
              {user.role === 'admin' && (
                <li><Link href="/admin" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} style={{ color: '#d97706', fontWeight: 700 }}>🛡️ Admin Panel</Link></li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="mobile-nav-link"
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 600, width: '100%', textAlign: 'left', cursor: 'pointer', padding: '0.6rem 0' }}
                >
                  🚪 Sign Out
                </button>
              </li>
            </>
          ) : (
            <li><Link href="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>My Account</Link></li>
          )}
        </ul>
        <div className="mobile-drawer-footer">
          <div className="drawer-contact-info">
            <p><strong>Support Email:</strong> support@slideease.com</p>
            <p><strong>Phone:</strong> +91 22 4567 8900</p>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>© 2026 SlideEase Pvt Ltd</p>
        </div>
      </div>

      {/* Cart Drawer Component */}
      <CartDrawer />

      {/* Backdrop for overlays */}
      <div 
        className={`drawer-backdrop ${(isCartOpen || isMenuOpen) ? 'show' : ''}`} 
        id="drawers-overlay-backdrop"
        onClick={() => {
          setIsCartOpen(false);
          setIsMenuOpen(false);
        }}
      ></div>
    </>
  );
}
