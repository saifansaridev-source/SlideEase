'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Turntable360() {
  const { addToCart, setIsCartOpen } = useCart();
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    startXRef.current = e.clientX;
    setAngle((prev) => {
      let next = (prev + deltaX * 0.75) % 360;
      if (next < 0) next += 360;
      return next;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    startXRef.current = e.touches[0].clientX;
    setAngle((prev) => {
      let next = (prev + deltaX * 0.75) % 360;
      if (next < 0) next += 360;
      return next;
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const normalized = angle > 180 ? angle - 360 : angle;
  const scaleX = Math.cos((angle * Math.PI) / 180);
  const skewY = Math.sin((angle * Math.PI) / 180) * 8;
  const transformStyle = `perspective(900px) rotateY(${normalized * 0.55}deg) scaleX(${Math.abs(scaleX) < 0.2 ? 0.2 : 1}) skewY(${skewY}deg)`;
  const shadowDistance = Math.sin((angle * Math.PI) / 180) * 15;

  const handleAddToCart = () => {
    addToCart({
      id: 'prod-01',
      name: 'Peacock Ikat Loafer',
      price: 1499,
      size: 7,
      image: '/assets/loafers.png',
      bgColor: '#f2f9f9',
      pattern: 'ikat'
    });
    setIsCartOpen(true);
  };

  return (
    <section className="section-360-showcase" id="showcase-360">
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px auto' }}>
          <span className="craft-eyebrow">✦ 360° Craft Inspection</span>
          <h2 className="section-title">Experience Every Angle of Detail</h2>
          <p className="section-subtitle">
            Drag or swipe horizontally to rotate our signature Peacock Ikat Loafer. Inspect hand-stitched borders and ergonomic contouring.
          </p>
        </div>

        <div className="turntable-container">
          {/* Interactive 360 Viewer Box */}
          <div 
            className="turntable-viewer-box" 
            id="turntable-box"
            style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="turntable-degree-badge">
              <span>⟳ Angle:</span>
              <span id="turntable-angle-val">{Math.round(angle)}°</span>
            </div>
            
            <img 
              src="/assets/loafers.png" 
              alt="SlideEase 360 Turntable View" 
              className="turntable-image-layer" 
              id="turntable-img"
              style={{
                transform: transformStyle,
                filter: `drop-shadow(${shadowDistance}px 18px 25px rgba(26, 35, 50, 0.22))`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              draggable="false"
            />
            
            <div className="turntable-hint-overlay">
              <span>👈 Drag or swipe to spin (360°) 👉</span>
            </div>
          </div>

          {/* Hotspots & Specifications */}
          <div className="turntable-details">
            <span style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-dark)', fontWeight: 600 }}>
              Flagship Silhouette
            </span>
            <h3 className="turntable-title">Peacock Ikat Loafer</h3>
            <div className="turntable-price">
              ₹1,499 <span style={{ textDecoration: 'line-through', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>₹2,499</span>
            </div>
            
            <div className="turntable-hotspots">
              <div className="hotspot-item">
                <div className="hotspot-icon">01</div>
                <div>
                  <h5>Hand-Dyed Ikat Canvas</h5>
                  <p>Spun from organic cotton canvas dyed with natural teal indigo extracts.</p>
                </div>
              </div>
              <div className="hotspot-item">
                <div className="hotspot-icon">02</div>
                <div>
                  <h5>Dual-Density Footbed</h5>
                  <p>High-resilience foam reduces joint impact for effortless 10,000-step comfort.</p>
                </div>
              </div>
              <div className="hotspot-item">
                <div className="hotspot-icon">03</div>
                <div>
                  <h5>Reinforced Goodyear Stitch</h5>
                  <p>Cruelty-free vegan leather welt hand-stitched for longevity and shape retention.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button className="btn btn-accent" id="turntable-add-cart-btn" onClick={handleAddToCart}>
                Add to Cart • ₹1,499
              </button>
              <Link href="/product/prod-01" className="btn btn-outline">
                Full Specifications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
