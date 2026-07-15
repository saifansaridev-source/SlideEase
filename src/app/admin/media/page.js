'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AdminMedia() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const json = await res.json();
      if (json.success) {
        setAssets(json.data);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError('Failed to fetch media assets from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const uploadFile = async (file) => {
    if (!file) return;
    
    // Simple extension check
    if (!file.type.startsWith('image/')) {
      alert('Only image uploads are allowed.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        fetchAssets(); // Reload grid
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteAsset = async (filename) => {
    if (!confirm(`Are you sure you want to permanently delete "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/admin/media?name=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setAssets((prev) => prev.filter((item) => item.name !== filename));
      } else {
        alert('Delete failed: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Delete failed.');
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert('Image path copied: ' + url);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Upload Zone */}
      <div 
        className="admin-card"
        style={{
          border: dragOver ? '2px dashed var(--accent-color)' : '2px dashed #cbd5e1',
          backgroundColor: dragOver ? '#fffbeb' : '#ffffff',
          borderRadius: '12px',
          padding: '2.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          margin: 0
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange} 
        />
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📤</div>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
          {uploading ? 'Uploading asset file...' : 'Drag & Drop Images here'}
        </h4>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          or click anywhere to select from your device storage
        </p>
      </div>

      {/* Asset Grid */}
      <div className="admin-card" style={{ margin: 0, padding: '1.5rem' }}>
        <div className="admin-card-header" style={{ padding: '0 0 1rem 0', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>🖼️ Media Library Index ({assets.length} items)</h3>
        </div>

        {error && <div style={{ padding: '1rem', color: 'var(--danger-color)', textAlign: 'center' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading media library index...</div>
        ) : assets.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No images in the library. Upload your first image above!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1.5rem'
          }}>
            {assets.map((asset) => (
              <div 
                key={asset.name}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                {/* Thumbnail Preview */}
                <div style={{
                  height: '140px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid #f1f5f9',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img 
                    src={asset.url} 
                    alt={asset.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }} 
                  />
                </div>

                {/* Metadata */}
                <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                  <span 
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#334155',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={asset.name}
                  >
                    {asset.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatSize(asset.size)}
                  </span>
                </div>

                {/* Actions Panel */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  borderTop: '1px solid #f1f5f9',
                  backgroundColor: '#f8fafc'
                }}>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    style={{
                      border: 'none',
                      borderRadius: 0,
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'transparent',
                      color: 'var(--accent-color)'
                    }}
                    onClick={() => handleCopyUrl(asset.url)}
                  >
                    Copy Path
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    style={{
                      border: 'none',
                      borderRadius: 0,
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'transparent',
                      color: 'var(--danger-color)'
                    }}
                    onClick={() => handleDeleteAsset(asset.name)}
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
