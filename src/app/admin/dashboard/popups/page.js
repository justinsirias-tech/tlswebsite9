"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";
import { toISOStringOrNull } from "@/lib/dateUtils";

export default function PopupsAdminPage() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    isActive: true
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  useEffect(() => {
    fetchPopups();
  }, []);

  async function fetchPopups() {
    try {
      const res = await fetch("/api/admin/popups");
      const data = await res.json();
      if (data.success) {
        setPopups(data.popups);
      }
    } catch (err) {
      console.error("Failed to fetch popups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a local blob URL for instant preview in the browser
    const localUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(localUrl);

    setUploading(true);
    setError("");

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
        setSuccess("Image uploaded successfully!");
      } else {
        setError(result.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("An error occurred during image upload");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/popups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setPopups(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this popup template?")) return;

    try {
      const res = await fetch(`/api/admin/popups/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setPopups(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete popup:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.imageUrl || !formData.startDate || !formData.endDate) {
      setError("Please fill out all fields and upload a banner image");
      return;
    }

    try {
      const payload = {
        ...formData,
        startDate: toISOStringOrNull(formData.startDate),
        endDate: toISOStringOrNull(formData.endDate)
      };

      const res = await fetch("/api/admin/popups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPopups(prev => [data.popup, ...prev]);
        setShowForm(false);
        setLocalPreviewUrl("");
        setFormData({
          name: "",
          imageUrl: "",
          startDate: "",
          endDate: "",
          isActive: true
        });
        setSuccess("Popup template created successfully!");
      } else {
        setError(data.error || "Failed to create popup template");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("An error occurred while creating popup template");
    }
  };

  const getStatusLabel = (popup) => {
    if (!popup.isActive) return { label: "Inactive", color: "#94a3b8" };
    const now = new Date();
    const start = new Date(popup.startDate);
    const end = new Date(popup.endDate);

    if (now < start) return { label: "Upcoming", color: "#38bdf8" };
    if (now > end) return { label: "Expired", color: "#f87171" };
    return { label: "Running", color: "#4ade80" };
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ fontSize: "2rem", color: "white" }}>Promotion Popups</h1>
          <p style={{ color: "var(--text-light)", marginTop: "0.5rem" }}>
            Manage scheduled image-only promotional banners and holiday announcements.
          </p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setLocalPreviewUrl("");
            setError("");
            setSuccess("");
          }}
          className="btn btn-primary"
          style={{ padding: "0.8rem 1.5rem" }}
        >
          {showForm ? "Cancel" : "Add New Popup"}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ff6b6b", padding: "1rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: "rgba(74, 222, 128, 0.15)", color: "#4ade80", padding: "1rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid rgba(74, 222, 128, 0.2)" }}>
          {success}
        </div>
      )}

      {showForm && (
        <div className={styles.tableContainer} style={{ padding: "2rem", marginBottom: "3rem" }}>
          <h2 style={{ color: "white", marginBottom: "1.5rem", fontSize: "1.25rem" }}>Create New Popup Template</h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Template Name (for admin reference) *</label>
              <input 
                type="text" 
                placeholder="e.g. Songkran Holiday 2026"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={styles.inlineInput}
                style={{ border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(0,0,0,0.2)" }}
                required
              />
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
              <label style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Popup Banner Image *</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                style={{ color: "white" }}
              />
              {uploading && <p style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Uploading image...</p>}
              {(formData.imageUrl || localPreviewUrl) && (
                <div style={{ marginTop: "1rem" }}>
                  <p style={{ color: "var(--text-light)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Image Preview:</p>
                  <img 
                    src={localPreviewUrl || formData.imageUrl} 
                    alt="Upload preview" 
                    style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <label style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Start Schedule *</label>
                <input 
                  type="datetime-local" 
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={styles.inlineInput}
                  style={{ border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(0,0,0,0.2)" }}
                  required
                />
              </div>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <label style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>End Schedule *</label>
                <input 
                  type="datetime-local" 
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={styles.inlineInput}
                  style={{ border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(0,0,0,0.2)" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input 
                type="checkbox" 
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <label htmlFor="isActive" style={{ color: "white", fontSize: "0.9rem", cursor: "pointer" }}>
                Set active immediately (if date range is current)
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem", marginTop: "1rem" }}>
              Save Popup Template
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--text-light)" }}>Loading templates...</p>
      ) : popups.length === 0 ? (
        <div className={styles.tableContainer} style={{ padding: "3rem", textAlign: "center", color: "var(--text-light)" }}>
          <i className="fa-solid fa-window-restore" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}></i>
          <p>No popup templates found. Click "Add New Popup" to create one.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Banner</th>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {popups.map((popup) => {
                const status = getStatusLabel(popup);
                return (
                  <tr key={popup.id}>
                    <td>
                      <img 
                        src={popup.imageUrl} 
                        alt={popup.name} 
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}
                      />
                    </td>
                    <td style={{ color: "white", fontWeight: "600" }}>{popup.name}</td>
                    <td style={{ color: "var(--text-light)" }}>{formatDateTime(popup.startDate)}</td>
                    <td style={{ color: "var(--text-light)" }}>{formatDateTime(popup.endDate)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <input 
                          type="checkbox" 
                          checked={popup.isActive}
                          onChange={() => handleToggleActive(popup.id, popup.isActive)}
                          style={{ cursor: "pointer" }}
                        />
                        <span 
                          style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: "bold", 
                            padding: "0.2rem 0.5rem", 
                            borderRadius: "4px", 
                            backgroundColor: `${status.color}20`, 
                            color: status.color,
                            border: `1px solid ${status.color}30` 
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          onClick={() => handleDelete(popup.id)} 
                          className={styles.deleteBtn}
                          style={{ padding: "0.3rem 0.6rem" }}
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
        </div>
      )}
    </div>
  );
}
