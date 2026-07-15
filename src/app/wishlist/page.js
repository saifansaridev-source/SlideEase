'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist = [], toggleWishlist, addToCart } = useCart();

  // Find wishlist products
  const wishlistProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  // Get recommendations (products not in wishlist)
  const recommendations = PRODUCTS.filter((p) => !wishlist.includes(p.id)).slice(0, 4);

  const handleMoveToCart = (product) => {
    // Default size to first available size or UK 7
    const size = product.sizes[0] || 'UK 7';
    addToCart(product, size, 1);
  };

  const handleClearAll = () => {
    // Toggle all items in wishlist to remove them
    const currentWishlist = [...wishlist];
    currentWishlist.forEach((id) => toggleWishlist(id));
  };

  return (
    <>
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">My Wishlist</li>
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
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <span style={{ fontSize: '4rem' }}>💔</span>
            <h2 style={{ fontSize: '1.8rem', margin: '1.5rem 0 0.8rem' }}>Your Wishlist is Empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Start browsing and save your favorite Slidex footwear designs!</p>
            <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        </section>
      ) : (
        /* Wishlist Items Grid */
        <section className="container" style={{ padding: '2rem 1.5rem 4rem' }} id="wishlist-full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <span>{wishlistProducts.length}</span> items in your wishlist
            </p>
            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }} onClick={handleClearAll}>
              Clear All
            </button>
          </div>
          
          <div className="product-grid wishlist-grid" id="wishlist-items-grid">
            {wishlistProducts.map((p) => {
              const discountPercent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
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
                      <span className="current-price">₹{p.price.toLocaleString()}</span>
                      <span className="original-price">₹{p.originalPrice.toLocaleString()}</span>
                      <span className="discount-percent">({discountPercent}% OFF)</span>
                    </div>
                    <div className="wishlist-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn btn-primary wishlist-move-btn" onClick={() => handleMoveToCart(p)} style={{ flex: 1 }}>
                        Add to Cart
                      </button>
                      <button className="wishlist-remove-btn" onClick={() => toggleWishlist(p.id)} aria-label="Remove from wishlist" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'none', cursor: 'pointer' }}>
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
      <section className="materials-section section-padding" id="wishlist-recommended">
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '1.8rem' }}>You Might Also Like</h2>
          <p className="section-subtitle">Popular picks from our collection.</p>
          <div className="product-grid best-sellers-grid">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
