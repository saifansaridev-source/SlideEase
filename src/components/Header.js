'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';

export default function Header() {
  const pathname = usePathname();
  const { getCartCount, isCartOpen, setIsCartOpen, isMenuOpen, setIsMenuOpen, wishlist = [] } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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
      {/* ========================================== */}
      {/* SECTION 1: PROMO BANNER BAR                */}
      {/* ========================================== */}
      <div className="promo-bar" id="promo-bar-section">
        <span>✨ FREE SHIPPING NATIONWIDE ON ORDERS ABOVE ₹999 | USE CODE: SLIDEEASE10 FOR 10% OFF ✨</span>
      </div>

      {/* ========================================== */}
      {/* SECTION 2: HEADER NAVIGATION & DRAWER      */}
      {/* ========================================== */}
      <header className="main-header" id="header-navigation-section">
        <div class="header-container">
          
          {/* Hamburger Toggle (Mobile) */}
          <button 
            className="mobile-menu-toggle" 
            aria-label="Open navigation menu" 
            id="hamburger-menu-btn"
            onClick={() => setIsMenuOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Brand Logo */}
          <Link href="/" className="logo-link" id="brand-logo-link">
            <img src="/assets/logo.png" alt="Slidex Logo" className="logo-img" />
          </Link>

          {/* Desktop Navbar */}
          <nav className="desktop-nav" id="desktop-navbar">
            <ul className="nav-list">
              <li><Link href="/" className="nav-link">Home</Link></li>
              <li><Link href="/shop?category=mens" className="nav-link">Men</Link></li>
              <li><Link href="/shop?category=womens" className="nav-link">Women</Link></li>
              <li><Link href="/shop" className="nav-link">Collections</Link></li>
              <li><Link href="/blog" className="nav-link">Blog</Link></li>
              <li><Link href="/about" className="nav-link">About</Link></li>
              <li><Link href="/contact" className="nav-link">Contact</Link></li>
            </ul>
          </nav>

          {/* Utilities (Search, Login, Cart) */}
          <div className="header-actions">
            {/* Search bar */}
            <div className="search-bar-container" id="header-search-box">
              <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Search footwear..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit' }}>
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
            </div>
            
            {/* Account Icon */}
            <Link href="/login" className="action-icon-btn" aria-label="Go to login page" id="account-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>

            {/* Wishlist Link */}
            <Link href="/wishlist" className="action-icon-btn" aria-label="View Wishlist" id="wishlist-btn" style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <li><Link href="/shop?category=womens" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Women's Collection</Link></li>
          <li><Link href="/blog" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Blog & Guides</Link></li>
          <li><Link href="/about" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
          <li><Link href="/contact" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Contact Us</Link></li>
        </ul>
        <div className="mobile-drawer-footer">
          <div className="drawer-contact-info">
            <p><strong>Support Email:</strong> support@slidexfootwear.com</p>
            <p><strong>Phone:</strong> +91 22 4567 8900</p>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>© 2026 Slidex Footwear Pvt Ltd</p>
        </div>
      </div>

      {/* Side Shopping Cart Drawer */}
      <CartDrawer />

      {/* Backdrop for drawers */}
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

