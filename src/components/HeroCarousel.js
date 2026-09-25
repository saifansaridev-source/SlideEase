'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_HERO_SLIDES } from '@/lib/cms-defaults';

export default function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 14, mins: 42, secs: 18 });
  const [slides, setSlides] = useState(DEFAULT_HERO_SLIDES);

  // Fetch admin-configured hero slides from MongoDB
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/hero-banner');
        const data = await res.json();
        if (data.success && data.banner?.slides && data.banner.slides.length > 0) {
          setSlides(data.banner.slides);
        }
      } catch (err) {
        // Fallback gracefully to default slides
      }
    };
    fetchBanners();
  }, []);

  const activeSlides = slides.filter(s => s.isActive !== false);

  // Auto-advance slides
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

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
    setActiveSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const neutralPlaceholders = [
    'linear-gradient(135deg, #0b111a 0%, #1a2332 50%, #0f1622 100%)',
    'linear-gradient(135deg, #120e09 0%, #241c14 50%, #161b24 100%)',
    'linear-gradient(135deg, #0d141e 0%, #17212e 50%, #0a0f16 100%)',
  ];

  return (
    <section className="hero-carousel" id="hero-banner-section" aria-label="Hero Slideshow">
      {activeSlides.map((slide, idx) => {
        const hasImage = Boolean(slide.image);
        const bg = hasImage 
          ? `url('${slide.image}')` 
          : neutralPlaceholders[idx % neutralPlaceholders.length];

        return (
          <div 
            key={slide.id || idx}
            className={`carousel-slide ${activeSlide === idx ? 'active' : ''}`}
            style={{ 
              backgroundImage: hasImage ? bg : undefined,
              background: !hasImage ? bg : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: activeSlide === idx ? 'block' : 'none',
              textAlign: slide.textAlign || 'left',
            }}
            role="img"
            aria-label={slide.heading || slide.tagline}
          >
            <div className="carousel-overlay" style={{ 
              background: hasImage 
                ? `rgba(15, 22, 34, ${(slide.overlayOpacity || 65) / 100})` 
                : 'transparent' 
            }}></div>
            <div className="carousel-content">
              {slide.showTagline !== false && slide.tagline && (
                <span className="carousel-tagline">{slide.tagline}</span>
              )}

              {slide.showHeading !== false && slide.heading && (
                idx === 0 ? (
                  <h1 className="carousel-title" style={{ whiteSpace: 'pre-line' }}>{slide.heading}</h1>
                ) : (
                  <h2 className="carousel-title" style={{ whiteSpace: 'pre-line' }}>{slide.heading}</h2>
                )
              )}

              {slide.showDescription !== false && slide.description && (
                <p className="carousel-desc">{slide.description}</p>
              )}

              {/* Countdown timer if slide has it enabled */}
              {slide.showCountdown && (
                <div className="hero-countdown" id="hero-countdown" aria-label="Sale countdown timer">
                  <span className="countdown-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px', verticalAlign: 'middle' }}><path d="M17.657 3.343A8 8 0 1 1 6.343 20.657 8 8 0 0 1 17.657 3.343z"/></svg>
                    Summer Sale Ends In:
                  </span>
                  <div className="countdown-digits">
                    <div className="countdown-unit"><span>{String(countdown.hours).padStart(2, '0')}</span><small>Hours</small></div>
                    <div className="countdown-sep">:</div>
                    <div className="countdown-unit"><span>{String(countdown.mins).padStart(2, '0')}</span><small>Mins</small></div>
                    <div className="countdown-sep">:</div>
                    <div className="countdown-unit"><span>{String(countdown.secs).padStart(2, '0')}</span><small>Secs</small></div>
                  </div>
                </div>
              )}

              {(slide.showCta !== false || slide.showSecondaryCta !== false) && (
                <div className="carousel-actions">
                  {slide.showCta !== false && slide.ctaLink && (
                    <Link href={slide.ctaLink} className="btn btn-accent">
                      {slide.ctaText || 'Explore'}
                    </Link>
                  )}
                  {slide.showSecondaryCta !== false && slide.secondaryCtaLink && (
                    <Link href={slide.secondaryCtaLink} className="btn-hairline-gold">
                      {slide.secondaryCtaText || 'Learn More'}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Prev/Next Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button className="carousel-arrow carousel-arrow-prev" onClick={prevSlide} aria-label="Previous slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button className="carousel-arrow carousel-arrow-next" onClick={nextSlide} aria-label="Next slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          {/* Slide Dots */}
          <div className="carousel-dots" role="tablist" aria-label="Slide indicators">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                className={`carousel-dot ${activeSlide === idx ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
                role="tab"
                aria-label={`Slide ${idx + 1}`}
                aria-selected={activeSlide === idx}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
