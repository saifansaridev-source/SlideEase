'use client';

import React, { useState, useRef } from 'react';

/**
 * Premium Image Upload Slot supporting:
 * - Drag and Drop
 * - Click to upload / File dialog
 * - Live image preview
 * - URL paste fallback
 * - Remove / Reset action
 * - Upload progress indicator
 * - Direct upload to /api/admin/upload (Cloudinary CDN or Local disk)
 */
export default function ImageUploadSlot({
  label,
  value,
  onChange,
  aspectRatio = '16/9',
  helpText = 'Recommended: High resolution JPG/PNG/WEBP (up to 5MB)',
  id,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleUploadFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files (JPG, PNG, WEBP, AVIF) are accepted.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        onChange(data.url);
      } else {
        setUploadError(data.error || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      setUploadError('Network error during upload. Please check connection.');
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  return (
    <div className="image-upload-slot" id={id} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-color)' }}>
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--danger-color)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ✕ Remove Image
          </button>
        )}
      </div>

      {/* Upload & Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2px dashed var(--accent-color)' : '1px dashed var(--border-color)',
          backgroundColor: isDragging ? 'rgba(201, 169, 97, 0.08)' : '#faf8f5',
          borderRadius: 'var(--radius-sm)',
          padding: '1.2rem',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '130px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />

        {value ? (
          <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '360px',
              height: '140px',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.6rem',
            }}>
              <img
                src={value}
                alt={label}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-dark)', fontWeight: 600 }}>
              ✓ Click or drop a new file to replace
            </span>
          </div>
        ) : (
          <div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.4rem' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)' }}>
              Drag & drop image here, or <span style={{ color: 'var(--accent-dark)', textDecoration: 'underline' }}>browse</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {helpText}
            </div>
          </div>
        )}

        {uploading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            zIndex: 5,
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)' }}>
              Uploading image to storage...
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div style={{ fontSize: '0.78rem', color: 'var(--danger-color)', fontWeight: 600 }}>
          ⚠ {uploadError}
        </div>
      )}

      {/* Manual URL Input Fallback */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>URL:</span>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or /assets/..."
          style={{
            flex: 1,
            padding: '0.35rem 0.6rem',
            fontSize: '0.78rem',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            color: 'var(--text-dark)',
          }}
        />
      </div>
    </div>
  );
}
