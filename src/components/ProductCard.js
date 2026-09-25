'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState((product.sizes && product.sizes[0]) || 7);

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const slugify = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };
  const productSlug = product.slug || slugify(product.name);
  const productUrl = `/product/${productSlug || product.id}`;

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <div 
        className="product-card-img-wrapper" 
        style={{ backgroundColor: product.bgColor || '#faf8f5', position: 'relative' }}
      >
        <Link 
          href={productUrl} 
          className="product-card-img-link"
          style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          aria-label={`View ${product.name}`}
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-card-img" 
            loading="lazy"
          />
        </Link>
        
        {/* Floating Badges */}
        <div className="product-badges-container" style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2, pointerEvents: 'none' }}>
          {product.tag && (
            <span className="product-badge product-badge-primary">
              {product.tag}
            </span>
          )}
          {product.comfort && (
            <span className="product-badge product-badge-comfort">
              {product.comfort}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          type="button"
          className={`wishlist-btn-float ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 3,
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'var(--danger-color)' : 'none'} stroke={isWishlisted ? 'var(--danger-color)' : 'currentColor'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div className="product-card-details">
        <Link href={productUrl} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div className="product-card-rating">
            <span className="star-rating" style={{ color: 'var(--accent-color)' }}>★ {product.rating || 4.8}</span>
            <span className="review-count">({product.reviews || 95})</span>
          </div>
          
          <h3 className="product-card-title">
            {product.name}
          </h3>

          <div className="product-card-price-row">
            <span className="current-price">₹{product.price}</span>
            <span className="original-price">₹{product.originalPrice}</span>
            <span className="discount-percent">({discountPercent}% OFF)</span>
          </div>
        </Link>

        <div className="product-card-actions" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <select 
            id={`size-${product.id}`} 
            className="filter-select" 
            style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.82rem', background: '#fff' }}
            value={selectedSize}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedSize(parseInt(e.target.value));
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(product.sizes || [6, 7, 8, 9, 10]).map((sz) => (
              <option key={sz} value={sz}>Size UK {sz}</option>
            ))}
          </select>
          <button 
            type="button"
            className="btn btn-primary btn-sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, `UK ${selectedSize}`);
            }}
            style={{ width: '100%', padding: '0.55rem', fontWeight: 600, fontSize: '0.85rem' }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
