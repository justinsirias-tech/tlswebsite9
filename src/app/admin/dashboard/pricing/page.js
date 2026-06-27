"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";

export default function PricingAdminPage() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("weight");
  const [newItem, setNewItem] = useState({ name: "", name_th: "", nonMember: "", member: "", unit: "piece" });
  const [translatingId, setTranslatingId] = useState(null);

  const translateName = async (englishName, id) => {
    if (!englishName) return;
    setTranslatingId(id);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: englishName })
      });
      const data = await res.json();
      if (res.ok && data.name_th) {
        if (id === "new") {
          setNewItem(prev => ({ ...prev, name_th: data.name_th }));
        } else {
          setPricing(prev => prev.map(p => p.id === id ? { ...p, name_th: data.name_th } : p));
          const item = pricing.find(p => p.id === id);
          if (item) {
            const payload = {
              ...item,
              name_th: data.name_th,
              nonMember: parseFloat(item.nonMember) || 0,
              member: item.member ? parseFloat(item.member) : null,
            };
            await fetch(`/api/pricing/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
          }
        }
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslatingId(null);
    }
  };

  const categories = [
    { id: "weight", label: "By Weight" },
    { id: "garments", label: "Garments" },
    { id: "linen", label: "Linen & Bedding" },
    { id: "ironing", label: "Ironing Only" },
    { id: "dryclean", label: "Dry Cleaning" }
  ];

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/pricing");
      const data = await res.json();
      setPricing(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInlineChange = (id, field, value) => {
    setPricing(pricing.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleInlineSave = async (id) => {
    const item = pricing.find(p => p.id === id);
    if (!item) return;
    
    const payload = {
      ...item,
      nonMember: parseFloat(item.nonMember) || 0,
      member: item.member ? parseFloat(item.member) : null,
    };

    try {
      await fetch(`/api/pricing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleInlineAdd = async () => {
    if (!newItem.name || !newItem.nonMember) return;

    const payload = {
      ...newItem,
      category: activeCategory,
      nonMember: parseFloat(newItem.nonMember) || 0,
      member: newItem.member ? parseFloat(newItem.member) : null,
    };

    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewItem({ name: "", name_th: "", nonMember: "", member: "", unit: "piece" });
        fetchPricing();
      } else {
        alert("Failed to add item.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInlineAdd();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this pricing item?")) return;

    try {
      const res = await fetch(`/api/pricing/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPricing(pricing.filter(p => p.id !== id));
      } else {
        alert("Failed to delete item.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSortedPricing = (items) => {
    const toppers = [];
    const others = [];
    items.forEach(item => {
      if (item.name && item.name.toLowerCase().includes("topper")) {
        toppers.push(item);
      } else {
        others.push(item);
      }
    });
    // Sort toppers alphabetically so 3.5FT < 5.0FT < 6.0FT
    toppers.sort((a, b) => a.name.localeCompare(b.name));
    return [...others, ...toppers];
  };

  const filteredPricing = getSortedPricing(pricing.filter(p => p.category === activeCategory));

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h1><i className="fa-solid fa-tags"></i> Pricing Management</h1>
        <p style={{ color: "var(--text-light)" }}>Edit prices directly in the table to save instantly.</p>
      </div>

      <div className={styles.tabsContainer}>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            className={`${styles.tabBtn} ${activeCategory === cat.id ? styles.activeTab : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p>Loading pricing data...</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Service Name (EN)</th>
                <th>Service Name (TH)</th>
                <th>Non-Member Price</th>
                <th>Member Price</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPricing.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No items in this category.</td>
                </tr>
              ) : (
                filteredPricing.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => handleInlineChange(item.id, 'name', e.target.value)} 
                        onBlur={() => {
                          handleInlineSave(item.id);
                          if (!item.name_th && item.name) {
                            translateName(item.name, item.id);
                          }
                        }}
                        className={styles.inlineInput}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input 
                          type="text" 
                          value={item.name_th || ""} 
                          onChange={(e) => handleInlineChange(item.id, 'name_th', e.target.value)} 
                          onBlur={() => handleInlineSave(item.id)}
                          className={styles.inlineInput}
                          placeholder="Thai name"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => translateName(item.name, item.id)}
                          disabled={translatingId === item.id || !item.name}
                          className="btn"
                          style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer" }}
                          title="Auto-translate English name to Thai"
                        >
                          {translatingId === item.id ? (
                            <i className="fa-solid fa-spinner fa-spin" style={{ color: "var(--primary)" }}></i>
                          ) : (
                            "🇹🇭"
                          )}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "4px" }}>฿</span>
                        <input 
                          type="number" 
                          value={item.nonMember} 
                          onChange={(e) => handleInlineChange(item.id, 'nonMember', e.target.value)} 
                          onBlur={() => handleInlineSave(item.id)}
                          className={styles.inlineInput}
                          style={{ width: "80px" }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "4px" }}>฿</span>
                        <input 
                          type="number" 
                          value={item.member || ""} 
                          onChange={(e) => handleInlineChange(item.id, 'member', e.target.value)} 
                          onBlur={() => handleInlineSave(item.id)}
                          className={styles.inlineInput}
                          placeholder="-"
                          style={{ width: "80px" }}
                        />
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={item.unit} 
                        onChange={(e) => handleInlineChange(item.id, 'unit', e.target.value)} 
                        onBlur={() => handleInlineSave(item.id)}
                        className={styles.inlineInput}
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {/* INLINE ADD NEW ROW */}
              <tr style={{ background: "rgba(58, 123, 213, 0.05)" }}>
                <td>
                  <input 
                    type="text" 
                    placeholder="New item name (EN)..."
                    value={newItem.name} 
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} 
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      if (!newItem.name_th && newItem.name) {
                        translateName(newItem.name, "new");
                      }
                    }}
                    className={styles.inlineInput}
                    style={{ background: "white" }}
                  />
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <input 
                      type="text" 
                      placeholder="New item name (TH)..."
                      value={newItem.name_th} 
                      onChange={(e) => setNewItem({ ...newItem, name_th: e.target.value })} 
                      onKeyDown={handleKeyDown}
                      className={styles.inlineInput}
                      style={{ flex: 1, background: "white" }}
                    />
                    <button
                      type="button"
                      onClick={() => translateName(newItem.name, "new")}
                      disabled={translatingId === "new" || !newItem.name}
                      className="btn"
                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer" }}
                      title="Auto-translate English name to Thai"
                    >
                      {translatingId === "new" ? (
                        <i className="fa-solid fa-spinner fa-spin" style={{ color: "var(--primary)" }}></i>
                      ) : (
                        "🇹🇭"
                      )}
                    </button>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "4px" }}>฿</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newItem.nonMember} 
                      onChange={(e) => setNewItem({ ...newItem, nonMember: e.target.value })} 
                      onKeyDown={handleKeyDown}
                      className={styles.inlineInput}
                      style={{ width: "80px", background: "white" }}
                    />
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "4px" }}>฿</span>
                    <input 
                      type="number" 
                      placeholder="-"
                      value={newItem.member} 
                      onChange={(e) => setNewItem({ ...newItem, member: e.target.value })} 
                      onKeyDown={handleKeyDown}
                      className={styles.inlineInput}
                      style={{ width: "80px", background: "white" }}
                    />
                  </div>
                </td>
                <td>
                  <input 
                    type="text" 
                    placeholder="piece"
                    value={newItem.unit} 
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} 
                    onKeyDown={handleKeyDown}
                    className={styles.inlineInput}
                    style={{ width: "80px", background: "white" }}
                  />
                </td>
                <td>
                  <button className="btn btn-primary" onClick={handleInlineAdd} disabled={!newItem.name || !newItem.nonMember} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                    <i className="fa-solid fa-plus"></i> Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
