"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../admin.module.css";

const PRESET_IMAGES = [
  { label: "Wash & Fold", url: "/assets/wash_and_fold.webp" },
  { label: "Dry Cleaning", url: "/assets/dry_clean.webp" },
  { label: "Hand Ironing", url: "/assets/service_ironing.webp" },
  { label: "Luxury Care", url: "/assets/about_artisans.webp" },
  { label: "Care Team", url: "/assets/staff_laundry.webp" },
  { label: "Eco Laundry", url: "/assets/story_eco.webp" },
  { label: "Hotel Service", url: "/assets/service_hotel.webp" },
  { label: "Laundry Basket", url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80" },
  { label: "Washing Machines", url: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80" },
  { label: "Garment Fabric", url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80" },
];

const getFirstImage = (html) => {
  if (!html) return "/assets/hero_laundry.webp";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : "/assets/hero_laundry.webp";
};

export default function ManageArticles() {
  const formatDate = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [articles, setArticles] = useState([]);
  const [queue, setQueue] = useState([]);
  const [activeTab, setActiveTab] = useState("ai"); // 'ai', 'manual', 'queue'

  // AI Gen state
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  // Manual Article state
  const [manualTitle, setManualTitle] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualUploading, setManualUploading] = useState(false);

  // Queue state
  const [newKeywords, setNewKeywords] = useState("");
  const [queueLoading, setQueueLoading] = useState(false);

  // Image Edit Modal state
  const [editingArticle, setEditingArticle] = useState(null);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalUploading, setModalUploading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const fileInputRef = useRef(null);
  const manualFileInputRef = useRef(null);

  // Collect all images used across all articles
  const allUsedImages = new Set();
  articles.forEach(art => {
    const matches = [...(art.content || '').matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    matches.forEach(img => allUsedImages.add(img));
  });

  // Collect images used by OTHER articles when editing a specific article
  const usedByOtherArticles = new Set();
  if (editingArticle) {
    articles.filter(a => a.id !== editingArticle.id).forEach(art => {
      const matches = [...(art.content || '').matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
      matches.forEach(img => usedByOtherArticles.add(img));
    });
  }

  const isModalImgDuplicate = Boolean(modalImageUrl && usedByOtherArticles.has(modalImageUrl.trim()));
  const isManualImgDuplicate = Boolean(manualImage && allUsedImages.has(manualImage.trim()));

  useEffect(() => {
    fetchArticles();
    fetchQueue();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (e) {
      console.error("Error fetching articles:", e);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/keywords");
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (e) {
      console.error("Error fetching queue:", e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) fetchArticles();
  };

  const handleDeleteKeyword = async (id) => {
    const res = await fetch(`/api/keywords/${id}`, { method: "DELETE" });
    if (res.ok) fetchQueue();
  };

  // Upload file helper
  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Failed to upload image");
    }
    return data.url;
  };

  // AI Generator Submit
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    try {
      const genRes = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!genRes.ok) throw new Error("Generation failed");
      const generatedData = await genRes.json();

      const saveRes = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generatedData.title,
          content: generatedData.content
        }),
      });
      if (!saveRes.ok) throw new Error("Saving failed");
      
      setTopic("");
      fetchArticles();
      alert("Article generated and published successfully!");
    } catch (err) {
      alert("An error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  // Manual Article Submit
  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualContent.trim()) {
      alert("Please provide both a Title and Content.");
      return;
    }

    setManualSubmitting(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle.trim(),
          content: manualContent.trim(),
          imageUrl: manualImage.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to publish article");

      setManualTitle("");
      setManualImage("");
      setManualContent("");
      fetchArticles();
      alert("Manual article created successfully!");
    } catch (err) {
      alert(err.message || "Failed to create article");
    } finally {
      setManualSubmitting(false);
    }
  };

  // Manual File Upload handler
  const handleManualFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setManualUploading(true);
    try {
      const url = await uploadImageFile(file);
      setManualImage(url);
    } catch (err) {
      alert(err.message || "Image upload failed");
    } finally {
      setManualUploading(false);
    }
  };

  // Queue Submit
  const handleAddKeywords = async (e) => {
    e.preventDefault();
    if (!newKeywords) return;
    setQueueLoading(true);

    const keywordsArray = newKeywords.split(',').map(k => k.trim()).filter(k => k);
    await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: keywordsArray })
    });
    
    setNewKeywords("");
    fetchQueue();
    setQueueLoading(false);
  };

  const triggerCronManually = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron/auto-generate?secret=TLS2026");
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Cron job triggered successfully in the background!");
        fetchArticles();
        fetchQueue();
      } else {
        alert("Cron job failed: " + (data.message || data.error));
      }
    } catch(err) {
      alert("Cron request failed.");
    }
    setLoading(false);
  };

  // Modal Image Editor actions
  const openImageEditor = (article) => {
    setEditingArticle(article);
    setModalImageUrl(getFirstImage(article.content));
  };

  const closeImageEditor = () => {
    setEditingArticle(null);
    setModalImageUrl("");
    setModalUploading(false);
    setModalSaving(false);
  };

  const handleModalFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setModalUploading(true);
    try {
      const url = await uploadImageFile(file);
      setModalImageUrl(url);
    } catch (err) {
      alert(err.message || "Image upload failed");
    } finally {
      setModalUploading(false);
    }
  };

  const handleSaveModalImage = async () => {
    if (!editingArticle || !modalImageUrl) return;
    setModalSaving(true);
    try {
      const res = await fetch(`/api/articles/${editingArticle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: modalImageUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to update article image");

      await fetchArticles();
      closeImageEditor();
      alert("Article picture updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to update image");
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ color: "var(--primary)" }}>Manage SEO Articles</h1>
          <p style={{ color: "var(--text-light)" }}>
            Generate, manually publish, and manage article images and content.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
        <button
          onClick={() => setActiveTab("ai")}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            background: activeTab === "ai" ? "var(--primary)" : "transparent",
            color: activeTab === "ai" ? "white" : "var(--text-light)",
            transition: "all 0.2s"
          }}
        >
          <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: "6px" }}></i>
          AI Generator
        </button>

        <button
          onClick={() => setActiveTab("manual")}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            background: activeTab === "manual" ? "var(--primary)" : "transparent",
            color: activeTab === "manual" ? "white" : "var(--text-light)",
            transition: "all 0.2s"
          }}
        >
          <i className="fa-solid fa-pen-to-square" style={{ marginRight: "6px" }}></i>
          Write Manual Article
        </button>

        <button
          onClick={() => setActiveTab("queue")}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            background: activeTab === "queue" ? "var(--primary)" : "transparent",
            color: activeTab === "queue" ? "white" : "var(--text-light)",
            transition: "all 0.2s"
          }}
        >
          <i className="fa-solid fa-list-check" style={{ marginRight: "6px" }}></i>
          Keyword Queue ({queue.filter(q => q.status === 'PENDING').length})
        </button>
      </div>

      {/* Tab Panels */}
      <div style={{ marginBottom: "3rem" }}>
        {/* 1. AI Generation Tab */}
        {activeTab === "ai" && (
          <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)", maxWidth: "800px" }}>
            <h2 style={{ marginBottom: "0.5rem" }}>Instant AI Article Generation</h2>
            <p style={{ color: "var(--text-light)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              Enter a garment care or laundry topic. The system will write a comprehensive article with verified images.
            </p>
            <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                type="text"
                className="form-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Caring for designer silk scarves in Bangkok"
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary" disabled={loading || !topic} style={{ alignSelf: "flex-start" }}>
                {loading ? "Generating & Publishing..." : "Generate Instantly"}
              </button>
            </form>
          </div>
        )}

        {/* 2. Manual Article Creation Tab */}
        {activeTab === "manual" && (
          <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)", maxWidth: "900px" }}>
            <h2 style={{ marginBottom: "0.5rem" }}>Write Manual Article</h2>
            <p style={{ color: "var(--text-light)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              Publish an article with your own custom title, uploaded images, and text.
            </p>

            <form onSubmit={handleCreateManual} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>Article Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                  required
                />
              </div>

              {/* Picture Selection */}
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Featured Picture
                </label>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
                  <input
                    type="file"
                    ref={manualFileInputRef}
                    onChange={handleManualFileUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => manualFileInputRef.current?.click()}
                    className="btn btn-outline"
                    disabled={manualUploading}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    {manualUploading ? "Uploading Image..." : "Upload from Computer"}
                  </button>

                  <span style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>or enter image URL:</span>
                  <input
                    type="url"
                    className="form-input"
                    value={manualImage}
                    onChange={(e) => setManualImage(e.target.value)}
                    placeholder="https://... or /assets/..."
                    style={{ flex: 1, minWidth: "220px" }}
                  />
                </div>

                {/* Preset Chips */}
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-light)", display: "block", marginBottom: "6px" }}>
                    Quick presets:
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {PRESET_IMAGES.map((preset, idx) => {
                      const isUsed = allUsedImages.has(preset.url);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setManualImage(preset.url)}
                          style={{
                            background: manualImage === preset.url ? "var(--primary)" : isUsed ? "#f8fafc" : "#f1f5f9",
                            color: manualImage === preset.url ? "white" : isUsed ? "#94a3b8" : "#475569",
                            border: isUsed ? "1px dashed #cbd5e1" : "1px solid #cbd5e1",
                            borderRadius: "20px",
                            padding: "0.3rem 0.8rem",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            opacity: isUsed ? 0.7 : 1,
                          }}
                        >
                          {preset.label} {isUsed ? "(Used)" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duplicate Image Warning */}
                {isManualImgDuplicate && (
                  <div style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "6px" }}></i>
                    <strong>Image Already In Use:</strong> This image is already used by another article. Images must never be repeated. Please select or upload a unique picture.
                  </div>
                )}

                {/* Preview */}
                {manualImage && (
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <img
                      src={manualImage}
                      alt="Preview"
                      style={{ width: "100px", height: "70px", objectFit: "cover", borderRadius: "8px" }}
                      onError={(e) => { e.currentTarget.src = "/assets/hero_laundry.webp"; }}
                    />
                    <div>
                      <strong style={{ fontSize: "0.9rem", display: "block" }}>Selected Picture Preview</strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-light)", wordBreak: "break-all" }}>{manualImage}</span>
                      {isManualImgDuplicate && (
                        <span style={{ display: "block", color: "#dc2626", fontWeight: "600", fontSize: "0.8rem", marginTop: "4px" }}>
                          Already used in another article
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Article Content (HTML or plain text)
                </label>
                <textarea
                  className="form-input"
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="<p>Write your article paragraphs here...</p>"
                  rows={8}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={manualSubmitting || !manualTitle || !manualContent || isManualImgDuplicate}
                style={{ alignSelf: "flex-start", padding: "0.8rem 2rem" }}
              >
                {manualSubmitting ? "Publishing..." : "Publish Article"}
              </button>
            </form>
          </div>
        )}

        {/* 3. Auto-Generation Queue Tab */}
        {activeTab === "queue" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
              <h2 style={{ marginBottom: "0.5rem" }}>Auto-Generation Queue</h2>
              <p style={{ color: "var(--text-light)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                Add comma-separated keywords here. A scheduled cron job will slowly process them.
              </p>
              <form onSubmit={handleAddKeywords} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <textarea
                  className="form-input"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  placeholder="e.g. removing wine stains, eco-friendly laundry, ironing suits..."
                  rows={3}
                  disabled={queueLoading}
                />
                <button type="submit" className="btn btn-outline" disabled={queueLoading || !newKeywords}>
                  Add to Queue
                </button>
              </form>
              
              <div style={{ background: "var(--background)", padding: "1rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                <strong>CRON URL:</strong> <code style={{ userSelect: "all" }}>https://your-domain.com/api/cron/auto-generate?secret=TLS2026</code>
              </div>
              
              <button onClick={triggerCronManually} className="btn btn-primary" style={{ width: "100%", fontSize: "0.9rem" }} disabled={loading}>
                Test Cron Job Manually
              </button>
            </div>

            {/* Queue List */}
            <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
              <h2 style={{ marginBottom: "1.5rem" }}>Pending Keywords ({queue.filter(q => q.status === 'PENDING').length})</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "400px", overflowY: "auto" }}>
                {queue.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "0.8rem 1rem", borderRadius: "8px", borderLeft: item.status === 'PENDING' ? "4px solid var(--accent)" : "4px solid #10b981", opacity: item.status === 'PROCESSED' ? 0.6 : 1 }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>{item.keyword}</span>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>{item.status}</span>
                      {item.status === 'PENDING' && (
                        <button onClick={() => handleDeleteKeyword(item.id)} style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {queue.length === 0 && <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Queue is empty.</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Articles Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2>Live Articles ({articles.length})</h2>
          <span style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
            Tip: Click &quot;Change Picture&quot; on any article to upload or swap its photo.
          </span>
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          {articles.length === 0 && (
            <div style={{ background: "white", padding: "3rem", borderRadius: "12px", textAlign: "center", color: "var(--text-light)" }}>
              No articles published yet.
            </div>
          )}

          {articles.map((article) => {
            const articleImg = getFirstImage(article.content);
            return (
              <div
                key={article.id}
                style={{
                  background: "white",
                  padding: "1.2rem 1.5rem",
                  borderRadius: "14px",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                {/* Thumbnail & Title */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", flex: 1, minWidth: "300px" }}>
                  <div style={{ position: "relative", width: "90px", height: "65px", flexShrink: 0, borderRadius: "8px", overflow: "hidden", background: "#f1f5f9" }}>
                    <img
                      src={articleImg}
                      alt={article.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.currentTarget.src = "/assets/hero_laundry.webp"; }}
                    />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.3rem", fontWeight: "600", color: "#1e293b" }}>
                      {article.title}
                    </h3>
                    <p style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>
                      Published: {formatDate(article.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <button
                    onClick={() => openImageEditor(article)}
                    className="btn btn-outline"
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      borderColor: "var(--primary)",
                      color: "var(--primary)"
                    }}
                  >
                    <i className="fa-solid fa-camera"></i>
                    Change Picture
                  </button>

                  <Link
                    href={`/articles/${article.id}`}
                    target="_blank"
                    className="btn btn-outline"
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    View
                  </Link>

                  <button
                    onClick={() => handleDelete(article.id)}
                    className="btn btn-outline"
                    style={{
                      color: "red",
                      borderColor: "#fca5a5",
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem"
                    }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Editor Modal */}
      {editingArticle && (
        <div className={styles.modalOverlay} onClick={closeImageEditor}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "600px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem" }}>Manage Article Picture</h2>
                <p style={{ color: "var(--text-light)", fontSize: "0.85rem", marginTop: "4px" }}>
                  {editingArticle.title}
                </p>
              </div>
              <button
                onClick={closeImageEditor}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-light)" }}
              >
                &times;
              </button>
            </div>

            {/* Current Image Preview */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ position: "relative", width: "100%", height: "220px", borderRadius: "12px", overflow: "hidden", background: "#f1f5f9", margin: "0 auto", border: "1px solid #e2e8f0" }}>
                <img
                  src={modalImageUrl || "/assets/hero_laundry.webp"}
                  alt="Article Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.src = "/assets/hero_laundry.webp"; }}
                />
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "6px", display: "block" }}>
                Preview of selected picture
              </span>
            </div>

            {/* Method 1: Upload from device */}
            <div style={{ marginBottom: "1.2rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.4rem" }}>
                1. Upload from Device
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleModalFileUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline"
                disabled={modalUploading || modalSaving}
                style={{ width: "100%", padding: "0.6rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
              >
                <i className="fa-solid fa-cloud-arrow-up"></i>
                {modalUploading ? "Uploading Image..." : "Choose Image File to Upload"}
              </button>
            </div>

            {/* Method 2: Custom URL */}
            <div style={{ marginBottom: "1.2rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.4rem" }}>
                2. Or Paste Image URL
              </label>
              <input
                type="url"
                className="form-input"
                value={modalImageUrl}
                onChange={(e) => setModalImageUrl(e.target.value)}
                placeholder="https://... or /assets/..."
                disabled={modalUploading || modalSaving}
              />
            </div>

            {/* Method 3: Pick Presets */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.4rem" }}>
                3. Or Select from Curated Presets
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.5rem" }}>
                {PRESET_IMAGES.map((preset, idx) => {
                  const isUsedByOther = usedByOtherArticles.has(preset.url);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalImageUrl(preset.url)}
                      style={{
                        border: modalImageUrl === preset.url ? "2px solid var(--primary)" : isUsedByOther ? "1px dashed #cbd5e1" : "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "4px",
                        background: isUsedByOther ? "#f8fafc" : "white",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "transform 0.1s ease",
                        opacity: isUsedByOther ? 0.6 : 1,
                        position: "relative"
                      }}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        style={{ width: "100%", height: "55px", objectFit: "cover", borderRadius: "6px" }}
                      />
                      <span style={{ fontSize: "0.75rem", display: "block", marginTop: "2px", fontWeight: "500", color: isUsedByOther ? "#94a3b8" : "#334155" }}>
                        {preset.label}
                      </span>
                      {isUsedByOther && (
                        <span style={{ fontSize: "0.65rem", color: "#dc2626", fontWeight: "bold", display: "block" }}>
                          (In Use)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duplicate Image Warning in Modal */}
            {isModalImgDuplicate && (
              <div style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "6px" }}></i>
                <strong>Duplicate Image:</strong> This picture is already used by another article. Each article must have a strictly unique picture. Please pick another photo.
              </div>
            )}

            {/* Modal Actions */}
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={closeImageEditor}
                className="btn btn-outline"
                disabled={modalSaving || modalUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalImage}
                className="btn btn-primary"
                disabled={modalSaving || modalUploading || !modalImageUrl || isModalImgDuplicate}
              >
                {modalSaving ? "Saving Picture..." : "Save Picture"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
