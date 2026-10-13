'use client';

import React, { useState, useEffect, useMemo } from 'react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter
  const [searchFilter, setSearchFilter] = useState('');
  const [parentFilter, setParentFilter] = useState('all');

  // Form input states (Create)
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [parent, setParent] = useState('');
  const [displayOrder, setDisplayOrder] = useState('10');
  
  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editParent, setEditParent] = useState('');
  const [editDisplayOrder, setEditDisplayOrder] = useState('10');
  const [editMsg, setEditMsg] = useState('');
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Safe Delete Modal State
  const [deleteConfirmCat, setDeleteConfirmCat] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError('Failed to fetch categories list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  // Helper to build hierarchy tree array
  const buildHierarchy = (items) => {
    const roots = items.filter(item => !item.parent);
    const result = [];
    
    const traverse = (parentSlug, depth = 0) => {
      const children = items.filter(item => item.parent === parentSlug);
      children.forEach(child => {
        result.push({ ...child, depth });
        traverse(child.slug, depth + 1);
      });
    };
    
    roots.forEach(root => {
      result.push({ ...root, depth: 0 });
      traverse(root.slug, 1);
    });
    
    // Safety check for orphaned items (loops or missing references)
    const addedSlugs = new Set(result.map(r => r.slug));
    const orphans = items.filter(item => item.parent && !addedSlugs.has(item.slug));
    orphans.forEach(orphan => {
      result.push({ ...orphan, depth: 0 });
    });
    
    return result;
  };

  const hierarchicalCategories = useMemo(() => buildHierarchy(categories), [categories]);

  // Filtered categories for table display
  const displayedCategories = useMemo(() => {
    return hierarchicalCategories.filter(cat => {
      const matchSearch = searchFilter === '' || 
        cat.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (cat.desc && cat.desc.toLowerCase().includes(searchFilter.toLowerCase()));
      
      const matchParent = parentFilter === 'all' || 
        (parentFilter === 'root' && !cat.parent) ||
        (cat.parent === parentFilter);
      
      return matchSearch && matchParent;
    });
  }, [hierarchicalCategories, searchFilter, parentFilter]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setFormMsg('');
    setFormError('');

    if (!name || !slug) {
      setFormError('Please enter category name and slug.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          slug, 
          desc,
          parent: parent || null,
          displayOrder: parseInt(displayOrder, 10) || 10
        }),
      });
      const data = await res.json();

      if (data.success) {
        setFormMsg(`Category "${name}" added successfully!`);
        setName('');
        setSlug('');
        setDesc('');
        setParent('');
        setDisplayOrder('10');
        fetchCategories(); // Reload table
      } else {
        setFormError(data.error);
      }
    } catch (err) {
      setFormError('Network error. Failed to add category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name || '');
    setEditSlug(cat.slug || '');
    setEditDesc(cat.desc || '');
    setEditParent(cat.parent || '');
    setEditDisplayOrder(String(cat.displayOrder || '10'));
    setEditMsg('');
    setEditError('');
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    setEditMsg('');
    setEditError('');

    try {
      setIsUpdating(true);
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory._id,
          oldSlug: editingCategory.slug,
          name: editName,
          slug: editSlug,
          desc: editDesc,
          parent: editParent || null,
          displayOrder: parseInt(editDisplayOrder, 10) || 10,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setEditMsg('Category updated successfully!');
        setTimeout(() => {
          setEditingCategory(null);
          fetchCategories();
        }, 800);
      } else {
        setEditError(data.error);
      }
    } catch (err) {
      setEditError('Network error. Failed to update category.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openDeleteModal = (cat) => {
    setDeleteConfirmCat(cat);
    setDeleteError('');
  };

  const handleExecuteDelete = async (force = false) => {
    if (!deleteConfirmCat) return;

    try {
      setIsDeleting(true);
      setDeleteError('');
      const res = await fetch(`/api/admin/categories?slug=${deleteConfirmCat.slug}${force ? '&force=true' : ''}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setDeleteConfirmCat(null);
        fetchCategories(); // Reload table
      } else {
        setDeleteError(data.error);
      }
    } catch (err) {
      setDeleteError('Network error. Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Top Banner / Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--primary-color)' }}>
            🏷️ Category & Catalog Hierarchy
          </h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage root collections (Men, Women) and subcategories. Changes synchronize directly with live storefront menus and product filters.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={fetchCategories}
            disabled={loading}
            style={{ fontSize: '0.85rem' }}
          >
            🔄 Refresh List
          </button>
        </div>
      </div>

      <div className="admin-split-layout">
        
        {/* Category Add Form */}
        <div className="admin-card" style={{ height: 'fit-content' }}>
          <div className="admin-card-header">
            <h3>➕ Add New Category</h3>
          </div>
          
          {formMsg && (
            <div style={{ padding: '0.8rem', backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '0.85rem', fontWeight: 600, borderRadius: '6px', marginBottom: '1rem', border: '1px solid #a7f3d0' }}>
              ✓ {formMsg}
            </div>
          )}
          {formError && (
            <div style={{ padding: '0.8rem', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600, borderRadius: '6px', marginBottom: '1rem', border: '1px solid #fecaca' }}>
              ⚠ {formError}
            </div>
          )}

          <form onSubmit={handleAddCategory} className="contact-form" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category Name <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Traditional Mojris"
                required 
                value={name} 
                onChange={handleNameChange} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category Slug <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. traditional-mojris"
                required 
                value={slug} 
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))} 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Used in URL: /shop?category={slug || '...'}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Parent Category</label>
              <select
                className="filter-select"
                value={parent}
                onChange={(e) => setParent(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">— None (Top Level Root Collection) —</option>
                {hierarchicalCategories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.depth > 0 ? "— ".repeat(cat.depth) : ""} {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input 
                type="number" 
                className="form-input" 
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min="0"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                rows={3} 
                className="form-input" 
                placeholder="Brief summary of category styles"
                value={desc} 
                onChange={(e) => setDesc(e.target.value)}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-accent" 
              style={{ padding: '0.8rem', width: '100%', marginTop: '0.5rem', fontWeight: 600 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Category...' : '➕ Insert Category'}
            </button>
          </form>
        </div>

        {/* Category List */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <h3>📋 Categories ({categories.length})</h3>
            
            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="🔍 Search categories..." 
                className="form-input"
                style={{ padding: '0.35rem 0.7rem', fontSize: '0.85rem', width: '180px' }}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              <select 
                className="filter-select"
                style={{ padding: '0.35rem 0.7rem', fontSize: '0.85rem' }}
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
              >
                <option value="all">All Groups</option>
                <option value="root">Roots Only</option>
                <option value="mens">Under Men's</option>
                <option value="womens">Under Women's</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrapper" style={{ minHeight: '350px', overflowX: 'auto' }}>
            {error && <div style={{ padding: '1rem', color: 'var(--danger-color)', textAlign: 'center' }}>Error: {error}</div>}

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Parent</th>
                  <th>Products</th>
                  <th>Order</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Loading category records from MongoDB...
                    </td>
                  </tr>
                ) : displayedCategories.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      {searchFilter || parentFilter !== 'all' ? 'No categories matching filter.' : 'No categories found in MongoDB.'}
                    </td>
                  </tr>
                ) : (
                  displayedCategories.map((cat, idx) => (
                    <tr key={cat.slug || idx}>
                      <td style={{ paddingLeft: `${cat.depth * 1.5 + 1}rem` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: cat.depth > 0 ? '#475569' : '#0f172a', fontSize: cat.depth === 0 ? '0.95rem' : '0.9rem' }}>
                            {cat.depth > 0 ? "↳ " : ""}{cat.name}
                          </strong>
                          {cat.depth === 0 && (
                            <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              ROOT
                            </span>
                          )}
                        </div>
                        {cat.desc && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cat.desc}
                          </div>
                        )}
                      </td>
                      <td>
                        <code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 5px', borderRadius: '3px' }}>{cat.slug}</code>
                      </td>
                      <td>
                        {cat.parent ? (
                          <span className="status-badge processing" style={{ fontSize: '0.75rem' }}>
                            {cat.parent}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>— Root —</span>
                        )}
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.78rem', 
                          fontWeight: 600, 
                          color: (cat.productCount || 0) > 0 ? 'var(--primary-color)' : 'var(--text-muted)',
                          background: (cat.productCount || 0) > 0 ? '#f0fdf4' : '#f8fafc',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: `1px solid ${(cat.productCount || 0) > 0 ? '#bbf7d0' : '#e2e8f0'}`
                        }}>
                          {cat.productCount || 0} prods
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {cat.displayOrder || 10}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => openEditModal(cat)}
                          >
                            ✏️ Edit
                          </button>
                          
                          {cat.slug !== 'mens' && cat.slug !== 'womens' ? (
                            <button 
                              className="btn btn-outline" 
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--danger-color)', borderColor: '#fca5a5' }}
                              onClick={() => openDeleteModal(cat)}
                            >
                              🗑️ Delete
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', alignSelf: 'center', padding: '0 4px' }}>
                              Protected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.2rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                ✏️ Edit Category: {editingCategory.name}
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingCategory(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {editMsg && (
                <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ {editMsg}
                </div>
              )}
              {editError && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚠ {editError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slug</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  disabled={editingCategory.slug === 'mens' || editingCategory.slug === 'womens'}
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                />
                {(editingCategory.slug === 'mens' || editingCategory.slug === 'womens') && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Root slug is locked to protect store routing.</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Parent Category</label>
                <select
                  className="filter-select"
                  value={editParent}
                  disabled={editingCategory.slug === 'mens' || editingCategory.slug === 'womens'}
                  onChange={(e) => setEditParent(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">— None (Top Level Root) —</option>
                  {hierarchicalCategories
                    .filter(c => c.slug !== editingCategory.slug)
                    .map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.depth > 0 ? "— ".repeat(cat.depth) : ""} {cat.name} ({cat.slug})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editDisplayOrder}
                  onChange={(e) => setEditDisplayOrder(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  rows={3} 
                  className="form-input" 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-accent" 
                  disabled={isUpdating}
                  style={{ minWidth: '130px' }}
                >
                  {isUpdating ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFE DELETE CONFIRMATION MODAL */}
      {deleteConfirmCat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '1.2rem 1.5rem',
              borderBottom: '1px solid #fee2e2',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#991b1b' }}>
                Confirm Category Deletion
              </h3>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete category <strong>&quot;{deleteConfirmCat.name}&quot;</strong> (<code>{deleteConfirmCat.slug}</code>)?
              </p>

              {(deleteConfirmCat.productCount || 0) > 0 ? (
                <div style={{ padding: '0.8rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', color: '#9a3412', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                  <strong>Safety Notice:</strong> There are <strong>{deleteConfirmCat.productCount} products</strong> associated with this category.
                  Deleting it could orphan these products. To proceed, please reassign those products first or confirm below.
                </div>
              ) : (
                <div style={{ padding: '0.8rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                  ✓ No products are currently assigned to this category. Safe to delete.
                </div>
              )}

              {deleteError && (
                <div style={{ padding: '0.8rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  ⚠ {deleteError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setDeleteConfirmCat(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '0.5rem 1rem' }}
                  onClick={() => handleExecuteDelete(false)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : '🗑️ Delete Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
