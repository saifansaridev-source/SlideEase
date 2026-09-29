"use client";
import React, { useState, useEffect, useCallback } from "react";

const EMPTY = { name: "", address: "", city: "", state: "", zip: "", phone: "", hours: "", lat: "", lng: "", published: true };

export default function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 3500); };

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stores");
      const json = await res.json();
      if (json.success) setStores(json.data || []);
    } catch { notify("Failed to load stores.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSave = async () => {
    if (!form.name || !form.city) { notify("Name and City are required.", "error"); return; }
    setSaving(true);
    try {
      const method = editId ? "PUT" : "POST";
      const body = editId ? { ...form, id: editId } : form;
      const res = await fetch("/api/admin/stores", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) { notify(editId ? "Store updated." : "Store added."); setShowForm(false); setForm(EMPTY); setEditId(null); fetchStores(); }
      else notify(json.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
    finally { setSaving(false); }
  };

  const handleEdit = (store) => { setForm({ name: store.name||"", address: store.address||"", city: store.city||"", state: store.state||"", zip: store.zip||"", phone: store.phone||"", hours: store.hours||"", lat: store.lat||"", lng: store.lng||"", published: store.published !== false }); setEditId(store._id||store.id); setShowForm(true); };

  const handleToggle = async (store) => {
    try {
      const res = await fetch("/api/admin/stores", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: store._id||store.id, published: !store.published }) });
      const json = await res.json();
      if (json.success) { notify(`Store ${store.published ? "unpublished" : "published"}.`); fetchStores(); }
      else notify(json.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this store location?")) return;
    try {
      const res = await fetch(`/api/admin/stores?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { notify("Store deleted."); fetchStores(); }
      else notify(json.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
  };

  const F = (key, label, required) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--primary-color)", textTransform: "uppercase" }}>{label}{required && " *"}</label>
      <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem" }} />
    </div>
  );

  return (
    <div className="admin-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary-color)", marginBottom: "0.25rem" }}>Store Locations</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Manage physical store locations displayed on the Store Locator page.</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }} className="btn btn-primary" style={{ fontSize: "0.85rem" }}>+ Add Location</button>
      </div>

      {msg.text && <div style={{ padding: "0.8rem 1.2rem", background: msg.type==="error"?"#fee2e2":"#dcfce7", color: msg.type==="error"?"#dc2626":"#16a34a", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", fontWeight: 600, fontSize: "0.88rem" }}>{msg.text}</div>}

      {showForm && (
        <div className="admin-card" style={{ padding: "1.5rem", marginBottom: "1.5rem", borderLeft: "3px solid var(--primary-color)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--primary-color)", marginBottom: "1rem", fontSize: "1rem" }}>{editId ? "Edit" : "Add"} Store Location</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.85rem", marginBottom: "1rem" }}>
            {F("name", "Store Name", true)}
            {F("address", "Street Address")}
            {F("city", "City", true)}
            {F("state", "State")}
            {F("zip", "PIN Code")}
            {F("phone", "Phone Number")}
            {F("hours", "Opening Hours")}
            {F("lat", "Latitude")}
            {F("lng", "Longitude")}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", marginBottom: "1rem" }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} /> Published (visible on Store Locator)
          </label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ fontSize: "0.85rem" }}>{saving ? "Saving..." : editId ? "Update Store" : "Add Store"}</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); setEditId(null); }} style={{ padding: "0.55rem 1.1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="admin-card" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No store locations added yet. Click "Add Location" to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {stores.map(store => (
            <div key={store._id||store.id} className="admin-card" style={{ padding: "1.25rem", borderLeft: `3px solid ${store.published ? "var(--primary-color)" : "var(--border-color)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--primary-color)", fontSize: "0.95rem" }}>{store.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{store.city}{store.state ? `, ${store.state}` : ""}</div>
                </div>
                <span style={{ padding: "0.2rem 0.55rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: store.published ? "#dcfce7" : "#f1f5f9", color: store.published ? "#16a34a" : "var(--text-muted)" }}>
                  {store.published ? "Live" : "Hidden"}
                </span>
              </div>
              {store.address && <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>{store.address}</div>}
              {store.phone && <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Ph: {store.phone}</div>}
              {store.hours && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Hours: {store.hours}</div>}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={() => handleEdit(store)} style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "var(--primary-color)" }}>Edit</button>
                <button onClick={() => handleToggle(store)} style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "#fff", cursor: "pointer" }}>{store.published ? "Unpublish" : "Publish"}</button>
                <button onClick={() => handleDelete(store._id||store.id)} style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "var(--danger-color)", borderColor: "var(--danger-color)", marginLeft: "auto" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}