'use client';

import React, { useState, useEffect } from 'react';

export default function AdminHeroBanner() {
  const [heroImage1, setHeroImage1] = useState('');
  const [heroImage2, setHeroImage2] = useState('');
  const [heroImage3, setHeroImage3] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/admin/hero-banner');
        const data = await res.json();
        if (data.success && data.banner) {
          setHeroImage1(data.banner.heroImage1 || '');
          setHeroImage2(data.banner.heroImage2 || '');
          setHeroImage3(data.banner.heroImage3 || '');
        }
      } catch (err) {
        setError('Failed to load current hero banner settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/hero-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroImage1,
          heroImage2,
          heroImage3,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage('Hero banners successfully updated in MongoDB! The homepage now reflects these images.');
      } else {
        setError(data.error || 'Failed to save hero banner settings.');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading hero banner configuration...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', margin: 0 }}>
          Homepage Hero Banners
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
          Control the background imagery for the 3 homepage hero slideshow banners. If left blank, the site displays a neutral, unbranded luxury gradient placeholder with zero external shoe brand logos.
        </p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: 'rgba(21, 128, 61, 0.1)', border: '1px solid #15803d', borderRadius: '6px', color: '#15803d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ✓ {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(185, 28, 28, 0.1)', border: '1px solid #b91c1c', borderRadius: '6px', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Slide 1 */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
            Slide 1: Primary Heritage Banner
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Headline: "Every stitch carries a hand. Every step carries a story."
          </p>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Image URL:
          </label>
          <input 
            type="url" 
            placeholder="https://example.com/your-hero-slide-1.jpg"
            value={heroImage1}
            onChange={(e) => setHeroImage1(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
          />
          {heroImage1 ? (
            <div style={{ marginTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Live Preview:</span>
              <img src={heroImage1} alt="Slide 1 Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          ) : (
            <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              ℹ No URL provided. Using neutral dark obsidian aesthetic gradient placeholder.
            </div>
          )}
        </div>

        {/* Slide 2 */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
            Slide 2: Women's Collection Banner
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Headline: "The Women's Guild: Ikat Weaves & Kutch Mirrorwork"
          </p>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Image URL:
          </label>
          <input 
            type="url" 
            placeholder="https://example.com/your-hero-slide-2.jpg"
            value={heroImage2}
            onChange={(e) => setHeroImage2(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
          />
          {heroImage2 ? (
            <div style={{ marginTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Live Preview:</span>
              <img src={heroImage2} alt="Slide 2 Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          ) : (
            <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              ℹ No URL provided. Using neutral warm bronze aesthetic gradient placeholder.
            </div>
          )}
        </div>

        {/* Slide 3 */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
            Slide 3: Men's Edit Banner
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Headline: "The Men's Edit: Sleek Cork Slides & Formal Loafers"
          </p>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Image URL:
          </label>
          <input 
            type="url" 
            placeholder="https://example.com/your-hero-slide-3.jpg"
            value={heroImage3}
            onChange={(e) => setHeroImage3(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
          />
          {heroImage3 ? (
            <div style={{ marginTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Live Preview:</span>
              <img src={heroImage3} alt="Slide 3 Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
          ) : (
            <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              ℹ No URL provided. Using neutral slate obsidian aesthetic gradient placeholder.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            type="submit" 
            disabled={saving}
            className="btn btn-accent"
            style={{ padding: '12px 28px', fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Saving to Database...' : 'Save Hero Banners'}
          </button>
        </div>

      </form>
    </div>
  );
}
