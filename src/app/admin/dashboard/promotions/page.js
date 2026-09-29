"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../../admin.module.css";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    if (previewImage) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [previewImage]);

  const initialForm = {
    title: "",
    title_th: "",
    title_cn: "",
    description: "",
    desc_th: "",
    desc_cn: "",
    code: "",
    badge: "",
    badge_th: "",
    badge_cn: "",
    imageUrl: "",
    category: "monthly",
    validUntil: "",
    bookUrl: "",
    lineUrl: "",
    whatsappUrl: "",
    reviewContent: "",
    reviewContent_th: "",
    reviewContent_cn: "",
    reviewUrl: "",
    clicksBook: 0,
    clicksLine: 0,
    clicksWhatsapp: 0,
    clicksReview: 0,
    isActive: true,
    sortOrder: 0
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      if (data.success) {
        setPromotions(data.promotions || []);
      }
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
      setError("Failed to load promotions.");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setError("");
    setSuccess("");
    setImageError("");
    setUploadingImage(false);
    setShowModal(true);
  };

  const handleOpenEdit = (promo) => {
    setEditingId(promo.id);
    setFormData({
      title: promo.title || "",
      title_th: promo.title_th || "",
      title_cn: promo.title_cn || "",
      description: promo.description || "",
      desc_th: promo.desc_th || "",
      desc_cn: promo.desc_cn || "",
      code: promo.code || "",
      badge: promo.badge || "",
      badge_th: promo.badge_th || "",
      badge_cn: promo.badge_cn || "",
      imageUrl: promo.imageUrl || "",
      category: promo.category || "monthly",
      validUntil: promo.validUntil || "",
      bookUrl: promo.bookUrl || "",
      lineUrl: promo.lineUrl || "",
      whatsappUrl: promo.whatsappUrl || "",
      reviewContent: promo.reviewContent || "",
      reviewContent_th: promo.reviewContent_th || "",
      reviewContent_cn: promo.reviewContent_cn || "",
      reviewUrl: promo.reviewUrl || "",
      clicksBook: promo.clicksBook || 0,
      clicksLine: promo.clicksLine || 0,
      clicksWhatsapp: promo.clicksWhatsapp || 0,
      clicksReview: promo.clicksReview || 0,
      isActive: promo.isActive !== undefined ? promo.isActive : true,
      sortOrder: promo.sortOrder || 0
    });
    setError("");
    setSuccess("");
    setImageError("");
    setUploadingImage(false);
    setShowModal(true);
  };

  const handleResetStats = async (promoId) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตสถิติการคลิกของโปรโมชั่นนี้กลับเป็น 0?")) return;
    try {
      const res = await fetch(`/api/admin/promotions/${promoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clicksBook: 0,
          clicksLine: 0,
          clicksWhatsapp: 0,
          clicksReview: 0
        })
      });
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          clicksBook: 0,
          clicksLine: 0,
          clicksWhatsapp: 0,
          clicksReview: 0
        }));
        setPromotions(prev => prev.map(p => p.id === promoId ? {
          ...p,
          clicksBook: 0,
          clicksLine: 0,
          clicksWhatsapp: 0,
          clicksReview: 0
        } : p));
        setSuccess("รีเซ็ตสถิติการคลิกกลับเป็น 0 สำเร็จ");
      } else {
        setError("ไม่สามารถรีเซ็ตสถิติได้");
      }
    } catch (err) {
      console.error("Failed to reset stats:", err);
      setError("เกิดข้อผิดพลาดในการรีเซ็ตสถิติ");
    }
  };

  const handleCopyDirectLink = (promo) => {
    if (!promo || typeof window === "undefined") return;
    const key = promo.code || promo.id;
    const shareUrl = `${window.location.origin}/th/promotions?promo=${encodeURIComponent(key)}`;
    navigator.clipboard.writeText(shareUrl);
    setSuccess(`คัดลอกลิงก์โปรโมชั่น (${promo.code || promo.title}) เรียบร้อยแล้ว: ${shareUrl}`);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file (PNG, JPG, WEBP, etc.).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image file size must be less than 10MB.");
      return;
    }

    setUploadingImage(true);
    setImageError("");

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data
      });
      const result = await res.json();
      if (res.ok && result.url) {
        setFormData(prev => ({ ...prev, imageUrl: result.url }));
      } else {
        setImageError(result.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setImageError("An error occurred during image upload.");
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setPromotions(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promotion offer?")) return;

    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setPromotions(prev => prev.filter(p => p.id !== id));
        setSuccess("Promotion deleted successfully.");
      }
    } catch (err) {
      console.error("Failed to delete promotion:", err);
      setError("Failed to delete promotion.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description) {
      setError("Title and Description are required.");
      setSaving(false);
      return;
    }

    try {
      const url = editingId ? `/api/admin/promotions/${editingId}` : "/api/admin/promotions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(editingId ? "Promotion updated!" : "Promotion created!");
        setShowModal(false);
        fetchPromotions();
      } else {
        setError(data.error || "Failed to save promotion");
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
            <i className="fa-solid fa-rectangle-ad" style={{ color: "#222945", marginRight: "0.75rem" }}></i>
            Promotions & Special Deals Manager
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Create and update monthly promotions, flash deals, and promo codes for the website.
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
          Add New Promotion
        </button>
      </div>

      {/* Quick KPI Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Total Offers</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#222945", marginTop: "0.25rem" }}>
            {promotions.length}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#16a34a", marginTop: "0.25rem", fontWeight: "600" }}>
            ● {promotions.filter(p => p.isActive).length} Active now
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Total Button Clicks</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#2563eb", marginTop: "0.25rem" }}>
            {promotions.reduce((sum, p) => sum + (p.clicksBook || 0) + (p.clicksLine || 0) + (p.clicksWhatsapp || 0) + (p.clicksReview || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
            สถิติกดทั้ง 4 ปุ่มรวมกัน
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Book Online Clicks</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1d4ed8", marginTop: "0.25rem" }}>
            {promotions.reduce((sum, p) => sum + (p.clicksBook || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
            🛒 คลิกจองทางหน้าเว็บ
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Social & Review Clicks</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#15803d", marginTop: "0.25rem" }}>
            {promotions.reduce((sum, p) => sum + (p.clicksLine || 0) + (p.clicksWhatsapp || 0) + (p.clicksReview || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
            💬 LINE, WA & Review
          </div>
        </div>
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
            maxWidth: "750px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.3rem", color: "#222945", fontWeight: "700" }}>
                {editingId ? "Edit Promotion Offer" : "Create New Promotion Offer"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.25rem" }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    Category *
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945", fontWeight: "600" }}
                  >
                    <option value="monthly">Monthly Deal</option>
                    <option value="flash">Flash Sale</option>
                    <option value="welcome">Welcome Offer</option>
                    <option value="partner">Partner Deal</option>
                    <option value="seasonal">Seasonal Special</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    Promo Code (e.g. TLSWELCOME15)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. WELCOME15"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945", fontWeight: "700" }}
                  />
                </div>
              </div>

              {/* Title Fields */}
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", color: "#222945", fontWeight: "700", fontSize: "0.95rem", marginBottom: "0.75rem" }}>
                  Offer Title (Multi-Language) *
                </label>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <input 
                    type="text" 
                    placeholder="English Title (e.g., First Time Order 15% Off)"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#222945", fontWeight: "500" }}
                  />
                  <input 
                    type="text" 
                    placeholder="Thai Title (e.g., ส่วนลด 15% สำหรับลูกค้านัดครั้งแรก)"
                    value={formData.title_th}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_th: e.target.value }))}
                    style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#222945", fontWeight: "500" }}
                  />
                  <input 
                    type="text" 
                    placeholder="Chinese Title (e.g., 首单预约 85 折优惠)"
                    value={formData.title_cn}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_cn: e.target.value }))}
                    style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#222945", fontWeight: "500" }}
                  />
                </div>
              </div>

              {/* Badge Tags */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.85rem", marginBottom: "0.3rem" }}>Badge (EN)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 15% OFF"
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.85rem", marginBottom: "0.3rem" }}>Badge (TH)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ลด 15%"
                    value={formData.badge_th}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge_th: e.target.value }))}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.85rem", marginBottom: "0.3rem" }}>Badge (CN)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 立减15%"
                    value={formData.badge_cn}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge_cn: e.target.value }))}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945" }}
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", color: "#222945", fontWeight: "700", fontSize: "0.95rem", marginBottom: "0.75rem" }}>
                  Offer Description *
                </label>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <textarea 
                    rows={3}
                    placeholder="English Description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#222945", lineHeight: "1.5" }}
                  />
                  <textarea 
                    rows={2}
                    placeholder="Thai Description..."
                    value={formData.desc_th}
                    onChange={(e) => setFormData(prev => ({ ...prev, desc_th: e.target.value }))}
                    style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#222945", lineHeight: "1.5" }}
                  />
                  <textarea 
                    rows={2}
                    placeholder="Chinese Description..."
                    value={formData.desc_cn}
                    onChange={(e) => setFormData(prev => ({ ...prev, desc_cn: e.target.value }))}
                    style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#222945", lineHeight: "1.5" }}
                  />
                </div>
              </div>

              {/* Validity & Image */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    Valid Until / Schedule Text
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Valid through Sept 30, 2026"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#222945" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    Banner Image (Optional)
                  </label>

                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />

                  {formData.imageUrl ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.5rem 0.75rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      background: "#f8fafc"
                    }}>
                      <div
                        onClick={() => setPreviewImage({ url: formData.imageUrl, title: formData.title || "Promotion Banner Preview" })}
                        title="Click to preview full image"
                        style={{ position: "relative", width: "42px", height: "42px", borderRadius: "6px", overflow: "hidden", border: "1px solid #cbd5e1", flexShrink: 0, cursor: "pointer" }}
                      >
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.4)",
                          opacity: 0,
                          transition: "opacity 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontSize: "0.8rem"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                        >
                          <i className="fa-solid fa-magnifying-glass-plus"></i>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", color: "#166534", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <i className="fa-solid fa-circle-check"></i> Image Uploaded
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {formData.imageUrl}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                          padding: "0.3rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "#334155",
                          cursor: "pointer"
                        }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                        style={{
                          padding: "0.3rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "#991b1b",
                          cursor: "pointer"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                          width: "100%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          padding: "0.7rem 1rem",
                          borderRadius: "8px",
                          border: "1px dashed #94a3b8",
                          background: "#f8fafc",
                          color: "#334155",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                          cursor: uploadingImage ? "not-allowed" : "pointer"
                        }}
                      >
                        {uploadingImage ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <span>Uploading image...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-cloud-arrow-up" style={{ color: "#2563eb", fontSize: "1.1rem" }}></i>
                            <span>Upload Image File</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Fallback direct URL input */}
                  <div style={{ marginTop: "0.35rem" }}>
                    <input 
                      type="text" 
                      placeholder="Or paste image URL (https://...)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "0.75rem" }}
                    />
                  </div>

                  {imageError && (
                    <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.3rem" }}>
                      {imageError}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Action Button URLs (Optional) */}
              <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", color: "#222945", fontWeight: "700", fontSize: "0.95rem", marginBottom: "0.4rem" }}>
                  <i className="fa-solid fa-link" style={{ marginRight: "0.5rem", color: "#2563eb" }}></i>
                  Custom Action Button URLs (Optional)
                </label>
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "0.65rem 0.9rem", borderRadius: "8px", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="fa-solid fa-circle-info" style={{ color: "#2563eb", fontSize: "1rem" }}></i>
                  <span style={{ color: "#1e40af", fontSize: "0.83rem", fontWeight: "600" }}>
                    ช่องไหนหากไม่ใส่ข้อมูล (เว้นว่างไว้) ปุ่มนั้นจะไม่ขึ้นมาแสดงผลบนหน้าต่างโปรโมชั่นครับ
                  </span>
                </div>

                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem", flexWrap: "wrap", gap: "0.4rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <label style={{ color: "#334155", fontWeight: "700", fontSize: "0.85rem", margin: 0 }}>
                          1. Book Online Button URL <span style={{ color: "#64748b", fontWeight: "400", fontSize: "0.78rem" }}>(เว้นว่าง = ไม่แสดงปุ่มนี้)</span>
                        </label>
                        {editingId && (
                          <span style={{ background: "#dbeafe", color: "#1e40af", padding: "0.12rem 0.45rem", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700" }}>
                            <i className="fa-solid fa-chart-simple" style={{ marginRight: "0.2rem" }}></i>คลิก {formData.clicksBook || 0}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, bookUrl: `/[locale]/booking${prev.code ? `?promo=${prev.code}` : ""}` }))}
                        style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.72rem", padding: "0.15rem 0.45rem", cursor: "pointer", color: "#2563eb", fontWeight: "600" }}
                      >
                        + ใช้ลิงก์จองหน้าเว็บของร้าน
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="เช่น /[locale]/booking?promo=CODE หรือ https://... (เว้นว่าง = ไม่แสดงปุ่มจอง)"
                      value={formData.bookUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookUrl: e.target.value }))}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#222945", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem", flexWrap: "wrap", gap: "0.4rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <label style={{ color: "#00B900", fontWeight: "700", fontSize: "0.85rem", margin: 0 }}>
                            <i className="fa-brands fa-line" style={{ marginRight: "0.35rem" }}></i>
                            2. LINE OA URL <span style={{ color: "#64748b", fontWeight: "400", fontSize: "0.78rem" }}>(เว้นว่าง = ไม่แสดง)</span>
                          </label>
                          {editingId && (
                            <span style={{ background: "#dcfce7", color: "#15803d", padding: "0.12rem 0.45rem", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700" }}>
                              <i className="fa-solid fa-chart-simple" style={{ marginRight: "0.2rem" }}></i>คลิก {formData.clicksLine || 0}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, lineUrl: "https://lin.ee/B2monGQ" }))}
                          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", fontSize: "0.72rem", padding: "0.15rem 0.45rem", cursor: "pointer", color: "#15803d", fontWeight: "600" }}
                        >
                          + LINE ของร้าน
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="เช่น https://line.me/R/ti/p/... (เว้นว่าง = ไม่แสดงปุ่ม LINE)"
                        value={formData.lineUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, lineUrl: e.target.value }))}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#222945", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem", flexWrap: "wrap", gap: "0.4rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <label style={{ color: "#25D366", fontWeight: "700", fontSize: "0.85rem", margin: 0 }}>
                            <i className="fa-brands fa-whatsapp" style={{ marginRight: "0.35rem" }}></i>
                            3. WhatsApp URL <span style={{ color: "#64748b", fontWeight: "400", fontSize: "0.78rem" }}>(เว้นว่าง = ไม่แสดง)</span>
                          </label>
                          {editingId && (
                            <span style={{ background: "#dcfce7", color: "#15803d", padding: "0.12rem 0.45rem", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700" }}>
                              <i className="fa-solid fa-chart-simple" style={{ marginRight: "0.2rem" }}></i>คลิก {formData.clicksWhatsapp || 0}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, whatsappUrl: "https://wa.me/message/7BO67YACZI6SH1" }))}
                          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", fontSize: "0.72rem", padding: "0.15rem 0.45rem", cursor: "pointer", color: "#15803d", fontWeight: "600" }}
                        >
                          + WhatsApp ของร้าน
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="เช่น https://wa.me/... (เว้นว่าง = ไม่แสดงปุ่ม WhatsApp)"
                        value={formData.whatsappUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsappUrl: e.target.value }))}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#222945", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  {/* 4. Click To Review Button (Optional) */}
                  <div style={{ marginTop: "0.4rem", padding: "0.85rem 1rem", background: "#f0f7ff", border: "1.5px solid #bfdbfe", borderRadius: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.4rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#1e40af", fontWeight: "700", fontSize: "0.88rem", margin: 0 }}>
                          <i className="fa-solid fa-file-lines" style={{ color: "#2563eb" }}></i>
                          4. "Click To Review" Button (Popup Information)
                        </label>
                        {editingId && (
                          <span style={{ background: "rgba(37, 99, 235, 0.12)", color: "#1d4ed8", border: "1px solid rgba(37, 99, 235, 0.25)", padding: "0.12rem 0.45rem", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700" }}>
                            <i className="fa-solid fa-chart-simple" style={{ marginRight: "0.2rem" }}></i>คลิก {formData.clicksReview || 0}
                          </span>
                        )}
                      </div>
                      <span style={{ color: "#2563eb", fontWeight: "500", fontSize: "0.76rem" }}>
                        (เว้นว่างไว้ = ไม่แสดงปุ่มนี้บนหน้าเว็บ)
                      </span>
                    </div>
                    <p style={{ color: "#1e3a8a", fontSize: "0.8rem", margin: "0 0 0.65rem 0", lineHeight: "1.4" }}>
                      ระบุข้อมูลรีวิวหรือความประทับใจของลูกค้า เมื่อผู้ใช้กดปุ่ม <strong>"Click To Review"</strong> บนหน้าเว็บ ระบบจะเปิด Popup แสดงข้อมูลที่ใส่ไว้ข้างในนี้ขึ้นมาครับ
                    </p>

                    <div style={{ display: "grid", gap: "0.65rem" }}>
                      <div>
                        <label style={{ display: "block", color: "#1e40af", fontWeight: "600", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                          Review Information / Content (Popup Text - English)
                        </label>
                        <textarea 
                          rows={3}
                          placeholder="e.g. Highly recommended! Beautiful tailoring and fantastic service from Sarto di Moda. Excellent fabrics and on-time delivery."
                          value={formData.reviewContent}
                          onChange={(e) => setFormData(prev => ({ ...prev, reviewContent: e.target.value }))}
                          style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "8px", border: "1px solid #bfdbfe", background: "#ffffff", color: "#222945", fontSize: "0.85rem", lineHeight: "1.5" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                        <div>
                          <label style={{ display: "block", color: "#1e40af", fontWeight: "600", fontSize: "0.78rem", marginBottom: "0.25rem" }}>
                            Review Content (Thai) - ข้อมูลรีวิวภาษาไทย
                          </label>
                          <textarea 
                            rows={2}
                            placeholder="ข้อความรีวิวภาษาไทย..."
                            value={formData.reviewContent_th}
                            onChange={(e) => setFormData(prev => ({ ...prev, reviewContent_th: e.target.value }))}
                            style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #bfdbfe", background: "#ffffff", color: "#222945", fontSize: "0.82rem", lineHeight: "1.4" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", color: "#1e40af", fontWeight: "600", fontSize: "0.78rem", marginBottom: "0.25rem" }}>
                            Review Content (Chinese) - 评价内容（中文）
                          </label>
                          <textarea 
                            rows={2}
                            placeholder="中文评价信息..."
                            value={formData.reviewContent_cn}
                            onChange={(e) => setFormData(prev => ({ ...prev, reviewContent_cn: e.target.value }))}
                            style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #bfdbfe", background: "#ffffff", color: "#222945", fontSize: "0.82rem", lineHeight: "1.4" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", color: "#1e40af", fontWeight: "600", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                          <i className="fa-solid fa-link" style={{ marginRight: "0.35rem", fontSize: "0.75rem" }}></i>
                          Review Link URL (Optional - e.g. Google Maps Review หรือลิงก์รีวิวภายนอก)
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. https://maps.app.goo.gl/... หรือ https://facebook.com/..."
                          value={formData.reviewUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, reviewUrl: e.target.value }))}
                          style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #bfdbfe", background: "#ffffff", color: "#222945", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Click Statistics Summary for this promotion */}
                  {editingId && (
                    <div style={{
                      marginTop: "0.75rem",
                      padding: "0.75rem 1rem",
                      background: "#ffffff",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.75rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.86rem", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <i className="fa-solid fa-chart-pie" style={{ color: "#2563eb" }}></i> สถิติการกดปุ่ม (Click Stats):
                        </span>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.76rem", background: "#eff6ff", color: "#1e40af", border: "1px solid #dbeafe", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: "600" }}>
                            🛒 Book: <strong>{formData.clicksBook || 0}</strong>
                          </span>
                          <span style={{ fontSize: "0.76rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: "600" }}>
                            💬 LINE: <strong>{formData.clicksLine || 0}</strong>
                          </span>
                          <span style={{ fontSize: "0.76rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: "600" }}>
                            📱 WA: <strong>{formData.clicksWhatsapp || 0}</strong>
                          </span>
                          <span style={{ fontSize: "0.76rem", background: "rgba(37, 99, 235, 0.08)", color: "#2563eb", border: "1px solid rgba(37, 99, 235, 0.25)", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <i className="fa-solid fa-file-lines" style={{ fontSize: "0.72rem" }}></i> Review: <strong>{formData.clicksReview || 0}</strong>
                          </span>
                        </div>
                        <span style={{ background: "#0f172a", color: "#ffffff", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "700" }}>
                          รวม: {(formData.clicksBook || 0) + (formData.clicksLine || 0) + (formData.clicksWhatsapp || 0) + (formData.clicksReview || 0)} ครั้ง
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleResetStats(editingId)}
                        style={{
                          background: "#fff1f2",
                          border: "1px solid #fecdd3",
                          color: "#be123c",
                          padding: "0.3rem 0.65rem",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                        title="รีเซ็ตสถิติปุ่มของโปรโมชั่นนี้เป็น 0"
                      >
                        <i className="fa-solid fa-rotate-left"></i>
                        รีเซ็ตสถิติเป็น 0
                      </button>
                    </div>
                  )}

                  {/* Direct Link Share Helper */}
                  {editingId && (
                    <div style={{
                      marginTop: "0.6rem",
                      padding: "0.65rem 0.9rem",
                      background: "#f0fdf4",
                      border: "1px dashed #86efac",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.6rem",
                      flexWrap: "wrap"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", minWidth: 0, flex: 1 }}>
                        <i className="fa-solid fa-link" style={{ color: "#16a34a", fontSize: "0.85rem" }}></i>
                        <span style={{ fontSize: "0.8rem", color: "#166534", fontWeight: "700", whiteSpace: "nowrap" }}>
                          ลิงก์ตรง (Direct URL):
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "#15803d", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {typeof window !== "undefined" ? window.location.origin : ""}/th/promotions?promo={formData.code || editingId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const link = `${window.location.origin}/th/promotions?promo=${encodeURIComponent(formData.code || editingId)}`;
                          navigator.clipboard.writeText(link);
                          setSuccess(`คัดลอกลิงก์ตรงเรียบร้อยแล้ว: ${link}`);
                        }}
                        style={{
                          background: "#16a34a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.3rem 0.7rem",
                          fontSize: "0.76rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                      >
                        <i className="fa-regular fa-copy"></i>
                        คัดลอกลิงก์แชร์
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Banner Preview inside Modal */}
              {formData.imageUrl && (
                <div style={{
                  position: "relative",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  maxHeight: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <img 
                    src={formData.imageUrl} 
                    alt="Card Preview" 
                    style={{ width: "100%", maxHeight: "150px", objectFit: "cover" }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.5rem",
                    background: "rgba(0,0,0,0.65)",
                    color: "white",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: "600"
                  }}>
                    Card Banner Preview
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "600", color: "#222945" }}>
                  <input 
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: "18px", height: "18px" }}
                  />
                  Active & Display on Promotions Page
                </label>
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
                  {saving ? "Saving..." : "Save Promotion"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Promotions Table */}
      {loading ? (
        <div style={{ background: "#ffffff", padding: "3rem", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#222945" }}></i>
          <p>Loading promotions...</p>
        </div>
      ) : promotions.length === 0 ? (
        <div style={{ background: "#ffffff", padding: "3.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
          <i className="fa-solid fa-rectangle-ad" style={{ fontSize: "3rem", marginBottom: "1rem", color: "#94a3b8" }}></i>
          <h3 style={{ color: "#222945", marginBottom: "0.5rem" }}>No promotions created yet</h3>
          <p style={{ marginBottom: "1.5rem" }}>Click "Add New Promotion" to post your first monthly deal or coupon offer.</p>
          <button onClick={handleOpenCreate} style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer" }}>
            Create First Promotion
          </button>
        </div>
      ) : (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "1rem 1.25rem" }}>Offer Details</th>
                <th style={{ padding: "1rem 1.25rem" }}>Promo Code</th>
                <th style={{ padding: "1rem 1.25rem" }}>Category</th>
                <th style={{ padding: "1rem 1.25rem" }}>Validity</th>
                <th style={{ padding: "1rem 1.25rem" }}>Click Stats</th>
                <th style={{ padding: "1rem 1.25rem" }}>Status</th>
                <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {promo.imageUrl && (
                        <div
                          onClick={() => setPreviewImage({ url: promo.imageUrl, title: promo.title })}
                          title="Click to preview full image"
                          style={{
                            position: "relative",
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                            cursor: "pointer"
                          }}
                        >
                          <img 
                            src={promo.imageUrl} 
                            alt="" 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.4)",
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontSize: "0.85rem"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                          >
                            <i className="fa-solid fa-magnifying-glass-plus"></i>
                          </div>
                        </div>
                      )}
                      {promo.badge && (
                        <span style={{ background: "#222945", color: "#ffffff", fontWeight: "700", fontSize: "0.75rem", padding: "0.25rem 0.6rem", borderRadius: "6px", whiteSpace: "nowrap" }}>
                          {promo.badge}
                        </span>
                      )}
                      <div>
                        <div style={{ fontWeight: "700", color: "#222945", fontSize: "0.95rem", lineHeight: "1.4" }}>{promo.title}</div>
                        {(promo.reviewContent || promo.reviewUrl) && (
                          <div style={{ marginTop: "0.4rem" }}>
                            <span style={{ 
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: "0.35rem", 
                              background: "rgba(37, 99, 235, 0.08)", 
                              border: "1px solid rgba(37, 99, 235, 0.25)", 
                              color: "#2563eb", 
                              fontSize: "0.72rem", 
                              fontWeight: "700", 
                              padding: "0.15rem 0.5rem", 
                              borderRadius: "6px" 
                            }}>
                              <i className="fa-solid fa-file-lines"></i> Click To Review
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "1.25rem" }}>
                    {promo.code ? (
                      <span style={{ fontFamily: "monospace", background: "#f1f5f9", border: "1px dashed #cbd5e1", padding: "0.35rem 0.75rem", borderRadius: "6px", fontWeight: "700", color: "#222945" }}>
                        {promo.code}
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No code</span>
                    )}
                  </td>

                  <td style={{ padding: "1.25rem", textTransform: "capitalize", fontWeight: "600", color: "#475569" }}>
                    {promo.category}
                  </td>

                  <td style={{ padding: "1.25rem", color: "#64748b", fontSize: "0.9rem" }}>
                    {promo.validUntil || "Ongoing"}
                  </td>

                  <td style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                        {promo.bookUrl && (
                          <span style={{ fontSize: "0.72rem", background: "#eff6ff", color: "#1e40af", border: "1px solid #dbeafe", padding: "0.15rem 0.45rem", borderRadius: "6px", fontWeight: "600" }} title="คลิกปุ่ม Book Online">
                            🛒 Book: {promo.clicksBook || 0}
                          </span>
                        )}
                        {promo.lineUrl && (
                          <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "0.15rem 0.45rem", borderRadius: "6px", fontWeight: "600" }} title="คลิกปุ่ม LINE OA">
                            💬 LINE: {promo.clicksLine || 0}
                          </span>
                        )}
                        {promo.whatsappUrl && (
                          <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "0.15rem 0.45rem", borderRadius: "6px", fontWeight: "600" }} title="คลิกปุ่ม WhatsApp">
                            📱 WA: {promo.clicksWhatsapp || 0}
                          </span>
                        )}
                        {(promo.reviewContent || promo.reviewUrl) && (
                          <span style={{ 
                            fontSize: "0.72rem", 
                            background: "rgba(37, 99, 235, 0.08)", 
                            color: "#2563eb", 
                            border: "1px solid rgba(37, 99, 235, 0.25)", 
                            padding: "0.15rem 0.45rem", 
                            borderRadius: "6px", 
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }} title="คลิกปุ่ม Click To Review">
                            <i className="fa-solid fa-file-lines" style={{ fontSize: "0.72rem" }}></i> Review: {promo.clicksReview || 0}
                          </span>
                        )}
                        {!promo.bookUrl && !promo.lineUrl && !promo.whatsappUrl && !promo.reviewContent && !promo.reviewUrl && (
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>ไม่มีปุ่ม</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: "600" }}>
                        รวม: <strong style={{ color: "#0f172a" }}>{(promo.clicksBook || 0) + (promo.clicksLine || 0) + (promo.clicksWhatsapp || 0) + (promo.clicksReview || 0)}</strong> ครั้ง
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "1.25rem" }}>
                    <button 
                      onClick={() => handleToggleActive(promo.id, promo.isActive)}
                      style={{
                        background: promo.isActive ? "#dcfce7" : "#f1f5f9",
                        color: promo.isActive ? "#166534" : "#64748b",
                        border: "1px solid",
                        borderColor: promo.isActive ? "#bbf7d0" : "#cbd5e1",
                        padding: "0.35rem 0.85rem",
                        borderRadius: "20px",
                        fontWeight: "700",
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      {promo.isActive ? "● Active" : "○ Inactive"}
                    </button>
                  </td>

                  <td style={{ padding: "1.25rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                      <button 
                        onClick={() => handleCopyDirectLink(promo)}
                        style={{ padding: "0.4rem 0.65rem", borderRadius: "6px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontWeight: "600", cursor: "pointer", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                        title="คัดลอกลิงก์ตรงที่เปิดโปรโมชั่นนี้ทันที"
                      >
                        <i className="fa-solid fa-link"></i>
                        <span>Link</span>
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(promo)}
                        style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", background: "#f1f5f9", color: "#222945", border: "1px solid #cbd5e1", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Image Preview Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(5px)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem"
          }}
        >
          {/* Top Controls */}
          <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", display: "flex", gap: "0.75rem", zIndex: 10 }}>
            {previewImage.url && (
              <a
                href={previewImage.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  padding: "0.5rem 0.9rem",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
                title="Open original image in new tab"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Original
              </a>
            )}
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem"
              }}
              title="Close preview (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92vw",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.15)"
            }}
          >
            <div style={{ maxWidth: "90vw", maxHeight: "72vh", overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0f19", padding: "0.5rem" }}>
              <img
                src={previewImage.url}
                alt={previewImage.title || "Preview"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            </div>
            {previewImage.title && (
              <div style={{
                width: "100%",
                padding: "0.85rem 1.25rem",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                textAlign: "center",
                fontWeight: "700",
                color: "#1e293b",
                fontSize: "0.95rem"
              }}>
                {previewImage.title}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
