'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const { toggleCompare, isInCompare, compareIds, maxCompare } = useCompare();

  const sizes = product.sizes || [];
  const hasSizes = sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState(hasSizes ? sizes[0] : null);
  const [wishlistAnim, setWishlistAnim] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const inCompare = isInCompare(product.id);
  const compareAtMax = compareIds.length >= maxCompare && !inCompare;

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const slugify = (t) => t ? t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'') : '';
  const productUrl = `/product/${product.slug || slugify(product.name) || product.id}`;

  const handleWishlist = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setWishlistAnim(true);
    toggleWishlist(product.id);
    setTimeout(() => setWishlistAnim(false), 600);
  }, [toggleWishlist, product.id]);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    const sizeLabel = selectedSize !== null ? `UK ${selectedSize}` : 'One Size';
    addToCart(product, sizeLabel);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  }, [addToCart, product, selectedSize]);

  const handleCompare = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (compareAtMax) return;
    toggleCompare(product.id);
  }, [toggleCompare, product.id, compareAtMax]);

  return (
    <>
      <div className="product-card" id={`product-card-${product.id}`}>
        <div className="product-card-img-wrapper" style={{ backgroundColor: product.bgColor || '#faf8f5', position: 'relative' }}>
          <Link href={productUrl} className="product-card-img-link" style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }} aria-label={`View ${product.name}`}>
            <img src={product.image} alt={product.name} className="product-card-img" loading="lazy" />
          </Link>

          <div className="product-badges-container" style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2, pointerEvents: 'none' }}>
            {product.tag && <span className="product-badge product-badge-primary">{product.tag}</span>}
            {product.comfort && <span className="product-badge product-badge-comfort">{product.comfort}</span>}
          </div>

          <button type="button" className={`wishlist-btn-float ${isWishlisted ? 'active' : ''}`} onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 3, border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: wishlistAnim ? 'scale(1.35)' : 'scale(1)', transition: 'transform 0.3s ease' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'var(--danger-color)' : 'none'} stroke={isWishlisted ? 'var(--danger-color)' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <div className="product-card-details">
          <Link href={productUrl} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="product-card-rating">
              <span className="star-rating" style={{ color: 'var(--accent-color)' }}>&#9733; {product.rating || 4.8}</span>
              <span className="review-count">({product.reviewCount || product.reviews || 95})</span>
            </div>
            <h3 className="product-card-title">{product.name}</h3>
            <div className="product-card-price-row">
              <span className="current-price">&#8377;{product.price?.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="original-price">&#8377;{product.originalPrice?.toLocaleString('en-IN')}</span>
                  {discountPercent > 0 && <span className="discount-percent">({discountPercent}% OFF)</span>}
                </>
              )}
            </div>
          </Link>

          <div className="product-card-actions" style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {hasSizes && (
              <select id={`size-${product.id}`} className="filter-select"
                style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.82rem', background: '#fff' }}
                value={selectedSize} onChange={(e) => { e.stopPropagation(); setSelectedSize(parseInt(e.target.value)); }} onClick={(e) => e.stopPropagation()}>
                {sizes.map((sz) => <option key={sz} value={sz}>Size UK {sz}</option>)}
              </select>
            )}

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleAddToCart} disabled={addedToCart}
                style={{ flex: 1, padding: '0.55rem', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s' }}>
                {addedToCart ? '&#10003; Added!' : 'Add to Cart'}
              </button>

              <button type="button" onClick={handleCompare}
                title={compareAtMax ? `Max ${maxCompare} products` : inCompare ? 'Remove from compare' : 'Add to compare'}
                aria-label={inCompare ? 'Remove from compare' : 'Compare'}
                style={{ padding: '0.55rem 0.6rem', border: `1.5px solid ${inCompare ? 'var(--accent-color)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', background: inCompare ? 'rgba(201,169,97,0.12)' : '#fff', cursor: compareAtMax ? 'not-allowed' : 'pointer', opacity: compareAtMax ? 0.5 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: inCompare ? 'var(--accent-dark)' : 'var(--text-muted)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
                </svg>
              </button>

              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickBuy(true); }}
                aria-label="Quick buy"
                title="Quick Buy"
                style={{ padding: '0.55rem 0.6rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: '#fff', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQuickBuy && (
        <QuickBuyModal product={product} onClose={() => setShowQuickBuy(false)} addToCart={addToCart} />
      )}
    </>
  );
}

function QuickBuyModal({ product, onClose, addToCart }) {
  const sizes = product.sizes || [];
  const hasSizes = sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState(hasSizes ? sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  const getStock = (sz) => {
    if (product.sizeStock && sz !== null) return product.sizeStock[String(sz)] ?? 10;
    if (typeof product.stockQty === 'number') return product.stockQty;
    if (typeof product.stock === 'number') return product.stock;
    return 10;
  };

  const stock = getStock(selectedSize);
  const isOOS = stock === 0;
  const maxQty = Math.min(stock, 10);

  const handleAdd = () => {
    if (hasSizes && !selectedSize) { setError('Please select a size.'); return; }
    if (isOOS) { setError('This size is out of stock.'); return; }
    setError('');
    const sizeLabel = selectedSize !== null ? `UK ${selectedSize}` : 'One Size';
    addToCart(product, sizeLabel, qty);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  const slugify = (t) => t ? t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'') : '';
  const productUrl = `/product/${product.slug || slugify(product.name) || product.id}`;

  return (
    <>
      <div onClick={onClose} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(10,16,28,0.65)', backdropFilter: 'blur(4px)', zIndex: 9000 }} />
      <div role="dialog" aria-modal="true" aria-label={`Quick buy: ${product.name}`}
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9001, width: '92%', maxWidth: '480px', background: '#fff', borderRadius: '16px', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'qbIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <style>{`@keyframes qbIn{from{opacity:0;transform:translate(-50%,-52%) scale(0.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>

        <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', borderBottom: '1px solid var(--border-color)', alignItems: 'flex-start' }}>
          <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)', lineHeight: 1.3, marginBottom: '0.3rem' }}>{product.name}</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-dark)' }}>&#8377;{product.price?.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>&#8377;{product.originalPrice?.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>x</button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {hasSizes && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Size (UK)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {sizes.map((sz) => {
                  const szStock = getStock(sz);
                  const isSelected = selectedSize === sz;
                  const szOOS = szStock === 0;
                  return (
                    <button key={sz} type="button" onClick={() => { if (!szOOS) { setSelectedSize(sz); setError(''); } }} disabled={szOOS}
                      style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`, background: isSelected ? 'rgba(201,169,97,0.12)' : szOOS ? '#f5f5f5' : '#fff', color: isSelected ? 'var(--accent-dark)' : szOOS ? '#bbb' : 'var(--primary-color)', cursor: szOOS ? 'not-allowed' : 'pointer', textDecoration: szOOS ? 'line-through' : 'none', transition: 'all 0.15s' }}>
                      {sz}{szStock > 0 && szStock <= 3 && <span style={{ fontSize: '0.65rem', color: 'var(--danger-color)' }}> ({szStock})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button type="button" onClick={() => setQty(q => Math.max(1,q-1))} style={{ width: '32px', height: '32px', border: '1px solid var(--border-color)', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
              <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
              <button type="button" onClick={() => setQty(q => Math.min(maxQty,q+1))} disabled={qty >= maxQty} style={{ width: '32px', height: '32px', border: '1px solid var(--border-color)', borderRadius: '6px', background: '#fff', cursor: qty >= maxQty ? 'not-allowed' : 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qty >= maxQty ? 0.5 : 1 }}>+</button>
              {stock > 0 && stock <= 5 && <span style={{ fontSize: '0.75rem', color: 'var(--danger-color)', fontWeight: 600 }}>Only {stock} left!</span>}
            </div>
          </div>

          {error && <div style={{ padding: '0.5rem 0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.8rem' }}>{error}</div>}

          <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={isOOS || added} style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px', transition: 'all 0.2s' }}>
            {added ? 'Added to Cart!' : isOOS ? 'Out of Stock' : `Add to Cart - Rs.${(product.price * qty).toLocaleString('en-IN')}`}
          </button>

          <Link href={productUrl} style={{ display: 'block', textAlign: 'center', marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
            View full details
          </Link>
        </div>
      </div>
    </>
  );
}