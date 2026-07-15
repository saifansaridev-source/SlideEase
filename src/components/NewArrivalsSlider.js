'use client';

import React, { useRef } from 'react';
import ProductCard from './ProductCard';

export default function NewArrivalsSlider({ products }) {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="slider-wrapper">
      <button className="slider-arrow prev" onClick={scrollLeft} aria-label="Previous items">
        ←
      </button>
      <div className="horizontal-product-slider" ref={sliderRef} style={{ display: 'flex', overflowX: 'auto', gap: '1.5rem', scrollBehavior: 'smooth' }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <button className="slider-arrow next" onClick={scrollRight} aria-label="Next items">
        →
      </button>
    </div>
  );
}
