"use client";

import { useEffect, useState } from "react";

export default function PartnerSalesPage() {
  const [sales, setSales] = useState([]);
  const [codes, setCodes] = useState([]);
  const [summary, setSummary] = useState({ totalCount: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [period, setPeriod] = useState("all");
  const [selectedCodeId, setSelectedCodeId] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  // Form State
  const initialForm = {
    partnerCodeId: "",
    promoCodeId: "",
    customerName: "",
    customerPhone: "",
    saleAmount: "",
    note: ""
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch partner's codes (for dropdown)
  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/partner/codes");
      const data = await res.json();
      if (res.ok && data.success) {
        setCodes(data.codes || []);
        if (data.codes.length > 0 && !formData.partnerCodeId && !formData.promoCodeId) {
          setFormData(prev => ({ ...prev, partnerCodeId: data.codes[0].id, promoCodeId: data.codes[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch sales
  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period && period !== "all") params.append("period", period);
      if (selectedCodeId) {
        params.append("partnerCodeId", selectedCodeId);
        params.append("promoCodeId", selectedCodeId);
      }

      const res = await fetch(`/api/partner/sales?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSales(data.sales || []);
        setSummary(data.summary || { totalCount: 0, totalAmount: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [period, selectedCodeId]);

  const handleOpenAdd = () => {
    setFormError("");
    setFormData({
      ...initialForm,
      partnerCodeId: codes.length > 0 ? codes[0].id : "",
      promoCodeId: codes.length > 0 ? codes[0].id : ""
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sale) => {
    setFormError("");
    setEditingSale(sale);
    setFormData({
      partnerCodeId: sale.partnerCodeId || sale.promoCodeId || "",
      promoCodeId: sale.partnerCodeId || sale.promoCodeId || "",
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      saleAmount: sale.saleAmount,
      note: sale.note || ""
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/partner/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "An error occurred while saving.");
        return;
      }

      setIsAddModalOpen(false);
      fetchSales();
    } catch (err) {
      setFormError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingSale) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/partner/sales/${editingSale.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "An error occurred while updating.");
        return;
      }

      setIsEditModalOpen(false);
      setEditingSale(null);
      fetchSales();
    } catch (err) {
      setFormError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Header & Actions */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem"
      }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.3rem 0" }}>
            Sales Tracking
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
            All sales orders recorded using partner promo codes
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            padding: "0.85rem 1.4rem",
            borderRadius: "10px",
            background: "#222945",
            color: "#ffffff",
            border: "none",
            fontWeight: "700",
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 10px rgba(34, 41, 69, 0.2)"
          }}
        >
          <i className="fa-solid fa-plus"></i>
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Filter & Summary Bar */}
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        {/* Filter Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* Period Tabs */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: "0.25rem", borderRadius: "10px" }}>
            {[
              { id: "all", label: "All" },
              { id: "today", label: "Today" },
              { id: "month", label: "This Month" },
              { id: "year", label: "This Year" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id)}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: period === t.id ? "#ffffff" : "transparent",
                  color: period === t.id ? "#222945" : "#64748b",
                  boxShadow: period === t.id ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Code Filter Dropdown */}
          <select
            value={selectedCodeId}
            onChange={(e) => setSelectedCodeId(e.target.value)}
            style={{
              padding: "0.5rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: "0.85rem",
              fontWeight: "600",
              outline: "none"
            }}
          >
            <option value="">All Promo Codes</option>
            {codes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} ({c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `฿${c.discountValue}`})
              </option>
            ))}
          </select>
        </div>

        {/* Summary Metric */}
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Total Orders: </span>
            <span style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>{summary.totalCount}</span>
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Total Revenue: </span>
            <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "#166534" }}>
              ฿{summary.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}></i>
            <div>Loading sales orders...</div>
          </div>
        ) : sales.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
            <i className="fa-solid fa-receipt" style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.5 }}></i>
            <h3 style={{ fontSize: "1.1rem", color: "#475569", margin: "0 0 0.5rem 0" }}>No sales found for the selected filter</h3>
            <p style={{ fontSize: "0.85rem", margin: "0 0 1.5rem 0" }}>Click the button below to record your first sale</p>
            <button
              onClick={handleOpenAdd}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                background: "#222945",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              + Record New Sale
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Date & Time</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Promo Code</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Customer Name</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Phone Number</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Sale Amount (THB)</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Note</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const dateStr = new Date(s.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  });
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.25rem", color: "#64748b", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <span style={{
                          fontFamily: "monospace",
                          fontWeight: "800",
                          color: "#222945",
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          padding: "0.25rem 0.55rem",
                          borderRadius: "6px",
                          letterSpacing: "0.5px"
                        }}>
                          {s.partnerCode?.code || s.promoCode?.code}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", fontWeight: "700", color: "#0f172a" }}>
                        {s.customerName}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "#475569", fontFamily: "monospace", fontSize: "0.9rem" }}>
                        {s.customerPhone}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right", fontWeight: "800", color: "#166534", fontSize: "1rem" }}>
                        ฿{s.saleAmount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "#64748b", fontSize: "0.85rem", maxWidth: "220px" }}>
                        {s.note || "-"}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            borderRadius: "6px",
                            background: "#f1f5f9",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem"
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Sale */}
      {isAddModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: "1rem"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "500px",
            padding: "2rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Record New Sale
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitAdd} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Select Partner Code *
                </label>
                <select
                  value={formData.partnerCodeId || formData.promoCodeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerCodeId: e.target.value, promoCodeId: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                >
                  {codes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `฿${c.discountValue} off`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0812345678"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Sale Price (THB) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 550.00"
                  value={formData.saleAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, saleAmount: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontWeight: "700", fontSize: "1.05rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional details, e.g. dry clean suit"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Saving..." : "Save Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Sale */}
      {isEditModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: "1rem"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "500px",
            padding: "2rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Edit Sale Order
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Partner Code
                </label>
                <select
                  value={formData.partnerCodeId || formData.promoCodeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerCodeId: e.target.value, promoCodeId: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                >
                  {codes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `฿${c.discountValue} off`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Sale Price (THB) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.saleAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, saleAmount: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontWeight: "700", fontSize: "1.05rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", borderBottom: "none", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Saving..." : "Update Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
