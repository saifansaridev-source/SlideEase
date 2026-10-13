'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const MANAGED_PAGES = [
  { slug: 'faq',              label: '❓ FAQ',                 icon: '❓', path: '/faq' },
  { slug: 'about',            label: '🏢 About',               icon: '🏢', path: '/about' },
  { slug: 'shipping-returns', label: '🚚 Shipping & Returns',  icon: '🚚', path: '/shipping-returns' },
  { slug: 'features',         label: '✨ Features',            icon: '✨', path: '/features' },
  { slug: 'privacy',          label: '🔒 Privacy Policy',      icon: '🔒', path: '/privacy' },
  { slug: 'terms',            label: '📄 Terms of Service',    icon: '📄', path: '/terms' },
  { slug: 'cookie',           label: '🍪 Cookie Policy',       icon: '🍪', path: '/cookie' },
];

export default function AdminCMS() {
  const [pages, setPages]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [msg,     setMsg]       = useState('');
  const [err,     setErr]       = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'

  // Form state
  const [title,    setTitle]    = useState('');
  const [content,  setContent]  = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [published, setPublished] = useState(true);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/cms');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPages(json.data);
      }
    } catch (e) {
      setErr('Failed to load CMS pages from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const openPage = async (pageSlug) => {
    setSelected(pageSlug);
    setMsg('');
    setErr('');
    setActiveTab('edit');

    // First check local state
    const existing = pages.find(p => p.slug === pageSlug);
    if (existing && existing.content) {
      setTitle(existing.title || '');
      setContent(existing.content || '');
      setMetaTitle(existing.metaTitle || existing.title || '');
      setMetaDesc(existing.metaDesc || '');
      setPublished(existing.published !== false);
    }

    // Always fetch authoritative single page from API (which automatically resolves defaults if not in DB)
    try {
      const res = await fetch(`/api/admin/cms?slug=${pageSlug}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setTitle(d.title || '');
        setContent(d.content || '');
        setMetaTitle(d.metaTitle || d.title || '');
        setMetaDesc(d.metaDesc || '');
        setPublished(d.published !== false);
      }
    } catch (e) {
      console.warn('Could not fetch authoritative page data:', e.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setMsg('');
    setErr('');
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selected,
          title,
          content,
          metaTitle,
          metaDesc,
          published,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg(`✓ Page "${selected}" saved and published successfully.`);
        setTimeout(() => setMsg(''), 4500);
        await fetchPages();
      } else {
        setErr(json.error || 'Failed to save page.');
      }
    } catch (e) {
      setErr('Network error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (slug) => {
    if (!confirm(`Reset "${slug}" to the default code-rendered content? (Removes CMS database override)`)) return;
    try {
      const res  = await fetch(`/api/admin/cms?slug=${slug}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setMsg(`✓ Page "${slug}" reset to code baseline.`);
        setTimeout(() => setMsg(''), 4500);
        await fetchPages();
        // Re-open page to load code defaults
        await openPage(slug);
      } else {
        alert(json.error || 'Failed to reset page.');
      }
    } catch (e) {
      alert('Network error while resetting page.');
    }
  };

  const selectedPageObj = pages.find(p => p.slug === selected);
  const isCustomized = Boolean(selectedPageObj?.hasOverride);
  const pageMetaInfo = MANAGED_PAGES.find(p => p.slug === selected);

  // Quick insertion helpers for rich formatting
  const insertTag = (openTag, closeTag = '') => {
    setContent(prev => prev + `${openTag}${closeTag}`);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
            📝 Content Management (CMS)
          </h2>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Manage storefront legal, support, and company content. Pre-populated with verified live content.
          </p>
        </div>
      </div>

      <div className="admin-split-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Page List Panel */}
        <div className="admin-card" style={{ padding: '1.2rem', background: '#fff', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ margin: '0 0 0.85rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            All Managed Pages ({MANAGED_PAGES.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {MANAGED_PAGES.map(({ slug, label, path }) => {
              const pData = pages.find(p => p.slug === slug);
              const custom = Boolean(pData?.hasOverride);
              const isDraft = pData?.published === false;
              const isSel = selected === slug;

              return (
                <button
                  key={slug}
                  onClick={() => openPage(slug)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '8px',
                    border: isSel ? '1px solid var(--accent-color)' : '1px solid transparent',
                    background: isSel ? 'var(--accent-light, #fef3c7)' : 'rgba(248, 250, 252, 0.8)',
                    color: isSel ? 'var(--accent-color, #b8973e)' : 'var(--text-dark, #1e293b)',
                    fontWeight: isSel ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{label}</span>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    {isDraft && (
                      <span style={{ fontSize: '0.62rem', background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.4rem', borderRadius: '6px', fontWeight: 700 }}>
                        DRAFT
                      </span>
                    )}
                    {custom ? (
                      <span style={{ fontSize: '0.62rem', background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: 700 }}>
                        CUSTOM
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', background: '#f1f5f9', color: '#64748b', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: 600 }}>
                        DEFAULT
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor & Preview Panel */}
        {selected ? (
          <div className="admin-card" style={{ padding: '1.75rem', background: '#fff', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            
            {/* Header with Title and Mode Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                    Editing: <span style={{ color: 'var(--accent-color)' }}>/{selected}</span>
                  </h3>
                  {isCustomized ? (
                    <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                      Database Override Active
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                      Code Baseline Loaded
                    </span>
                  )}
                  {!published && (
                    <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                      Draft Mode
                    </span>
                  )}
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Public URL: <Link href={pageMetaInfo?.path || `/${selected}`} target="_blank" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{pageMetaInfo?.path || `/${selected}`} ↗</Link>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ display: 'inline-flex', background: 'var(--bg-light, #f1f5f9)', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      border: 'none',
                      borderRadius: '5px',
                      background: activeTab === 'edit' ? '#fff' : 'transparent',
                      color: activeTab === 'edit' ? 'var(--primary-color)' : 'var(--text-muted)',
                      fontWeight: activeTab === 'edit' ? 700 : 500,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    ✏️ HTML Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      border: 'none',
                      borderRadius: '5px',
                      background: activeTab === 'preview' ? '#fff' : 'transparent',
                      color: activeTab === 'preview' ? 'var(--primary-color)' : 'var(--text-muted)',
                      fontWeight: activeTab === 'preview' ? 700 : 500,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    👁️ Storefront Preview
                  </button>
                </div>

                {isCustomized && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', color: 'var(--danger-color, #dc2626)', borderColor: 'var(--danger-color, #dc2626)' }}
                    onClick={() => handleReset(selected)}
                    title="Removes database override and restores code defaults"
                  >
                    ↺ Reset to Default
                  </button>
                )}
              </div>
            </div>

            {msg && <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.88rem' }}>{msg}</div>}
            {err && <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.88rem' }}>⚠ {err}</div>}

            {activeTab === 'edit' ? (
              <form onSubmit={handleSave}>
                <div className="admin-form-row-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--primary-color)' }}>
                      Page Heading / Title *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Privacy Policy"
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--primary-color)' }}>
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={metaTitle}
                      onChange={e => setMetaTitle(e.target.value)}
                      placeholder="Browser tab / Search snippet title"
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--primary-color)' }}>
                    SEO Meta Description
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={metaDesc}
                    onChange={e => setMetaDesc(e.target.value)}
                    placeholder="Search engine summary (recommended 150-160 characters)"
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Quick HTML Snippet Helper */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem', background: 'var(--bg-light, #f8fafc)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quick Insert:</span>
                  {[
                    { label: 'H2 Heading', code: '<h2>Heading Title</h2>\n' },
                    { label: 'H3 Subhead', code: '<h3>Subheading</h3>\n' },
                    { label: 'Paragraph', code: '<p>Your paragraph text here.</p>\n' },
                    { label: 'Bullet List', code: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n' },
                    { label: 'Callout Box', code: '<div style="background: var(--bg-light); border-left: 4px solid var(--primary-color); padding: 1rem; border-radius: 6px; margin: 1rem 0;">\n  <p>Important extract or note.</p>\n</div>\n' }
                  ].map(snip => (
                    <button
                      key={snip.label}
                      type="button"
                      onClick={() => insertTag(snip.code)}
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + {snip.label}
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--primary-color)' }}>
                    Page Content (Standard HTML Supported)
                  </label>
                  <textarea
                    className="form-input"
                    rows={16}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Enter or edit your formatted page HTML..."
                    style={{ width: '100%', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.84rem', lineHeight: 1.5, resize: 'vertical', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  />
                  <small style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supports standard HTML tags (headings, paragraphs, lists, links, tables). Unsafe scripts are automatically stripped on save.
                  </small>
                </div>

                <div className="checkbox-row" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input
                    type="checkbox"
                    id="cms-published"
                    checked={published}
                    onChange={e => setPublished(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cms-published" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary-color)', cursor: 'pointer' }}>
                    Page is Published (Live on Storefront)
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button type="submit" className="btn btn-accent" disabled={saving} style={{ padding: '0.65rem 1.8rem', fontWeight: 700, background: 'var(--accent-color, #b8973e)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    {saving ? 'Saving...' : '💾 Save Page Content'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setSelected(null)} style={{ padding: '0.65rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer' }}>
                    Close
                  </button>
                </div>
              </form>
            ) : (
              /* Live Preview Display */
              <div>
                <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>Previewing Storefront View:</span>
                  <h1 style={{ margin: '0.5rem 0 0.2rem', fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--primary-color)' }}>{title || 'Untitled Page'}</h1>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>SEO: {metaTitle} — {metaDesc}</p>
                </div>

                <div
                  className="legal-content"
                  style={{ background: '#fff', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '300px' }}
                  dangerouslySetInnerHTML={{ __html: content || '<p style="color: var(--text-muted);">No content provided.</p>' }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="admin-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#fff', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-color)' }}>Select a Page to Edit</h3>
            <p style={{ fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto' }}>
              Choose any of the 7 managed storefront pages on the left. All pages are pre-populated with their real storefront content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

