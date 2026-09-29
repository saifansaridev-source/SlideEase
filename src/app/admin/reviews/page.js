"use client";
import React, { useState, useEffect, useCallback } from "react";

const STATUS_COLORS = { approved: "#16a34a", pending: "#d97706", rejected: "#dc2626" };
const STATUS_BG = { approved: "#dcfce7", pending: "#fef9c3", rejected: "#fee2e2" };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [photoOnly, setPhotoOnly] = useState(false);

  const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 3500); };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      if (json.success) setReviews(json.data || []);
    } catch { notify("Failed to load reviews.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleStatus = async (id, status) => {
    try {
      const res = await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const json = await res.json();
      if (json.success) { notify(`Review ${status}.`); fetchReviews(); }
      else notify(json.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { notify("Review deleted."); fetchReviews(); }
      else notify(json.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
  };

  const filtered = reviews.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (ratingFilter !== "all" && String(r.rating) !== ratingFilter) return false;
    if (photoOnly && !r.photos?.length) return false;
    if (search) {
      const q = search.toLowerCase();
      return (r.author||"").toLowerCase().includes(q) || (r.productId||"").toLowerCase().includes(q) || (r.title||"").toLowerCase().includes(q);
    }
    return true;
  });

  const counts = { all: reviews.length, pending: reviews.filter(r=>r.status==="pending").length, approved: reviews.filter(r=>r.status==="approved").length, rejected: reviews.filter(r=>r.status==="rejected").length };

  return (
    <div className="admin-content">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary-color)", marginBottom: "0.25rem" }}>Customer Reviews</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Moderate, approve, reject and delete customer reviews. Photo reviews require moderation.</p>
      </div>

      {msg.text && (
        <div style={{ padding: "0.8rem 1.2rem", background: msg.type === "error" ? "#fee2e2" : "#dcfce7", color: msg.type === "error" ? "#dc2626" : "#16a34a", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontWeight: 600, fontSize: "0.88rem" }}>
          {msg.text}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {["all","pending","approved","rejected"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "0.4rem 1rem", borderRadius: "999px", border: `1.5px solid ${filter===s ? "var(--primary-color)" : "var(--border-color)"}`, background: filter===s ? "var(--primary-color)" : "#fff", color: filter===s ? "#fff" : "var(--text-muted)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", textTransform: "capitalize" }}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase()+s.slice(1)} ({counts[s]||0})
          </button>
        ))}
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", marginLeft: "auto", color: "var(--primary-color)" }}>
          <input type="checkbox" checked={photoOnly} onChange={e => setPhotoOnly(e.target.checked)} /> Photo reviews only
        </label>
      </div>

      {/* Search + rating filter */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by author, product ID, title..." className="filter-select" style={{ flex: 1, minWidth: "200px", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.85rem" }} />
        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="filter-select" style={{ padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
          <option value="all">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} stars</option>)}
        </select>
      </div>

      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color)", background: "#f8fafc" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Product/Author</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Review</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Rating</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Photo</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading reviews...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No reviews match the current filters.</td></tr>
            ) : filtered.map(r => (
              <tr key={r._id || r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.85rem 1rem", maxWidth: "160px" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary-color)" }}>{r.author}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>ID: {r.productId}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{r.date || new Date(r.createdAt).toLocaleDateString("en-IN")}</div>
                  {r.verifiedPurchase && <span style={{ fontSize: "0.68rem", background: "#dcfce7", color: "#16a34a", padding: "0.1rem 0.4rem", borderRadius: "999px", fontWeight: 700 }}>Verified</span>}
                </td>
                <td style={{ padding: "0.85rem 1rem", maxWidth: "300px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.2rem" }}>{r.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{(r.body||"").substring(0,120)}{r.body?.length > 120 ? "..." : ""}</div>
                </td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                  <span style={{ color: "var(--accent-color)", fontWeight: 700 }}>{"★".repeat(r.rating||5)}</span>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{r.rating}/5</div>
                </td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                  <span style={{ padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, background: STATUS_BG[r.status||"pending"], color: STATUS_COLORS[r.status||"pending"] }}>
                    {(r.status||"pending").toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                  {r.photos?.length ? (
                    <a href={r.photos[0]} target="_blank" rel="noopener noreferrer">
                      <img src={r.photos[0]} alt="Review" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
                    </a>
                  ) : <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>—</span>}
                </td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    {r.status !== "approved" && (
                      <button onClick={() => handleStatus(r._id||r.id, "approved")} style={{ padding: "0.3rem 0.65rem", background: "#dcfce7", border: "1px solid #86efac", color: "#16a34a", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>Approve</button>
                    )}
                    {r.status !== "rejected" && (
                      <button onClick={() => handleStatus(r._id||r.id, "rejected")} style={{ padding: "0.3rem 0.65rem", background: "#fee2e2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>Reject</button>
                    )}
                    <button onClick={() => handleDelete(r._id||r.id)} style={{ padding: "0.3rem 0.65rem", background: "#fff", border: "1px solid var(--border-color)", color: "var(--text-muted)", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem" }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}