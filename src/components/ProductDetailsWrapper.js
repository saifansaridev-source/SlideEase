'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ProductCard from './ProductCard';

export default function ProductDetailsWrapper({ product, relatedProducts = [], allProducts = [] }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, wishlist } = useCart();

  /* ── 1. Variant & Gallery States ── */
  const getInitialSize = () => {
    const rawSizes = product.sizes || [5, 6, 7, 8, 9, 10];
    const availableSizes = rawSizes.map(String);
    if (product.sizeStock) {
      const firstInStock = availableSizes.find(s => (product.sizeStock[s] || 0) > 0);
      if (firstInStock) return isNaN(Number(firstInStock)) ? firstInStock : Number(firstInStock);
    }
    return rawSizes[0] || 7;
  };

  const [activeThumb, setActiveThumb] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(getInitialSize);
  const [selectedColor, setSelectedColor] = useState('Original');
  const [priceModifier, setPriceModifier] = useState(0);
  const [skuSuffix, setSkuSuffix] = useState('-ORG');

  const selectedSizeQty = product.sizeStock && product.sizeStock[String(selectedSize)] !== undefined
    ? product.sizeStock[String(selectedSize)]
    : 10;
  const isSelectedSizeOOS = selectedSizeQty === 0;
  const isSelectedSizeLow = selectedSizeQty > 0 && selectedSizeQty < 5;

  const [variantStockLabel, setVariantStockLabel] = useState(
    isSelectedSizeOOS ? 'Out of Stock' : isSelectedSizeLow ? 'Low Stock' : 'In Stock'
  );
  const [variantStockClass, setVariantStockClass] = useState(
    isSelectedSizeOOS ? 'out-of-stock' : isSelectedSizeLow ? 'low-stock' : 'in-stock'
  );

  useEffect(() => {
    const qty = product.sizeStock && product.sizeStock[String(selectedSize)] !== undefined
      ? product.sizeStock[String(selectedSize)]
      : 10;
    if (qty === 0) {
      setVariantStockLabel('Out of Stock');
      setVariantStockClass('out-of-stock');
    } else if (qty < 5) {
      setVariantStockLabel(`Only ${qty} Left!`);
      setVariantStockClass('low-stock');
    } else {
      setVariantStockLabel('In Stock');
      setVariantStockClass('in-stock');
    }
  }, [selectedSize, product.sizeStock]);

  const [qty, setQty] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  /* ── 2. Modal & Tab States ── */
  const [activeTab, setActiveTab] = useState('tab-description');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  /* ── 3. Zoom Lens Coordinates ── */
  const [zoomStyle, setZoomStyle] = useState({});
  const imgContainerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imgContainerRef.current) return;
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`,
      transform: 'scale(1.4)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  /* ── 4. Color Swatches Definition ── */
  const colorSwatches = [
    { name: 'Original', hex: product.patternColor || '#008080', priceDelta: 0, sku: '-ORG', stock: 'In Stock', stockClass: 'in-stock' },
    { name: 'Tan', hex: '#c48a43', priceDelta: 100, sku: '-TAN', stock: 'Only 5 Left!', stockClass: 'low-stock' },
    { name: 'Dark Brown', hex: '#5a3921', priceDelta: 150, sku: '-DBR', stock: 'Only 2 Left!', stockClass: 'low-stock' },
    { name: 'Black', hex: '#1a1a2e', priceDelta: 50, sku: '-BLK', stock: 'In Stock', stockClass: 'in-stock' },
  ];

  const handleColorSelect = (swatch) => {
    setSelectedColor(swatch.name);
    setPriceModifier(swatch.priceDelta);
    setSkuSuffix(swatch.sku);
    setVariantStockLabel(swatch.stock);
    setVariantStockClass(swatch.stockClass);
  };

  /* ── 5. Calculated Pricing ── */
  const currentPrice = (product.price || 1299) + priceModifier;
  const originalPrice = (product.originalPrice || 2199) + priceModifier;
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  /* ── 6. Wishlist check ── */
  const isWishlisted = wishlist.includes(product.id);

  /* ── 7. Thumbnails List ── */
  const thumbUrls = Array.isArray(product.gallery) && product.gallery.length > 0
    ? [product.image, ...product.gallery]
    : [product.image, product.image, product.image];

  /* ── 8. Add to Cart / Buy Now ── */
  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      price: currentPrice,
      originalPrice: originalPrice,
      selectedColor: selectedColor,
    };
    addToCart(itemToAdd, `UK ${selectedSize}`, qty);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    const itemToAdd = {
      ...product,
      price: currentPrice,
      originalPrice: originalPrice,
      selectedColor: selectedColor,
    };
    addToCart(itemToAdd, `UK ${selectedSize}`, qty);
    router.push('/checkout');
  };

  /* ── 9. Reviews State & Management ── */
  const [reviewsList, setReviewsList] = useState([
    { author: 'Priya Sharma', title: 'Incredibly comfortable!', body: 'The memory foam soles are amazing. I can wear these all day without any discomfort.', rating: 5, date: '15/06/2026' },
    { author: 'Rahul Mehta', title: 'Beautiful craftsmanship', body: 'The handwoven patterns are stunning. These shoes always get compliments wherever I go.', rating: 5, date: '02/06/2026' },
    { author: 'Ananya Patel', title: 'Great vegan alternative', body: 'Finally found premium vegan shoes in India. The quality is at par with leather products. Highly recommend!', rating: 4, date: '20/05/2026' }
  ]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmittedNotice, setReviewSubmittedNotice] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setReviewsList(prev => [...json.data, ...prev]);
        }
      })
      .catch(() => { });
  }, [product.id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTitle.trim() || !newBody.trim()) return;

    const newRev = {
      productId: product.id,
      author: newAuthor.trim(),
      title: newTitle.trim(),
      body: newBody.trim(),
      rating: newRating,
      date: new Date().toLocaleDateString('en-IN')
    };

    setReviewsList(prev => [newRev, ...prev]);
    setNewAuthor('');
    setNewTitle('');
    setNewBody('');
    setNewRating(5);
    setReviewSubmittedNotice(true);
    setTimeout(() => setReviewSubmittedNotice(false), 4000);

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRev)
      });
    } catch (e) {
      console.warn('MongoDB review submission failed:', e);
    }
  };

  /* ── 10. Recently Viewed Storage & Retrieval ── */
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    try {
      const storedIds = JSON.parse(localStorage.getItem('slidex_recently_viewed') || '[]');

      // Filter out current product to display previous visits
      const otherIds = storedIds.filter(id => id !== product.id);
      if (allProducts.length > 0 && otherIds.length > 0) {
        const found = otherIds
          .map(id => allProducts.find(p => p.id === id))
          .filter(Boolean)
          .slice(0, 4);
        setRecentlyViewed(found);
      }

      // Add current product to front of list
      const updated = [product.id, ...storedIds.filter(id => id !== product.id)].slice(0, 8);
      localStorage.setItem('slidex_recently_viewed', JSON.stringify(updated));
    } catch (e) { }
  }, [product.id, allProducts]);

  /* ── 11. Schema.org JSON-LD ── */
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.desc,
    sku: product.id.toUpperCase().replace('PROD-', 'SLDX-SKU-') + skuSuffix,
    brand: {
      '@type': 'Brand',
      name: 'SlideEase Footwear'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: currentPrice,
      availability: 'https://schema.org/InStock',
      url: `https://www.slidexfootwear.com/product/${product.id}`
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.8,
      reviewCount: product.reviews || 120
    }
  };

  return (
    <>
      {/* Product JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* ── SECTION 1: BREADCRUMBS ────────────────────────────────────────── */}
      <nav className="breadcrumb-nav" id="product-breadcrumb" aria-label="Breadcrumb">
        <div className="container" style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}>
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li id="breadcrumb-category-item">
              <Link href={`/shop?category=${product.category}`}>
                {product.category === 'mens' ? "Men's Footwear" : "Women's Footwear"}
              </Link>
            </li>
            <li className="breadcrumb-active" id="breadcrumb-product-name">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* ── SECTION 2: PRODUCT DETAIL GRID ────────────────────────────────── */}
      <section className="product-detail-section" id="product-detail-main" style={{ padding: '1rem 0 3.5rem 0' }}>
        <div className="container">
          <div className="product-detail-grid">

            {/* Left Column: Image Gallery & Video Teaser */}
            <div className="product-gallery">
              <div
                className="product-gallery-main"
                id="product-main-image-container"
                ref={imgContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ backgroundColor: product.bgColor || '#faf8f5' }}
              >
                <img
                  id="product-main-img"
                  src={activeThumb}
                  alt={product.name}
                  className="product-main-img"
                  style={zoomStyle}
                />
                <div className={`product-stock-badge ${variantStockClass}`} id="product-stock-badge">
                  {variantStockLabel}
                </div>
                <button
                  className={`wishlist-btn-float ${isWishlisted ? 'active' : ''}`}
                  id="product-wishlist-btn"
                  aria-label="Add to Wishlist"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={isWishlisted ? '#ef4444' : 'none'} stroke={isWishlisted ? '#ef4444' : 'currentColor'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails */}
              <div className="product-gallery-thumbs" id="product-thumbnails">
                {thumbUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`${product.name} view ${idx + 1}`}
                    className={activeThumb === url ? 'active' : ''}
                    onClick={() => setActiveThumb(url)}
                  />
                ))}
              </div>

              {/* Product Video Teaser */}
              <div className="product-video-section" id="product-video-section">
                <div
                  className="product-video-placeholder"
                  onClick={() => setIsVideoModalOpen(true)}
                  role="button"
                  tabIndex={0}
                  aria-label="Watch Artisanal Craftsmanship Video"
                >
                  <div className="video-play-icon">▶</div>
                  <p style={{ margin: 0, fontWeight: 600 }}>Watch Artisanal Craftsmanship Video</p>
                  <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Behind the scenes with Ramjibhai Vankar</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Information & Purchase Bar */}
            <div className="product-info">
              <div className="product-info-tag" id="product-tag">{product.tag || 'Handcrafted Heritage'}</div>
              <h1 className="product-info-title" id="product-title">{product.name}</h1>

              <div className="product-info-rating" id="product-rating-display">
                <span className="stars" style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }}>
                  {'★'.repeat(Math.round(product.rating || 5)) + '☆'.repeat(5 - Math.round(product.rating || 5))}
                </span>
                <span className="review-count" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  ({product.reviews || reviewsList.length} reviews)
                </span>
                <a href="#product-reviews-section" className="write-review-link">Write a Review</a>
              </div>

              <div className="product-info-price-block">
                <span className="product-info-current-price" id="product-current-price">₹{currentPrice.toLocaleString()}</span>
                <span className="product-info-original-price" id="product-original-price">₹{originalPrice.toLocaleString()}</span>
                <span className="product-info-discount" id="product-discount-pct">{discountPercent}% OFF</span>
              </div>

              <p className="product-info-tax-note">Inclusive of all taxes. Free shipping on orders above ₹999.</p>

              <div className="product-info-desc" id="product-description">
                <p>{product.desc || 'Handcrafted vegan luxury footwear with artisanal Indian motifs and orthotic cushioned soles.'}</p>
              </div>

              {/* Variant: Size Selector */}
              <div className="product-variant-group">
                <label className="variant-label">
                  <span>Select Size (UK/Indian)</span>
                  <span
                    className="variant-guide-link"
                    onClick={() => setIsSizeGuideOpen(true)}
                    role="button"
                    tabIndex={0}
                  >
                    📏 Size Guide
                  </span>
                </label>
                <div className="variant-options size-options" id="product-size-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                  {(product.sizes || [5, 6, 7, 8, 9, 10]).map((sz) => {
                    const szKey = String(sz);
                    const qtyInStock = product.sizeStock && product.sizeStock[szKey] !== undefined
                      ? product.sizeStock[szKey]
                      : 10;
                    const isOOS = qtyInStock === 0;
                    const isLow = qtyInStock > 0 && qtyInStock < 5;
                    const isCurrent = String(selectedSize) === szKey;

                    return (
                      <div key={sz} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                        <button
                          type="button"
                          disabled={isOOS}
                          className={`variant-btn ${isCurrent ? 'active' : ''}`}
                          style={{
                            opacity: isOOS ? 0.38 : 1,
                            textDecoration: isOOS ? 'line-through' : 'none',
                            cursor: isOOS ? 'not-allowed' : 'pointer',
                            backgroundColor: isCurrent ? 'var(--primary-color)' : isOOS ? '#f3f4f6' : '#fff',
                            color: isCurrent ? '#fff' : isOOS ? '#9ca3af' : 'inherit',
                            borderColor: isCurrent ? 'var(--primary-color)' : isOOS ? '#d1d5db' : 'var(--border-color)',
                            minWidth: '54px',
                            padding: '0.5rem 0.75rem',
                            position: 'relative'
                          }}
                          onClick={() => {
                            if (!isOOS) setSelectedSize(sz);
                          }}
                          title={isOOS ? `UK ${sz} is Out of Stock` : isLow ? `Only ${qtyInStock} left in UK ${sz}!` : `UK ${sz} In Stock`}
                        >
                          UK {sz}
                        </button>
                        {isOOS && (
                          <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, marginTop: '3px' }}>
                            Out of Stock
                          </span>
                        )}
                        {isLow && !isOOS && (
                          <span style={{ fontSize: '0.65rem', color: '#d97706', fontWeight: 700, marginTop: '3px' }}>
                            Low Stock ({qtyInStock})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Variant: Color Selector */}
              <div className="product-variant-group">
                <label className="variant-label">
                  <span>Color: <strong style={{ textTransform: 'capitalize', color: 'var(--primary-color)' }}>{selectedColor}</strong></span>
                </label>
                <div className="variant-options color-options" id="product-color-options">
                  {colorSwatches.map((swatch) => (
                    <button
                      key={swatch.name}
                      type="button"
                      className={`color-swatch ${selectedColor === swatch.name ? 'active' : ''}`}
                      style={{ backgroundColor: swatch.hex }}
                      title={`${swatch.name} ${swatch.priceDelta ? `(+₹${swatch.priceDelta})` : ''}`}
                      onClick={() => handleColorSelect(swatch)}
                      aria-label={`Select ${swatch.name} color`}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="product-variant-group">
                <label className="variant-label">Quantity</label>
                <div className="product-qty-selector">
                  <button
                    type="button"
                    className="qty-btn-lg"
                    id="qty-decrease"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-display" id="qty-display">{qty}</span>
                  <button
                    type="button"
                    className="qty-btn-lg"
                    id="qty-increase"
                    onClick={() => setQty(q => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-action-btns">
                <button
                  type="button"
                  disabled={isSelectedSizeOOS}
                  className="btn btn-primary product-add-cart-btn"
                  id="product-add-to-cart-btn"
                  onClick={handleAddToCart}
                  style={{
                    opacity: isSelectedSizeOOS ? 0.5 : 1,
                    cursor: isSelectedSizeOOS ? 'not-allowed' : 'pointer'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }}>
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  {isSelectedSizeOOS ? `UK ${selectedSize} Out of Stock` : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  disabled={isSelectedSizeOOS}
                  className="btn btn-accent product-buy-now-btn"
                  id="product-buy-now-btn"
                  onClick={handleBuyNow}
                  style={{
                    opacity: isSelectedSizeOOS ? 0.5 : 1,
                    cursor: isSelectedSizeOOS ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSelectedSizeOOS ? 'Unavailable' : 'Buy Now'}
                </button>
              </div>

              {addedNotice && (
                <div style={{ padding: '0.8rem 1rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>
                  ✓ {product.name} ({selectedColor}, UK {selectedSize} × {qty}) added to cart!
                </div>
              )}

              {/* Product Meta Info */}
              <div className="product-meta-info">
                <div className="meta-row">
                  <span className="meta-label">Availability:</span>
                  <span className="meta-value" id="product-availability">
                    {isSelectedSizeOOS ? (
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>❌ UK {selectedSize} is Out of Stock</span>
                    ) : isSelectedSizeLow ? (
                      <span style={{ color: '#d97706', fontWeight: 700 }}>⚠️ Low Stock: Only {selectedSizeQty} pairs left in UK {selectedSize}!</span>
                    ) : (
                      <span style={{ color: '#15803d', fontWeight: 700 }}>✓ In Stock ({selectedSizeQty} pairs available in UK {selectedSize})</span>
                    )}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">SKU:</span>
                  <span className="meta-value" id="product-sku">
                    {product.id.toUpperCase().replace('PROD-', 'SLDX-SKU-') + skuSuffix}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Category:</span>
                  <span className="meta-value" id="product-category" style={{ textTransform: 'capitalize' }}>
                    {product.category === 'mens' ? "Men's Collection" : "Women's Collection"}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Material:</span>
                  <span className="meta-value" id="product-material">{product.material || 'Vegan Leather'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Weight:</span>
                  <span className="meta-value" id="product-weight">350g (per shoe)</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Dimensions:</span>
                  <span className="meta-value" id="product-dimensions">30 × 12 × 10 cm</span>
                </div>
              </div>

              {/* Trust & Benefit Boxes */}
              <div className="product-trust-strip" id="product-benefit-boxes">
                <div className="trust-mini-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Secure 256-Bit Payment</span>
                </div>
                <div className="trust-mini-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <span>Free Shipping Above ₹999</span>
                </div>
                <div className="trust-mini-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  <span>7-Day Easy Exchanges</span>
                </div>
                <div className="trust-mini-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                  </svg>
                  <span>100% PETA Vegan Certified</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: PRODUCT TABS ───────────────────────────────────────── */}
      <section className="product-tabs-section" id="product-tabs-section">
        <div className="container">
          <div className="product-tabs-header">
            <button
              type="button"
              className={`product-tab-btn ${activeTab === 'tab-description' ? 'active' : ''}`}
              onClick={() => setActiveTab('tab-description')}
            >
              Description & Craft
            </button>
            <button
              type="button"
              className={`product-tab-btn ${activeTab === 'tab-specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('tab-specifications')}
            >
              Specifications
            </button>
            <button
              type="button"
              className={`product-tab-btn ${activeTab === 'tab-shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('tab-shipping')}
            >
              Shipping & Returns
            </button>
          </div>

          <div className="product-tabs-content">
            {activeTab === 'tab-description' && (
              <div className="product-tab-pane active" id="tab-description">
                <div id="tab-desc-content" style={{ maxWidth: '840px', lineHeight: 1.8 }}>
                  <p style={{ marginBottom: '1.2rem', fontSize: '1rem', color: 'var(--text-dark)' }}>
                    Handcrafted in collaboration with Master Weavers from Gujarat, Rajasthan, and Indore, each pair embodies the soul of timeless Indian heritage footwear reimagined for contemporary urban elegance.
                  </p>
                  <p style={{ marginBottom: '1.2rem', color: 'var(--text-muted)' }}>
                    Constructed using 100% animal-free vegan leather and hand-spun artisanal textiles, the sole is engineered with a dual-layer memory foam orthotic footbed to cradle every contour of your foot. Walking comfort is paired with zero break-in period and ultra-breathable sweat-absorbent lining.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: '#faf8f5', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--primary-color)' }}>🌱 100% Vegan</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>Completely cruelty-free materials certified by PETA.</p>
                    </div>
                    <div style={{ padding: '1rem', background: '#faf8f5', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--primary-color)' }}>🪡 Artisan Handwoven</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>Authentic warp & weft patterns preserving family heritage.</p>
                    </div>
                    <div style={{ padding: '1rem', background: '#faf8f5', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--primary-color)' }}>☁️ Memory Foam Base</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>Ergonomic all-day comfort without foot exhaustion.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tab-specifications' && (
              <div className="product-tab-pane active" id="tab-specifications">
                <table className="specs-table" id="specs-table-body" style={{ maxWidth: '840px' }}>
                  <tbody>
                    <tr><td>Upper Material</td><td>{product.material || 'Vegan Leather'} + Handcrafted Motif</td></tr>
                    <tr><td>Sole Technology</td><td>Dual-Layer Memory Foam + Anti-Slip Vulcanized Natural Rubber</td></tr>
                    <tr><td>Inner Lining</td><td>Breathable Cotton-Blend Moisture-Absorbent Mesh</td></tr>
                    <tr><td>Closure Type</td><td>Ergonomic Slip-On</td></tr>
                    <tr><td>Water Resistance</td><td>Splash-Proof Vegan Leather Trim</td></tr>
                    <tr><td>Care Instructions</td><td>Gently wipe clean with damp cotton cloth. Air dry in shade.</td></tr>
                    <tr><td>Manufacturing Origin</td><td>Handcrafted in India</td></tr>
                    <tr><td>Ethical Certification</td><td>100% PETA-Approved Vegan</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'tab-shipping' && (
              <div className="product-tab-pane active" id="tab-shipping">
                <div className="shipping-info-grid" style={{ maxWidth: '840px' }}>
                  <div className="shipping-info-card">
                    <h4>🚚 Standard Delivery</h4>
                    <p>FREE on all orders above ₹999. Dispatched within 24 hours, delivered in 3-5 business days across India.</p>
                  </div>
                  <div className="shipping-info-card">
                    <h4>⚡ Express Metro Delivery</h4>
                    <p>Flat ₹99. Priority courier dispatch delivered within 24-48 hours in metro locations.</p>
                  </div>
                  <div className="shipping-info-card">
                    <h4>🔄 7-Day Doorstep Returns</h4>
                    <p>Hassle-free 7-day doorstep size exchanges and return pickups. Zero restocking fees.</p>
                  </div>
                  <div className="shipping-info-card">
                    <h4>💰 Instant Refunds</h4>
                    <p>Refunds initiated within 24 hours of return pickup verification to your original payment method.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: CUSTOMER REVIEWS ───────────────────────────────────── */}
      <section className="product-reviews-section section-padding" id="product-reviews-section" style={{ backgroundColor: '#faf8f5', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Customer Reviews</h2>
          <p className="section-subtitle">Real experiences shared by verified SlideEase wearers.</p>

          <div className="reviews-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginTop: '2rem' }}>

            {/* Review Summary Card */}
            <div className="review-summary-card" style={{ background: '#ffffff', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', height: 'fit-content' }}>
              <div className="review-avg-score" id="review-avg-score" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1 }}>
                {product.rating || 4.8}
              </div>
              <div className="review-avg-stars" id="review-avg-stars" style={{ color: 'var(--accent-color)', fontSize: '1.4rem', margin: '0.4rem 0' }}>
                ★★★★★
              </div>
              <p className="review-total-count" id="review-total-count" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Based on {product.reviews || reviewsList.length} verified ratings
              </p>

              <div className="review-bars" id="review-bars" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="review-bar-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ width: '24px' }}>5★</span>
                  <div className="review-bar" style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="review-bar-fill" style={{ width: '74%', height: '100%', background: 'var(--accent-color)' }} />
                  </div>
                  <span style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)' }}>74%</span>
                </div>
                <div className="review-bar-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ width: '24px' }}>4★</span>
                  <div className="review-bar" style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="review-bar-fill" style={{ width: '18%', height: '100%', background: 'var(--accent-color)' }} />
                  </div>
                  <span style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)' }}>18%</span>
                </div>
                <div className="review-bar-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ width: '24px' }}>3★</span>
                  <div className="review-bar" style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="review-bar-fill" style={{ width: '6%', height: '100%', background: 'var(--accent-color)' }} />
                  </div>
                  <span style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)' }}>6%</span>
                </div>
                <div className="review-bar-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ width: '24px' }}>2★</span>
                  <div className="review-bar" style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="review-bar-fill" style={{ width: '2%', height: '100%', background: 'var(--accent-color)' }} />
                  </div>
                  <span style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)' }}>2%</span>
                </div>
                <div className="review-bar-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ width: '24px' }}>1★</span>
                  <div className="review-bar" style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="review-bar-fill" style={{ width: '0%', height: '100%', background: 'var(--accent-color)' }} />
                  </div>
                  <span style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)' }}>0%</span>
                </div>
              </div>
            </div>

            {/* Review List */}
            <div className="reviews-list" id="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {reviewsList.map((rev, index) => (
                <div key={index} className="review-card" style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div className="review-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <div className="review-card-author" style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                        {rev.author} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d', marginLeft: '0.4rem', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>✓ Verified Buyer</span>
                      </div>
                      <div className="review-card-stars" style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                        {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <span className="review-card-date" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                  </div>
                  <div className="review-card-title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', color: 'var(--text-dark)' }}>{rev.title}</div>
                  <div className="review-card-body" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{rev.body}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Write a Review Form Card */}
          <div className="write-review-form-card" id="write-review-form" style={{ marginTop: '3rem', background: '#ffffff', padding: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '780px' }}>
            <h3 className="form-h3" style={{ fontSize: '1.3rem', marginBottom: '1.2rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>Write a Verified Review</h3>

            {reviewSubmittedNotice && (
              <div style={{ padding: '0.8rem 1rem', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', fontWeight: 600 }}>
                ✓ Thank you! Your review has been successfully posted.
              </div>
            )}

            <form id="review-submit-form" onSubmit={handleReviewSubmit}>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="input-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>Overall Rating *</label>
                <div className="star-rating-input" id="star-rating-input" style={{ display: 'flex', gap: '0.3rem', fontSize: '1.6rem', cursor: 'pointer', color: 'var(--accent-color)' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="star-input"
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {(hoverRating || newRating) >= star ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div className="form-group">
                  <label htmlFor="review-author" className="input-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>Your Name *</label>
                  <input
                    type="text"
                    id="review-author"
                    className="form-control"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                    placeholder="e.g. Priya S."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="review-title" className="input-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>Review Headline *</label>
                  <input
                    type="text"
                    id="review-title"
                    className="form-control"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                    placeholder="e.g. Comfortable and beautifully crafted"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="review-body" className="input-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>Your Detailed Feedback *</label>
                <textarea
                  id="review-body"
                  className="form-control"
                  style={{ width: '100%', minHeight: '110px', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
                  placeholder="Share details about the fit, comfort, weave aesthetics, and finish..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
                Submit Customer Review
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ── SECTION 5: RELATED PRODUCTS ("You May Also Like") ────────────── */}
      {relatedProducts.length > 0 && (
        <section className="section-padding" id="related-products-section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>You May Also Like</h2>
            <p className="section-subtitle">Explore complementary handcrafted vegan footwear from our collection.</p>
            <div className="product-grid related-products-grid" id="related-products-grid" style={{ marginTop: '2.5rem' }}>
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 6: RECENTLY VIEWED PRODUCTS ───────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section className="section-padding" id="recently-viewed-section" style={{ backgroundColor: '#faf8f5', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Recently Viewed</h2>
            <p className="section-subtitle">Pairs you recently discovered while browsing our catalog.</p>
            <div className="product-grid recently-viewed-grid" id="recently-viewed-grid" style={{ marginTop: '2.5rem' }}>
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 7: SIZE GUIDE MODAL ───────────────────────────────────── */}
      {isSizeGuideOpen && (
        <div
          className="modal-overlay active"
          id="size-guide-modal"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '90%' }}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>SlideEase Footwear Size Matrix</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsSizeGuideOpen(false)}
                aria-label="Close size guide modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem 0' }}>
              <table className="size-chart-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem' }}>UK / Indian</th>
                    <th style={{ padding: '0.75rem' }}>EU Size</th>
                    <th style={{ padding: '0.75rem' }}>US Size</th>
                    <th style={{ padding: '0.75rem' }}>Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.7rem', fontWeight: 600 }}>UK 5</td><td>EU 38</td><td>US 6</td><td>23.8 cm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.7rem', fontWeight: 600 }}>UK 6</td><td>EU 39</td><td>US 7</td><td>24.5 cm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.7rem', fontWeight: 600 }}>UK 7</td><td>EU 40</td><td>US 8</td><td>25.5 cm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.7rem', fontWeight: 600 }}>UK 8</td><td>EU 41</td><td>US 9</td><td>26.0 cm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.7rem', fontWeight: 600 }}>UK 9</td><td>EU 42</td><td>US 10</td><td>27.0 cm</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.7rem', fontWeight: 600 }}>UK 10</td><td>EU 43</td><td>US 11</td><td>27.8 cm</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#faf5ea', border: '1px solid rgba(201, 169, 97, 0.4)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                  💡 <strong>Fitting Tip:</strong> SlideEase shoes fit true to standard Indian sizing. If you possess broad feet or are between sizes, we recommend selecting the next size up for optimal memory foam comfort.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 8: VIDEO TEASER MODAL ─────────────────────────────────── */}
      {isVideoModalOpen && (
        <div
          className="modal-overlay active"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', width: '90%', padding: '2rem' }}
          >
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>The Craft Behind {product.name}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Close video modal"
              >
                &times;
              </button>
            </div>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#0f172a', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textAlign: 'center', padding: '2rem' }}>
              <img
                src="/assets/artisan_hands.png"
                alt="Artisan Craftsmanship"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.8rem', color: '#ffffff' }}>
                  ▶
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Artisanal Heritage Video</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', maxWidth: '420px', color: 'rgba(255,255,255,0.85)' }}>
                  Filmed on location in Bhuj and Indore. Discover the traditional wooden handlooms and master artisan stitching that shape every SlideEase shoe.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
