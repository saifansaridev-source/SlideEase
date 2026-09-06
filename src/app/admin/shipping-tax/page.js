'use client';

import React, { useState, useEffect } from 'react';

const FIELD = (label, key, type = 'text', help = '') => ({ label, key, type, help });

const SHIPPING_FIELDS = [
  FIELD('Free Shipping Threshold (₹)', 'freeShippingThreshold', 'number', 'Orders above this amount qualify for free standard shipping.'),
  FIELD('Flat Shipping Rate (₹)', 'shippingFlatRate', 'number', 'Charged when order does not qualify for free shipping.'),
  FIELD('Standard Delivery Window', 'standardDeliveryDays', 'text', 'E.g. "5-7" (shown to customer at checkout).'),
  FIELD('Express Delivery Window', 'expressDeliveryDays', 'text', 'E.g. "2-3" (shown at checkout when express is selected).'),
  FIELD('Express Delivery Charge (₹)', 'expressDeliveryCharge', 'number', 'Additional charge for express delivery option.'),
  FIELD('Cash on Delivery (COD) Charge (₹)', 'codCharge', 'number', 'Extra fee added to COD orders.'),
];

const TAX_FIELDS = [
  FIELD('GST Rate (%)', 'taxRate', 'number', 'Total GST percentage (CGST + SGST or IGST).'),
  FIELD('CGST Rate (%)', 'cgstRate', 'number', 'Central GST component.'),
  FIELD('SGST Rate (%)', 'sgstRate', 'number', 'State GST component.'),
];

const TOGGLE_FIELDS = [
  { key: 'freeShippingEnabled', label: 'Enable Free Shipping Threshold' },
  { key: 'expressEnabled',      label: 'Enable Express Delivery Option' },
  { key: 'codEnabled',          label: 'Enable Cash on Delivery (COD)' },
  { key: 'taxIncludedInPrice',  label: 'Product Prices Are Tax-Inclusive (GST already included)' },
];

export default function AdminShippingTax() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [msg,     setMsg]       = useState('');
  const [err,     setErr]       = useState('');

  useEffect(() => {
    fetch('/api/admin/shipping-tax')
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
      const res  = await fetch('/api/admin/shipping-tax', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setMsg('Shipping & Tax settings saved successfully.');
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
    <div style={{ width: '100%', maxWidth: '760px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
          🚚 Shipping &amp; Tax Settings
        </h2>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          These values are read by the storefront at checkout — no code changes needed after saving.
        </p>
      </div>

      {msg && <div style={{ padding: '0.8rem 1.2rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 600 }}>✓ {msg}</div>}
      {err && <div style={{ padding: '0.8rem 1.2rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 600 }}>⚠ {err}</div>}

      <form onSubmit={handleSave}>

        {/* SHIPPING SECTION */}
        <div className="admin-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            📦 Shipping Configuration
          </h3>

          {/* Toggle switches */}
          {TOGGLE_FIELDS.slice(0, 3).map(({ key, label }) => (
            <div key={key} className="checkbox-row" style={{ marginBottom: '0.75rem' }}>
              <input
                type="checkbox"
                id={`toggle-${key}`}
                checked={!!settings[key]}
                onChange={e => handleChange(key, e.target.checked)}
              />
              <label htmlFor={`toggle-${key}`}>{label}</label>
            </div>
          ))}

          <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {SHIPPING_FIELDS.map(({ label, key, type, help }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  className="form-input"
                  value={settings[key] ?? ''}
                  onChange={e => handleChange(key, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                  min={type === 'number' ? 0 : undefined}
                />
                {help && <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{help}</small>}
              </div>
            ))}
          </div>
        </div>

        {/* TAX SECTION */}
        <div className="admin-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            🧾 Tax (GST) Configuration
          </h3>

          <div className="checkbox-row" style={{ marginBottom: '1rem' }}>
            <input
              type="checkbox"
              id="toggle-taxIncludedInPrice"
              checked={!!settings.taxIncludedInPrice}
              onChange={e => handleChange('taxIncludedInPrice', e.target.checked)}
            />
            <label htmlFor="toggle-taxIncludedInPrice">Product prices already include GST (tax-inclusive pricing)</label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            {TAX_FIELDS.map(({ label, key, type, help }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings[key] ?? ''}
                  min="0"
                  max="100"
                  step="0.01"
                  onChange={e => handleChange(key, parseFloat(e.target.value))}
                />
                {help && <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>{help}</small>}
              </div>
            ))}
          </div>

          {/* Live preview */}
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <strong>Preview:</strong> On an order of ₹2000 —{' '}
            {settings.taxIncludedInPrice
              ? `Tax is already included in the ₹2000 price (CGST ${settings.cgstRate}% + SGST ${settings.sgstRate}%).`
              : `₹${Math.round(2000 * settings.taxRate / 100)} GST (${settings.taxRate}%) will be added → Total ₹${Math.round(2000 * (1 + settings.taxRate / 100))}.`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-accent" disabled={saving} style={{ padding: '0.65rem 1.75rem', fontSize: '0.9rem', fontWeight: 700 }}>
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
