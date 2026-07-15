'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 7);

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

  return (
    <div className="product-card">
      <div className="product-card-img-wrapper" style={{ backgroundColor: product.bgColor || '#f9f9f9', position: 'relative' }}>
        <Link href={`/product/${productSlug}`}>
          <img src={product.image} alt={product.name} className="product-card-img" />
        </Link>
        {product.tag && <span className="product-badge">{product.tag}</span>}
        <button 
          className={`wishlist-btn-float ${isWishlisted ? 'active' : ''}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label="Add to wishlist"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
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
        <div className="product-card-rating">
          <span className="star-rating">★ {product.rating}</span>
          <span className="review-count">({product.reviews})</span>
        </div>
        
        <h3 className="product-card-title">
          <Link href={`/product/${productSlug}`}>{product.name}</Link>
        </h3>

        <div className="product-card-price-row">
          <span className="current-price">₹{product.price}</span>
          <span className="original-price">₹{product.originalPrice}</span>
          <span className="discount-percent">({discountPercent}% OFF)</span>
        </div>

        <div className="product-card-actions" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <select 
            id={`size-${product.id}`} 
            className="filter-select" 
            style={{ width: '100%', padding: '0.3rem' }}
            value={selectedSize}
            onChange={(e) => setSelectedSize(parseInt(e.target.value))}
          >
            {product.sizes.map((sz) => (
              <option key={sz} value={sz}>Size {sz}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => addToCart(product, `UK ${selectedSize}`)}
            style={{ width: '100%' }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
