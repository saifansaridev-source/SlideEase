"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUS_STEPS = [
  { key: "Processing", label: "Order Confirmed", desc: "Your order has been received and is being prepared." },
  { key: "Packed", label: "Packed", desc: "Your handcrafted pair has been carefully packed." },
  { key: "Shipped", label: "Shipped", desc: "Your order is on its way to you." },
  { key: "Delivered", label: "Delivered", desc: "Your order has been delivered successfully." },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  const fetchOrder = (customParam = "") => {
    if (!orderId) return;
    setLoading(true);
    setError("");
    const url = `/api/orders/${orderId}${customParam}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
          setNeedsVerify(false);
        } else if (data.requiresVerification) {
          setNeedsVerify(true);
        } else {
          setError(data.error || "Order not found.");
        }
      })
      .catch(() => setError("Failed to load order details."))
      .finally(() => {
        setLoading(false);
        setVerifying(false);
      });
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;
    setVerifying(true);
    const param = verifyInput.includes("@")
      ? `?email=${encodeURIComponent(verifyInput.trim())}`
      : `?phone=${encodeURIComponent(verifyInput.trim())}`;
    fetchOrder(param);
  };

  const stepIndex = order ? Math.max(0, STATUS_STEPS.findIndex((s) => s.key === order.status)) : 0;
  const statusColors = { Processing: "var(--accent-color)", Packed: "#3b82f6", Shipped: "#8b5cf6", Delivered: "#10b981", Cancelled: "#ef4444" };

  if (loading && !verifying) return <div style={{ textAlign: "center", padding: "6rem", color: "var(--text-muted)" }}><p>Loading order details...</p></div>;

  if (needsVerify && !order) {
    return (
      <div style={{ backgroundColor: "var(--bg-light)", minHeight: "80vh", padding: "4rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: "480px", margin: "0 auto", backgroundColor: "#fff", padding: "2.5rem", borderRadius: "8px", border: "1px solid var(--border-color)", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--primary-color)", marginBottom: "0.5rem" }}>Order Verification</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            For privacy and security, please enter the customer email or phone number used when placing order <strong>{orderId}</strong>.
          </p>
          <form onSubmit={handleVerifySubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Email or 10-digit Phone"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              required
              style={{ padding: "0.8rem 1rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.95rem" }}
            />
            {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={verifying} className="btn btn-primary" style={{ padding: "0.8rem", width: "100%" }}>
              {verifying ? "Verifying..." : "Track My Order"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error || !order) return (
    <div style={{ textAlign: "center", padding: "6rem" }}>
      <h2 style={{ color: "var(--primary-color)", marginBottom: "0.5rem" }}>Order Not Found</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>{error || "We could not locate this order."}</p>
      <Link href="/account/orders" className="btn btn-primary">View My Orders</Link>
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "90vh", paddingBottom: "5rem" }}>
      <section style={{ background: "linear-gradient(135deg, var(--primary-color), #2d4a40)", padding: "3rem 1.5rem", textAlign: "center", color: "#fff" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent-color)", display: "block", marginBottom: "0.4rem" }}>Live Order Status</span>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", margin: "0 0 0.4rem" }}>Order Tracking</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>Order # {order.orderNumber}</p>
      </section>
      <div className="container" style={{ maxWidth: "800px", margin: "3rem auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ backgroundColor: statusColors[order.status] || "var(--primary-color)", color: "#fff", padding: "0.5rem 1.5rem", borderRadius: "999px", fontWeight: 700, fontSize: "0.9rem" }}>
            {order.status === "Cancelled" ? "Order Cancelled" : "Status: " + order.status}
          </span>
        </div>

        {order.status !== "Cancelled" && (
          <div className="checkout-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--primary-color)", marginBottom: "2rem", textAlign: "center" }}>Delivery Progress</h3>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              <div style={{ position: "absolute", top: "20px", left: "12%", right: "12%", height: "3px", background: "var(--border-color)", zIndex: 0 }}>
                <div style={{ width: (stepIndex / (STATUS_STEPS.length - 1) * 100) + "%", height: "100%", background: "var(--accent-color)", transition: "width 0.5s ease" }} />
              </div>
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= stepIndex;
                return (
                  <div key={step.key} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 1 }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: done ? "var(--accent-color)" : "var(--border-color)", color: done ? "#fff" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.7rem", fontSize: "0.85rem", fontWeight: 700, border: "3px solid " + (done ? "var(--accent-color)" : "var(--border-color)") }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: "0.72rem", fontWeight: done ? 700 : 400, color: done ? "var(--primary-color)" : "var(--text-muted)" }}>{step.label}</div>
                  </div>
                );
              })}
            </div>
            <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>{STATUS_STEPS[stepIndex]?.desc}</p>
          </div>
        )}

        <div className="checkout-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--primary-color)", marginBottom: "1.2rem" }}>Order Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.88rem" }}>
            <div><span style={{ color: "var(--text-muted)" }}>Order No.</span><br /><strong>{order.orderNumber}</strong></div>
            <div><span style={{ color: "var(--text-muted)" }}>Placed On</span><br /><strong>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></div>
            <div><span style={{ color: "var(--text-muted)" }}>Payment Method</span><br /><strong>{order.payment?.method || "Online"}</strong></div>
            <div><span style={{ color: "var(--text-muted)" }}>Payment Status</span><br /><strong>{order.payment?.status || "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-muted)" }}>Shipping</span><br /><strong style={{ textTransform: "capitalize" }}>{order.shippingMethod || "Standard"}</strong></div>
            <div><span style={{ color: "var(--text-muted)" }}>Total Paid</span><br /><strong style={{ color: "var(--accent-color)", fontSize: "1.1rem" }}>Rs. {(order.pricing?.total || 0).toLocaleString("en-IN")}</strong></div>
          </div>
        </div>

        {Array.isArray(order.items) && order.items.length > 0 && (
          <div className="checkout-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--primary-color)", marginBottom: "1.2rem" }}>Items Ordered</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--primary-color)" }}>{item.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Size: {item.size} - Qty: {item.quantity}</div>
                  </div>
                  <strong>Rs. {(item.lineTotal || (item.unitPrice * item.quantity) || 0).toLocaleString("en-IN")}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.customer && (
          <div className="checkout-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--primary-color)", marginBottom: "1rem" }}>Delivery Address</h3>
            <address style={{ fontStyle: "normal", fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--primary-color)" }}>{order.customer.firstName} {order.customer.lastName}</strong><br />
              {order.customer.address}<br />
              {order.customer.city}, {order.customer.state} - {order.customer.zip}<br />
              Ph: {order.customer.phone}
            </address>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/shop" className="btn btn-primary" style={{ marginRight: "1rem" }}>Continue Shopping</Link>
          <Link href="/contact" className="btn btn-outline">Need Help?</Link>
        </div>
      </div>
    </div>
  );
}