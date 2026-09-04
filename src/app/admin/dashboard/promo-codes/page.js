"use client";

import { useState, useEffect } from "react";
import { toInputDateTime, toISOStringOrNull } from "@/lib/dateUtils";

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getPromoStatus = (pc) => {
    if (!pc.isActive) {
      return { label: "Disabled", color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1" };
    }
    const now = new Date();
    if (pc.startDate && new Date(pc.startDate) > now) {
      return { label: "Upcoming (Auto)", color: "#0284c7", bg: "#e0f2fe", border: "#bae6fd" };
    }
    if (pc.endDate && new Date(pc.endDate) < now) {
      return { label: "Expired (Auto)", color: "#dc2626", bg: "#fee2e2", border: "#fecaca" };
    }
    return { label: "Active", color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0" };
  };

  const formatSchedule = (pc) => {
    const formatDate = (d) => new Date(d).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
    if (pc.startDate && pc.endDate) {
      return `${formatDate(pc.startDate)} → ${formatDate(pc.endDate)}`;
    }
    if (pc.startDate) {
      return `Starts: ${formatDate(pc.startDate)}`;
    }
    if (pc.endDate) {
      return `Ends: ${formatDate(pc.endDate)}`;
    }
    return pc.expiryDate || "Immediate & Ongoing";
  };

  const initialForm = {
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 15,
    discountTarget: "ALL",
    minOrderValue: 0,
    maxDiscount: "",
    usageLimit: "",
    usedCount: 0,
    startDate: "",
    endDate: "",
    expiryDate: "",
    isActive: true,
    description: ""
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  async function fetchPromoCodes() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/promo-codes");
      const data = await res.json();
      if (data.success) {
        setPromoCodes(data.promoCodes || []);
      }
    } catch (err) {
      console.error("Failed to fetch promo codes:", err);
      setError("Failed to load promo codes.");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleOpenEdit = (pc) => {
    setEditingId(pc.id);
    setFormData({
      code: pc.code || "",
      discountType: pc.discountType || "PERCENTAGE",
      discountValue: pc.discountValue !== undefined ? pc.discountValue : 15,
      discountTarget: pc.discountTarget || "ALL",
      minOrderValue: pc.minOrderValue !== undefined ? pc.minOrderValue : 0,
      maxDiscount: pc.maxDiscount !== null ? pc.maxDiscount : "",
      usageLimit: pc.usageLimit !== null ? pc.usageLimit : "",
      usedCount: pc.usedCount || 0,
      startDate: toInputDateTime(pc.startDate),
      endDate: toInputDateTime(pc.endDate),
      expiryDate: pc.expiryDate || "",
      isActive: pc.isActive !== undefined ? pc.isActive : true,
      description: pc.description || ""
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "TLS";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promo code?")) return;

    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setPromoCodes(prev => prev.filter(p => p.id !== id));
        setSuccess("Promo Code deleted successfully.");
      }
    } catch (err) {
      console.error("Failed to delete promo code:", err);
      setError("Failed to delete promo code.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!formData.code) {
      setError("Promo Code is required.");
      setSaving(false);
      return;
    }

    try {
      const url = editingId ? `/api/admin/promo-codes/${editingId}` : "/api/admin/promo-codes";
      const method = editingId ? "PUT" : "POST";

      const payload = {
        ...formData,
        startDate: toISOStringOrNull(formData.startDate),
        endDate: toISOStringOrNull(formData.endDate)
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(editingId ? "Promo Code updated!" : "Promo Code created!");
        setShowModal(false);
        fetchPromoCodes();
      } else {
        setError(data.error || "Failed to save Promo Code");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.5rem",
        marginBottom: "2rem",
        background: "#ffffff",
        padding: "1.75rem 2rem",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)"
      }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", color: "#222945", fontWeight: "800", marginBottom: "0.4rem" }}>
            <i className="fa-solid fa-ticket" style={{ color: "#222945", marginRight: "0.75rem" }}></i>
            Promo Codes & Coupons Manager
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Create and manage discount codes, percentage cuts, fixed THB discounts, and usage limits.
          </p>
        </div>
        <button 
          onClick={handleOpenCreate}
          style={{
            padding: "0.8rem 1.8rem",
            borderRadius: "10px",
            background: "#222945",
            color: "#ffffff",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.95rem",
            boxShadow: "0 4px 12px rgba(34, 41, 69, 0.25)"
          }}
        >
          <i className="fa-solid fa-plus" style={{ marginRight: "0.5rem" }}></i>
          Create New Promo Code
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", padding: "1rem 1.25rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: "#f0fdf4", color: "#166534", padding: "1rem 1.25rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #bbf7d0" }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: "0.5rem" }}></i>
          {success}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(34, 41, 69, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "680px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.3rem", color: "#222945", fontWeight: "700" }}>
                {editingId ? "Edit Promo Code" : "Create New Promo Code"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.25rem" }}>

              <div>
                <label style={{ display: "block", color: "#222945", fontWeight: "700", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                  Promo Code *
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input 
                    type="text" 
                    placeholder="e.g. TLSWELCOME15"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    required
                    style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945", fontWeight: "800", fontFamily: "monospace", fontSize: "1.1rem" }}
                  />
                  <button 
                    type="button"
                    onClick={generateRandomCode}
                    style={{ padding: "0.75rem 1rem", borderRadius: "8px", background: "#f1f5f9", color: "#222945", border: "1px solid #cbd5e1", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" }}
                  >
                    Auto Generate
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    Discount Type *
                  </label>
                  <select 
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945", fontWeight: "600" }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (THB)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    Discount Value * ({formData.discountType === "PERCENTAGE" ? "%" : "THB"})
                  </label>
                  <input 
                    type="number"
                    step="0.01" 
                    placeholder="15"
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945", fontWeight: "700" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                  Applies To * (Discount Scope)
                </label>
                <select 
                  value={formData.discountTarget}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountTarget: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945", fontWeight: "600" }}
                >
                  <option value="ALL">Entire Order (All Services)</option>
                  <option value="DELIVERY">Delivery Fee Only (ลดเฉพาะค่ารับส่ง)</option>
                </select>
                <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                  {formData.discountTarget === "DELIVERY" 
                    ? "ส่วนลดนี้จะคิดเฉพาะค่าบริการรับส่งเท่านั้น (เช่น โค้ดฟรีค่ารับส่ง 100% หรือลด 50 บาท)"
                    : "ส่วนลดนี้จะคิดจากยอดรวมของบริการทั้งหมด"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    Minimum Order Value (THB)
                  </label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    Usage Limit (Total Redemptions)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Leave empty for unlimited"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    <i className="fa-regular fa-calendar-plus" style={{ marginRight: "0.35rem", color: "#64748b" }}></i>
                    Start Date & Time
                  </label>
                  <input 
                    type="datetime-local" 
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945", fontSize: "0.9rem" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                    Leave empty to start immediately
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    <i className="fa-regular fa-calendar-xmark" style={{ marginRight: "0.35rem", color: "#64748b" }}></i>
                    End Date & Time (Expiry)
                  </label>
                  <input 
                    type="datetime-local" 
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945", fontSize: "0.9rem" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                    Leave empty for ongoing (no expiry)
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                  Description / Internal Notes
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 20% discount on same-day express turnaround"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "600", color: "#222945" }}>
                  <input 
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: "18px", height: "18px" }}
                  />
                  Active & Redeemable Code
                </label>
                <span style={{ fontSize: "0.8rem", color: "#64748b", marginLeft: "1.6rem" }}>
                  When enabled, the system will automatically activate and deactivate this code based on the scheduled Start and End dates.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#475569", fontWeight: "600", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  style={{ padding: "0.75rem 2rem", borderRadius: "8px", border: "none", background: "#222945", color: "#ffffff", fontWeight: "700", cursor: "pointer" }}
                >
                  {saving ? "Saving..." : "Save Promo Code"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Promo Codes Table */}
      {loading ? (
        <div style={{ background: "#ffffff", padding: "3rem", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#222945" }}></i>
          <p>Loading promo codes...</p>
        </div>
      ) : promoCodes.length === 0 ? (
        <div style={{ background: "#ffffff", padding: "3.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
          <i className="fa-solid fa-ticket" style={{ fontSize: "3rem", marginBottom: "1rem", color: "#94a3b8" }}></i>
          <h3 style={{ color: "#222945", marginBottom: "0.5rem" }}>No promo codes created yet</h3>
          <p style={{ marginBottom: "1.5rem" }}>Click "Create New Promo Code" to launch your first coupon code.</p>
          <button onClick={handleOpenCreate} style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer" }}>
            Create First Promo Code
          </button>
        </div>
      ) : (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "1rem 1.25rem" }}>Code</th>
                <th style={{ padding: "1rem 1.25rem" }}>Discount</th>
                <th style={{ padding: "1rem 1.25rem" }}>Redemptions</th>
                <th style={{ padding: "1rem 1.25rem" }}>Min Order</th>
                <th style={{ padding: "1rem 1.25rem" }}>Validity Schedule</th>
                <th style={{ padding: "1rem 1.25rem" }}>Status</th>
                <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((pc) => (
                <tr key={pc.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1.25rem" }}>
                    <span style={{ fontFamily: "monospace", background: "#222945", color: "#ffffff", padding: "0.4rem 0.8rem", borderRadius: "6px", fontWeight: "800", letterSpacing: "1px" }}>
                      {pc.code}
                    </span>
                    {pc.description && (
                      <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem" }}>{pc.description}</div>
                    )}
                  </td>

                  <td style={{ padding: "1.25rem", fontWeight: "800", color: "#222945" }}>
                    <div>
                      {pc.discountType === "PERCENTAGE" ? `${pc.discountValue}% OFF` : `${pc.discountValue} THB OFF`}
                    </div>
                    {pc.discountTarget === "DELIVERY" ? (
                      <span style={{
                        display: "inline-block",
                        marginTop: "0.35rem",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        border: "1px solid #bfdbfe"
                      }}>
                        🚚 Delivery Only
                      </span>
                    ) : (
                      <span style={{
                        display: "inline-block",
                        marginTop: "0.35rem",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        background: "#f1f5f9",
                        color: "#64748b",
                        border: "1px solid #e2e8f0"
                      }}>
                        All Services
                      </span>
                    )}
                  </td>

                  <td style={{ padding: "1.25rem", fontWeight: "600", color: "#475569" }}>
                    {pc.usedCount} {pc.usageLimit ? `/ ${pc.usageLimit}` : "(Unlimited)"}
                  </td>

                  <td style={{ padding: "1.25rem", color: "#64748b", fontSize: "0.9rem" }}>
                    {pc.minOrderValue ? `${pc.minOrderValue} THB` : "None"}
                  </td>

                  <td style={{ padding: "1.25rem", color: "#475569", fontSize: "0.85rem", maxWidth: "230px", lineHeight: "1.4" }}>
                    {formatSchedule(pc)}
                  </td>

                  <td style={{ padding: "1.25rem" }}>
                    {(() => {
                      const st = getPromoStatus(pc);
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-start" }}>
                          <span style={{
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.border}`,
                            padding: "0.25rem 0.65rem",
                            borderRadius: "12px",
                            fontWeight: "700",
                            fontSize: "0.75rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem"
                          }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: st.color }}></span>
                            {st.label}
                          </span>
                          <button 
                            onClick={() => handleToggleActive(pc.id, pc.isActive)}
                            title={pc.isActive ? "Click to manually disable" : "Click to manually enable"}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#64748b",
                              textDecoration: "underline",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              padding: 0
                            }}
                          >
                            {pc.isActive ? "Turn Off" : "Turn On"}
                          </button>
                        </div>
                      );
                    })()}
                  </td>

                  <td style={{ padding: "1.25rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button 
                        onClick={() => handleOpenEdit(pc)}
                        style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", background: "#f1f5f9", color: "#222945", border: "1px solid #cbd5e1", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
