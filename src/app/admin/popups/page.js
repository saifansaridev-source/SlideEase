'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ImageUploadSlot from '@/components/ImageUploadSlot';

// ─── Default new popup template ──────────────────────────────────────────────
const createDefaultPopup = () => ({
  id: `popup_${Date.now()}`,
  name: 'New Popup',
  isActive: true,
  type: 'promo', // promo | newsletter | announcement
  heading: 'Exclusive Offer',
  subheading: 'For Our Valued Customers',
  description: 'Get 10% off your first order when you subscribe.',
  image: '',
  ctaText: 'Shop Now',
  ctaLink: '/shop',
  showCloseBtn: true,
  triggerType: 'delay', // delay | exit_intent | scroll
  delaySeconds: 5,
  scrollPercent: 40,
  displayFrequency: 'once_per_session', // once_per_session | always | once_per_day | once_ever
  targetPages: 'all', // all | homepage | shop | product
  bgColor: '#0f1622',
  accentColor: '#b8973e',
  textColor: '#ffffff',
  showCouponCode: false,
  couponCode: '',
});

// ─── Field helpers ────────────────────────────────────────────────────────────
function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'block', fontSize: '0.77rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
      {children}
    </label>
  );
}

function Inp({ id, value, onChange, placeholder, type = 'text' }) {
  return (
    <input id={id} type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.87rem', color: 'var(--primary-color)', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' }}
    />
  );
}

