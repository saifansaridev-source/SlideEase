'use client';

import React, { useState, useEffect } from 'react';

const MANAGED_PAGES = [
  { slug: 'faq',              label: '❓ FAQ', icon: '❓' },
  { slug: 'about',            label: '🏢 About', icon: '🏢' },
  { slug: 'shipping-returns', label: '🚚 Shipping & Returns', icon: '🚚' },
  { slug: 'privacy',          label: '🔒 Privacy Policy', icon: '🔒' },
  { slug: 'terms',            label: '📄 Terms of Service', icon: '📄' },
  { slug: 'cookie',           label: '🍪 Cookie Policy', icon: '🍪' },
];

export default function AdminCMS() {
  const [pages, setPages]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [msg,     setMsg]       = useState('');
  const [err,     setErr]       = useState('');

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
      if (json.success) setPages(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const openPage = async (pageSlug) => {
    const existing = pages.find(p => p.slug === pageSlug);
    if (existing) {
      setTitle(existing.title || '');
      setContent(existing.content || '');
      setMetaTitle(existing.metaTitle || '');
      setMetaDesc(existing.metaDesc || '');
      setPublished(existing.published !== false);
    } else {
      const info = MANAGED_PAGES.find(p => p.slug === pageSlug);
      setTitle(info?.label.replace(/^[^\s]+ /, '') || pageSlug);
      setContent('');
      setMetaTitle('');
      setMetaDesc('');
      setPublished(true);
    }
    setSelected(pageSlug);
    setMsg('');
    setErr('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
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
        setMsg('Page content saved successfully.');
        setTimeout(() => setMsg(''), 4000);
        fetchPages();
      } else {
        setErr(json.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (slug) => {
    if (!confirm(`Reset "${slug}" to the code-rendered default? (Removes CMS override from database)`)) return;
    const res  = await fetch(`/api/admin/cms?slug=${slug}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      setMsg('Page reset to default.');
      setSelected(null);
      fetchPages();
    } else {
      alert(json.error);
    }
  };

  const hasOverride = (slug) => pages.some(p => p.slug === slug);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
          📝 Content Management (CMS)
        </h2>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Edit page content for key storefront pages. Overrides are stored in MongoDB and take precedence over code-rendered defaults.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Page List */}
        <div className="admin-card" style={{ padding: '1rem' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Managed Pages
          </p>
          {MANAGED_PAGES.map(({ slug, label }) => (
            <button
              key={slug}
              onClick={() => openPage(slug)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '0.7rem 0.9rem',
                marginBottom: '0.3rem',
                borderRadius: '6px',
                border: 'none',
                background: selected === slug ? 'var(--accent-light, #fef3c7)' : 'transparent',
                color: selected === slug ? 'var(--accent-color)' : 'var(--text-dark)',
                fontWeight: selected === slug ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
              {hasOverride(slug) && (
                <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
                  CUSTOM
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Editor Panel */}
        {selected ? (
          <div className="admin-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Editing: <span style={{ color: 'var(--accent-color)' }}>/{selected}</span>
              </h3>
              {hasOverride(selected) && (
                <button
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                  onClick={() => handleReset(selected)}
                >
                  ↺ Reset to Default
                </button>
              )}
            </div>

            {msg && <div style={{ padding: '0.7rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>✓ {msg}</div>}
            {err && <div style={{ padding: '0.7rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>⚠ {err}</div>}

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Page Title</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Displayed as the page heading"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SEO Meta Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    placeholder="Browser tab / Google title (defaults to Page Title)"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">SEO Meta Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={metaDesc}
                  onChange={e => setMetaDesc(e.target.value)}
                  placeholder="Google search snippet (150–160 chars recommended)"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Page Content (HTML supported)</label>
                <textarea
                  className="form-input"
                  rows={14}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="<h2>Section heading</h2><p>Your content here...</p>"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }}
                />
                <small style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Standard HTML tags are supported. Leave empty to use the code-rendered page without override.
                </small>
              </div>

              <div className="checkbox-row" style={{ marginBottom: '1.5rem' }}>
                <input type="checkbox" id="cms-published" checked={published} onChange={e => setPublished(e.target.checked)} />
                <label htmlFor="cms-published">Page is published (visible on storefront)</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-accent" disabled={saving} style={{ padding: '0.65rem 1.75rem', fontWeight: 700 }}>
                  {saving ? 'Saving...' : '💾 Save Page'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p style={{ fontWeight: 600 }}>Select a page from the left panel to edit its content.</p>
            <p style={{ fontSize: '0.85rem' }}>Pages marked <strong>CUSTOM</strong> have database overrides active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
