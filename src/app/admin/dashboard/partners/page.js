"use client";

import { useEffect, useState } from "react";
import { toInputDateTime, toISOStringOrNull } from "@/lib/dateUtils";

export default function AdminPartnersPage() {
  const [activeTab, setActiveTab] = useState("accounts"); // "accounts" | "sales"

  // Partners State
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  // Sales State
  const [sales, setSales] = useState([]);
  const [salesSummary, setSalesSummary] = useState({ count: 0, totalRevenue: 0 });
  const [loadingSales, setLoadingSales] = useState(false);
  const [filterPartnerId, setFilterPartnerId] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // Codes Management for a selected Partner
  const [selectedPartnerForCodes, setSelectedPartnerForCodes] = useState(null);
  const [partnerCodes, setPartnerCodes] = useState([]);
  const [loadingPartnerCodes, setLoadingPartnerCodes] = useState(false);
  const [isCreateCodeModalOpen, setIsCreateCodeModalOpen] = useState(false);
  const [isEditCodeModalOpen, setIsEditCodeModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);

  const initialCodeForm = {
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "15",
    minOrderValue: "0",
    maxDiscount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    description: "",
    isActive: true
  };
  const [codeFormData, setCodeFormData] = useState(initialCodeForm);
  const [codeFormError, setCodeFormError] = useState("");
  const [isCodeSubmitting, setIsCodeSubmitting] = useState(false);

  const getCodeStatus = (pc) => {
    if (!pc.isActive) {
      return { label: "Disabled", color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1" };
    }
    const now = new Date();
    if (pc.startDate && new Date(pc.startDate) > now) {
      return { label: "Upcoming (Auto)", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" };
    }
    if (pc.endDate && new Date(pc.endDate) < now) {
      return { label: "Expired (Auto)", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
    }
    return { label: "Active", color: "#166534", bg: "#dcfce7", border: "#bbf7d0" };
  };

  const formatSchedule = (pc) => {
    if (!pc.startDate && !pc.endDate) {
      return "Always Active (No limits)";
    }
    const formatOpt = { dateStyle: "medium", timeStyle: "short" };
    const startStr = pc.startDate ? new Date(pc.startDate).toLocaleString("en-US", formatOpt) : "Now";
    const endStr = pc.endDate ? new Date(pc.endDate).toLocaleString("en-US", formatOpt) : "Ongoing";
    return `${startStr} → ${endStr}`;
  };

  const fetchPartnerCodes = async (partnerId) => {
    try {
      setLoadingPartnerCodes(true);
      const res = await fetch(`/api/admin/partners/${partnerId}/codes`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPartnerCodes(data.codes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPartnerCodes(false);
    }
  };

  const handleOpenCodesModal = (partner) => {
    setSelectedPartnerForCodes(partner);
    fetchPartnerCodes(partner.id);
  };

  const handleOpenCreateCode = () => {
    setCodeFormError("");
    setCodeFormData(initialCodeForm);
    setIsCreateCodeModalOpen(true);
  };

  const handleOpenEditCode = (pc) => {
    setCodeFormError("");
    setEditingCode(pc);
    setCodeFormData({
      code: pc.code,
      discountType: pc.discountType || "PERCENTAGE",
      discountValue: String(pc.discountValue ?? "15"),
      minOrderValue: String(pc.minOrderValue ?? "0"),
      maxDiscount: pc.maxDiscount !== null && pc.maxDiscount !== undefined ? String(pc.maxDiscount) : "",
      usageLimit: pc.usageLimit !== null && pc.usageLimit !== undefined ? String(pc.usageLimit) : "",
      startDate: toInputDateTime(pc.startDate),
      endDate: toInputDateTime(pc.endDate),
      description: pc.description || "",
      isActive: pc.isActive
    });
    setIsEditCodeModalOpen(true);
  };

  const handleToggleCodeActive = async (codeId, currentStatus) => {
    if (!selectedPartnerForCodes) return;
    try {
      const res = await fetch(`/api/admin/partners/${selectedPartnerForCodes.id}/codes/${codeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        fetchPartnerCodes(selectedPartnerForCodes.id);
        fetchPartners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCode = async (codeId) => {
    if (!selectedPartnerForCodes) return;
    if (!window.confirm("Are you sure you want to delete this partner code?")) return;

    try {
      const res = await fetch(`/api/admin/partners/${selectedPartnerForCodes.id}/codes/${codeId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete partner code.");
        return;
      }
      if (data.message && data.message.includes("deactivated")) {
        alert(data.message);
      }
      fetchPartnerCodes(selectedPartnerForCodes.id);
      fetchPartners();
    } catch (err) {
      console.error("Failed to delete partner code:", err);
      alert("Unable to connect to the server.");
    }
  };

  const handleSubmitCreateCode = async (e) => {
    e.preventDefault();
    if (!selectedPartnerForCodes) return;
    setCodeFormError("");
    setIsCodeSubmitting(true);

    try {
      const payload = {
        ...codeFormData,
        startDate: toISOStringOrNull(codeFormData.startDate),
        endDate: toISOStringOrNull(codeFormData.endDate)
      };

      const res = await fetch(`/api/admin/partners/${selectedPartnerForCodes.id}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setCodeFormError(data.error || "An error occurred while creating the promo code.");
        return;
      }

      setIsCreateCodeModalOpen(false);
      fetchPartnerCodes(selectedPartnerForCodes.id);
      fetchPartners();
    } catch (err) {
      setCodeFormError("Unable to connect to the server.");
    } finally {
      setIsCodeSubmitting(false);
    }
  };

  const handleSubmitEditCode = async (e) => {
    e.preventDefault();
    if (!editingCode) return;
    setCodeFormError("");
    setIsCodeSubmitting(true);

    try {
      const payload = {
        ...codeFormData,
        startDate: toISOStringOrNull(codeFormData.startDate),
        endDate: toISOStringOrNull(codeFormData.endDate)
      };

      const res = await fetch(`/api/admin/partners/${selectedPartnerForCodes.id}/codes/${editingCode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setCodeFormError(data.error || "An error occurred while updating the partner code.");
        return;
      }

      setIsEditCodeModalOpen(false);
      setEditingCode(null);
      if (selectedPartnerForCodes) fetchPartnerCodes(selectedPartnerForCodes.id);
      fetchPartners();
    } catch (err) {
      setCodeFormError("Unable to connect to the server.");
    } finally {
      setIsCodeSubmitting(false);
    }
  };

  const initialForm = {
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    phone: "",
    note: "",
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Partners
  const fetchPartners = async () => {
    try {
      setLoadingPartners(true);
      const res = await fetch("/api/admin/partners");
      const data = await res.json();
      if (res.ok && data.success) {
        setPartners(data.partners || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPartners(false);
    }
  };

  // Fetch All Partner Sales
  const fetchSales = async () => {
    try {
      setLoadingSales(true);
      const params = new URLSearchParams();
      if (filterPartnerId) params.append("partnerId", filterPartnerId);
      if (filterPeriod && filterPeriod !== "all") params.append("period", filterPeriod);

      const res = await fetch(`/api/admin/partners/sales?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSales(data.sales || []);
        setSalesSummary(data.summary || { count: 0, totalRevenue: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (activeTab === "sales") {
      fetchSales();
    }
  }, [activeTab, filterPartnerId, filterPeriod]);

  const handleOpenCreate = () => {
    setFormError("");
    setFormData(initialForm);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setFormError("");
    setEditingPartner(p);
    setFormData({
      companyName: p.companyName,
      contactName: p.contactName,
      email: p.email,
      password: "", // Leave blank if keeping current password
      phone: p.phone || "",
      note: p.note || "",
      isActive: p.isActive
    });
    setIsEditModalOpen(true);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        fetchPartners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "An error occurred while creating the partner account.");
        return;
      }

      setIsCreateModalOpen(false);
      fetchPartners();
    } catch (err) {
      setFormError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingPartner) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Do not overwrite password if empty

      const res = await fetch(`/api/admin/partners/${editingPartner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "An error occurred while updating the partner account.");
        return;
      }

      setIsEditModalOpen(false);
      setEditingPartner(null);
      fetchPartners();
    } catch (err) {
      setFormError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#222945", margin: 0 }}>
            Partners & Sales Management
          </h1>
          <p style={{ color: "#64748b", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
            Manage partner accounts and monitor aggregated sales across all partners
          </p>
        </div>

        {activeTab === "accounts" && (
          <button
            onClick={handleOpenCreate}
            style={{
              background: "#222945",
              color: "#ffffff",
              border: "none",
              padding: "0.75rem 1.25rem",
              borderRadius: "10px",
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
            <span>Create Partner Account</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveTab("accounts")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "accounts" ? "3px solid #222945" : "3px solid transparent",
            color: activeTab === "accounts" ? "#222945" : "#64748b",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-users"></i>
          <span>Partner Accounts ({partners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "sales" ? "3px solid #222945" : "3px solid transparent",
            color: activeTab === "sales" ? "#222945" : "#64748b",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-receipt"></i>
          <span>All Partner Sales</span>
        </button>
      </div>

      {/* TAB 1: ACCOUNTS */}
      {activeTab === "accounts" && (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {loadingPartners ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "0.8rem" }}></i>
              <div>Loading partner accounts...</div>
            </div>
          ) : partners.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
              <i className="fa-solid fa-handshake" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}></i>
              <h3 style={{ fontSize: "1.2rem", color: "#475569", margin: "0 0 0.5rem 0" }}>No partner accounts found</h3>
              <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.9rem" }}>Click the button below to create the first partner account</p>
              <button
                onClick={handleOpenCreate}
                style={{ background: "#222945", color: "#ffffff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
              >
                + Create Partner Account
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Partner / Company</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Contact Info</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>Promo Codes</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>Sales Orders</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Total Revenue (THB)</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1.1rem 1.25rem" }}>
                        <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "1rem" }}>{p.companyName}</div>
                        {p.note && <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>{p.note}</div>}
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem" }}>
                        <div style={{ fontWeight: "700", color: "#334155" }}>{p.contactName}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>
                          <i className="fa-solid fa-envelope" style={{ marginRight: "0.3rem" }}></i>
                          {p.email}
                        </div>
                        {p.phone && (
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.1rem" }}>
                            <i className="fa-solid fa-phone" style={{ marginRight: "0.3rem" }}></i>
                            {p.phone}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleOpenCodesModal(p)}
                          title="Click to view and manage promo codes for this partner"
                          style={{
                            background: "#f0f9ff",
                            color: "#0284c7",
                            border: "1px solid #bae6fd",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem"
                          }}
                        >
                          <i className="fa-solid fa-ticket"></i>
                          <span>{p._count?.codes ?? 0} Codes (Manage)</span>
                        </button>
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "center", fontWeight: "700", color: "#475569" }}>
                        {p._count?.sales ?? 0} orders
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "right", fontWeight: "900", color: "#166534", fontSize: "1.05rem" }}>
                        ฿{p.totalRevenue?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleToggleActive(p.id, p.isActive)}
                          style={{
                            background: p.isActive ? "#dcfce7" : "#f1f5f9",
                            color: p.isActive ? "#166534" : "#64748b",
                            border: `1px solid ${p.isActive ? "#bbf7d0" : "#cbd5e1"}`,
                            padding: "0.3rem 0.75rem",
                            borderRadius: "20px",
                            fontWeight: "700",
                            fontSize: "0.75rem",
                            cursor: "pointer"
                          }}
                        >
                          {p.isActive ? "● Active" : "○ Disabled"}
                        </button>
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleOpenCodesModal(p)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              background: "#222945",
                              color: "#ffffff",
                              border: "none",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem"
                            }}
                          >
                            <i className="fa-solid fa-ticket"></i>
                            <span>Manage Codes</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              background: "#f1f5f9",
                              color: "#334155",
                              border: "1px solid #cbd5e1",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              cursor: "pointer"
                            }}
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
      )}

      {/* TAB 2: ALL SALES */}
      {activeTab === "sales" && (
        <div>
          {/* Filters & Total Summary */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {/* Partner Dropdown */}
              <select
                value={filterPartnerId}
                onChange={(e) => setFilterPartnerId(e.target.value)}
                style={{ padding: "0.5rem 0.85rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: "600", color: "#334155" }}
              >
                <option value="">All Partners</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.companyName}</option>
                ))}
              </select>

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
                    onClick={() => setFilterPeriod(t.id)}
                    style={{
                      padding: "0.45rem 0.85rem",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: filterPeriod === t.id ? "#ffffff" : "transparent",
                      color: filterPeriod === t.id ? "#222945" : "#64748b",
                      boxShadow: filterPeriod === t.id ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sales Metric */}
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Total Revenue: </span>
                <span style={{ fontSize: "1.25rem", fontWeight: "900", color: "#166534" }}>
                  ฿{salesSummary.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Total Orders: </span>
                <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>{salesSummary.count}</span>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {loadingSales ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "0.8rem" }}></i>
                <div>Loading partner sales data...</div>
              </div>
            ) : sales.length === 0 ? (
              <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
                <i className="fa-solid fa-receipt" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}></i>
                <div style={{ fontSize: "1.1rem", color: "#475569" }}>No sales found for the selected filter</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase" }}>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Date & Time</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Partner</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Promo Code</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Customer Name</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Phone Number</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Sale Price (THB)</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem 1.25rem", color: "#64748b", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          {new Date(s.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", fontWeight: "700", color: "#0f172a" }}>
                          {s.partner?.companyName}
                        </td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: "800", color: "#222945", background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                            {s.partnerCode?.code || s.promoCode?.code}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 1.25rem", fontWeight: "600", color: "#334155" }}>
                          {s.customerName}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", fontFamily: "monospace", color: "#64748b" }}>
                          {s.customerPhone}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right", fontWeight: "900", color: "#166534" }}>
                          ฿{s.saleAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", color: "#64748b", fontSize: "0.85rem", maxWidth: "200px" }}>
                          {s.note || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Partner */}
      {isCreateModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "520px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Create Partner Account
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Company / Business Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Hotel or Luxury Residence"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe, Operations Manager"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Login Email *
                </label>
                <input
                  type="email"
                  placeholder="partner@hotel.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Initial Password (min. 6 characters) *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 081-234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partnership project 2026"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Partner */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "520px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Edit Partner: {editingPartner?.companyName}
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>
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
                  Company / Business Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password to reset"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="adminPartnerActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="adminPartnerActive" style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155", cursor: "pointer" }}>
                  Account Active
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
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
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Partner Codes Management */}
      {selectedPartnerForCodes && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            {/* Header */}
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd", padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                    PARTNER CODES
                  </span>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    {selectedPartnerForCodes.companyName}
                  </h2>
                </div>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Contact: {selectedPartnerForCodes.contactName} ({selectedPartnerForCodes.email})
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button
                  onClick={handleOpenCreateCode}
                  style={{
                    background: "#222945",
                    color: "#ffffff",
                    border: "none",
                    padding: "0.6rem 1.1rem",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    boxShadow: "0 4px 10px rgba(34, 41, 69, 0.15)"
                  }}
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Create Code for Partner</span>
                </button>

                <button
                  onClick={() => setSelectedPartnerForCodes(null)}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.3rem" }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "1.5rem 2rem", overflowY: "auto", flex: 1 }}>
              {loadingPartnerCodes ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "#64748b" }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}></i>
                  <div>Loading partner codes...</div>
                </div>
              ) : partnerCodes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                  <i className="fa-solid fa-ticket" style={{ fontSize: "2.5rem", marginBottom: "0.8rem", opacity: 0.5 }}></i>
                  <h3 style={{ fontSize: "1.1rem", color: "#475569", margin: "0 0 0.4rem 0" }}>No promo codes for this partner</h3>
                  <p style={{ fontSize: "0.85rem", margin: "0 0 1.25rem 0" }}>Click the button below to create promo codes for this partner</p>
                  <button
                    onClick={handleOpenCreateCode}
                    style={{
                      background: "#222945",
                      color: "#ffffff",
                      border: "none",
                      padding: "0.6rem 1.25rem",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    + Create Code for Partner
                  </button>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.75rem", textTransform: "uppercase" }}>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Promo Code</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Discount</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Schedule</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Usage / Limit</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerCodes.map((pc) => {
                      const st = getCodeStatus(pc);
                      return (
                        <tr key={pc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span style={{
                              fontFamily: "monospace",
                              fontWeight: "800",
                              color: "#222945",
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.95rem"
                            }}>
                              {pc.code}
                            </span>
                            {pc.description && (
                              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                                {pc.description}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: "0.85rem 1rem", fontWeight: "700", color: "#0f172a" }}>
                            {pc.discountType === "PERCENTAGE" ? `${pc.discountValue}% OFF` : `${pc.discountValue} THB`}
                          </td>

                          <td style={{ padding: "0.85rem 1rem", color: "#475569", fontSize: "0.8rem", maxWidth: "200px" }}>
                            {formatSchedule(pc)}
                          </td>

                          <td style={{ padding: "0.85rem 1rem", textAlign: "center", fontWeight: "700", color: "#334155" }}>
                            {pc._count?.sales ?? pc.usedCount} {pc.usageLimit ? `/ ${pc.usageLimit}` : "(Unlimited)"}
                          </td>

                          <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                            <span style={{
                              background: st.bg,
                              color: st.color,
                              border: `1px solid ${st.border}`,
                              padding: "0.2rem 0.55rem",
                              borderRadius: "10px",
                              fontWeight: "700",
                              fontSize: "0.75rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem"
                            }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: st.color }}></span>
                              {st.label}
                            </span>
                          </td>

                          <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                              <button
                                onClick={() => handleToggleCodeActive(pc.id, pc.isActive)}
                                style={{
                                  background: "none",
                                  border: "1px solid #cbd5e1",
                                  color: pc.isActive ? "#991b1b" : "#166534",
                                  padding: "0.3rem 0.6rem",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                              >
                                {pc.isActive ? "Turn Off" : "Turn On"}
                              </button>
                              <button
                                onClick={() => handleOpenEditCode(pc)}
                                style={{
                                  background: "#f1f5f9",
                                  border: "1px solid #cbd5e1",
                                  color: "#334155",
                                  padding: "0.3rem 0.6rem",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCode(pc.id)}
                                style={{
                                  background: "#fef2f2",
                                  border: "1px solid #fecaca",
                                  color: "#991b1b",
                                  padding: "0.3rem 0.6rem",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                              >
                                Delete
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

            {/* Footer */}
            <div style={{ padding: "1rem 2rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedPartnerForCodes(null)}
                style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Create Code for Selected Partner */}
      {isCreateCodeModalOpen && selectedPartnerForCodes && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "540px", padding: "2rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Create Code for {selectedPartnerForCodes.companyName}
                </h3>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  This partner code will be assigned to this partner account automatically
                </p>
              </div>
              <button onClick={() => setIsCreateCodeModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            {codeFormError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {codeFormError}
              </div>
            )}

            <form onSubmit={handleSubmitCreateCode} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Partner Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. GRAND20 or LUXURY15"
                  value={codeFormData.code}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontFamily: "monospace", fontWeight: "800", letterSpacing: "1px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Discount Type
                  </label>
                  <select
                    value={codeFormData.discountType}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (THB)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15"
                    value={codeFormData.discountValue}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontWeight: "700" }}
                  />
                </div>
              </div>

              {/* Start & End Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={codeFormData.startDate}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Leave blank to start immediately</span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={codeFormData.endDate}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Leave blank for no expiration</span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Usage Limit
                </label>
                <input
                  type="number"
                  placeholder="Leave blank for unlimited"
                  value={codeFormData.usageLimit}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Description / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exclusive discount for partner guests"
                  value={codeFormData.description}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateCodeModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCodeSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isCodeSubmitting ? 0.7 : 1 }}
                >
                  {isCodeSubmitting ? "Creating..." : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Modal: Edit Code */}
      {isEditCodeModalOpen && editingCode && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "540px", padding: "2rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Edit Partner Code: {editingCode.code}
                </h3>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Modify conditions, schedule, and active status
                </p>
              </div>
              <button onClick={() => setIsEditCodeModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            {codeFormError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {codeFormError}
              </div>
            )}

            <form onSubmit={handleSubmitEditCode} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Discount Type
                  </label>
                  <select
                    value={codeFormData.discountType}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (THB)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={codeFormData.discountValue}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontWeight: "700" }}
                  />
                </div>
              </div>

              {/* Start & End Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={codeFormData.startDate}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={codeFormData.endDate}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Description / Notes
                </label>
                <input
                  type="text"
                  value={codeFormData.description}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="adminEditCodeActive"
                  checked={codeFormData.isActive}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="adminEditCodeActive" style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155", cursor: "pointer" }}>
                  Enable this code (Active)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsEditCodeModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCodeSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isCodeSubmitting ? 0.7 : 1 }}
                >
                  {isCodeSubmitting ? "Saving..." : "Update Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
