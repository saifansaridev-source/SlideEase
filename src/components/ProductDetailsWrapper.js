'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ProductCard from './ProductCard';

export default function ProductDetailsWrapper({ product, relatedProducts }) {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [activeThumb, setActiveThumb] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 7);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const router = useRouter();

  // Wishlist check
  const isWishlisted = wishlist.includes(product.id);

  // Review states
  const [reviewsList, setReviewsList] = useState([
    { author: 'Priya Sharma', title: 'Incredibly comfortable!', body: 'The memory foam soles are amazing. I can wear these all day at work without any discomfort.', rating: 5, date: '15/06/2026' },
    { author: 'Rahul Mehta', title: 'Beautiful craftsmanship', body: 'The handwoven patterns are stunning. These shoes always get compliments wherever I go.', rating: 5, date: '02/06/2026' },
    { author: 'Ananya Patel', title: 'Great vegan alternative', body: 'Finally found premium vegan shoes in India. The quality is at par with leather products. Highly recommend!', rating: 4, date: '20/05/2026' }
  ]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newAuthor || !newTitle || !newBody) return;

    const newRev = {
      author: newAuthor,
      title: newTitle,
      body: newBody,
      rating: newRating,
      date: new Date().toLocaleDateString('en-IN')
    };

    setReviewsList([...reviewsList, newRev]);
    setNewAuthor('');
    setNewTitle('');
    setNewBody('');
    setNewRating(5);
  };

  const handleBuyNow = () => {
    addToCart(product, `UK ${selectedSize}`, qty);
    router.push('/checkout');
  };

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const thumbUrls = [product.image, product.image, product.image]; // Mock thumbnails

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="breadcrumb-nav container" aria-label="Breadcrumb" style={{ padding: '2rem 1.5rem 1rem 1.5rem' }}>
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item"><a href={`/shop?category=${product.category}`}>{product.category === 'mens' ? "Men's Footwear" : "Women's Footwear"}</a></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* Main Layout Container */}
      <section className="container" style={{ padding: '0 1.5rem 4rem 1.5rem' }}>
        <div className="product-detail-grid">
          
          {/* Gallery Columns */}
          <div className="product-gallery-col">
            <div className="product-main-image-container" id="product-main-image-container" style={{ backgroundColor: product.bgColor || '#fcfbf7' }}>
              <img 
                src={activeThumb} 
                alt={product.name} 
                className="product-main-img" 
                id="product-main-img"
              />
            </div>
            
            <div className="product-thumbnails" id="product-thumbnails">
              {thumbUrls.map((url, index) => (
                <img 
                  key={index}
                  src={url} 
                  alt={`view ${index + 1}`} 
                  className={activeThumb === url ? 'active' : ''} 
                  onClick={() => setActiveThumb(url)}
                />
              ))}
            </div>
          </div>

          {/* Details Column */}
          <div className="product-info-col">
            <span className="product-tag" id="product-tag">{product.tag || 'Handcrafted'}</span>
            <h1 className="product-title" id="product-title">{product.name}</h1>
            
            <div className="product-rating-display" id="product-rating-display">
              <span className="stars">{'★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating))}</span>
              <span className="review-count">({product.reviews} reviews)</span>
            </div>

            <div className="product-price-row">
              <span className="current-price" id="product-current-price">₹{product.price}</span>
              <span className="original-price" id="product-original-price">₹{product.originalPrice}</span>
              <span className="discount-pct" id="product-discount-pct">{discountPercent}% OFF</span>
            </div>

            <div className="product-description" id="product-description">
              <p>{product.desc}</p>
            </div>

            {/* Color swatches mock */}
            <div className="product-variants-section">
              <h4 className="variant-label">Color: <span style={{ fontWeight: 500 }}>Original</span></h4>
              <div className="color-swatch-group" id="product-color-options">
                <button className="color-swatch active" style={{ backgroundColor: product.patternColor }}></button>
                <button className="color-swatch" style={{ backgroundColor: '#c48a43' }}></button>
                <button className="color-swatch" style={{ backgroundColor: '#1a1a2e' }}></button>
              </div>
            </div>

            {/* Size options */}
            <div className="product-variants-section">
              <h4 className="variant-label">Select Size (UK/Indian):</h4>
              <div className="size-swatch-group" id="product-size-options">
                {product.sizes.map((sz) => (
                  <button 
                    key={sz} 
                    className={`variant-btn ${selectedSize === sz ? 'active' : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity selection */}
            <div className="product-qty-row">
              <div className="qty-picker">
                <button className="qty-picker-btn" onClick={() => qty > 1 && setQty(qty - 1)}>-</button>
                <span className="qty-picker-val">{qty}</span>
                <button className="qty-picker-btn" onClick={() => qty < 10 && setQty(qty + 1)}>+</button>
              </div>
              
              <button 
                className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                aria-label="Toggle wishlist"
              >
                ❤️
              </button>
              <span className="product-stock-badge in-stock" id="product-stock-badge">In Stock</span>
            </div>

            {/* Checkout Action triggers */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '1rem' }}
                onClick={() => addToCart(product, `UK ${selectedSize}`, qty)}
              >
                Add to Cart
              </button>
              <button 
                className="btn btn-accent" 
                style={{ flex: 1, padding: '1rem' }}
                onClick={handleBuyNow}
              >
                Buy It Now
              </button>
            </div>

            {/* Product description Tabs */}
            <div className="product-info-tabs" style={{ marginTop: '3.5rem' }}>
              <div className="tabs-header">
                <button 
                  className={`product-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Product Details
                </button>
                <button 
                  className={`product-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                  onClick={() => setActiveTab('shipping')}
                >
                  Shipping & Returns
                </button>
              </div>

              <div className="tabs-content">
                {activeTab === 'details' && (
                  <div className="product-tab-pane active">
                    <p style={{ marginBottom: '1rem' }}>Designed with custom woven cultural motifs and structured vegan leather boundaries, this pair highlights the perfect synthesis of craftsmanship and walking relief.</p>
                    <ul style={{ paddingLeft: '1.2rem' }}>
                      <li><strong>Upper:</strong> Premium Handcrafted Canvas / Velvet.</li>
                      <li><strong>Lining:</strong> Breathable, sweat-absorbent vegan mesh.</li>
                      <li><strong>Sole:</strong> Anti-slip textured natural vulcanized rubber.</li>
                      <li><strong>Cushion:</strong> Dual-layer memory foam orthotic padding.</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="product-tab-pane active">
                    <p>📦 <strong>Free Shipping:</strong> Free shipping is applied automatically to all pre-paid pan-India orders valued above ₹999.</p>
                    <p style={{ marginTop: '0.8rem' }}>🔄 <strong>Easy Returns:</strong> We support a 15-day exchange and refund policy. Simply contact customer service within 15 days of order delivery to arrange a pickup.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Related Products Grid */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 className="section-title">You May Also Like</h2>
          <p className="section-subtitle">Complete your styling look with other popular shoes in our catalog.</p>
          <div className="product-grid best-sellers-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews section */}
      <section className="section-padding" id="reviews-section" style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 className="section-title">Client Reviews</h2>
          <p className="section-subtitle" id="review-total-count">Based on {reviewsList.length} reviews</p>

          <div className="reviews-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', marginTop: '3rem' }}>
            {/* Submit review */}
            <div className="review-form-container">
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="contact-form" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="review-author" className="form-label">Your Name</label>
                  <input 
                    type="text" 
                    id="review-author" 
                    required 
                    className="form-input" 
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="review-title" className="form-label">Review Title</label>
                  <input 
                    type="text" 
                    id="review-title" 
                    required 
                    placeholder="e.g. Best sandals I've owned!"
                    className="form-input" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '0.4rem', fontSize: '1.4rem', color: 'var(--accent-color)' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        {(hoverRating || newRating) >= star ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="review-body" className="form-label">Review Message</label>
                  <textarea 
                    id="review-body" 
                    required 
                    rows={4} 
                    className="form-input"
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>Submit Review</button>
              </form>
            </div>

            {/* Reviews display */}
            <div className="reviews-list-container" id="reviews-list">
              {reviewsList.map((rev, index) => (
                <div key={index} className="review-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="review-card-header">
                    <div>
                      <div className="review-card-author">{rev.author}</div>
                      <div className="review-card-stars">{'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}</div>
                    </div>
                    <span className="review-card-date">{rev.date}</span>
                  </div>
                  <div className="review-card-title">{rev.title}</div>
                  <div className="review-card-body">{rev.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
