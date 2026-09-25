'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';

export default function WishlistPage() {
  const { wishlist = [], toggleWishlist, addToCart } = useCart();
  const [allProducts, setAllProducts] = useState(PRODUCTS);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const prods = data.data || data.products;
        if (data.success && Array.isArray(prods) && prods.length > 0) {
          setAllProducts(prods);
        }
      })
      .catch(() => {});
  }, []);

  // Find wishlist products
  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p.id));

  // Get recommendations (products not in wishlist)
  const recommendations = allProducts.filter((p) => !wishlist.includes(p.id)).slice(0, 4);

  const handleMoveToCart = (product) => {
    const size = product.sizes && product.sizes[0] ? product.sizes[0] : 'UK 7';
    addToCart(product, size, 1);
  };

  const handleClearAll = () => {
    const currentWishlist = [...wishlist];
    currentWishlist.forEach((id) => toggleWishlist(id));
  };

  return (
    <>
      <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ padding: '0.8rem 0', backgroundColor: 'var(--bg-white)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li>/</li>
            <li className="breadcrumb-active" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>My Wishlist</li>
          </ol>
        </div>
      </nav>

      <section className="page-hero" style={{ backgroundImage: "url('/og_image.png')", minHeight: '280px', height: '30vh' }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Saved Items</span>
          <h1 className="page-hero-title">My Wishlist</h1>
          <p className="page-hero-desc">Your collection of favorite handcrafted vegan footwear.</p>
        </div>
      </section>

      {/* Wishlist Empty State */}
      {wishlistProducts.length === 0 ? (
        <section className="container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }} id="wishlist-empty">
          <div style={{ maxWidth: '420px', margin: '0 auto', backgroundColor: '#fff', padding: '3rem 2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>💔</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', margin: '0 0 0.8rem 0', color: 'var(--primary-color)' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Start browsing and save your favorite SlideEase handcrafted footwear designs!
            </p>
            <Link href="/shop" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>
              Start Shopping
            </Link>
          </div>
        </section>
      ) : (
        /* Wishlist Items Grid */
        <section className="container" style={{ padding: '3rem 1.5rem 5rem' }} id="wishlist-full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '1rem', color: 'var(--primary-color)', fontWeight: 600, margin: 0 }}>
              <span>{wishlistProducts.length}</span> {wishlistProducts.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem 1.2rem' }} onClick={handleClearAll}>
              Clear All
            </button>
          </div>
          
          <div className="product-grid wishlist-grid" id="wishlist-items-grid">
            {wishlistProducts.map((p) => {
              const orig = p.originalPrice || p.price * 1.3;
              const discountPercent = Math.round(((orig - p.price) / orig) * 100);
              return (
                <div key={p.id} className="product-card">
                  <Link href={`/product/${p.id}`} className="product-card-img-wrapper" style={{ backgroundColor: p.bgColor || '#f9f9f9', display: 'block' }}>
                    <img src={p.image} alt={p.name} className="product-card-img" loading="lazy" />
                  </Link>
                  <div className="product-card-details">
                    <span className="product-card-category">{p.tag || p.type}</span>
                    <h3 className="product-card-title">
                      <Link href={`/product/${p.id}`}>{p.name}</Link>
                    </h3>
                    <div className="product-card-price-row">
                      <span className="current-price">₹{p.price.toLocaleString('en-IN')}</span>
                      <span className="original-price">₹{Math.round(orig).toLocaleString('en-IN')}</span>
                      <span className="discount-percent">({discountPercent}% OFF)</span>
                    </div>
                    <div className="wishlist-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn btn-primary wishlist-move-btn" onClick={() => handleMoveToCart(p)} style={{ flex: 1 }}>
                        Add to Cart
                      </button>
                      <button 
                        className="wishlist-remove-btn" 
                        onClick={() => toggleWishlist(p.id)} 
                        aria-label="Remove from wishlist" 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommended Section */}
      <section className="materials-section section-padding" id="wishlist-recommended" style={{ backgroundColor: 'var(--bg-white)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '1.8rem', textAlign: 'center', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>
            You Might Also Like
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            Popular handcrafted picks from our SlideEase collection.
          </p>
          <div className="product-grid best-sellers-grid" id="wishlist-recommendations">
            {recommendations.map((p) => {
              const orig = p.originalPrice || p.price * 1.3;
              const discountPercent = Math.round(((orig - p.price) / orig) * 100);
              return (
                <div key={p.id} className="product-card">
                  <Link href={`/product/${p.id}`} className="product-card-img-wrapper" style={{ backgroundColor: p.bgColor || '#f9f9f9', display: 'block' }}>
                    <img src={p.image} alt={p.name} className="product-card-img" loading="lazy" />
                  </Link>
                  <div className="product-card-details">
                    <span className="product-card-category">{p.tag || p.type}</span>
                    <h3 className="product-card-title">
                      <Link href={`/product/${p.id}`}>{p.name}</Link>
                    </h3>
                    <div className="product-card-price-row">
                      <span className="current-price">₹{p.price.toLocaleString('en-IN')}</span>
                      <span className="original-price">₹{Math.round(orig).toLocaleString('en-IN')}</span>
                      <span className="discount-percent">({discountPercent}% OFF)</span>
                    </div>
                    <div style={{ marginTop: '0.8rem' }}>
                      <button className="btn btn-primary" onClick={() => handleMoveToCart(p)} style={{ width: '100%', fontSize: '0.8rem', padding: '0.6rem' }}>
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
