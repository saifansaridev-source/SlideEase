'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      tagline: 'Proudly Indian • Truly Vegan',
      title: 'Crafted for Comfort, Designed for Heritage',
      desc: 'Experience premium handcrafted footwear combining intricate traditional Indian fabric motifs with ultra-soft contoured memory foam bases.',
      bg: '/public/og_image.png', // Fallback path or Atlas
      link: '/shop',
      linkText: 'Shop Footwear',
      storyLink: '/about',
      storyText: 'Our Story'
    },
    {
      tagline: 'Festival of Colors',
      title: "The Women's Collection: Artisan Juttis",
      desc: 'Adorn your feet with vibrant mirror-work embroidery and woven Ikat slides. Step out in style for every festive look.',
      bg: '/public/og_image.png',
      link: '/shop?category=womens',
      linkText: "Explore Women's"
    },
    {
      tagline: 'Sophisticated Comfort',
      title: "The Men's Collection: Sleek Vegan Slides",
      desc: 'Double-padded cork and premium vegan leather slip-ons built for your daily walks, formal meetings, and evening gatherings.',
      bg: '/public/og_image.png',
      link: '/shop?category=mens',
      linkText: "Explore Men's"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-carousel" id="hero-banner-section">
      {slides.map((slide, idx) => (
        <div 
          key={idx}
          className={`carousel-slide ${activeSlide === idx ? 'active' : ''}`}
          style={{ 
            backgroundImage: "url('/og_image.png')",
            display: activeSlide === idx ? 'block' : 'none'
          }}
        >
          <div className="carousel-overlay"></div>
          <div className="carousel-content">
            <span className="carousel-tagline">{slide.tagline}</span>
            <h2 className="carousel-title">{slide.title}</h2>
            <p className="carousel-desc">{slide.desc}</p>
            <div className="carousel-actions">
              <Link href={slide.link} className="btn btn-accent">
                {slide.linkText}
              </Link>
              {slide.storyLink && (
                <Link href={slide.storyLink} className="btn btn-outline" style={{ borderColor: 'var(--bg-light)', color: 'var(--bg-light)' }}>
                  {slide.storyText}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Indicators */}
      <div className="carousel-dots">
        {slides.map((_, idx) => (
          <span 
            key={idx}
            className={`carousel-dot ${activeSlide === idx ? 'active' : ''}`}
            onClick={() => setActiveSlide(idx)}
          ></span>
        ))}
      </div>
    </section>
  );
}