function Sel({ id, value, onChange, options }) {
  return (
    <select id={id} value={value ?? ''} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.87rem', color: 'var(--primary-color)', background: '#fff', boxSizing: 'border-box' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
      <div onClick={() => onChange(!checked)} style={{ width: '38px', height: '21px', borderRadius: '10.5px', position: 'relative', background: checked ? 'var(--accent-color,#b8973e)' : '#d1d5db', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: '2.5px', left: checked ? '19px' : '2.5px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>{label}</span>
    </label>
  );
}

// ─── Popup Live Preview ───────────────────────────────────────────────────────
function PopupPreview({ popup }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '460px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', background: popup.bgColor || '#0f1622', color: popup.textColor || '#fff', fontFamily: 'inherit' }}>
      {/* Top accent strip */}
      <div style={{ height: '4px', background: popup.accentColor || '#b8973e' }} />

      {/* Image (if any) */}
      {popup.image && (
        <div style={{ height: '180px', overflow: 'hidden' }}>
          <img src={popup.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '1.6rem 1.8rem' }}>
        {popup.heading && (
          <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: popup.textColor || '#fff', lineHeight: 1.3 }}>
            {popup.heading}
          </h3>
        )}
        {popup.subheading && (
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: popup.accentColor || '#b8973e', fontWeight: 600 }}>{popup.subheading}</p>
        )}
        {popup.description && (
          <p style={{ margin: '0 0 1rem', fontSize: '0.87rem', opacity: 0.85, lineHeight: 1.6 }}>{popup.description}</p>
        )}

        {/* Coupon code pill */}
        {popup.showCouponCode && popup.couponCode && (
          <div style={{ margin: '0 0 1rem', padding: '0.6rem 1rem', border: `1.5px dashed ${popup.accentColor || '#b8973e'}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>Coupon Code</span>
            <span style={{ fontWeight: 800, letterSpacing: '0.1em', fontSize: '0.95rem', color: popup.accentColor || '#b8973e' }}>{popup.couponCode}</span>
          </div>
        )}

        {popup.ctaText && (
          <a href="#preview" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', background: popup.accentColor || '#b8973e', color: '#fff', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
            {popup.ctaText}
          </a>
        )}
      </div>

      {/* Close button preview */}
      {popup.showCloseBtn && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff', cursor: 'default' }}>×</div>
      )}
    </div>
  );
}

// ─── Single Popup Editor ──────────────────────────────────────────────────────
function PopupEditor({ popup, onChange, onDelete }) {
  const update = (field, val) => onChange({ ...popup, [field]: val });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header Row */}
      <div style={{ background: 'var(--bg-secondary,#f9f6f0)', padding: '0.9rem 1.3rem', borderBottom: collapsed ? 'none' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <Toggle id={`popup-active-${popup.id}`} checked={popup.isActive !== false} onChange={v => update('isActive', v)} label="" />
          <input
            type="text"
            value={popup.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Popup name (internal)"
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-color)', outline: 'none', fontFamily: 'inherit' }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: popup.isActive !== false ? 'rgba(21,128,61,0.1)' : 'rgba(100,100,100,0.1)', color: popup.isActive !== false ? '#15803d' : '#888' }}>
            {popup.isActive !== false ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
          <button type="button" onClick={onDelete} style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer', color: '#b91c1c' }}>
            Delete
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: '1.4rem', background: '#fff', display: 'grid', gap: '1.2rem' }}>

          {/* Live Preview */}
          <div className="admin-split-layout">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* Basic Content */}
              <div className="admin-form-row-2">
                <div>
                  <FieldLabel htmlFor={`${popup.id}-type`}>Popup Type</FieldLabel>
                  <Sel id={`${popup.id}-type`} value={popup.type} onChange={v => update('type', v)} options={[
                    { value: 'promo', label: 'Promotional Offer' },
                    { value: 'newsletter', label: 'Newsletter Signup' },
                    { value: 'announcement', label: 'Announcement' },
                  ]} />
                </div>
                <div>
                  <FieldLabel htmlFor={`${popup.id}-target`}>Target Pages</FieldLabel>
                  <Sel id={`${popup.id}-target`} value={popup.targetPages} onChange={v => update('targetPages', v)} options={[
                    { value: 'all', label: 'All Pages' },
                    { value: 'homepage', label: 'Homepage Only' },
                    { value: 'shop', label: 'Shop Pages' },
                    { value: 'product', label: 'Product Pages' },
                  ]} />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor={`${popup.id}-heading`}>Heading</FieldLabel>
                <Inp id={`${popup.id}-heading`} value={popup.heading} onChange={v => update('heading', v)} placeholder="e.g. Exclusive Offer" />
              </div>
              <div>
                <FieldLabel htmlFor={`${popup.id}-subheading`}>Sub-heading</FieldLabel>
                <Inp id={`${popup.id}-subheading`} value={popup.subheading} onChange={v => update('subheading', v)} placeholder="e.g. For Our Valued Customers" />
              </div>
              <div>
                <FieldLabel htmlFor={`${popup.id}-desc`}>Description</FieldLabel>
                <textarea id={`${popup.id}-desc`} value={popup.description || ''} onChange={e => update('description', e.target.value)} placeholder="Supporting message..." rows={3}
                  style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.87rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              {/* CTA */}
              <div className="admin-form-row-2">
                <div>
                  <FieldLabel htmlFor={`${popup.id}-ctatext`}>CTA Button Text</FieldLabel>
                  <Inp id={`${popup.id}-ctatext`} value={popup.ctaText} onChange={v => update('ctaText', v)} placeholder="e.g. Shop Now" />
                </div>
                <div>
                  <FieldLabel htmlFor={`${popup.id}-ctalink`}>CTA Link</FieldLabel>
                  <Inp id={`${popup.id}-ctalink`} value={popup.ctaLink} onChange={v => update('ctaLink', v)} placeholder="/shop" />
                </div>
              </div>

              {/* Coupon */}
              <div style={{ background: 'var(--bg-secondary,#f9f6f0)', borderRadius: '8px', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
                <Toggle id={`${popup.id}-showcoupon`} checked={!!popup.showCouponCode} onChange={v => update('showCouponCode', v)} label="Show coupon code in popup" />
                {popup.showCouponCode && (
                  <div>
                    <FieldLabel htmlFor={`${popup.id}-coupon`}>Coupon Code</FieldLabel>
                    <Inp id={`${popup.id}-coupon`} value={popup.couponCode} onChange={v => update('couponCode', v)} placeholder="e.g. FIRST10" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Preview + Colors */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary,#f9f6f0)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Preview</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PopupPreview popup={popup} />
                </div>
              </div>

              {/* Color Pickers */}
              <div className="admin-form-row-3">
                {[
                  { label: 'Background', field: 'bgColor' },
                  { label: 'Accent', field: 'accentColor' },
                  { label: 'Text', field: 'textColor' },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <FieldLabel htmlFor={`${popup.id}-${field}`}>{label}</FieldLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.3rem 0.5rem', background: '#fff' }}>
                      <input type="color" id={`${popup.id}-${field}`} value={popup[field] || '#000000'} onChange={e => update(field, e.target.value)} style={{ width: '24px', height: '24px', border: 'none', padding: 0, cursor: 'pointer', background: 'none' }} />
                      <input type="text" value={popup[field] || ''} onChange={e => update(field, e.target.value)} style={{ flex: 1, border: 'none', fontSize: '0.78rem', outline: 'none', fontFamily: 'monospace' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1.2rem' }}>
            <FieldLabel>Banner / Hero Image (optional)</FieldLabel>
            <ImageUploadSlot id={`popup-img-${popup.id}`} label="Popup Banner Image" value={popup.image || ''} onChange={val => update('image', val)} />
          </div>

          {/* Timing / Trigger */}
          <div style={{ background: 'var(--bg-secondary,#f9f6f0)', borderRadius: '10px', padding: '1.2rem', display: 'grid', gap: '1rem', borderTop: '1px dashed var(--border-color)' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Timing & Trigger</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div>
                <FieldLabel htmlFor={`${popup.id}-trigger`}>Trigger</FieldLabel>
                <Sel id={`${popup.id}-trigger`} value={popup.triggerType} onChange={v => update('triggerType', v)} options={[
                  { value: 'delay', label: 'Time Delay' },
                  { value: 'exit_intent', label: 'Exit Intent' },
                  { value: 'scroll', label: 'Scroll Depth' },
                ]} />
              </div>
              {popup.triggerType === 'delay' && (
                <div>
                  <FieldLabel htmlFor={`${popup.id}-delay`}>Delay (seconds)</FieldLabel>
                  <Inp id={`${popup.id}-delay`} type="number" value={popup.delaySeconds} onChange={v => update('delaySeconds', Number(v))} placeholder="5" />
                </div>
              )}
              {popup.triggerType === 'scroll' && (
                <div>
                  <FieldLabel htmlFor={`${popup.id}-scroll`}>Scroll Depth (%)</FieldLabel>
                  <Inp id={`${popup.id}-scroll`} type="number" value={popup.scrollPercent} onChange={v => update('scrollPercent', Number(v))} placeholder="40" />
                </div>
              )}
              <div>
                <FieldLabel htmlFor={`${popup.id}-freq`}>Display Frequency</FieldLabel>
                <Sel id={`${popup.id}-freq`} value={popup.displayFrequency} onChange={v => update('displayFrequency', v)} options={[
                  { value: 'once_per_session', label: 'Once per Session' },
                  { value: 'once_per_day', label: 'Once per Day' },
                  { value: 'once_ever', label: 'Once Ever' },
                  { value: 'always', label: 'Always Show' },
                ]} />
              </div>
            </div>
            <Toggle id={`${popup.id}-close`} checked={popup.showCloseBtn !== false} onChange={v => update('showCloseBtn', v)} label="Show close button" />
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPopupsPage() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch('/api/admin/popups');
        const data = await res.json();
        if (data.success) setPopups(data.popups || []);
      } catch (err) {
        setError('Failed to load popup configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchPopups();
  }, []);

  const handleChange = useCallback((updatedPopup) => {
    setPopups(prev => prev.map(p => (p.id === updatedPopup.id ? updatedPopup : p)));
  }, []);

  const handleDelete = useCallback((id) => {
    if (!confirm('Delete this popup permanently?')) return;
    setPopups(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleAdd = () => {
    setPopups(prev => [...prev, createDefaultPopup()]);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popups }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Popup configuration saved! Changes are now live on the storefront.');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(data.error || 'Failed to save popups.');
      }
    } catch (err) {
      setError('An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Loading popup configuration...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', margin: 0 }}>
            Promotional Popup Manager
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
            Create and configure timed, exit-intent, or scroll-triggered promotional popups for the storefront.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={handleAdd} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.3rem', fontWeight: 600 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New Popup
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', fontWeight: 600 }}>
            {saving ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Saving...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save All Popups
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status */}
      {message && (
        <div style={{ padding: '12px 16px', background: 'rgba(21,128,61,0.08)', border: '1px solid #15803d', borderRadius: '8px', color: '#15803d', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {message}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(185,28,28,0.08)', border: '1px solid #b91c1c', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Popup List */}
      {popups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ marginBottom: '1rem', opacity: 0.4 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>No popups configured</p>
          <p style={{ fontSize: '0.87rem', margin: '0 0 1.5rem' }}>Add your first promotional popup to engage visitors.</p>
          <button type="button" onClick={handleAdd} className="btn btn-primary" style={{ padding: '0.7rem 1.8rem', fontWeight: 600 }}>
            Create First Popup
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {popups.map(popup => (
            <PopupEditor
              key={popup.id}
              popup={popup}
              onChange={handleChange}
              onDelete={() => handleDelete(popup.id)}
            />
          ))}
        </div>
      )}

      {/* Bottom Save */}
      {popups.length > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 600 }}>
            {saving ? 'Saving...' : 'Save All Popups'}
          </button>
        </div>
      )}

    </div>
  );
}
