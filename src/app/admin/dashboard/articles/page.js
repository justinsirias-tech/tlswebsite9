"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";

export default function ManageArticles() {
  const [articles, setArticles] = useState([]);
  const [queue, setQueue] = useState([]);
  
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [newKeywords, setNewKeywords] = useState("");
  const [queueLoading, setQueueLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
    fetchQueue();
  }, []);

  const fetchArticles = async () => {
    const res = await fetch("/api/articles");
    if (res.ok) {
      const data = await res.json();
      setArticles(data);
    }
  };

  const fetchQueue = async () => {
    const res = await fetch("/api/keywords");
    if (res.ok) {
      const data = await res.json();
      setQueue(data);
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
        alert("Cron job triggered successfully! Generated: " + data.articleTitle);
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

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ color: "var(--primary)" }}>Manage SEO Articles</h1>
          <p style={{ color: "var(--text-light)" }}>Generate and manage SEO articles with embedded images and backlinks.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
        
        {/* Manual Generation */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Manual Generation</h2>
          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              className="form-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Silk garment care tips"
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !topic}>
              {loading ? "Generating..." : "Generate Instantly"}
            </button>
          </form>
        </div>

        {/* Auto-Generation Queue */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Auto-Generation Queue</h2>
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

      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        
        {/* Queue List */}
        <div>
          <h2 style={{ marginBottom: "1.5rem" }}>Pending Keywords ({queue.filter(q => q.status === 'PENDING').length})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {queue.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", background: "white", padding: "0.8rem 1rem", borderRadius: "8px", borderLeft: item.status === 'PENDING' ? "4px solid var(--accent)" : "4px solid #10b981", opacity: item.status === 'PROCESSED' ? 0.6 : 1 }}>
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

        {/* Live Articles */}
        <div>
          <h2 style={{ marginBottom: "1.5rem" }}>Live Articles ({articles.length})</h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {articles.length === 0 && <p style={{ color: "var(--text-light)" }}>No articles generated yet.</p>}
            {articles.map((article) => (
              <div key={article.id} style={{ background: "white", padding: "1.5rem", borderRadius: "12px", boxShadow: "var(--shadow-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{article.title}</h3>
                  <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>
                    Published: {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(article.id)} 
                  className="btn btn-outline" 
                  style={{ color: "red", borderColor: "red", padding: "0.5rem 1rem" }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
