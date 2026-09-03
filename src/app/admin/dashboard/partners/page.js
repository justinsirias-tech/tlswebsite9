"use client";

import { useEffect, useState } from "react";

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
        setFormError(data.error || "เกิดข้อผิดพลาดในการสร้าง Partner");
        return;
      }

      setIsCreateModalOpen(false);
      fetchPartners();
    } catch (err) {
      setFormError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
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
        setFormError(data.error || "เกิดข้อผิดพลาดในการแก้ไข Partner");
        return;
      }

      setIsEditModalOpen(false);
      setEditingPartner(null);
      fetchPartners();
    } catch (err) {
      setFormError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
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
            จัดการบัญชีพาร์ทเนอร์และตรวจสอบรายงานยอดขายรวมทุก Partner
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
            <span>สร้าง Partner Account</span>
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
          <span>All Partner Sales (ยอดขายรวม)</span>
        </button>
      </div>

      {/* TAB 1: ACCOUNTS */}
      {activeTab === "accounts" && (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {loadingPartners ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "0.8rem" }}></i>
              <div>กำลังโหลดรายชื่อพาร์ทเนอร์...</div>
            </div>
          ) : partners.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
              <i className="fa-solid fa-handshake" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}></i>
              <h3 style={{ fontSize: "1.2rem", color: "#475569", margin: "0 0 0.5rem 0" }}>ยังไม่มีบัญชีพาร์ทเนอร์ในระบบ</h3>
              <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.9rem" }}>คลิกปุ่มด้านล่างเพื่อสร้างบัญชีแรกให้กับพาร์ทเนอร์</p>
              <button
                onClick={handleOpenCreate}
                style={{ background: "#222945", color: "#ffffff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
              >
                + สร้าง Partner Account
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>พาร์ทเนอร์ / บริษัท</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>ผู้ติดต่อ & ข้อมูลติดต่อ</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>จำนวนโค้ด</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>รายการขาย</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>ยอดขายรวม (THB)</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>สถานะ</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>จัดการ</th>
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

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "center", fontWeight: "700", color: "#0284c7" }}>
                        {p._count?.codes ?? 0} โค้ด
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "center", fontWeight: "700", color: "#475569" }}>
                        {p._count?.sales ?? 0} รายการ
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
                          แก้ไข / รหัสผ่าน
                        </button>
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
                <option value="">พาร์ทเนอร์ทั้งหมด (All Partners)</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.companyName}</option>
                ))}
              </select>

              {/* Period Tabs */}
              <div style={{ display: "flex", background: "#f1f5f9", padding: "0.25rem", borderRadius: "10px" }}>
                {[
                  { id: "all", label: "ทั้งหมด" },
                  { id: "today", label: "วันนี้" },
                  { id: "month", label: "เดือนนี้" },
                  { id: "year", label: "ปีนี้" },
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
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>ยอดรวมทั้งหมด: </span>
                <span style={{ fontSize: "1.25rem", fontWeight: "900", color: "#166534" }}>
                  ฿{salesSummary.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>จำนวนรายการ: </span>
                <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>{salesSummary.count}</span>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {loadingSales ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "0.8rem" }}></i>
                <div>กำลังโหลดข้อมูลรายการขายรวม...</div>
              </div>
            ) : sales.length === 0 ? (
              <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
                <i className="fa-solid fa-receipt" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}></i>
                <div style={{ fontSize: "1.1rem", color: "#475569" }}>ยังไม่พบรายการขายตามเงื่อนไขที่เลือก</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase" }}>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>วัน-เวลา</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>พาร์ทเนอร์</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>โค้ดโปรโมชั่น</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>ลูกค้า</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>เบอร์โทร</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>ราคาขาย (THB)</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem 1.25rem", color: "#64748b", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          {new Date(s.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", fontWeight: "700", color: "#0f172a" }}>
                          {s.partner?.companyName}
                        </td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: "800", color: "#222945", background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                            {s.promoCode?.code}
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
                สร้างบัญชีพาร์ทเนอร์ใหม่
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
                  ชื่อบริษัท / ร้านค้าพาร์ทเนอร์ *
                </label>
                <input
                  type="text"
                  placeholder="เช่น โรงแรม Grand Hotel หรือ คอนโด Luxury Ville"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  ชื่อผู้ติดต่อ *
                </label>
                <input
                  type="text"
                  placeholder="เช่น คุณวิชัย ผู้จัดการฝ่ายบริการ"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  อีเมลสำหรับเข้าสู่ระบบ *
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
                  รหัสผ่านเริ่มต้น (อย่างน้อย 6 ตัวอักษร) *
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
                  เบอร์โทรศัพท์ผู้ติดต่อ
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 02-123-4567 หรือ 081-xxx-xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  บันทึกเพิ่มเติม (Note)
                </label>
                <input
                  type="text"
                  placeholder="เช่น โครงการความร่วมมือปี 2026"
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
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "กำลังสร้าง..." : "สร้างบัญชี"}
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
                แก้ไขข้อมูล: {editingPartner?.companyName}
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
                  ชื่อบริษัท / ร้านค้าพาร์ทเนอร์ *
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
                  ชื่อผู้ติดต่อ *
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
                  อีเมล *
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
                  เปลี่ยนรหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)
                </label>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านใหม่หากต้องการรีเซ็ต"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  เบอร์โทรศัพท์ผู้ติดต่อ
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
                  บันทึกเพิ่มเติม (Note)
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
                  เปิดใช้งานบัญชีนี้ (Active)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
