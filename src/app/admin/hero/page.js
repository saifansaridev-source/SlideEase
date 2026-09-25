'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ImageUploadSlot from '@/components/ImageUploadSlot';
import { DEFAULT_SECTION_IMAGES, DEFAULT_HERO_SLIDES } from '@/lib/cms-defaults';

// ─── Reusable Field Components ───────────────────────────────────────────────

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
      {children}
    </label>
  );
}

function TextField({ id, value, onChange, placeholder, multiline = false }) {
  const style = {
    width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)',
    borderRadius: '6px', fontSize: '0.88rem', color: 'var(--primary-color)',
    background: 'var(--bg-primary, #fff)', fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.2s', outline: 'none', resize: 'vertical',
  };
  if (multiline) {
    return <textarea id={id} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={style} />;
  }
  return <input id={id} type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...style, resize: undefined }} />;
}

function Toggle({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: '40px', height: '22px', borderRadius: '11px', position: 'relative',
          background: checked ? 'var(--accent-color, #b8973e)' : '#d1d5db',
          transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: '3px', left: checked ? '21px' : '3px',
          width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
      <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>{label}</span>
    </label>
  );
}

// ─── SlideContentEditor ───────────────────────────────────────────────────────

function SlideContentEditor({ slide, index, onChange }) {
  const update = (field, value) => onChange(index, { ...slide, [field]: value });

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      {/* Slide Header */}
      <div style={{ background: 'var(--bg-secondary, #f9f6f0)', padding: '1rem 1.4rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-color, #b8973e)' }}>Slide {index + 1}</span>
          <h4 style={{ margin: '0.1rem 0 0', fontSize: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>{slide.heading?.split('\n')[0] || `Slide ${index + 1}`}</h4>
        </div>
        <Toggle
          id={`slide-${index}-active`}
          checked={slide.isActive !== false}
          onChange={v => update('isActive', v)}
          label={slide.isActive !== false ? 'Active' : 'Hidden'}
        />
      </div>

      {/* Slide Body */}
      <div style={{ padding: '1.4rem', background: '#fff', display: 'grid', gap: '1rem' }}>
        {/* Image Upload */}
        <div>
          <FieldLabel>Background Image</FieldLabel>
          <ImageUploadSlot
            id={`hero-img-${index}`}
            label={`Slide ${index + 1} Background`}
            value={slide.image || ''}
            onChange={val => update('image', val)}
          />
        </div>

        {/* Tagline + Heading */}
        <div className="admin-form-row-2">
          <div>
            <FieldLabel htmlFor={`slide-${index}-tagline`}>Tagline / Eyebrow</FieldLabel>
            <TextField id={`slide-${index}-tagline`} value={slide.tagline} onChange={v => update('tagline', v)} placeholder="e.g. ✦ Ascend with Heritage" />
            <div style={{ marginTop: '0.5rem' }}>
              <Toggle id={`slide-${index}-showtag`} checked={slide.showTagline !== false} onChange={v => update('showTagline', v)} label="Show tagline" />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor={`slide-${index}-align`}>Text Alignment</FieldLabel>
            <select
              id={`slide-${index}-align`}
              value={slide.textAlign || 'left'}
              onChange={e => update('textAlign', e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.88rem', color: 'var(--primary-color)', background: '#fff', boxSizing: 'border-box' }}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>

        {/* Heading */}
        <div>
          <FieldLabel htmlFor={`slide-${index}-heading`}>Main Heading (use \n for line breaks)</FieldLabel>
          <TextField id={`slide-${index}-heading`} value={slide.heading} onChange={v => update('heading', v)} placeholder="e.g. Every stitch carries a hand.\nEvery step carries a story." multiline />
          <div style={{ marginTop: '0.5rem' }}>
            <Toggle id={`slide-${index}-showhead`} checked={slide.showHeading !== false} onChange={v => update('showHeading', v)} label="Show heading" />
          </div>
        </div>

        {/* Description */}
        <div>
          <FieldLabel htmlFor={`slide-${index}-desc`}>Description</FieldLabel>
          <TextField id={`slide-${index}-desc`} value={slide.description} onChange={v => update('description', v)} placeholder="Short supporting description for the slide..." multiline />
          <div style={{ marginTop: '0.5rem' }}>
            <Toggle id={`slide-${index}-showdesc`} checked={slide.showDescription !== false} onChange={v => update('showDescription', v)} label="Show description" />
          </div>
        </div>

        {/* Primary CTA */}
        <div style={{ background: 'var(--bg-secondary, #f9f6f0)', borderRadius: '8px', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Primary CTA Button</span>
            <Toggle id={`slide-${index}-showcta`} checked={slide.showCta !== false} onChange={v => update('showCta', v)} label="Show" />
          </div>
          <div className="admin-form-row-2">
            <div>
              <FieldLabel htmlFor={`slide-${index}-ctatext`}>Button Text</FieldLabel>
              <TextField id={`slide-${index}-ctatext`} value={slide.ctaText} onChange={v => update('ctaText', v)} placeholder="e.g. Explore the Collection" />
            </div>
            <div>
              <FieldLabel htmlFor={`slide-${index}-ctalink`}>Button Link (URL)</FieldLabel>
              <TextField id={`slide-${index}-ctalink`} value={slide.ctaLink} onChange={v => update('ctaLink', v)} placeholder="e.g. /shop or /shop?category=womens" />
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div style={{ background: 'var(--bg-secondary, #f9f6f0)', borderRadius: '8px', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Secondary CTA Button</span>
            <Toggle id={`slide-${index}-showseccta`} checked={slide.showSecondaryCta !== false} onChange={v => update('showSecondaryCta', v)} label="Show" />
          </div>
          <div className="admin-form-row-2">
            <div>
              <FieldLabel htmlFor={`slide-${index}-secctatext`}>Button Text</FieldLabel>
              <TextField id={`slide-${index}-secctatext`} value={slide.secondaryCtaText} onChange={v => update('secondaryCtaText', v)} placeholder="e.g. See the Craft" />
            </div>
            <div>
              <FieldLabel htmlFor={`slide-${index}-secctalink`}>Button Link (URL)</FieldLabel>
              <TextField id={`slide-${index}-secctalink`} value={slide.secondaryCtaLink} onChange={v => update('secondaryCtaLink', v)} placeholder="e.g. /#craft-journey" />
            </div>
          </div>
        </div>

        {/* Extra Options */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
          <Toggle id={`slide-${index}-countdown`} checked={!!slide.showCountdown} onChange={v => update('showCountdown', v)} label="Show countdown timer" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FieldLabel htmlFor={`slide-${index}-overlay`}>Overlay opacity</FieldLabel>
            <input
              id={`slide-${index}-overlay`}
              type="range" min="0" max="90" step="5"
              value={slide.overlayOpacity ?? 65}
              onChange={e => update('overlayOpacity', Number(e.target.value))}
              style={{ width: '100px' }}
            />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', minWidth: '36px' }}>{slide.overlayOpacity ?? 65}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminVisualCMS() {
  const [activeTab, setActiveTab] = useState('hero');
  const [images, setImages] = useState(DEFAULT_SECTION_IMAGES);
  const [slides, setSlides] = useState(DEFAULT_HERO_SLIDES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSlides, setSavingSlides] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sectionsRes, heroRes] = await Promise.all([
          fetch('/api/admin/cms/sections'),
          fetch('/api/admin/hero-banner'),
        ]);
        const sectionsData = await sectionsRes.json();
        const heroData = await heroRes.json();

        if (sectionsData.success && sectionsData.images) {
          setImages(prev => ({ ...prev, ...sectionsData.images }));
        }
        if (heroData.success && heroData.banner?.slides?.length > 0) {
          setSlides(heroData.banner.slides);
        }
      } catch (err) {
        setError('Failed to load CMS configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleImageChange = (key, value) => {
    setImages(prev => ({ ...prev, [key]: value }));
  };

  const handleSlideChange = useCallback((index, updatedSlide) => {
    setSlides(prev => prev.map((s, i) => (i === index ? updatedSlide : s)));
  }, []);

  const handleSaveImages = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(images),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Section images saved successfully!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setError(data.error || 'Failed to save section images.');
      }
    } catch (err) {
      setError('An unexpected error occurred while saving images.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSlides = async () => {
    setSavingSlides(true);
    setMessage('');
    setError('');
    try {
      // Merge images into slides for unified storage
      const slidesWithImages = slides.map((slide, idx) => ({
        ...slide,
        image: slide.image || images[`heroImage${idx + 1}`] || '',
      }));

      const res = await fetch('/api/admin/hero-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: slidesWithImages }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Hero slide content saved! Live storefront updated.');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setError(data.error || 'Failed to save hero slide content.');
      }
    } catch (err) {
      setError('An unexpected error occurred while saving slide content.');
    } finally {
      setSavingSlides(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Loading Visual CMS...
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'hero', label: 'Hero Banners' },
    { id: 'pages', label: 'About & Contact' },
    { id: 'style', label: 'Shop by Style' },
    { id: 'story', label: 'Artisan Stories' },
    { id: 'instagram', label: 'Instagram Gallery' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', margin: 0 }}>
            Visual CMS & Section Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
            Manage hero banner content, site imagery, and storefront sections via MongoDB persistence.
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div style={{ padding: '12px 16px', background: 'rgba(21, 128, 61, 0.08)', border: '1px solid #15803d', borderRadius: '8px', color: '#15803d', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {message}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(185, 28, 28, 0.08)', border: '1px solid #b91c1c', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.3rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
              marginBottom: '-2px',
              color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: HERO BANNERS ── */}
      {activeTab === 'hero' && (
        <div>
          {/* Info Banner */}
          <div style={{ background: 'linear-gradient(135deg, rgba(184,151,62,0.08), rgba(184,151,62,0.03))', border: '1px solid rgba(184,151,62,0.3)', borderRadius: '10px', padding: '1rem 1.4rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color,#b8973e)" strokeWidth="2" style={{ marginTop: '1px', flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>
              <strong>Hero Slide Content:</strong> Edit heading, description, CTA buttons, and visibility per slide. Each slide also has its own background image upload. Click <strong>Save Slide Content</strong> to persist changes.
            </div>
          </div>

          {/* Slide Editors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {slides.map((slide, idx) => (
              <SlideContentEditor
                key={slide.id || idx}
                slide={slide}
                index={idx}
                onChange={handleSlideChange}
              />
            ))}
          </div>

          {/* Save Slide Content */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleSaveSlides}
              disabled={savingSlides}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {savingSlides ? (
                <>
                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Save Hero Slide Content
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: ABOUT & CONTACT ── */}
      {activeTab === 'pages' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {[
            { key: 'aboutHeroImage', label: 'About Page Hero Banner', hint: 'Top header banner on the /about story page.' },
            { key: 'contactHeroImage', label: 'Contact Page Hero Banner', hint: 'Top header banner on the /contact page.' },
          ].map(({ key, label, hint }) => (
            <div key={key} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>{label}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>{hint}</p>
              <ImageUploadSlot id={`slot-${key}`} label={label} value={images[key]} onChange={val => handleImageChange(key, val)} />
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
            <button type="button" onClick={handleSaveImages} disabled={saving} className="btn btn-primary" style={{ padding: '0.7rem 1.8rem', fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save Page Images'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: SHOP BY STYLE ── */}
      {activeTab === 'style' && (
        <div>
          <div style={{ marginBottom: '1.2rem' }}>
            <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.2rem', color: 'var(--primary-color)' }}>Homepage → Shop by Style (4 Category Images)</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Control the four circular category showcase images on the homepage.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { key: 'styleImage1', label: "Men's Slides" },
              { key: 'styleImage2', label: "Women's Sandals" },
              { key: 'styleImage3', label: 'Premium Loafers' },
              { key: 'styleImage4', label: 'Artisan Mojris' },
            ].map(({ key, label }) => (
              <div key={key} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <ImageUploadSlot id={`slot-${key}`} label={label} value={images[key]} onChange={val => handleImageChange(key, val)} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button type="button" onClick={handleSaveImages} disabled={saving} className="btn btn-primary" style={{ padding: '0.7rem 1.8rem', fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save Style Images'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 4: ARTISAN STORIES ── */}
      {activeTab === 'story' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', color: 'var(--primary-color)' }}>Ramji Bhai Vankar Section</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Left portrait and right loom/craft image for the master artisan quote section.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <ImageUploadSlot id="slot-ramji-left" label="Left Image (Portrait)" value={images.ramjiLeftImage} onChange={val => handleImageChange('ramjiLeftImage', val)} />
              <ImageUploadSlot id="slot-ramji-right" label="Right Image (Loom / Craft)" value={images.ramjiRightImage} onChange={val => handleImageChange('ramjiRightImage', val)} />
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', color: 'var(--primary-color)' }}>"Modern Indian Classic" Section</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Right-side shoemaking process image in the "Shoes that Walk with Culture" section.</p>
            <ImageUploadSlot id="slot-modern-classic" label="Modern Indian Classic — Right Image" value={images.modernClassicImage} onChange={val => handleImageChange('modernClassicImage', val)} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="button" onClick={handleSaveImages} disabled={saving} className="btn btn-primary" style={{ padding: '0.7rem 1.8rem', fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save Story Images'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 5: INSTAGRAM GALLERY ── */}
      {activeTab === 'instagram' && (
        <div>
          <div style={{ marginBottom: '1.2rem' }}>
            <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.2rem', color: 'var(--primary-color)' }}>Homepage → Instagram Community Grid (6 Images)</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Each of the 6 community styling photos can be replaced independently.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.4rem', boxShadow: 'var(--shadow-sm)' }}>
                <ImageUploadSlot id={`slot-instagram-${num}`} label={`Instagram — Image ${num}`} value={images[`instagramImage${num}`]} onChange={val => handleImageChange(`instagramImage${num}`, val)} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button type="button" onClick={handleSaveImages} disabled={saving} className="btn btn-primary" style={{ padding: '0.7rem 1.8rem', fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save Instagram Images'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
