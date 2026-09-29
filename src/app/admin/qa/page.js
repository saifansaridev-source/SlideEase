"use client";
import React, { useState, useEffect, useCallback } from "react";

export default function AdminQAPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [search, setSearch] = useState("");
  const [answerDraft, setAnswerDraft] = useState({});
  const [editing, setEditing] = useState(null);

  const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 3500); };

  const fetchQA = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/qa");
      const json = await res.json();
      if (json.success) setQuestions(json.data || []);
    } catch { notify("Failed to load Q&A.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchQA(); }, [fetchQA]);

  const handleAnswer = async (id) => {
    const answer = (answerDraft[id] || "").trim();
    if (!answer) { notify("Answer cannot be empty.", "error"); return; }
    try {
      const res = await fetch("/api/admin/qa", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, answer }) });
      const json = await res.json();
      if (json.success) { notify("Answer saved."); setEditing(null); setAnswerDraft(d => ({ ...d, [id]: "" })); fetchQA(); }
      else notify(json.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/qa?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { notify("Question deleted."); fetchQA(); }
      else notify(json.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
  };

  const filtered = questions.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (q.question||"").toLowerCase().includes(s) || (q.productId||"").toLowerCase().includes(s) || (q.customerName||"").toLowerCase().includes(s);
  });

  const unanswered = questions.filter(q => !q.answer).length;

  return (
    <div className="admin-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary-color)", marginBottom: "0.25rem" }}>Product Q&amp;A</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Answer customer questions about products. {unanswered > 0 && <strong style={{ color: "var(--danger-color)" }}>{unanswered} unanswered</strong>}</p>
        </div>
      </div>

      {msg.text && <div style={{ padding: "0.8rem 1.2rem", background: msg.type==="error"?"#fee2e2":"#dcfce7", color: msg.type==="error"?"#dc2626":"#16a34a", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontWeight: 600, fontSize: "0.88rem" }}>{msg.text}</div>}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product ID, question, customer..." style={{ width: "100%", padding: "0.6rem 0.9rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.85rem", marginBottom: "1.25rem", boxSizing: "border-box" }} />

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading questions...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>No questions yet. When customers ask questions on product pages, they will appear here.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map(q => (
            <div key={q._id || q.id} className="admin-card" style={{ padding: "1.25rem", borderLeft: q.answer ? "3px solid #16a34a" : "3px solid #d97706" }}>
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "0.2rem 0.55rem", borderRadius: "999px", fontWeight: 700, color: "var(--text-muted)" }}>Product: {q.productId}</span>
                <span style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "0.2rem 0.55rem", borderRadius: "999px", fontWeight: 700, color: "var(--text-muted)" }}>{q.customerName||"Anonymous"}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "auto" }}>{q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-IN") : ""}</span>
                <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem", borderRadius: "999px", fontWeight: 700, background: q.answer?"#dcfce7":"#fef9c3", color: q.answer?"#16a34a":"#d97706" }}>
                  {q.answer ? "Answered" : "Unanswered"}
                </span>
              </div>

              <div style={{ fontWeight: 700, color: "var(--primary-color)", marginBottom: "0.5rem" }}>Q: {q.question}</div>

              {q.answer && editing !== (q._id||q.id) && (
                <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>SlideEase Answer</div>
                  <div style={{ fontSize: "0.88rem", color: "var(--text-dark)", lineHeight: 1.6 }}>{q.answer}</div>
                </div>
              )}

              {(editing === (q._id||q.id) || !q.answer) && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <textarea
                    value={answerDraft[q._id||q.id] ?? (q.answer||"")}
                    onChange={e => setAnswerDraft(d => ({ ...d, [q._id||q.id]: e.target.value }))}
                    placeholder="Type your answer here..."
                    rows={3}
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.85rem", resize: "vertical", boxSizing: "border-box" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {editing === (q._id||q.id) || !q.answer ? (
                  <>
                    <button onClick={() => handleAnswer(q._id||q.id)} className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
                      {q.answer ? "Update Answer" : "Post Answer"}
                    </button>
                    {q.answer && <button onClick={() => { setEditing(null); setAnswerDraft(d => ({...d,[q._id||q.id]:""})); }} style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem", background: "none", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>}
                  </>
                ) : (
                  <button onClick={() => { setEditing(q._id||q.id); setAnswerDraft(d=>({...d,[q._id||q.id]:q.answer})); }} style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem", background: "none", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer", color: "var(--primary-color)" }}>Edit Answer</button>
                )}
                <button onClick={() => handleDelete(q._id||q.id)} style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem", background: "none", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer", color: "var(--danger-color)", borderColor: "var(--danger-color)", marginLeft: "auto" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}