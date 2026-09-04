"use client";

import { useEffect, useState } from "react";

export default function PartnerCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);

  const initialForm = {
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "15",
    discountTarget: "ALL",
    minOrderValue: "0",
    maxDiscount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    description: "",
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toInputDateTime = (dateVal) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getPromoStatus = (pc) => {
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
    const startStr = pc.startDate ? new Date(pc.startDate).toLocaleString("th-TH", formatOpt) : "Now";
    const endStr = pc.endDate ? new Date(pc.endDate).toLocaleString("th-TH", formatOpt) : "Ongoing";
    return `${startStr} → ${endStr}`;
  };

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partner/codes");
      const data = await res.json();
      if (res.ok && data.success) {
        setCodes(data.codes || []);
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

  const handleOpenEdit = (pc) => {
    setFormError("");
    setEditingCode(pc);
    setFormData({
      code: pc.code,
      discountType: pc.discountType || "PERCENTAGE",
      discountValue: String(pc.discountValue ?? "15"),
      discountTarget: pc.discountTarget || "ALL",
      minOrderValue: String(pc.minOrderValue ?? "0"),
      maxDiscount: pc.maxDiscount !== null && pc.maxDiscount !== undefined ? String(pc.maxDiscount) : "",
      usageLimit: pc.usageLimit !== null && pc.usageLimit !== undefined ? String(pc.usageLimit) : "",
      startDate: toInputDateTime(pc.startDate),
      endDate: toInputDateTime(pc.endDate),
      description: pc.description || "",
      isActive: pc.isActive
    });
    setIsEditModalOpen(true);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/partner/codes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        fetchCodes();
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
      const res = await fetch("/api/partner/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "เกิดข้อผิดพลาดในการสร้างโค้ด");
        return;
      }

      setIsCreateModalOpen(false);
      fetchCodes();
    } catch (err) {
      setFormError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingCode) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/partner/codes/${editingCode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "เกิดข้อผิดพลาดในการแก้ไขโค้ด");
        return;
      }

      setIsEditModalOpen(false);
      setEditingCode(null);
      fetchCodes();
    } catch (err) {
      setFormError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem"
      }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.3rem 0" }}>
            จัดการโค้ดโปรโมชั่น (My Promo Codes)
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
            สร้างและกำหนดเงื่อนไขวันเวลาการเปิด-ปิดใช้งานโค้ดของพาร์ทเนอร์
          </p>
        </div>

        <div style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          color: "#0369a1",
          padding: "0.6rem 1rem",
          borderRadius: "10px",
          fontSize: "0.85rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <i className="fa-solid fa-shield-halved"></i>
          <span>โค้ดโปรโมชั่นออกโดย Admin TLS (ติดต่อแอดมินเพื่อขอโค้ดเพิ่ม)</span>
        </div>
      </div>

      {/* Codes Table */}
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}></i>
            <div>กำลังโหลดข้อมูลโค้ด...</div>
          </div>
        ) : codes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
            <i className="fa-solid fa-ticket" style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.5 }}></i>
            <h3 style={{ fontSize: "1.1rem", color: "#475569", margin: "0 0 0.5rem 0" }}>ยังไม่มีโค้ดโปรโมชั่นสำหรับพาร์ทเนอร์ของคุณ</h3>
            <p style={{ fontSize: "0.85rem", margin: 0 }}>กรุณาติดต่อทีมงานผู้ดูแลระบบ TLS เพื่อสร้างโค้ดโปรโมชั่นสำหรับพาร์ทเนอร์ของคุณ</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>โค้ด (Code)</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>ส่วนลด</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>กำหนดการใช้งาน (Schedule)</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>จำนวนที่ใช้</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>สถานะ</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((pc) => {
                  const status = getPromoStatus(pc);
                  return (
                    <tr key={pc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <span style={{
                          fontFamily: "monospace",
                          fontWeight: "800",
                          color: "#222945",
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          padding: "0.3rem 0.6rem",
                          borderRadius: "6px",
                          fontSize: "0.95rem",
                          letterSpacing: "1px"
                        }}>
                          {pc.code}
                        </span>
                        {pc.description && (
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.3rem" }}>
                            {pc.description}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "1rem 1.25rem", fontWeight: "800", color: "#0f172a" }}>
                        {pc.discountType === "PERCENTAGE" ? `${pc.discountValue}% OFF` : `${pc.discountValue} THB OFF`}
                        {pc.discountTarget === "DELIVERY" && (
                          <span style={{ display: "block", fontSize: "0.75rem", color: "#0284c7", fontWeight: "600" }}>
                            (เฉพาะค่าจัดส่ง)
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "1rem 1.25rem", color: "#475569", fontSize: "0.85rem", maxWidth: "240px", lineHeight: "1.4" }}>
                        {formatSchedule(pc)}
                      </td>

                      <td style={{ padding: "1rem 1.25rem", textAlign: "center", fontWeight: "700", color: "#334155" }}>
                        {pc._count?.sales ?? pc.usedCount} {pc.usageLimit ? `/ ${pc.usageLimit}` : "(ไม่จำกัด)"}
                      </td>

                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", alignItems: "flex-start" }}>
                          <span style={{
                            background: status.bg,
                            color: status.color,
                            border: `1px solid ${status.border}`,
                            padding: "0.25rem 0.6rem",
                            borderRadius: "12px",
                            fontWeight: "700",
                            fontSize: "0.75rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem"
                          }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: status.color }}></span>
                            {status.label}
                          </span>

                          <button
                            onClick={() => handleToggleActive(pc.id, pc.isActive)}
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
                      </td>

                      <td style={{ padding: "1rem 1.25rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleOpenEdit(pc)}
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
                          <span>แก้ไข</span>
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

      {/* Modal: Edit Code */}
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
            maxWidth: "540px",
            padding: "2rem",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                แก้ไขโค้ด: {editingCode?.code}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    วัน-เวลาเริ่มต้น (Start Date)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>เว้นว่างหากเริ่มทันที</span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    วัน-เวลาสิ้นสุด (End Date)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>เว้นว่างหากไม่มีวันหมดอายุ</span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  คำอธิบาย / รายละเอียดโค้ด
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="partnerCodeActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="partnerCodeActive" style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155", cursor: "pointer" }}>
                  เปิดใช้งานโค้ดนี้ (Active)
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
                  {isSubmitting ? "กำลังบันทึก..." : "อัปเดตโค้ด"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
