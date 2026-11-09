'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MediaSelector from '@/components/MediaSelector';
import RichTextEditor from '@/components/RichTextEditor';
import Link from 'next/link';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Page View state: 'list' (catalog table) or 'form' (add/edit form view)
  const [viewMode, setViewMode] = useState('list');
  // Form navigation tabs inside form view: 'general', 'inventory', 'images', 'attributes'
  const [formTab, setFormTab] = useState('general');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('womens');
  const [type, setType] = useState('slides');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [tag, setTag] = useState('');
  
  // Inventory fields
  const [sku, setSku] = useState('');
  const [manageStock, setManageStock] = useState(true);
  const [stockQty, setStockQty] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [allowBackorders, setAllowBackorders] = useState('no');
  const [soldIndividually, setSoldIndividually] = useState(false);
  const [stock, setStock] = useState('in-stock');

  // Attributes fields
  const [pattern, setPattern] = useState('');
  const [patternColor, setPatternColor] = useState('#333333');
  const [bgColor, setBgColor] = useState('#f9f9f9');
  const [material, setMaterial] = useState('Vegan Leather');
  const [color, setColor] = useState('tan');
  const [sizes, setSizes] = useState('6, 7, 8, 9, 10');
  const [sizeStock, setSizeStock] = useState({ '5': 10, '6': 12, '7': 5, '8': 0, '9': 10, '10': 8 });

  // Variants management fields
  const [variantsList, setVariantsList] = useState([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarColor, setNewVarColor] = useState('Tan');
  const [newVarColorHex, setNewVarColorHex] = useState('#c48a43');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [newVarOriginalPrice, setNewVarOriginalPrice] = useState('');
  const [newVarSku, setNewVarSku] = useState('');
  const [newVarImage, setNewVarImage] = useState('/assets/sandals.png');
  const [newVarStock, setNewVarStock] = useState('in-stock');
  const [newVarSizes, setNewVarSizes] = useState('5, 6, 7, 8, 9, 10');
  const [newVarDesc, setNewVarDesc] = useState('');

  // Media fields
  const [image, setImage] = useState('/assets/slides.png');
  const [gallery, setGallery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Editing tracker
  const [editingProduct, setEditingProduct] = useState(null);

  // Pickers modal toggles
  const [isMainPickerOpen, setIsMainPickerOpen] = useState(false);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);

  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?category=all');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError('Failed to fetch products list.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setCategories(json.data);
        if (!editingProduct) {
          setCategory(json.data[0].slug);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  }, [editingProduct]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const resetForm = () => {
    setName('');
    setCategory(categories[0]?.slug || 'womens');
    setType('slides');
    setPrice('');
    setOriginalPrice('');
    setDesc('');
    setShortDesc('');
    setTag('');
    setSku('');
    setManageStock(true);
    setStockQty('50');
    setLowStockThreshold('10');
    setAllowBackorders('no');
    setSoldIndividually(false);
    setStock('in-stock');
    setPattern('');
    setPatternColor('#333333');
    setBgColor('#f9f9f9');
    setMaterial('Vegan Leather');
    setColor('tan');
    setSizes('6, 7, 8, 9, 10');
    setImage('/assets/slides.png');
    setGallery('');
    setVariantsList([]);
    setNewVarName('');
    setNewVarColor('Tan');
    setNewVarColorHex('#c48a43');
    setNewVarPrice('');
    setNewVarOriginalPrice('');
    setNewVarSku('');
    setNewVarImage('/assets/sandals.png');
    setNewVarStock('in-stock');
    setNewVarSizes('5, 6, 7, 8, 9, 10');
    setNewVarDesc('');
    
    setEditingProduct(null);
    setFormMsg('');
    setFormError('');
    setFormTab('general');
    setViewMode('list'); // Switch back to catalog table
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setCategory(product.category || 'womens');
    setType(product.type || 'slides');
    setPrice(product.price ? String(product.price) : '');
    setOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setDesc(product.desc || '');
    setShortDesc(product.shortDesc || '');
    setTag(product.tag || '');
    
    setSku(product.sku || `SLX-${product.id.toUpperCase()}`);
    setManageStock(product.manageStock === undefined ? true : !!product.manageStock);
    setStockQty(product.stockQty === undefined ? '50' : String(product.stockQty));
    setLowStockThreshold(product.lowStockThreshold === undefined ? '10' : String(product.lowStockThreshold));
    setAllowBackorders(product.allowBackorders || 'no');
    setSoldIndividually(!!product.soldIndividually);
    setStock(product.stock || 'in-stock');
    
    setPattern(product.pattern || '');
    setPatternColor(product.patternColor || '#333333');
    setBgColor(product.bgColor || '#f9f9f9');
    setMaterial(product.material || 'Vegan Leather');
    setColor(product.color || 'tan');
    setSizes(Array.isArray(product.sizes) ? product.sizes.join(', ') : '6, 7, 8, 9, 10');
    setSizeStock(product.sizeStock || { '5': 10, '6': 10, '7': 10, '8': 10, '9': 10, '10': 10 });
    
    setImage(product.image || '/assets/slides.png');
    setGallery(Array.isArray(product.gallery) ? product.gallery.join(', ') : '');
    setVariantsList(Array.isArray(product.variants) ? product.variants : []);
    
    setFormMsg('');
    setFormError('');
    setFormTab('general');
    setViewMode('form'); // Open edit form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormMsg('Uploading featured product photo to Cloudinary CDN...');
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error(`Upload failed (Status ${res.status}: ${res.statusText})`);
      }

      if (res.ok && data.success && data.url) {
        setImage(data.url);
        setFormMsg('✓ Featured photo uploaded successfully to Cloudinary CDN!');
        setTimeout(() => setFormMsg(''), 4000);
      } else {
        setFormError(data.error || 'Failed to upload featured photo.');
      }
    } catch (err) {
      setFormError('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDirectFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setFormError('');
    const newUploadedUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setFormMsg(`Uploading image ${i + 1} of ${files.length} to Cloudinary CDN...`);
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          throw new Error(`Upload failed for "${files[i].name}" (Status ${res.status}: ${res.statusText})`);
        }

        if (res.ok && data.success && (data.url || data.urls?.[0])) {
          newUploadedUrls.push(data.url || data.urls[0]);
        } else {
          throw new Error(data.error || `Failed to upload "${files[i].name}"`);
        }
      }

      // If no main image set or default placeholder, set first uploaded as main
      if (!image || image.includes('slides.png') || image.includes('og_image')) {
        setImage(newUploadedUrls[0]);
      }

      // Append all uploaded to gallery
      const existing = gallery ? gallery.split(',').map(s => s.trim()).filter(Boolean) : [];
      const combined = [...existing, ...newUploadedUrls];
      setGallery(combined.join(', '));
      setFormMsg(`✓ Successfully uploaded ${newUploadedUrls.length} product photo(s) to Cloudinary CDN!`);
      setTimeout(() => setFormMsg(''), 4000);
    } catch (err) {
      setFormError('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleVariantPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormMsg('Uploading variant photo to Cloudinary CDN...');
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error(`Upload failed (Status ${res.status}: ${res.statusText})`);
      }

      if (res.ok && data.success && data.url) {
        setNewVarImage(data.url);
        setFormMsg('✓ Variant photo uploaded successfully to Cloudinary CDN!');
        setTimeout(() => setFormMsg(''), 4000);
      } else {
        setFormError(data.error || 'Failed to upload variant photo.');
      }
    } catch (err) {
      setFormError('Variant upload error: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormMsg('');
    setFormError('');

    if (!name || !price) {
      setFormError('Please enter product name and current price.');
      return;
    }

    const payload = {
      name,
      category,
      type,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice || price),
      desc,
      shortDesc,
      tag,
      sku,
      manageStock,
      stockQty: manageStock ? (parseInt(stockQty) || 0) : 0,
      lowStockThreshold: manageStock ? (parseInt(lowStockThreshold) || 10) : 10,
      allowBackorders,
      soldIndividually,
      stock,
      pattern,
      patternColor,
      bgColor,
      material: material.trim(),
      color: (color || 'tan').trim().toLowerCase(),
      sizes: sizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : ['6', '7', '8', '9', '10'],
      sizeStock: sizeStock || {},
      image,
      gallery: gallery ? gallery.split(',').map(s => s.trim()).filter(Boolean) : [],
      variants: variantsList
    };

    try {
      if (editingProduct) {
        // UPDATE (PUT) Request
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
        const data = await res.json();

        if (data.success) {
          alert('Product details updated successfully!');
          resetForm();
          fetchProducts();
        } else {
          setFormError(data.error);
        }
      } else {
        // CREATE (POST) Request
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            rating: 4.8,
            reviews: 5
          }),
        });
        const data = await res.json();

        if (data.success) {
          alert('New product inserted successfully!');
          resetForm();
          fetchProducts();
        } else {
          setFormError(data.error);
        }
      }
    } catch (err) {
      setFormError('Could not save product data. Backend connection failure.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product from database?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        alert('Product deleted successfully!');
        if (editingProduct && editingProduct.id === id) {
          resetForm();
        }
        fetchProducts();
      } else {
        alert('Delete failed: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Product delete failed.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      
      {/* 1. LISTING MODE (Full-width catalog listing table) */}
      {viewMode === 'list' && (
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem' }}>
            <h3 style={{ margin: 0 }}>📦 Shoe Catalog ({products.length} Items)</h3>
            <button 
              type="button" 
              className="btn btn-accent" 
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
              onClick={() => {
                resetForm();
                setViewMode('form');
              }}
            >
              ➕ Add New Product
            </button>
          </div>

          <div className="admin-table-wrapper" style={{ minHeight: '300px' }}>
            {error && <div style={{ padding: '1rem', color: 'var(--danger-color)', textAlign: 'center' }}>Error: {error}</div>}
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Color & Material</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '4rem' }}>Fetching inventory catalog...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '4rem' }}>No products found in the database. Click "Add New Product" to insert one!</td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', backgroundColor: prod.bgColor || '#fcfbf7', border: '1px solid #e2e8f0' }}>
                          <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{prod.name}</strong><br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {prod.id}</span>
                      </td>
                      <td><code>{prod.sku || `SLX-${prod.id.toUpperCase()}`}</code></td>
                      <td style={{ textTransform: 'capitalize' }}>{prod.category}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <span style={{ 
                            display: 'inline-block', 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '50%', 
                            backgroundColor: prod.color === 'teal' ? '#008080' : 
                                            prod.color === 'red' ? '#dc2626' : 
                                            prod.color === 'tan' ? '#c48a43' : 
                                            prod.color === 'blue' ? '#4f46e5' : 
                                            prod.color === 'purple' ? '#701a75' : 
                                            prod.color === 'pink' ? '#db2777' : 
                                            prod.color === 'green' ? '#059669' : 
                                            prod.color === 'gold' ? '#b45309' : 
                                            prod.color === 'black' ? '#111827' : '#94a3b8' 
                          }} />
                          <strong style={{ textTransform: 'capitalize' }}>{prod.color || '—'}</strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.material || '—'}</span>
                      </td>
                      <td>
                        {prod.originalPrice && prod.originalPrice > prod.price ? (
                          <span>
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.4rem', fontSize: '0.85rem' }}>₹{prod.originalPrice}</span>
                            <strong>₹{prod.price}</strong>
                          </span>
                        ) : (
                          <strong>₹{prod.price}</strong>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${prod.stock === 'in-stock' ? 'delivered' : prod.stock === 'low-stock' ? 'pending' : 'cancelled'}`}>
                          {prod.stock === 'in-stock' ? 'In Stock' : prod.stock === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link 
                            href={`/product/${prod.slug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline" 
                            style={{ 
                              fontSize: '0.75rem', 
                              padding: '0.35rem 0.7rem', 
                              color: '#0f172a', 
                              borderColor: '#cbd5e1',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            View
                          </Link>
                          <button 
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                            onClick={() => handleStartEdit(prod)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                            onClick={() => handleDeleteProduct(prod.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ADD/EDIT MODE (WooCommerce-style Full-width structured forms layout) */}
      {viewMode === 'form' && (
        <div className="admin-card" style={{ margin: 0, padding: 0 }}>
          <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem' }}>
            <h3 style={{ margin: 0 }}>{editingProduct ? `✏️ Edit Product Details: ${editingProduct.name}` : '➕ Add New Footwear Product'}</h3>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={resetForm}
            >
              ⬅️ Back to Catalog List
            </button>
          </div>

          {formError && <div style={{ margin: '1.5rem 2rem 0 2rem', padding: '0.8rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)', fontSize: '0.85rem', fontWeight: 600, borderRadius: '4px' }}>{formError}</div>}

          <form onSubmit={handleFormSubmit}>
            
            {/* Horizontal Metatab Selector inside Form wrapper */}
            <div className="admin-modal-split">
              
              {/* Left Pane Options List */}
              <div className="admin-modal-tabs">
                <button
                  type="button"
                  style={{
                    padding: '0.8rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: formTab === 'general' ? 700 : 500,
                    backgroundColor: formTab === 'general' ? '#f1f5f9' : 'transparent',
                    color: formTab === 'general' ? 'var(--accent-color)' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setFormTab('general')}
                >
                  ⚙️ General Settings
                </button>
                <button
                  type="button"
                  style={{
                    padding: '0.8rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: formTab === 'inventory' ? 700 : 500,
                    backgroundColor: formTab === 'inventory' ? '#f1f5f9' : 'transparent',
                    color: formTab === 'inventory' ? 'var(--accent-color)' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setFormTab('inventory')}
                >
                  📊 Inventory & Stock
                </button>
                <button
                  type="button"
                  style={{
                    padding: '0.8rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: formTab === 'images' ? 700 : 500,
                    backgroundColor: formTab === 'images' ? '#f1f5f9' : 'transparent',
                    color: formTab === 'images' ? 'var(--accent-color)' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setFormTab('images')}
                >
                  🖼️ Product Images
                </button>
                <button
                  type="button"
                  style={{
                    padding: '0.8rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: formTab === 'attributes' ? 700 : 500,
                    backgroundColor: formTab === 'attributes' ? '#f1f5f9' : 'transparent',
                    color: formTab === 'attributes' ? 'var(--accent-color)' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setFormTab('attributes')}
                >
                  🎨 Attributes & Design
                </button>
                <button
                  type="button"
                  style={{
                    padding: '0.8rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: formTab === 'variants' ? 700 : 500,
                    backgroundColor: formTab === 'variants' ? '#f1f5f9' : 'transparent',
                    color: formTab === 'variants' ? 'var(--accent-color)' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setFormTab('variants')}
                >
                  🎭 Color Variants ({variantsList.length})
                </button>
              </div>

              {/* Right Input Fields pane */}
              <div className="contact-form" style={{ padding: 0, gap: '1.25rem' }}>
                
                {/* 1. GENERAL TAB */}
                {formTab === 'general' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Product Title / Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="e.g. Ivory Beaded Loafers"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                    </div>

                    <div className="admin-form-row-2">
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                          {categories.map(cat => (
                            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Style / Fit Type</label>
                        <select className="filter-select" value={type} onChange={(e) => setType(e.target.value)}>
                          <option value="slides">Slides & Slippers</option>
                          <option value="sandals">Sandals</option>
                          <option value="loafers">Loafers</option>
                        </select>
                      </div>
                    </div>

                    <div className="admin-form-row-2">
                      <div className="form-group">
                        <label className="form-label">Sale Price (₹)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          required 
                          placeholder="e.g. 1299"
                          value={price} 
                          onChange={(e) => setPrice(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Regular Price (₹)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="e.g. 1999"
                          value={originalPrice} 
                          onChange={(e) => setOriginalPrice(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Product Badge / Tag Label</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Best Seller, New Launch, 10% OFF"
                        value={tag} 
                        onChange={(e) => setTag(e.target.value)} 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Short Description (Summary preview)</label>
                      <RichTextEditor 
                        value={shortDesc}
                        onChange={(val) => setShortDesc(val)}
                        placeholder="Brief 1-2 sentence overview of product highlight..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Long Description (Detailed specs)</label>
                      <RichTextEditor 
                        value={desc}
                        onChange={(val) => setDesc(val)}
                        placeholder="Full product history, craftmanship story, sole type, padding details..."
                      />
                    </div>
                  </>
                )}

                {/* 2. INVENTORY TAB */}
                {formTab === 'inventory' && (
                  <>
                    <div className="admin-form-row-2">
                      <div className="form-group">
                        <label className="form-label">SKU (Stock Keeping Unit)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. SLX-IVORY-LF"
                          value={sku} 
                          onChange={(e) => setSku(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Stock Status</label>
                        <select className="filter-select" value={stock} onChange={(e) => setStock(e.target.value)}>
                          <option value="in-stock">In Stock</option>
                          <option value="low-stock">Low Stock</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div className="checkbox-row" style={{ marginTop: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        id="manageStockForm" 
                        checked={manageStock} 
                        onChange={(e) => setManageStock(e.target.checked)} 
                      />
                      <label htmlFor="manageStockForm">
                        Enable product-level stock quantity tracking
                      </label>
                    </div>

                    {manageStock && (
                      <>
                        <div className="admin-form-row-2">
                          <div className="form-group">
                            <label className="form-label">Stock Quantity</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              min="0"
                              value={stockQty} 
                              onChange={(e) => setStockQty(e.target.value)} 
                              required={manageStock}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Low Stock Threshold Alert</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              min="1"
                              value={lowStockThreshold} 
                              onChange={(e) => setLowStockThreshold(e.target.value)} 
                              required={manageStock}
                            />
                          </div>
                        </div>

                    {/* Size-Wise Stock Quantities Manager */}
                    <div className="form-group" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}>
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>📏 Size-Wise Stock Quantities (Pairs per Size)</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                          Total calculated: {Object.values(sizeStock).reduce((acc, q) => acc + (parseInt(q) || 0), 0)} pairs
                        </span>
                      </label>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.8rem' }}>
                        Specify units in stock for each size. Setting a size to 0 automatically grays it out and marks it &quot;Out of Stock&quot; on the storefront. Sizes under 5 pairs display &quot;Low Stock&quot;.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.8rem' }}>
                        {['5', '6', '7', '8', '9', '10', '11'].map((sz) => {
                          const currentVal = sizeStock[sz] !== undefined ? sizeStock[sz] : '';
                          const isZero = currentVal === 0 || currentVal === '0';
                          const isLow = currentVal > 0 && currentVal < 5;

                          return (
                            <div key={sz} style={{
                              border: `1px solid ${isZero ? '#ef4444' : isLow ? '#f59e0b' : '#cbd5e1'}`,
                              borderRadius: '8px',
                              padding: '0.6rem 0.8rem',
                              backgroundColor: isZero ? '#fef2f2' : isLow ? '#fffbeb' : '#f8fafc'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                <span>UK {sz}</span>
                                {isZero && <span style={{ color: '#ef4444', fontSize: '0.68rem' }}>Sold Out</span>}
                                {isLow && <span style={{ color: '#d97706', fontSize: '0.68rem' }}>Low</span>}
                              </div>
                              <input 
                                type="number" 
                                min="0"
                                className="form-input" 
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                                placeholder="0"
                                value={currentVal}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const updated = { ...sizeStock, [sz]: Math.max(0, val) };
                                  setSizeStock(updated);
                                  // Update total stock qty
                                  const sum = Object.values(updated).reduce((a, b) => a + (parseInt(b) || 0), 0);
                                  setStockQty(String(sum));
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="checkbox-row" style={{ borderTop: 'none', paddingTop: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        id="soldIndividuallyForm" 
                        checked={soldIndividually} 
                        onChange={(e) => setSoldIndividually(e.target.checked)} 
                      />
                      <label htmlFor="soldIndividuallyForm">
                        Limit purchases to 1 item per checkout order (Sold Individually)
                      </label>
                    </div>
                  </>
                )}

                {/* 3. IMAGES TAB */}
                {formTab === 'images' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Featured Product Image</label>
                      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ width: '100px', height: '100px', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', flexShrink: 0 }}>
                          {image ? (
                            <img src={image} alt="Featured Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: '2rem' }}>🖼️</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <input 
                              type="file" 
                              accept="image/*" 
                              id="directFeaturedUpload" 
                              style={{ display: 'none' }}
                              onChange={handleFeaturedImageUpload}
                              disabled={isUploading}
                            />
                            <label 
                              htmlFor="directFeaturedUpload"
                              className="btn btn-primary"
                              style={{ 
                                padding: '0.5rem 1rem', 
                                fontSize: '0.82rem', 
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                opacity: isUploading ? 0.6 : 1
                              }}
                            >
                              {isUploading ? '⏳ Uploading...' : '📤 Upload New Featured Photo'}
                            </label>
                            <button 
                              type="button" 
                              className="btn btn-outline" 
                              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                              onClick={() => setIsMainPickerOpen(true)}
                            >
                              Browse Media Library
                            </button>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Directly upload a photo from your computer to Cloudinary CDN, or select an asset from the media library.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="form-group" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label className="form-label" style={{ margin: 0 }}>Product Gallery Photos (4+ Angles)</label>
                        <div>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            id="directPhotoUpload" 
                            style={{ display: 'none' }}
                            onChange={handleDirectFileUpload}
                            disabled={isUploading}
                          />
                          <label 
                            htmlFor="directPhotoUpload"
                            className="btn btn-primary"
                            style={{ 
                              padding: '0.4rem 0.9rem', 
                              fontSize: '0.8rem', 
                              cursor: isUploading ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              opacity: isUploading ? 0.6 : 1
                            }}
                          >
                            {isUploading ? '⏳ Uploading...' : '📤 Upload Multiple Photos'}
                          </label>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                          Click &quot;Upload Multiple Photos&quot; to select 4+ images directly from your computer, or click &quot;+&quot; to pick existing media.
                        </p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                          {gallery.split(',').map(s => s.trim()).filter(Boolean).map((imgUrl, i) => (
                            <div key={i} style={{ width: '80px', height: '80px', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                              <img src={imgUrl} alt={`Gallery Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                type="button"
                                onClick={() => {
                                  const urls = gallery.split(',').map(s => s.trim()).filter(Boolean);
                                  const updated = urls.filter((_, idx) => idx !== i);
                                  setGallery(updated.join(', '));
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '3px',
                                  right: '3px',
                                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  padding: 0,
                                  lineHeight: 1
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{ width: '80px', height: '80px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', padding: 0 }}
                            onClick={() => setIsGalleryPickerOpen(true)}
                            title="Add from Media Library"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 4. ATTRIBUTES TAB */}
                {formTab === 'attributes' && (
                  <>
                    <div className="admin-form-row-2">
                      <div className="form-group">
                        <label className="form-label">Primary Filter Color</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          list="color-preset-list"
                          placeholder="e.g. tan, black, teal, red, purple, gold, blue, pink, green"
                          value={color} 
                          onChange={(e) => setColor(e.target.value)} 
                        />
                        <datalist id="color-preset-list">
                          <option value="tan">Tan</option>
                          <option value="black">Black</option>
                          <option value="teal">Teal</option>
                          <option value="red">Red</option>
                          <option value="purple">Purple</option>
                          <option value="gold">Gold</option>
                          <option value="blue">Blue</option>
                          <option value="pink">Pink</option>
                          <option value="green">Green</option>
                        </datalist>
                        <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                          Maps to the Shop catalog Color filter.
                        </small>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Upper Fabric / Material</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          list="material-preset-list"
                          placeholder="e.g. Vegan Leather, Velvet, Jute, Khadi Cotton, Ikat Canvas"
                          value={material} 
                          onChange={(e) => setMaterial(e.target.value)} 
                        />
                        <datalist id="material-preset-list">
                          <option value="Vegan Leather">Vegan Leather</option>
                          <option value="Ikat Canvas">Ikat Canvas</option>
                          <option value="Velvet">Velvet</option>
                          <option value="Jute">Jute</option>
                          <option value="Khadi Cotton">Khadi Cotton</option>
                        </datalist>
                        <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                          Maps to the Shop catalog Material filter.
                        </small>
                      </div>
                    </div>

                    <div className="admin-form-row-2" style={{ marginTop: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Available Sizes (Comma-separated)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. 5, 6, 7, 8, 9, 10"
                          value={sizes} 
                          onChange={(e) => setSizes(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Upper Embroidery Pattern Type</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. kutch, ikat, mandala, classic"
                          value={pattern} 
                          onChange={(e) => setPattern(e.target.value)} 
                        />
                      </div>
                    </div>


                    <div className="admin-form-row-2">
                      <div className="form-group">
                        <label className="form-label">Embroidery Motif Color</label>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <input 
                            type="color" 
                            className="form-input" 
                            style={{ width: '50px', height: '38px', padding: '0.2rem', cursor: 'pointer' }}
                            value={patternColor} 
                            onChange={(e) => setPatternColor(e.target.value)} 
                          />
                          <code style={{ fontSize: '0.9rem' }}>{patternColor}</code>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Shoe Inner Sole Color</label>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <input 
                            type="color" 
                            className="form-input" 
                            style={{ width: '50px', height: '38px', padding: '0.2rem', cursor: 'pointer' }}
                            value={bgColor} 
                            onChange={(e) => setBgColor(e.target.value)} 
                          />
                          <code style={{ fontSize: '0.9rem' }}>{bgColor}</code>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 5. COLOR VARIANTS TAB */}
                {formTab === 'variants' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 0.3rem 0', color: '#0f172a' }}>Product Color Variants</h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Manage authentic color variants for this product. Each variant maintains its own real name, photo, pricing, SKU, and size inventory.
                      </p>
                    </div>

                    {/* Existing Variants List */}
                    {variantsList.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🎨</div>
                        <strong style={{ fontSize: '0.9rem', color: '#334155' }}>No custom color variants defined yet</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                          Add distinct color editions below (e.g. Tan, Dark Brown, Onyx Black) so customers can switch colors on the storefront.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {variantsList.map((v, i) => (
                          <div 
                            key={v.id || i} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '0.8rem 1rem', 
                              borderRadius: '8px', 
                              backgroundColor: '#f8fafc', 
                              border: '1px solid #e2e8f0',
                              gap: '1rem' 
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              <span style={{ 
                                width: '22px', 
                                height: '22px', 
                                borderRadius: '50%', 
                                backgroundColor: v.colorHex || '#333', 
                                border: '2px solid #fff', 
                                boxShadow: '0 0 0 1px #cbd5e1',
                                flexShrink: 0
                              }} />
                              <div>
                                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{v.name || v.color}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Color: <strong>{v.color}</strong> &bull; SKU: <code>{v.sku || '—'}</code> &bull; ₹{v.price} {v.originalPrice ? `(MRP ₹${v.originalPrice})` : ''}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span className={`status-badge ${v.stock === 'in-stock' ? 'delivered' : v.stock === 'low-stock' ? 'pending' : 'cancelled'}`} style={{ fontSize: '0.72rem' }}>
                                {v.stock === 'in-stock' ? 'In Stock' : v.stock === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setVariantsList(prev => prev.filter((_, idx) => idx !== i));
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--danger-color)',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  padding: '0.2rem 0.5rem'
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Variant Subform */}
                    <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.25rem', marginTop: '0.5rem' }}>
                      <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.92rem', color: 'var(--primary-color)' }}>➕ Add Variant Edition</h5>
                      
                      <div className="admin-form-row-2">
                        <div className="form-group">
                          <label className="form-label">Variant Name</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. Golden Mandala Heels - Warm Tan"
                            value={newVarName}
                            onChange={(e) => setNewVarName(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Color Name & Hex</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="e.g. Tan, Dark Brown, Black"
                              value={newVarColor}
                              onChange={(e) => setNewVarColor(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <input 
                              type="color" 
                              value={newVarColorHex}
                              onChange={(e) => setNewVarColorHex(e.target.value)}
                              style={{ width: '42px', height: '38px', padding: '0.2rem', cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="admin-form-row-3" style={{ marginTop: '0.8rem' }}>
                        <div className="form-group">
                          <label className="form-label">Price (₹)</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder={price || "1899"}
                            value={newVarPrice}
                            onChange={(e) => setNewVarPrice(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Original MRP (₹)</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder={originalPrice || "3199"}
                            value={newVarOriginalPrice}
                            onChange={(e) => setNewVarOriginalPrice(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">SKU</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. SLDX-PROD-11-TAN"
                            value={newVarSku}
                            onChange={(e) => setNewVarSku(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="admin-form-row-2" style={{ marginTop: '0.8rem' }}>
                        <div className="form-group">
                          <label className="form-label">Variant Photo</label>
                          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '48px', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', flexShrink: 0 }}>
                              {newVarImage ? (
                                <img src={newVarImage} alt="Variant Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: '1.2rem' }}>🎨</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                              <input 
                                type="file" 
                                accept="image/*" 
                                id="directVariantPhotoUpload" 
                                style={{ display: 'none' }}
                                onChange={handleVariantPhotoUpload}
                                disabled={isUploading}
                              />
                              <label 
                                htmlFor="directVariantPhotoUpload"
                                className="btn btn-outline"
                                style={{ 
                                  padding: '0.4rem 0.8rem', 
                                  fontSize: '0.78rem', 
                                  cursor: isUploading ? 'not-allowed' : 'pointer',
                                  whiteSpace: 'nowrap',
                                  opacity: isUploading ? 0.6 : 1
                                }}
                              >
                                {isUploading ? '⏳ Uploading...' : '📤 Upload Photo'}
                              </label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="or paste Image URL"
                                value={newVarImage}
                                onChange={(e) => setNewVarImage(e.target.value)}
                                style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Stock Status</label>
                          <select 
                            className="form-select"
                            value={newVarStock}
                            onChange={(e) => setNewVarStock(e.target.value)}
                          >
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginTop: '0.8rem' }}>
                        <label className="form-label">Available Sizes (Comma separated)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="5, 6, 7, 8, 9, 10"
                          value={newVarSizes}
                          onChange={(e) => setNewVarSizes(e.target.value)}
                        />
                      </div>

                      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                          onClick={() => {
                            if (!newVarColor.trim()) {
                              alert('Please provide a color name for this variant.');
                              return;
                            }
                            const vPrice = parseFloat(newVarPrice || price || '1299');
                            const vOrig = parseFloat(newVarOriginalPrice || originalPrice || String(vPrice + 900));
                            const vName = newVarName.trim() || `${name || 'Product'} - ${newVarColor.trim()}`;
                            const vSku = newVarSku.trim() || `SLX-${(newVarColor || 'VAR').toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
                            const varSizesArr = newVarSizes ? newVarSizes.split(',').map(s => s.trim()).filter(Boolean) : [5, 6, 7, 8, 9, 10];
                            
                            const createdVariant = {
                              id: `var-${Date.now()}`,
                              name: vName,
                              color: newVarColor.trim(),
                              colorHex: newVarColorHex,
                              price: vPrice,
                              originalPrice: vOrig,
                              sku: vSku,
                              image: newVarImage.trim() || image || '/assets/sandals.png',
                              gallery: [newVarImage.trim() || image || '/assets/sandals.png'],
                              sizes: varSizesArr,
                              sizeStock: varSizesArr.reduce((acc, sz) => ({ ...acc, [sz]: 10 }), {}),
                              stock: newVarStock,
                              desc: newVarDesc.trim() || desc || ''
                            };

                            setVariantsList(prev => [...prev, createdVariant]);
                            setNewVarName('');
                            setNewVarColor('');
                            setNewVarPrice('');
                            setNewVarOriginalPrice('');
                            setNewVarSku('');
                            setNewVarDesc('');
                          }}
                        >
                          ✓ Add Variant to List
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Action Buttons in Form Footer */}
            <div 
              style={{ 
                padding: '1.5rem 2rem', 
                borderTop: '1px solid #e2e8f0', 
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px'
              }}
            >
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ padding: '0.75rem 1.5rem' }}
                onClick={resetForm}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-accent" 
                style={{ padding: '0.75rem 1.5rem' }}
              >
                {editingProduct ? 'Save Product Details' : 'Publish Product'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Reusable Asset Media Selector Popups */}
      <MediaSelector 
        isOpen={isMainPickerOpen}
        onClose={() => setIsMainPickerOpen(false)}
        onSelect={(url) => setImage(url)}
        mode="single"
        initialSelection={image}
      />

      <MediaSelector 
        isOpen={isGalleryPickerOpen}
        onClose={() => setIsGalleryPickerOpen(false)}
        onSelect={(urls) => setGallery(urls.join(', '))}
        mode="multiple"
        initialSelection={gallery ? gallery.split(',').map(s => s.trim()).filter(Boolean) : []}
      />

    </div>
  );
}
