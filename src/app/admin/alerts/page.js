"use client";
import React, { useState, useEffect, useCallback } from "react";

function AlertsTab({ type }) {
  const isStock = type === "stock";
  const apiUrl = isStock ? "/api/admin/alerts/stock" : "/api/admin/alerts/price";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [search, setSearch] = useState("");

  const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 3500); };

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.success) setItems(json.data || []);
    } catch { notify("Failed to load alerts.", "error"); }
    finally { setLoading(false); }
  }, [apiUrl]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleDeactivate = async (id) => {
    try {
      const res = await fetch(apiUrl, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "fulfilled" }) });
      const json = await res.json();
      if (json.success) { notify("Alert marked as fulfilled."); fetchAlerts(); }
      else notify(json.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
  };

  const filtered = items.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (item.productId||"").toLowerCase().includes(s) || (item.email||"").toLowerCase().includes(s) || (item.productName||"").toLowerCase().includes(s);
  });

  const activeCount = items.filter(i => i.status !== "fulfilled").length;

  return (
    <div>
      {msg.text && <div style={{ padding: "0.8rem 1.2rem", background: msg.type==="error"?"#fee2e2":"#dcfce7", color: msg.type==="error"?"#dc2626":"#16a34a", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", fontWeight: 600, fontSize: "0.88rem" }}>{msg.text}</div>}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product, email..." style={{ flex: 1, minWidth: "200px", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.85rem" }} />
        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{activeCount} active alert{activeCount !== 1 ? "s" : ""}</span>
      </div>
      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "580px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color)", background: "#f8fafc" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Product</th>
              {isStock && <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Size</th>}
              {!isStock && <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Price Snapshot</th>}
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Customer</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Date</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading alerts...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No {isStock ? "back-in-stock" : "price-drop"} alert subscriptions yet.</td></tr>
            ) : filtered.map(item => (
              <tr key={item._id || item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary-color)" }}>{item.productName || item.productId}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{item.productId}</div>
                </td>
                {isStock && <td style={{ padding: "0.85rem 1rem", fontSize: "0.85rem" }}>{item.size ? `UK ${item.size}` : "Any"}</td>}
                {!isStock && (
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Rs. {(item.priceAtSubscription||0).toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>at subscription time</div>
                  </td>
                )}
                <td style={{ padding: "0.85rem 1rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>{item.email || "—"}</td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "—"}
                </td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                  <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, background: item.status==="fulfilled"?"#f1f5f9":"#fef9c3", color: item.status==="fulfilled"?"var(--text-muted)":"#d97706" }}>
                    {item.status === "fulfilled" ? "Fulfilled" : "Active"}
                  </span>
                </td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                  {item.status !== "fulfilled" && (
                    <button onClick={() => handleDeactivate(item._id||item.id)} style={{ padding: "0.3rem 0.65rem", background: "#f1f5f9", border: "1px solid var(--border-color)", color: "var(--text-muted)", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>Mark Fulfilled</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminAlertsPage() {
  const [tab, setTab] = useState("stock");
  return (
    <div className="admin-content">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary-color)", marginBottom: "0.25rem" }}>Customer Alerts</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Manage back-in-stock and price-drop alert subscriptions from customers.</p>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--border-color)" }}>
        {[["stock","Back-in-Stock"],["price","Price Drop"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: "0.6rem 1.25rem", background: "none", border: "none", borderBottom: `2.5px solid ${tab===key?"var(--primary-color)":"transparent"}`, color: tab===key?"var(--primary-color)":"var(--text-muted)", fontWeight: tab===key?700:500, cursor: "pointer", fontSize: "0.88rem", marginBottom: "-2px", transition: "all 0.2s" }}>{label}</button>
        ))}
      </div>
      <AlertsTab key={tab} type={tab} />
    </div>
  );
}