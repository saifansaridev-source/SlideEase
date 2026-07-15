'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function MediaSelector({ isOpen, onClose, onSelect, mode = 'single', initialSelection = [] }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('library'); // 'upload' or 'library'
  const [uploading, setUploading] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState([]);

  const fileInputRef = useRef(null);

  // Initialize selected URLs based on initial selections passed down
  useEffect(() => {
    if (isOpen) {
      setSelectedUrls(Array.isArray(initialSelection) ? initialSelection : [initialSelection].filter(Boolean));
      fetchAssets();
    }
  }, [isOpen, initialSelection]);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const json = await res.json();
      if (json.success) {
        setAssets(json.data);
      }
    } catch (err) {
      console.error('Failed to load media selector assets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Only images are allowed.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        await fetchAssets();
        // Automatically switch to library and select the newly uploaded asset
        setActiveTab('library');
        if (mode === 'single') {
          setSelectedUrls([data.data.url]);
        } else {
          setSelectedUrls((prev) => [...prev, data.data.url]);
        }
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Upload error.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleSelectAsset = (url) => {
    if (mode === 'single') {
      setSelectedUrls([url]);
    } else {
      setSelectedUrls((prev) => {
        if (prev.includes(url)) {
          return prev.filter((item) => item !== url);
        } else {
          return [...prev, url];
        }
      });
    }
  };

  const handleInsert = () => {
    if (mode === 'single') {
      onSelect(selectedUrls[0] || '');
    } else {
      onSelect(selectedUrls);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="admin-modal-overlay active" 
      onClick={onClose} 
      style={{ zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div 
        className="admin-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '800px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        
        {/* Header with Tabs */}
        <div 
          className="admin-modal-header" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            alignItems: 'stretch',
            padding: '1.25rem 2rem 0 2rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>🖼️ Media Asset Selector</h3>
            <button className="admin-modal-close" onClick={onClose} style={{ border: 'none', background: 'none' }}>&times;</button>
          </div>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'library' ? 700 : 500,
                color: activeTab === 'library' ? 'var(--accent-color)' : '#64748b',
                borderBottom: activeTab === 'library' ? '2px solid var(--accent-color)' : 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('library')}
            >
              Media Library
            </button>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'upload' ? 700 : 500,
                color: activeTab === 'upload' ? 'var(--accent-color)' : '#64748b',
                borderBottom: activeTab === 'upload' ? '2px solid var(--accent-color)' : 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('upload')}
            >
              Upload Files
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          
          {activeTab === 'upload' ? (
            <div 
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '4rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#f8fafc'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleFileChange} 
              />
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
              <h4>{uploading ? 'Uploading asset file...' : 'Select File to Upload'}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
                Maximum size limit: 5MB. Supports JPEG, PNG, WebP format.
              </p>
            </div>
          ) : (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Reading media folder...</div>
              ) : assets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No media library items. Upload one under the Upload tab!
                </div>
              ) : (
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '1rem'
                  }}
                >
                  {assets.map((asset) => {
                    const isSelected = selectedUrls.includes(asset.url);
                    return (
                      <div
                        key={asset.name}
                        onClick={() => handleSelectAsset(asset.url)}
                        style={{
                          border: isSelected ? '3px solid var(--accent-color)' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          height: '110px',
                          backgroundColor: '#f8fafc',
                          position: 'relative',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <img 
                          src={asset.url} 
                          alt={asset.name} 
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: 'var(--accent-color)',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer actions */}
        <div 
          style={{ 
            padding: '1rem 2rem', 
            borderTop: '1px solid #e2e8f0', 
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
          }}
        >
          <span style={{ alignSelf: 'center', fontSize: '0.8rem', color: '#64748b', marginRight: 'auto' }}>
            {selectedUrls.length} file{selectedUrls.length !== 1 ? 's' : ''} selected
          </span>
          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-accent" 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}
            onClick={handleInsert}
            disabled={selectedUrls.length === 0}
          >
            Insert Selection
          </button>
        </div>

      </div>
    </div>
  );
}
