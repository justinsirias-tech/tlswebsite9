"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PartnerSalesPage() {
  const [sales, setSales] = useState([]);
  const [codes, setCodes] = useState([]);
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalGrossAmount: 0,
    totalDiscountAmount: 0,
    totalNetAmount: 0,
    totalAmount: 0
  });
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

  // Helper to compute pricing breakdown for any sale record
  const getSalePricing = (s) => {
    const original = Number(s.originalAmount ?? s.saleAmount) || 0;
    if (s.discountAmount !== undefined && s.netAmount !== undefined) {
      return {
        original,
        discount: Number(s.discountAmount) || 0,
        net: Number(s.netAmount) || 0
      };
    }
    const pc = s.partnerCode || s.promoCode;
    let discount = 0;
    if (pc) {
      if (pc.discountType === "PERCENTAGE") {
        const raw = original * ((Number(pc.discountValue) || 0) / 100);
        discount = pc.maxDiscount ? Math.min(raw, Number(pc.maxDiscount)) : raw;
      } else if (pc.discountType === "FIXED") {
        discount = Math.min(original, Number(pc.discountValue) || 0);
      }
    }
    discount = Math.round(discount * 100) / 100;
    const net = Math.max(0, Math.round((original - discount) * 100) / 100);
    return { original, discount, net };
  };

  // Helper to compute live preview in Add/Edit modal
  const getModalPricingPreview = () => {
    const rawAmount = parseFloat(formData.saleAmount);
    if (isNaN(rawAmount) || rawAmount <= 0) return null;
    const activeCodeId = formData.partnerCodeId || formData.promoCodeId;
    const code = codes.find(c => c.id === activeCodeId);
    let discount = 0;
    if (code) {
      if (code.discountType === "PERCENTAGE") {
        const raw = rawAmount * ((Number(code.discountValue) || 0) / 100);
        discount = code.maxDiscount ? Math.min(raw, Number(code.maxDiscount)) : raw;
      } else if (code.discountType === "FIXED") {
        discount = Math.min(rawAmount, Number(code.discountValue) || 0);
      }
    }
    discount = Math.round(discount * 100) / 100;
    const net = Math.max(0, Math.round((rawAmount - discount) * 100) / 100);
    return { original: rawAmount, discount, net, code };
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
        setSummary(data.summary || {
          totalCount: 0,
          totalGrossAmount: 0,
          totalDiscountAmount: 0,
          totalNetAmount: 0,
          totalAmount: 0
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadCodes() {
      try {
        const res = await fetch("/api/partner/codes");
        const data = await res.json();
        if (!ignore && res.ok && data.success) {
          setCodes(data.codes || []);
          if (data.codes?.length > 0) {
            setFormData(prev => ({
              ...prev,
              partnerCodeId: prev.partnerCodeId || data.codes[0].id,
              promoCodeId: prev.promoCodeId || data.codes[0].id
            }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCodes();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadSales() {
      try {
        const params = new URLSearchParams();
        if (period && period !== "all") params.append("period", period);
        if (selectedCodeId) {
          params.append("partnerCodeId", selectedCodeId);
          params.append("promoCodeId", selectedCodeId);
        }

        const res = await fetch(`/api/partner/sales?${params.toString()}`);
        const data = await res.json();
        if (!ignore && res.ok && data.success) {
          setSales(data.sales || []);
          setSummary(data.summary || {
            totalCount: 0,
            totalGrossAmount: 0,
            totalDiscountAmount: 0,
            totalNetAmount: 0,
            totalAmount: 0
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadSales();
    return () => {
      ignore = true;
    };
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
      saleAmount: sale.originalAmount !== undefined ? sale.originalAmount : sale.saleAmount,
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

  const addPreview = isAddModalOpen ? getModalPricingPreview() : null;
  const editPreview = isEditModalOpen ? getModalPricingPreview() : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Link
              href="/partner/dashboard"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                textDecoration: "none"
              }}
              title="Back to Overview"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
              Sales Tracking
            </h1>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.3rem 0 0 0" }}>
            Comprehensive log of all order transactions, showing full price before discount, discounts given, and net amounts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            padding: "0.75rem 1.4rem",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
            color: "#ffffff",
            border: "none",
            fontWeight: "800",
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 6px 18px rgba(2, 132, 199, 0.35)",
            transition: "all 0.15s ease"
          }}
        >
          <i className="fa-solid fa-plus"></i>
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "1.25rem 1.5rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
          {/* Period Tabs */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: "0.3rem", borderRadius: "10px" }}>
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "month", label: "This Month" },
              { id: "year", label: "This Year" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id)}
                style={{
                  padding: "0.45rem 0.95rem",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: period === t.id ? "800" : "600",
                  cursor: "pointer",
                  background: period === t.id ? "#ffffff" : "transparent",
                  color: period === t.id ? "#0f172a" : "#64748b",
                  boxShadow: period === t.id ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Promo Code Filter */}
          <div style={{ position: "relative" }}>
            <select
              value={selectedCodeId}
              onChange={(e) => setSelectedCodeId(e.target.value)}
              style={{
                padding: "0.55rem 2rem 0.55rem 0.95rem",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                fontSize: "0.85rem",
                fontWeight: "700",
                outline: "none",
                cursor: "pointer",
                appearance: "none"
              }}
            >
              <option value="">All Promo Codes</option>
              {codes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `฿${c.discountValue} off`})
                </option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down" style={{
              position: "absolute",
              right: "0.8rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.75rem",
              color: "#94a3b8",
              pointerEvents: "none"
            }}></i>
          </div>
        </div>

        <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>
          Showing records for: <span style={{ color: "#0f172a", fontWeight: "800" }}>{period === "all" ? "All Time" : period === "today" ? "Today" : period === "month" ? "This Month" : "This Year"}</span>
        </div>
      </div>

      {/* Financial Summary Ribbon */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem"
      }}>
        {/* 1. Total Orders */}
        <div style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "1.3rem 1.5rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Orders
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#0f172a", marginTop: "0.2rem" }}>
              {(summary.totalCount || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>Orders in this filter</div>
          </div>
          <div style={{
            width: "46px",
            height: "46px",
            borderRadius: "14px",
            background: "#f1f5f9",
            color: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem"
          }}>
            <i className="fa-solid fa-receipt"></i>
          </div>
        </div>

        {/* 2. Total Gross */}
        <div style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "1.3rem 1.5rem",
          border: "1px solid #cbd5e1",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Before Discount (Gross)
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#1e293b", marginTop: "0.2rem" }}>
              ฿{(summary.totalGrossAmount !== undefined ? summary.totalGrossAmount : summary.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>Full booking value</div>
          </div>
          <div style={{
            width: "46px",
            height: "46px",
            borderRadius: "14px",
            background: "#f8fafc",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            border: "1px solid #e2e8f0"
          }}>
            <i className="fa-solid fa-tags"></i>
          </div>
        </div>

        {/* 3. Total Discounts */}
        <div style={{
          background: "#fffaf5",
          borderRadius: "18px",
          padding: "1.3rem 1.5rem",
          border: "1px solid #fed7aa",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Discounts
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#ea580c", marginTop: "0.2rem" }}>
              -฿{(summary.totalDiscountAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9a3412", marginTop: "0.2rem" }}>Guest promo savings</div>
          </div>
          <div style={{
            width: "46px",
            height: "46px",
            borderRadius: "14px",
            background: "#fff7ed",
            color: "#ea580c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            border: "1px solid #fed7aa"
          }}>
            <i className="fa-solid fa-percent"></i>
          </div>
        </div>

        {/* 4. Net Revenue */}
        <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
          borderRadius: "18px",
          padding: "1.3rem 1.5rem",
          border: "1px solid #bbf7d0",
          boxShadow: "0 4px 15px rgba(5, 150, 105, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Net Sales
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#059669", marginTop: "0.2rem" }}>
              ฿{(summary.totalNetAmount !== undefined ? summary.totalNetAmount : summary.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: "700", marginTop: "0.2rem" }}>Final billed revenue</div>
          </div>
          <div style={{
            width: "46px",
            height: "46px",
            borderRadius: "14px",
            background: "#dcfce7",
            color: "#059669",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            border: "1px solid #a7f3d0"
          }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div style={{
        background: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
        overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.8rem", marginBottom: "0.8rem", color: "#0284c7" }}></i>
            <div>Loading sales records...</div>
          </div>
        ) : sales.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              color: "#94a3b8"
            }}>
              <i className="fa-solid fa-receipt" style={{ fontSize: "1.6rem" }}></i>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", margin: "0 0 0.35rem 0" }}>
              No sales found
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1.5rem 0" }}>
              No orders matched the selected filter period or promo code.
            </p>
            <button
              onClick={handleOpenAdd}
              style={{
                padding: "0.65rem 1.3rem",
                borderRadius: "10px",
                background: "#0f172a",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              + Record Sale Now
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Date & Time</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Promo Code</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Customer</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Phone</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Gross Amount</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Discount</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Net Amount</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Note</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const dateObj = new Date(s.createdAt);
                  const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                  const pricing = getSalePricing(s);
                  const pc = s.partnerCode || s.promoCode;

                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.25rem", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.85rem" }}>{dateStr}</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{timeStr}</div>
                      </td>

                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "flex-start" }}>
                          <span style={{
                            fontFamily: "monospace",
                            fontWeight: "800",
                            color: "#0369a1",
                            background: "#f0f9ff",
                            border: "1px solid #bae6fd",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "6px",
                            letterSpacing: "0.5px",
                            fontSize: "0.85rem"
                          }}>
                            {pc?.code || "CODE"}
                          </span>
                          {pc && (
                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600" }}>
                              {pc.discountType === "PERCENTAGE" ? `${pc.discountValue}% OFF` : `฿${pc.discountValue} OFF`}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "#f1f5f9",
                            color: "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "800"
                          }}>
                            {s.customerName ? s.customerName[0].toUpperCase() : "C"}
                          </div>
                          <span style={{ fontWeight: "700", color: "#0f172a" }}>{s.customerName}</span>
                        </div>
                      </td>

                      <td style={{ padding: "1rem 1.25rem", color: "#475569", fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {s.customerPhone}
                      </td>

                      {/* 1. Original Gross Amount */}
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right", fontWeight: "700", color: "#334155", fontSize: "0.95rem" }}>
                        ฿{pricing.original.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* 2. Discount Amount */}
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        {pricing.discount > 0 ? (
                          <span style={{
                            background: "#fff7ed",
                            color: "#c2410c",
                            border: "1px solid #fed7aa",
                            padding: "0.25rem 0.55rem",
                            borderRadius: "6px",
                            fontWeight: "800",
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap"
                          }}>
                            -฿{pricing.discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>฿0.00</span>
                        )}
                      </td>

                      {/* 3. Net Final Amount */}
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right", fontWeight: "900", color: "#059669", fontSize: "1.05rem" }}>
                        ฿{pricing.net.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: "1rem 1.25rem", color: "#64748b", fontSize: "0.85rem", maxWidth: "200px" }}>
                        {s.note || <span style={{ color: "#cbd5e1" }}>-</span>}
                      </td>

                      <td style={{ padding: "1rem 1.25rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            borderRadius: "8px",
                            background: "#f8fafc",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            transition: "all 0.15s ease"
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

      {/* Modal: Record Sale */}
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
            borderRadius: "24px",
            width: "100%",
            maxWidth: "520px",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#f0f9ff",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <i className="fa-solid fa-plus"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Record New Sale
                  </h2>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Enter regular price before discount; discounts are computed automatically</span>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitAdd} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Select Partner Promo Code *
                </label>
                <select
                  value={formData.partnerCodeId || formData.promoCodeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerCodeId: e.target.value, promoCodeId: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.9rem" }}
                >
                  {codes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `฿${c.discountValue} off`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe / Room 502"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Customer Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0812345678"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.9rem" }}
                />
              </div>

              {/* Full Price Before Discount Input */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>
                    Full Price Before Discount (Gross) *
                  </label>
                  <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: "600" }}>
                    * Standard rate before discount
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 1200.00 (regular price)"
                  value={formData.saleAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, saleAmount: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontWeight: "800", fontSize: "1.1rem", color: "#0f172a" }}
                />
              </div>

              {/* Dynamic Live Discount Calculation Preview */}
              {addPreview && (
                <div style={{
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  border: "1px solid #cbd5e1",
                  borderRadius: "14px",
                  padding: "0.9rem 1.1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                  fontSize: "0.85rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                    <span>Before Discount (Gross):</span>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>
                      ฿{addPreview.original.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", color: "#c2410c" }}>
                    <span>
                      Discount {addPreview.code?.code} ({addPreview.code?.discountType === "PERCENTAGE" ? `${addPreview.code?.discountValue}% OFF` : `฿${addPreview.code?.discountValue} OFF`}):
                    </span>
                    <span style={{ fontWeight: "800", color: "#ea580c" }}>
                      -฿{addPreview.discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "0.45rem",
                    borderTop: "1px solid #e2e8f0",
                    marginTop: "0.2rem"
                  }}>
                    <span style={{ fontWeight: "800", color: "#166534" }}>
                      Net Price (Billed to Guest):
                    </span>
                    <span style={{ fontWeight: "900", color: "#059669", fontSize: "1.15rem" }}>
                      ฿{addPreview.net.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional service details, e.g. 5 shirts dry clean"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "10px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: "800",
                    cursor: "pointer",
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? "Saving..." : "Record Sale"}
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
            borderRadius: "24px",
            width: "100%",
            maxWidth: "520px",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#f1f5f9",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <i className="fa-solid fa-pen-to-square"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Edit Sale Order
                  </h2>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Update gross amount and partner promo code</span>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Partner Promo Code
                </label>
                <select
                  value={formData.partnerCodeId || formData.promoCodeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerCodeId: e.target.value, promoCodeId: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.9rem" }}
                >
                  {codes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `฿${c.discountValue} off`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Customer Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.9rem" }}
                />
              </div>

              {/* Full Price Before Discount Input */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>
                    Full Price Before Discount (Gross) *
                  </label>
                  <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: "600" }}>
                    * Standard rate before discount
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.saleAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, saleAmount: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontWeight: "800", fontSize: "1.1rem", color: "#0f172a" }}
                />
              </div>

              {/* Dynamic Live Discount Calculation Preview */}
              {editPreview && (
                <div style={{
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  border: "1px solid #cbd5e1",
                  borderRadius: "14px",
                  padding: "0.9rem 1.1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                  fontSize: "0.85rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                    <span>Before Discount (Gross):</span>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>
                      ฿{editPreview.original.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", color: "#c2410c" }}>
                    <span>
                      Discount {editPreview.code?.code} ({editPreview.code?.discountType === "PERCENTAGE" ? `${editPreview.code?.discountValue}% OFF` : `฿${editPreview.code?.discountValue} OFF`}):
                    </span>
                    <span style={{ fontWeight: "800", color: "#ea580c" }}>
                      -฿{editPreview.discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "0.45rem",
                    borderTop: "1px solid #e2e8f0",
                    marginTop: "0.2rem"
                  }}>
                    <span style={{ fontWeight: "800", color: "#166534" }}>
                      Net Price (Billed to Guest):
                    </span>
                    <span style={{ fontWeight: "900", color: "#059669", fontSize: "1.15rem" }}>
                      ฿{editPreview.net.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", borderBottom: "none", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "10px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: "800",
                    cursor: "pointer",
                    opacity: isSubmitting ? 0.7 : 1
                  }}
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
