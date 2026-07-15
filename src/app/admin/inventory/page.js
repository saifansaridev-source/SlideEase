'use client';

import React, { useState, useEffect } from 'react';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');

  // Track local edits of stock status per product (for fast inline changes)
  const [localStocks, setLocalStocks] = useState({});

  // WordPress Inventory Modal States
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [sku, setSku] = useState('');
  const [manageStock, setManageStock] = useState(true);
  const [stockQty, setStockQty] = useState('50');
  const [stockStatus, setStockStatus] = useState('in-stock');
  const [allowBackorders, setAllowBackorders] = useState('no');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [soldIndividually, setSoldIndividually] = useState(false);

  const fetchInventory = async () => {
    try {
      // Fetch categories
      const catRes = await fetch('/api/admin/categories');
      const catJson = await catRes.json();
      if (catJson.success) {
        setCategories(catJson.data);
      }

      // Fetch all products
      const prodRes = await fetch('/api/products?category=all');
      const prodJson = await prodRes.json();
      if (prodJson.success) {
        setProducts(prodJson.data);

        // Initialize local stock state maps
        const stocksMap = {};
        prodJson.data.forEach((p) => {
          stocksMap[p.id] = p.stock || 'in-stock';
        });
        setLocalStocks(stocksMap);
      } else {
        setError(prodJson.error);
      }
    } catch (err) {
      setError('Failed to fetch inventory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (productId, newStock) => {
    setLocalStocks((prev) => ({
      ...prev,
      [productId]: newStock
    }));
  };

  const handleSaveStock = async (productId) => {
    const updatedStock = localStocks[productId];
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, stock: updatedStock }),
      });
      const data = await res.json();

      if (data.success) {
        alert('Stock status updated successfully!');

        // Update product in local products array
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: updatedStock } : p))
        );
      } else {
        alert('Failed to update stock: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Failed to update stock.');
    }
  };

  // Open WordPress Inventory Edit Popup Modal
  const handleOpenModal = (product) => {
    setSku(product.sku || `SLX-${product.id.toUpperCase()}`);
    setManageStock(product.manageStock === undefined ? true : !!product.manageStock);
    setStockQty(product.stockQty === undefined ? '50' : String(product.stockQty));
    setStockStatus(product.stock || 'in-stock');
    setAllowBackorders(product.allowBackorders || 'no');
    setLowStockThreshold(product.lowStockThreshold === undefined ? '10' : String(product.lowStockThreshold));
    setSoldIndividually(!!product.soldIndividually);
    setSelectedProductForModal(product);
  };

  // Save Modal Inventory Settings to Database
  const handleSaveModalInventory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProductForModal.id,
          sku,
          manageStock,
          stockQty: manageStock ? (parseInt(stockQty) || 0) : 0,
          stock: stockStatus,
          allowBackorders,
          lowStockThreshold: manageStock ? (parseInt(lowStockThreshold) || 10) : 10,
          soldIndividually
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert('Inventory settings saved successfully!');
        setSelectedProductForModal(null);
        fetchInventory(); // Refresh layout items
      } else {
        alert('Failed to save settings: ' + data.error);
      }
    } catch (err) {
      alert('Network error. Failed to save inventory settings.');
    }
  };

  // Filtering Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;

    let matchesStock = true;
    if (selectedStock !== 'all') {
      matchesStock = p.stock === selectedStock;
    }

    return matchesSearch && matchesCat && matchesStock;
  });

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>📊 E-Commerce Inventory & Stock Levels</h3>

          {/* Filtering & Search Bars */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', marginTop: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search footwear name..."
              className="form-input"
              style={{ flex: 2, minWidth: '200px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="filter-select"
              style={{ flex: 1, minWidth: '150px' }}
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <select
              className="filter-select"
              style={{ flex: 1, minWidth: '150px' }}
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
            >
              <option value="all">All Stock Statuses</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper" style={{ minHeight: '300px' }}>
          {error && <div style={{ padding: '1rem', color: 'var(--danger-color)', textAlign: 'center' }}>Error: {error}</div>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Action Panel</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>Fetching database stock metrics...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>No products match your search or filter options.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const currentLocalStock = localStocks[p.id] || p.stock;
                  const hasChanges = currentLocalStock !== p.stock;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ width: '45px', height: '45px', borderRadius: '4px', overflow: 'hidden', backgroundColor: p.bgColor || '#fcfbf7' }}>
                          <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong
                            style={{ cursor: 'pointer', color: 'var(--accent-color)', textDecoration: 'underline' }}
                            onClick={() => handleOpenModal(p)}
                            title="Click to manage advanced WordPress-style inventory settings"
                          >
                            {p.name}
                          </strong>
                          <br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            SKU: {p.sku || `SLX-${p.id.toUpperCase()}`}
                          </span>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                      <td>₹{p.price}</td>
                      <td>
                        <select
                          value={currentLocalStock}
                          onChange={(e) => handleStockChange(p.id, e.target.value)}
                          className="filter-select"
                          style={{
                            fontSize: '0.85rem',
                            padding: '0.3rem 0.5rem',
                            width: '140px',
                            border: hasChanges ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                            backgroundColor: hasChanges ? '#fffbeb' : '#fff'
                          }}
                        >
                          <option value="in-stock">In Stock</option>
                          <option value="low-stock">Low Stock</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.35rem 0.8rem',
                            backgroundColor: hasChanges ? 'var(--accent-color)' : 'var(--primary-color)',
                            borderColor: hasChanges ? 'var(--accent-color)' : 'var(--primary-color)',
                            opacity: hasChanges ? 1 : 0.65,
                            cursor: hasChanges ? 'pointer' : 'default'
                          }}
                          disabled={!hasChanges}
                          onClick={() => handleSaveStock(p.id)}
                        >
                          {hasChanges ? 'Save Changes' : 'Saved'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Settings Popup Modal */}
      {selectedProductForModal && (
        <div className="admin-modal-overlay active" onClick={() => setSelectedProductForModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="admin-modal-header">
              <h3>📦 Inventory Settings</h3>
              <button className="admin-modal-close" onClick={() => setSelectedProductForModal(null)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Editing product: <strong>{selectedProductForModal.name}</strong>
              </p>

              <form onSubmit={handleSaveModalInventory} className="contact-form" style={{ gap: '1.2rem', padding: 0 }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">SKU (Stock Keeping Unit)</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Status</label>
                    <select
                      className="filter-select"
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value)}
                    >
                      <option value="in-stock">In Stock</option>
                      <option value="low-stock">Low Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="manageStock"
                    checked={manageStock}
                    onChange={(e) => setManageStock(e.target.checked)}
                  />
                  <label htmlFor="manageStock">
                    Track stock quantity for this product
                  </label>
                </div>

                {manageStock && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Stock Quantity</label>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          required
                          value={stockQty}
                          onChange={(e) => setStockQty(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Low Stock Threshold</label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          required
                          value={lowStockThreshold}
                          onChange={(e) => setLowStockThreshold(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Allow Backorders?</label>
                      <select
                        className="filter-select"
                        value={allowBackorders}
                        onChange={(e) => setAllowBackorders(e.target.value)}
                      >
                        <option value="no">Do not allow</option>
                        <option value="notify">Allow, but notify customer</option>
                        <option value="yes">Allow</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="soldIndividually"
                    checked={soldIndividually}
                    onChange={(e) => setSoldIndividually(e.target.checked)}
                  />
                  <label htmlFor="soldIndividually">
                    Limit purchases to 1 item per order (Sold Individually)
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-accent" style={{ flex: 1, padding: '0.8rem' }}>
                    Save Inventory Settings
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '0.8rem' }}
                    onClick={() => setSelectedProductForModal(null)}
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
