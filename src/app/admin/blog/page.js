'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // List view filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // View mode: 'list' or 'form'
  const [viewMode, setViewMode] = useState('list');
  const [editingBlog, setEditingBlog] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Footwear Care');
  const [author, setAuthor] = useState('SlideEase Editorial Team');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');
  const [previewTab, setPreviewTab] = useState('edit'); // 'edit' or 'preview'

  // Image Drag & Drop states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const CATEGORIES = [
    'Footwear Care',
    'Latest Trends',
    'Buying Guides',
    'Heritage Craft',
    'Artisan Stories',
    'Styling Advice'
  ];

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/blogs');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data || []);
      } else {
        setError(data.error || 'Failed to load blogs');
      }
    } catch (err) {
      setError('Connection failure while loading blogs');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Auto-slugify title helper
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingBlog) {
      setSlug(slugify(val));
    }
  };

  // Open Form to Add New Blog
  const handleAddNewBlog = () => {
    setEditingBlog(null);
    setTitle('');
    setSlug('');
    setCoverImage('');
    setCategory('Footwear Care');
    setAuthor('SlideEase Editorial Team');
    setExcerpt('');
    setContent('');
    setStatus('published');
    setPreviewTab('edit');
    setViewMode('form');
  };

  // Open Form to Edit Existing Blog
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setTitle(blog.title || '');
    setSlug(blog.slug || '');
    setCoverImage(blog.coverImage || '');
    setCategory(blog.category || 'Footwear Care');
    setAuthor(blog.author || 'SlideEase Editorial Team');
    setExcerpt(blog.excerpt || '');
    setContent(blog.content || '');
    setStatus(blog.status || 'published');
    setPreviewTab('edit');
    setViewMode('form');
  };

  // Image Upload via API
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setCoverImage(data.url);
        showNotification('Cover image uploaded successfully!');
      } else {
        alert(data.error || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      alert('Error uploading image to server');
    } finally {
      setUploadingImage(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Editor toolbar helper
  const insertFormatting = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Save Blog
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a blog title.');
      return;
    }
    if (!content.trim()) {
      alert('Please enter the blog article content.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        customSlug: slug.trim() || slugify(title),
        coverImage: coverImage.trim() || '/og_image.png',
        category,
        author: author.trim() || 'SlideEase Editorial Team',
        excerpt: excerpt.trim() || title.trim(),
        content: content.trim(),
        status
      };

      const url = '/api/admin/blogs';
      const method = editingBlog ? 'PUT' : 'POST';
      if (editingBlog) {
        payload.id = editingBlog.id || editingBlog._id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showNotification(editingBlog ? 'Blog article updated successfully!' : 'New blog article created and saved!');
        setViewMode('list');
        fetchBlogs();
      } else {
        alert(data.error || 'Failed to save blog post');
      }
    } catch (err) {
      alert('Connection error while saving blog');
    } finally {
      setSaving(false);
    }
  };

  // Delete Blog prompt
  const confirmDelete = (blog) => {
    setBlogToDelete(blog);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!blogToDelete) return;

    const id = blogToDelete.id || blogToDelete._id || blogToDelete.slug;
    try {
      const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Blog article deleted successfully', 'info');
        setDeleteModalOpen(false);
        setBlogToDelete(null);
        fetchBlogs();
      } else {
        alert(data.error || 'Failed to delete blog article');
      }
    } catch (err) {
      alert('Connection failure while deleting blog');
    }
  };

  // Toggle quick status (Publish / Unpublish)
  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: blog.id || blog._id,
          title: blog.title,
          status: newStatus
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Blog ${newStatus === 'published' ? 'published to live store' : 'moved to drafts'}`);
        fetchBlogs();
      } else {
        alert(data.error || 'Failed to update blog status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  // Filtered blogs
  const filteredBlogs = blogs.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchQuery =
      (b.title && b.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.slug && b.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchQuery;
  });

  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.status === 'published').length;
  const draftCount = blogs.filter((b) => b.status === 'draft').length;

  return (
    <div style={{ width: '100%' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: notification.type === 'info' ? 'var(--primary-color)' : '#10b981',
          color: '#ffffff',
          padding: '0.85rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          fontWeight: 600,
          fontSize: '0.9rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <span>{notification.type === 'info' ? 'ℹ️' : '✓'}</span> {notification.msg}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && blogToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 22, 40, 0.7)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 0.8rem 0', color: 'var(--danger-color)', fontSize: '1.25rem' }}>
              ⚠️ Delete Blog Article
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Are you sure you want to permanently delete <strong>&ldquo;{blogToDelete.title}&rdquo;</strong>?
              This will remove the article from the customer-facing website and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => { setDeleteModalOpen(false); setBlogToDelete(null); }}
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={executeDelete}
                style={{
                  backgroundColor: 'var(--danger-color)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                Yes, Delete Blog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: BLOG LIST & OVERVIEW */}
      {viewMode === 'list' && (
        <>
          {/* Header & Stats Banner */}
          <div className="admin-page-header">
            <div>
              <h2 style={{ margin: '0 0 0.35rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--primary-color)' }}>
                📖 Blog Management System
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Write, publish, edit, and organize editorial fashion guides and shoe care articles for SlideEase.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <Link
                href="/blog"
                target="_blank"
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>↗</span> Live Blog
              </Link>
              <button
                type="button"
                onClick={handleAddNewBlog}
                className="btn btn-accent"
                style={{ padding: '0.6rem 1.35rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <span>➕</span> Add New Blog
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div className="admin-card" style={{ padding: '1.2rem', margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Articles</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '0.2rem' }}>{totalCount}</div>
            </div>
            <div className="admin-card" style={{ padding: '1.2rem', margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Published (Live)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>{publishedCount}</div>
            </div>
            <div className="admin-card" style={{ padding: '1.2rem', margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Drafts</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>{draftCount}</div>
            </div>
          </div>

          {/* Search, Filter & List Card */}
          <div className="admin-card" style={{ margin: 0 }}>
            {/* Filter toolbar */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {/* Status tabs */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: statusFilter === 'all' ? 'var(--primary-color)' : 'var(--border-color)',
                    backgroundColor: statusFilter === 'all' ? 'var(--primary-color)' : '#fff',
                    color: statusFilter === 'all' ? '#fff' : 'var(--text-dark)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('published')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: statusFilter === 'published' ? '#16a34a' : 'var(--border-color)',
                    backgroundColor: statusFilter === 'published' ? '#16a34a' : '#fff',
                    color: statusFilter === 'published' ? '#fff' : 'var(--text-dark)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Published ({publishedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('draft')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: statusFilter === 'draft' ? '#d97706' : 'var(--border-color)',
                    backgroundColor: statusFilter === 'draft' ? '#d97706' : '#fff',
                    color: statusFilter === 'draft' ? '#fff' : 'var(--text-dark)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Drafts ({draftCount})
                </button>
              </div>

              {/* Search input */}
              <div style={{ minWidth: '240px' }}>
                <input
                  type="text"
                  placeholder="Search articles by title or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="customer-table-desktop">
              <div className="admin-table-wrapper" style={{ minHeight: '300px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    Loading articles catalog...
                  </div>
                ) : filteredBlogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: '0 0 1rem 0' }}>No blog articles match your search or filter.</p>
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={handleAddNewBlog}
                      style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
                    >
                      + Create First Blog
                    </button>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Cover</th>
                        <th>Title &amp; URL Slug</th>
                        <th>Category</th>
                        <th>Visibility</th>
                        <th>Published Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBlogs.map((blog) => {
                        const dateStr = blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—';

                        return (
                          <tr key={blog.id || blog._id || blog.slug}>
                            <td>
                              <div style={{
                                width: '64px',
                                height: '44px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                backgroundColor: '#f1ede4',
                                border: '1px solid var(--border-color)'
                              }}>
                                <img
                                  src={blog.coverImage || '/og_image.png'}
                                  alt={blog.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.92rem' }}>
                                {blog.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                <code>/blog/{blog.slug}</code>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                backgroundColor: '#f1f5f9',
                                color: '#334155',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.76rem',
                                fontWeight: 600
                              }}>
                                {blog.category || 'General'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(blog)}
                                title="Click to toggle publish status"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  border: 'none',
                                  padding: '0.3rem 0.75rem',
                                  borderRadius: '50px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  backgroundColor: blog.status === 'published' ? '#dcfce7' : '#fef3c7',
                                  color: blog.status === 'published' ? '#15803d' : '#b45309'
                                }}
                              >
                                <span>{blog.status === 'published' ? '●' : '○'}</span>
                                {blog.status === 'published' ? 'Published' : 'Draft'}
                              </button>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              {dateStr}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                                {blog.status === 'published' && (
                                  <Link
                                    href={`/blog/${blog.slug}`}
                                    target="_blank"
                                    className="btn btn-outline"
                                    style={{
                                      padding: '0.35rem 0.65rem',
                                      fontSize: '0.75rem',
                                      borderRadius: '4px',
                                      textDecoration: 'none',
                                      color: 'var(--accent-color)',
                                      borderColor: 'var(--border-color)'
                                    }}
                                    title="View Live Article"
                                  >
                                    👁️ View
                                  </Link>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleEditBlog(blog)}
                                  className="btn btn-outline"
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.75rem',
                                    borderRadius: '4px',
                                    color: 'var(--primary-color)',
                                    borderColor: 'var(--border-color)'
                                  }}
                                  title="Edit Blog"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => confirmDelete(blog)}
                                  className="btn btn-outline"
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.75rem',
                                    borderRadius: '4px',
                                    color: 'var(--danger-color)',
                                    borderColor: 'var(--danger-color)'
                                  }}
                                  title="Delete Blog"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="customer-cards-mobile">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Loading articles...
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  No blog articles found.
                </div>
              ) : (
                filteredBlogs.map((blog) => (
                  <div key={blog.id || blog._id || blog.slug} className="customer-card">
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '70px',
                        height: '52px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#f1ede4',
                        flexShrink: 0
                      }}>
                        <img
                          src={blog.coverImage || '/og_image.png'}
                          alt={blog.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-color)' }}>
                          {blog.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          <code>/blog/{blog.slug}</code>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{
                        backgroundColor: '#f1f5f9',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        {blog.category || 'General'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(blog)}
                        style={{
                          border: 'none',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '50px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: blog.status === 'published' ? '#dcfce7' : '#fef3c7',
                          color: blog.status === 'published' ? '#15803d' : '#b45309'
                        }}
                      >
                        {blog.status === 'published' ? '● Published' : '○ Draft'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.7rem' }}>
                      {blog.status === 'published' && (
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className="btn btn-outline"
                          style={{ flex: 1, textAlign: 'center', padding: '0.45rem', fontSize: '0.78rem', textDecoration: 'none' }}
                        >
                          👁️ View Live
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditBlog(blog)}
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(blog)}
                        className="btn btn-outline"
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Add More Button */}
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-accent"
                onClick={handleAddNewBlog}
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                + Add More Blog
              </button>
            </div>
          </div>
        </>
      )}

      {/* VIEW MODE 2: CREATE / EDIT BLOG CMS FORM */}
      {viewMode === 'form' && (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Top Form Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-color)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '0.4rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                ← Back to Blog List
              </button>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--primary-color)' }}>
                {editingBlog ? '✏️ Edit Blog Article' : '✨ Write New Blog Article'}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBlog}
                disabled={saving}
                className="btn btn-accent"
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {saving ? 'Saving Article...' : status === 'published' ? 'Publish Article 🚀' : 'Save As Draft 💾'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveBlog}>
            {/* 1. COVER IMAGE UPLOAD (DRAG & DROP) */}
            <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.6rem' }}>
                Featured Cover Image *
              </label>

              {coverImage ? (
                <div style={{ position: 'relative', width: '100%', maxHeight: '340px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: '#f1ede4' }}>
                  <img
                    src={coverImage}
                    alt="Cover Preview"
                    style={{ width: '100%', height: '100%', maxHeight: '340px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '0.8rem',
                    right: '0.8rem',
                    display: 'flex',
                    gap: '0.5rem',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '0.4rem',
                    borderRadius: '6px'
                  }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#fff', color: 'var(--primary-color)' }}
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="btn"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--danger-color)', color: '#fff', border: 'none' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--accent-color)' : '#cbd5e1'}`,
                    backgroundColor: isDragging ? 'rgba(217, 119, 6, 0.05)' : '#f8fafc',
                    borderRadius: '10px',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                    {uploadingImage ? '⏳' : '🖼️'}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-color)', marginBottom: '0.35rem' }}>
                    {uploadingImage ? 'Uploading image to storage...' : 'Drag & Drop your cover image here'}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    or <span style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'underline' }}>browse from your computer</span> (PNG, JPG, WebP)
                  </p>
                </div>
              )}
            </div>

            {/* 2. ARTICLE META DETAILS */}
            <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.4rem' }}>
                  Blog Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to Care for Vegan Leather Shoes in Monsoon"
                  value={title}
                  onChange={handleTitleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Slug & Category grid */}
              <div className="admin-form-row-2" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                    URL Slug
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '0.65rem 0.75rem', backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      /blog/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="article-url-slug"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.75rem',
                        borderRadius: '0 6px 6px 0',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Author & Visibility grid */}
              <div className="admin-form-row-2" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                    Author / Byline
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="SlideEase Editorial Team"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                    Visibility / Publish Status
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                    <label style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '6px',
                      border: `1.5px solid ${status === 'published' ? '#16a34a' : 'var(--border-color)'}`,
                      backgroundColor: status === 'published' ? '#f0fdf4' : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: status === 'published' ? '#16a34a' : 'inherit'
                    }}>
                      <input
                        type="radio"
                        name="blogStatus"
                        value="published"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                      />
                      <span>● Published (Live)</span>
                    </label>

                    <label style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '6px',
                      border: `1.5px solid ${status === 'draft' ? '#d97706' : 'var(--border-color)'}`,
                      backgroundColor: status === 'draft' ? '#fffbeb' : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: status === 'draft' ? '#d97706' : 'inherit'
                    }}>
                      <input
                        type="radio"
                        name="blogStatus"
                        value="draft"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                      />
                      <span>○ Draft (Hidden)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                  Short Excerpt / Preview Summary
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise 1-2 sentence preview shown on card listings and social media..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* 3. PROFESSIONAL CONTENT EDITOR */}
            <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  Blog Article Content *
                </label>

                {/* Edit vs Preview Toggle */}
                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('edit')}
                    style={{
                      padding: '0.35rem 0.9rem',
                      border: 'none',
                      backgroundColor: previewTab === 'edit' ? 'var(--primary-color)' : '#fff',
                      color: previewTab === 'edit' ? '#fff' : 'var(--text-dark)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Content Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('preview')}
                    style={{
                      padding: '0.35rem 0.9rem',
                      border: 'none',
                      backgroundColor: previewTab === 'preview' ? 'var(--primary-color)' : '#fff',
                      color: previewTab === 'preview' ? '#fff' : 'var(--text-dark)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    👁️ Formatted Preview
                  </button>
                </div>
              </div>

              {previewTab === 'edit' ? (
                <>
                  {/* Rich Editing Toolbar */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.35rem',
                    padding: '0.5rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderBottom: 'none',
                    borderRadius: '6px 6px 0 0'
                  }}>
                    <button
                      type="button"
                      onClick={() => insertFormatting('## ', '\n', 'Section Heading')}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('### ', '\n', 'Sub-heading')}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <span style={{ borderRight: '1px solid #cbd5e1', margin: '0 0.2rem' }} />
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**', 'bold text')}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                      title="Bold"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*', 'italic text')}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontStyle: 'italic' }}
                      title="Italic"
                    >
                      <em>I</em>
                    </button>
                    <span style={{ borderRight: '1px solid #cbd5e1', margin: '0 0.2rem' }} />
                    <button
                      type="button"
                      onClick={() => insertFormatting('> "', '"', 'Artisan quotation or tip...')}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Blockquote"
                    >
                      &ldquo; Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('* ', '\n', 'List item')}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Bulleted List"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('1. ', '\n', 'Step one')}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Numbered List"
                    >
                      1. List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('[', '](https://example.com)', 'Link label')}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Insert Link"
                    >
                      🔗 Link
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n---\n\n', '', '')}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Divider line"
                    >
                      — Line
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={16}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Write your article here...\n\n## Introduction\nStart with an engaging overview of the topic...\n\n### Practical Recommendations\n* Point one with specific details\n* Point two with care tips\n\n> "An inspirational quote or craftsman philosophy..."\n\nConclude with advice for SlideEase conscious footwear enthusiasts.`}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0 0 6px 6px',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      lineHeight: 1.7,
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Formatting shortcuts: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>* list</code>, <code>&gt; quote</code></span>
                    <span>{content.trim() ? `${content.trim().split(/\s+/).length} words` : '0 words'}</span>
                  </div>
                </>
              ) : (
                /* Live Preview Window */
                <div style={{
                  padding: '2rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  minHeight: '350px'
                }}>
                  {title && (
                    <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.8rem', marginBottom: '1rem' }}>
                      {title}
                    </h1>
                  )}
                  {excerpt && (
                    <p style={{ fontSize: '1.05rem', color: '#64748b', fontStyle: 'italic', marginBottom: '2rem' }}>
                      {excerpt}
                    </p>
                  )}
                  {content ? (
                    <div style={{ lineHeight: 1.8, fontSize: '0.95rem', color: '#334155' }}>
                      {content.split(/\n\s*\n/).map((block, i) => {
                        const trimmed = block.trim();
                        if (!trimmed) return null;
                        if (trimmed.startsWith('## ')) {
                          return <h2 key={i} style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>{trimmed.replace(/^##\s+/, '')}</h2>;
                        }
                        if (trimmed.startsWith('### ')) {
                          return <h3 key={i} style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginTop: '1.2rem', marginBottom: '0.5rem' }}>{trimmed.replace(/^###\s+/, '')}</h3>;
                        }
                        if (trimmed.startsWith('> ')) {
                          return <blockquote key={i} style={{ borderLeft: '3px solid var(--accent-color)', paddingLeft: '1rem', fontStyle: 'italic', color: 'var(--primary-color)', margin: '1rem 0' }}>{trimmed.replace(/^>\s+/, '')}</blockquote>;
                        }
                        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                          const items = trimmed.split('\n');
                          return (
                            <ul key={i} style={{ paddingLeft: '1.5rem', margin: '0.8rem 0' }}>
                              {items.map((it, j) => <li key={j}>{it.replace(/^[\*\-]\s+/, '')}</li>)}
                            </ul>
                          );
                        }
                        return <p key={i} style={{ marginBottom: '1rem' }}>{trimmed}</p>;
                      })}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '3rem' }}>
                      No content written yet. Switch to Content Editor to write your article.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', paddingBottom: '3rem' }}>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="btn btn-outline"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-accent"
                style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', fontWeight: 700 }}
              >
                {saving ? 'Saving...' : status === 'published' ? 'Publish Article 🚀' : 'Save As Draft 💾'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
