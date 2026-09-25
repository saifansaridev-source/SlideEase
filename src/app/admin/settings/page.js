'use client';

import React, { useState, useEffect } from 'react';

const SECTIONS = [
  {
    id: 'store',
    label: '🏪 Store Information',
    fields: [
      { key: 'storeName',     label: 'Store Name',         type: 'text' },
      { key: 'storeTagline',  label: 'Tagline / Slogan',   type: 'text' },
      { key: 'siteUrl',       label: 'Site URL',            type: 'url',   help: 'Full URL including https (e.g. https://your-domain.com)' },
      { key: 'supportEmail',  label: 'Support Email',       type: 'email' },
      { key: 'supportPhone',  label: 'Support Phone',       type: 'text' },
      { key: 'whatsappNumber',label: 'WhatsApp Number',     type: 'text',  help: 'Include country code, digits only (e.g. 919876543210)' },
      { key: 'address',       label: 'Business Address',    type: 'textarea' },
      { key: 'gstNumber',     label: 'GST Number',          type: 'text',  help: 'Shown on invoices. Leave blank if not registered.' },
    ],
  },
  {
    id: 'loyalty',
    label: '🎁 Loyalty Programme',
    fields: [
      { key: 'loyaltyPointsEnabled',    label: 'Enable Loyalty Points',        type: 'toggle' },
      { key: 'loyaltyPointsPerRupee',   label: 'Points Earned Per ₹1 Spent',  type: 'number', help: 'E.g. 1 → customer earns 1 point per ₹1' },
      { key: 'loyaltyRedemptionRate',   label: 'Points Needed Per ₹1 Discount', type: 'number', help: 'E.g. 100 → 100 points = ₹1 off' },
    ],
  },
  {
    id: 'store_ops',
    label: '⚙️ Operations',
    fields: [
      { key: 'maintenanceMode',          label: 'Maintenance Mode (takes storefront offline)', type: 'toggle' },
      { key: 'reviewModerationEnabled',  label: 'Require Admin Approval Before Reviews Go Live', type: 'toggle' },
      { key: 'maxCartItems',             label: 'Max Items Per Cart',        type: 'number', help: 'Prevents cart abuse. Typical: 10' },
    ],
  },
];

export default function AdminGeneralSettings() {
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState('');
  const [err,      setErr]      = useState('');

  useEffect(() => {
    fetch('/api/admin/general-settings')
      .then(r => r.json())
      .then(json => {
        if (json.success) setSettings(json.data);
        else setErr(json.error);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErr('');
    try {
      const res  = await fetch('/api/admin/general-settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setMsg('General settings saved successfully.');
        setTimeout(() => setMsg(''), 4000);
      } else {
        setErr(json.error);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading settings...</div>;

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
          ⚙️ General Settings
        </h2>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Store identity, contact info, loyalty programme, and operational toggles.
        </p>
      </div>

      {msg && <div style={{ padding: '0.8rem 1.2rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 600 }}>✓ {msg}</div>}
      {err && <div style={{ padding: '0.8rem 1.2rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 600 }}>⚠ {err}</div>}

      <form onSubmit={handleSave}>
        {SECTIONS.map((section) => (
          <div key={section.id} className="admin-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              {section.label}
            </h3>

            <div className="admin-form-row-2">
              {section.fields.map(({ key, label, type, help }) => {
                if (type === 'toggle') {
                  return (
                    <div key={key} style={{ gridColumn: '1 / -1' }}>
                      <div className="checkbox-row">
                        <input
                          type="checkbox"
                          id={`gs-${key}`}
                          checked={!!settings[key]}
                          onChange={e => handleChange(key, e.target.checked)}
                        />
                        <label htmlFor={`gs-${key}`}>{label}</label>
                      </div>
                      {help && <small style={{ display: 'block', marginTop: '0.2rem', marginLeft: '1.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{help}</small>}
                    </div>
                  );
                }
                if (type === 'textarea') {
                  return (
                    <div key={key} className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">{label}</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={settings[key] || ''}
                        onChange={e => handleChange(key, e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                      {help && <small style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{help}</small>}
                    </div>
                  );
                }
                return (
                  <div key={key} className="form-group">
                    <label className="form-label">{label}</label>
                    <input
                      type={type === 'number' ? 'number' : type}
                      className="form-input"
                      value={settings[key] ?? ''}
                      onChange={e => handleChange(key, type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)}
                      min={type === 'number' ? 0 : undefined}
                    />
                    {help && <small style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{help}</small>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Maintenance Mode Warning */}
        {settings?.maintenanceMode && (
          <div style={{ padding: '1rem 1.25rem', background: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: '6px', marginBottom: '1.5rem', color: '#991b1b', fontWeight: 600, fontSize: '0.9rem' }}>
            ⚠️ Maintenance Mode is ON — the storefront will be inaccessible to customers. Remember to turn it off when done.
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-accent" disabled={saving} style={{ padding: '0.65rem 1.75rem', fontSize: '0.9rem', fontWeight: 700 }}>
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
