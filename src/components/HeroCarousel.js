'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 14, mins: 42, secs: 18 });
  const [adminBanners, setAdminBanners] = useState({ heroImage1: '', heroImage2: '', heroImage3: '' });

  // Fetch admin-configured hero images from MongoDB
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/hero-banner');
        const data = await res.json();
        if (data.success && data.banner) {
          setAdminBanners(data.banner);
        }
      } catch (err) {
        // Fallback gracefully to neutral gradient placeholders
      }
    };
    fetchBanners();
  }, []);

  const neutralPlaceholders = [
    'linear-gradient(135deg, #0b111a 0%, #1a2332 50%, #0f1622 100%)',
    'linear-gradient(135deg, #120e09 0%, #241c14 50%, #161b24 100%)',
    'linear-gradient(135deg, #0d141e 0%, #17212e 50%, #0a0f16 100%)',
  ];

  const slides = [
    {
      tagline: '✦ Ascend with Heritage',
      title: 'Every stitch carries a hand.\nEvery step carries a story.',
      desc: 'Handcrafted from cork-based vegan leather and traditional Indian artisan weaves, re-engineered with dual-density memory foam for modern movement.',
      bg: adminBanners.heroImage1 ? `url('${adminBanners.heroImage1}')` : neutralPlaceholders[0],
      isImage: Boolean(adminBanners.heroImage1),
      primaryLink: '/shop',
      primaryText: 'Explore the Collection',
      secondaryLink: '/#craft-journey',
      secondaryText: 'See the Craft'
    },
    {
      tagline: '✦ Living Craft • Cruelty-Free Elegance',
      title: "The Women's Guild:\nIkat Weaves & Kutch Mirrorwork",
      desc: 'Preserving generational textile artistry on contoured, shock-absorbing bases designed for everyday festive and casual poise.',
      bg: adminBanners.heroImage2 ? `url('${adminBanners.heroImage2}')` : neutralPlaceholders[1],
      isImage: Boolean(adminBanners.heroImage2),
      primaryLink: '/shop?category=womens',
      primaryText: "Explore Women's",
      secondaryLink: '/#craft-journey',
      secondaryText: 'Meet the Artisans'
    },
    {
      tagline: '✦ Grounded Sophistication',
      title: "The Men's Edit:\nSleek Cork Slides & Formal Loafers",
      desc: 'Double-padded memory foam soles wrapped in water-resistant vegan leather. Built for daily strides, celebrations, and understated poise.',
      bg: adminBanners.heroImage3 ? `url('${adminBanners.heroImage3}')` : neutralPlaceholders[2],
      isImage: Boolean(adminBanners.heroImage3),
      primaryLink: '/shop?category=mens',
      primaryText: "Explore Men's",
      secondaryLink: '/#showcase-360',
      secondaryText: '360° Studio'
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Countdown timer tick
  useEffect(() => {
    const cdTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        return { hours: 23, mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(cdTimer);
  }, []);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="hero-carousel" id="hero-banner-section" aria-label="Hero Slideshow">
      {slides.map((slide, idx) => (
        <div 
          key={idx}
          className={`carousel-slide ${activeSlide === idx ? 'active' : ''}`}
          style={{ 
            backgroundImage: slide.isImage ? slide.bg : undefined,
            background: !slide.isImage ? slide.bg : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: activeSlide === idx ? 'block' : 'none'
          }}
          role="img"
          aria-label={slide.title}
        >
          <div className="carousel-overlay" style={{ background: slide.isImage ? 'rgba(15, 22, 34, 0.65)' : 'transparent' }}></div>
          <div className="carousel-content">
            <span className="carousel-tagline">{slide.tagline}</span>
            {idx === 0 ? (
              <h1 className="carousel-title" style={{ whiteSpace: 'pre-line' }}>{slide.title}</h1>
            ) : (
              <h2 className="carousel-title" style={{ whiteSpace: 'pre-line' }}>{slide.title}</h2>
            )}
            <p className="carousel-desc">{slide.desc}</p>

            {/* Countdown timer on slide 1 */}
            {idx === 0 && (
              <div className="hero-countdown" id="hero-countdown" aria-label="Sale countdown timer">
                <span className="countdown-label">🔥 Summer Sale Ends In:</span>
                <div className="countdown-digits">
                  <div className="countdown-unit"><span>{String(countdown.hours).padStart(2, '0')}</span><small>Hours</small></div>
                  <div className="countdown-sep">:</div>
                  <div className="countdown-unit"><span>{String(countdown.mins).padStart(2, '0')}</span><small>Mins</small></div>
                  <div className="countdown-sep">:</div>
                  <div className="countdown-unit"><span>{String(countdown.secs).padStart(2, '0')}</span><small>Secs</small></div>
                </div>
              </div>
            )}

            <div className="carousel-actions">
              <Link href={slide.primaryLink} className="btn btn-accent">
                {slide.primaryText}
              </Link>
              <Link href={slide.secondaryLink} className="btn-hairline-gold">
                {slide.secondaryText}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Prev/Next Navigation Arrows */}
      <button className="carousel-arrow carousel-prev" onClick={prevSlide} aria-label="Previous slide">&#8249;</button>
      <button className="carousel-arrow carousel-next" onClick={nextSlide} aria-label="Next slide">&#8250;</button>

      {/* Slide Indicators */}
      <div className="carousel-dots" role="tablist" aria-label="Slide indicators">
        {slides.map((_, idx) => (
          <span 
            key={idx}
            className={`carousel-dot ${activeSlide === idx ? 'active' : ''}`}
            onClick={() => setActiveSlide(idx)}
            role="tab"
            aria-selected={activeSlide === idx}
            aria-label={`Slide ${idx + 1}`}
          ></span>
        ))}
      </div>
    </section>
  );
}
