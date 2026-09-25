'use client';

import React, { useState, useEffect } from 'react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form input states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [parent, setParent] = useState('');
  
  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');

  const fetchCategories = async () => {
    try {
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

  // Helper to build hierarchy tree array (like WordPress)
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

  const hierarchicalCategories = buildHierarchy(categories);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setFormMsg('');
    setFormError('');

    if (!name || !slug) {
      setFormError('Please enter category name and slug.');
      return;
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          slug, 
          desc,
          parent: parent || null
        }),
      });
      const data = await res.json();

      if (data.success) {
        setFormMsg('Category added successfully!');
        setName('');
        setSlug('');
        setDesc('');
        setParent('');
        fetchCategories(); // Reload table
      } else {
        setFormError(data.error);
      }
    } catch (err) {
      setFormError('Network error. Failed to add category.');
    }
  };

  const handleDeleteCategory = async (slugVal) => {
    if (!confirm(`Are you sure you want to delete the category "${slugVal}"? All nested sub-categories will be set to top-level.`)) return;

    try {
      const res = await fetch(`/api/admin/categories?slug=${slugVal}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        alert('Category deleted successfully!');
        fetchCategories(); // Reload table
      } else {
        alert('Failed to delete: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Delete failed.');
    }
  };

  return (
    <div className="admin-split-layout">
      
      {/* Category Add Form */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>🏷️ Add New Category</h3>
        </div>
        
        {formMsg && <div style={{ padding: '0.8rem', backgroundColor: 'var(--success-light)', color: 'var(--success-color)', fontSize: '0.85rem', fontWeight: 600, borderRadius: '4px', marginBottom: '1rem' }}>{formMsg}</div>}
        {formError && <div style={{ padding: '0.8rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)', fontSize: '0.85rem', fontWeight: 600, borderRadius: '4px', marginBottom: '1rem' }}>{formError}</div>}

        <form onSubmit={handleAddCategory} className="contact-form" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Premium Sneakers"
              required 
              value={name} 
              onChange={handleNameChange} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category Slug</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. premium-sneakers"
              required 
              value={slug} 
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Category</label>
            <select
              className="filter-select"
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">— None (Top Level) —</option>
              {hierarchicalCategories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.depth > 0 ? "— ".repeat(cat.depth) : ""} {cat.name}
                </option>
              ))}
            </select>
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

          <button type="submit" className="btn btn-accent" style={{ padding: '0.8rem', width: '100%', marginTop: '1rem' }}>
            Insert Category
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>🏷️ Category Management</h3>
        </div>

        <div className="admin-table-wrapper" style={{ minHeight: '300px' }}>
          {error && <div style={{ padding: '1rem', color: 'var(--danger-color)', textAlign: 'center' }}>Error: {error}</div>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Parent Category</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Loading category records...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No categories found in MongoDB.</td>
                </tr>
              ) : (
                hierarchicalCategories.map((cat, idx) => (
                  <tr key={cat.slug || idx}>
                    <td style={{ paddingLeft: `${cat.depth * 1.5 + 1.2}rem` }}>
                      <strong style={{ color: cat.depth > 0 ? '#475569' : '#0f172a' }}>
                        {cat.depth > 0 ? "↳ " : ""}{cat.name}
                      </strong>
                    </td>
                    <td><code>{cat.slug}</code></td>
                    <td>
                      {cat.parent ? (
                        <span className="status-badge processing" style={{ fontSize: '0.75rem' }}>
                          {cat.parent}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cat.desc || '—'}</td>
                    <td>
                      {/* Prevent deleting core categories */}
                      {cat.slug !== 'mens' && cat.slug !== 'womens' ? (
                        <button 
                          className="btn btn-outline" 
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                          onClick={() => handleDeleteCategory(cat.slug)}
                        >
                          Delete
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>System Standard</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
