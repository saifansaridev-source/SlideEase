'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';

// Multi-angle footwear perspectives
const PRESET_VIEWPOINTS = [
  { label: 'Front (0°)', angle: 0 },
  { label: 'Quarter (45°)', angle: 45 },
  { label: 'Profile (90°)', angle: 90 },
  { label: 'Heel (180°)', angle: 180 },
  { label: 'Medial (270°)', angle: 270 },
];

export default function Turntable360({
  product = null,
  frames = null,
  productName = null,
  price = null
}) {
  const { addToCart, setIsCartOpen } = useCart();
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const startXRef = useRef(0);
  const autoPlayRef = useRef(null);

  // Fallback to flagship product from catalog if no product prop is provided
  const activeProduct = product || PRODUCTS[0] || {
    id: 'prod-01',
    name: "Men's GlideWave Olive Toggle-Lace Sneakers",
    slug: 'mens-glidewave-olive-toggle-lace-sneakers',
    price: 2999,
    originalPrice: 6000,
    image: 'https://res.cloudinary.com/yttzcohv/image/upload/v1795377672/slideease/products/catalog-shoe_01-1795377671099.jpg',
  };

  const displayName = productName || activeProduct.name;
  const displayPrice = typeof price === 'number' ? price : (activeProduct.price || 2999);
  const displayOriginalPrice = activeProduct.originalPrice || 6000;
  const productSlug = activeProduct.slug || activeProduct.id || 'prod-01';

  // Frame sequence for turntable (uses product image/gallery with fallback)
  const defaultImage = activeProduct.image || '/products/shoes/shoe_01.png';
  const frameList = frames && frames.length > 0
    ? frames
    : (Array.isArray(activeProduct.gallery) && activeProduct.gallery.length > 0
        ? activeProduct.gallery
        : [defaultImage]);

  const totalFrames = frameList.length;
  const currentFrameIndex = Math.min(
    totalFrames - 1,
    Math.floor((angle / 360) * totalFrames) % totalFrames
  );

  // Continuous Autoplay Turntable
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setAngle((prev) => (prev + 2) % 360);
      }, 50);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying]);

  const handleMouseDown = (e) => {
    setIsAutoPlaying(false);
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    startXRef.current = e.clientX;
    setAngle((prev) => {
      let next = (prev + deltaX * 0.8) % 360;
      if (next < 0) next += 360;
      return next;
    });
  }, [isDragging]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsAutoPlaying(false);
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    startXRef.current = e.touches[0].clientX;
    setAngle((prev) => {
      let next = (prev + deltaX * 0.8) % 360;
      if (next < 0) next += 360;
      return next;
    });
  }, [isDragging]);

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleAddToCart = () => {
    addToCart(activeProduct, 'UK 7', 1);
    setIsCartOpen(true);
  };

  // Dynamic interactive tilt to mimic multi-angle studio inspection
  const dynamicTilt = ((angle - 180) / 180) * 6; // Max ±6 deg smooth tilt

  return (
    <section className="section-360-showcase" id="showcase-360">
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 40px auto' }}>
          <span className="craft-eyebrow">✦ 360° Studio Inspection</span>
          <h2 className="section-title">Experience Every Angle of Handcraft</h2>
          <p className="section-subtitle">
            Interact with our studio inspection turntable. Inspect the sculpted sole contours, reinforced welt, and breathable cruelty-free upper.
          </p>
        </div>

        <div className="turntable-container">
          {/* Interactive Viewer Frame */}
          <div>
            <div
              className="turntable-viewer-box"
              id="turntable-box"
              style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', position: 'relative' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="turntable-degree-badge">
                <span>⟳ Studio Angle:</span>
                <span id="turntable-angle-val">{Math.round(angle)}°</span>
              </div>

              <img
                src={frameList[currentFrameIndex]}
                alt={`${displayName} 360 Studio View`}
                className="turntable-image-layer"
                id="turntable-img"
                style={{
                  filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.15))',
                  transition: isDragging ? 'none' : 'transform 0.15s ease, opacity 0.15s ease',
                  maxHeight: '340px',
                  maxWidth: '92%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  transform: `rotate(${dynamicTilt}deg)`,
                }}
                draggable="false"
              />

              <div className="turntable-hint-overlay">
                <span>👈 Drag or swipe to inspect 360° 👉</span>
              </div>
            </div>

            {/* Turntable Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PRESET_VIEWPOINTS.map((vp) => (
                  <button
                    key={vp.angle}
                    type="button"
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setAngle(vp.angle);
                    }}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: Math.abs(angle - vp.angle) < 25 ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                      backgroundColor: Math.abs(angle - vp.angle) < 25 ? '#fef3c7' : '#fff',
                      color: Math.abs(angle - vp.angle) < 25 ? '#92400e' : 'var(--text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {vp.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                style={{
                  fontSize: '0.78rem',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--accent-color)',
                  backgroundColor: isAutoPlaying ? 'var(--accent-color)' : '#fff',
                  color: isAutoPlaying ? '#fff' : 'var(--accent-color)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isAutoPlaying ? '⏸ Pause Spin' : '▶ Auto Turntable'}
              </button>
            </div>
          </div>

          {/* Hotspots & Specifications */}
          <div className="turntable-details">
            <span style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-dark)', fontWeight: 600 }}>
              Signature Footwear Silhouette
            </span>
            <h3 className="turntable-title">{displayName}</h3>
            <div className="turntable-price">
              ₹{displayPrice?.toLocaleString('en-IN')}{' '}
              {displayOriginalPrice > displayPrice && (
                <span style={{ textDecoration: 'line-through', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>
                  ₹{displayOriginalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="turntable-hotspots">
              <div className="hotspot-item">
                <div className="hotspot-icon">01</div>
                <div>
                  <h5>Bungee Speed-Toggle Lacing</h5>
                  <p>Innovative cinch toggle mechanism providing instant slip-in fit with zero lace tying required.</p>
                </div>
              </div>
              <div className="hotspot-item">
                <div className="hotspot-icon">02</div>
                <div>
                  <h5>Dual-Density Cushioning Pods</h5>
                  <p>Sculpted hollow wave pods engineered to reduce foot fatigue and absorb step impact.</p>
                </div>
              </div>
              <div className="hotspot-item">
                <div className="hotspot-icon">03</div>
                <div>
                  <h5>Breathable Vegan Overlays</h5>
                  <p>Microfiber mesh with durable, water-resistant cruelty-free overlays for lasting comfort.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button className="btn btn-accent" id="turntable-add-cart-btn" onClick={handleAddToCart}>
                Add to Cart • ₹{displayPrice?.toLocaleString('en-IN')}
              </button>
              <Link href={`/product/${productSlug}`} className="btn btn-outline">
                View Full Specs & Care
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
