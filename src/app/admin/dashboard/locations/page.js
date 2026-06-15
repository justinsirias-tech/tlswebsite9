"use client";

import { useState, useEffect } from "react";
import Autocomplete from "react-google-autocomplete";
import styles from "../../admin.module.css";

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState("Bangkok");
  const [activeType, setActiveType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const cities = ["Bangkok", "Pattaya"];

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/hotels");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem({ 
        ...item, 
        nearbyAmenities: item.nearbyAmenities?.join(", ") || "",
        nearbyAmenities_th: item.nearbyAmenities_th?.join(", ") || ""
      });
    } else {
      setEditingItem({ 
        city: activeCity, 
        city_th: activeCity === "Bangkok" ? "กรุงเทพฯ" : "พัทยา",
        name: "", 
        name_th: "",
        type: "hotel", 
        stars: 5,
        totalRooms: 100,
        averagePrice: "",
        address: "",
        address_th: "",
        transport: "",
        transport_th: "",
        image: "",
        mapLink: "",
        website: "",
        article: "",
        article_th: "",
        nearbyAmenities: "",
        nearbyAmenities_th: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isNew = !editingItem.id;
    const url = isNew ? "/api/hotels" : `/api/hotels/${editingItem.id}`;
    const method = isNew ? "POST" : "PUT";

    // Convert comma-separated string back to array
    const payload = {
      ...editingItem,
      nearbyAmenities: editingItem.nearbyAmenities ? editingItem.nearbyAmenities.split(",").map(i => i.trim()).filter(Boolean) : [],
      nearbyAmenities_th: editingItem.nearbyAmenities_th ? editingItem.nearbyAmenities_th.split(",").map(i => i.trim()).filter(Boolean) : []
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchLocations();
        closeModal();
      } else {
        alert("Failed to save location.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const res = await fetch(`/api/hotels/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLocations(locations.filter(l => l.id !== id));
      } else {
        alert("Failed to delete location.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateArticle = async () => {
    if (!editingItem.name || !editingItem.city || !editingItem.type) {
      alert("Please enter the Location Name, City, and Type before generating the article.");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingItem.name,
          city: editingItem.city,
          type: editingItem.type
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEditingItem({ 
          ...editingItem, 
          stars: data.stars || editingItem.stars,
          totalRooms: data.totalRooms || editingItem.totalRooms,
          averagePrice: data.averagePrice || editingItem.averagePrice,
          transport: data.transport || editingItem.transport,
          nearbyAmenities: data.nearbyAmenities || editingItem.nearbyAmenities,
          article: data.article || editingItem.article
        });
      } else {
        alert("Failed to generate article: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error calling AI API");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (!editingItem.name && !editingItem.address && !editingItem.article) {
      alert("Please fill out some English fields (Name, Address, or Article) before translating.");
      return;
    }
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingItem.name,
          city: editingItem.city,
          transport: editingItem.transport,
          address: editingItem.address,
          nearbyAmenities: editingItem.nearbyAmenities,
          article: editingItem.article
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEditingItem(prev => ({
          ...prev,
          name_th: data.name_th || prev.name_th,
          city_th: data.city_th || prev.city_th,
          transport_th: data.transport_th || prev.transport_th,
          address_th: data.address_th || prev.address_th,
          nearbyAmenities_th: data.nearbyAmenities_th ? data.nearbyAmenities_th.join(", ") : prev.nearbyAmenities_th,
          article_th: data.article_th || prev.article_th
        }));
      } else {
        alert("Failed to translate content: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error calling translation API");
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredLocations = locations
    .filter(l => l.city === activeCity)
    .filter(l => activeType === "all" || l.type === activeType)
    .filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h1><i className="fa-solid fa-building"></i> Building Directory</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="fa-solid fa-plus"></i> Add Location
        </button>
      </div>

      <div className={styles.tabsContainer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {cities.map((city) => (
            <button 
              key={city}
              className={`${styles.tabBtn} ${activeCity === city ? styles.activeTab : ""}`}
              onClick={() => setActiveCity(city)}
            >
              {city}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { id: "all", label: "All" },
              { id: "hotel", label: "Hotels" },
              { id: "apartment", label: "Apartments" },
              { id: "condo", label: "Condos" }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveType(t.id)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "20px",
                  border: "none",
                  background: activeType === t.id ? "var(--primary)" : "transparent",
                  color: activeType === t.id ? "white" : "var(--text-light)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontWeight: activeType === t.id ? "600" : "normal"
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", width: "250px" }}>
            <i 
              className="fa-solid fa-magnifying-glass" 
              style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }}
            ></i>
            <input 
              type="text" 
              placeholder="Search building..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 1rem 0.6rem 2.5rem",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "var(--text)",
                outline: "none",
                fontSize: "0.9rem"
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p style={{ padding: "2rem" }}>Loading locations data...</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Location Name</th>
                <th>Type</th>
                <th>Stars</th>
                <th>Rooms</th>
                <th>Address</th>
                <th>Transport/Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No locations in this city.</td>
                </tr>
              ) : (
                filteredLocations.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ textTransform: "capitalize" }}>{item.type}</td>
                    <td>{item.stars} <i className="fa-solid fa-star" style={{color: "#FFD700", fontSize:"0.8em"}}></i></td>
                    <td>{item.totalRooms}</td>
                    <td>{item.address}</td>
                    <td>{item.transport}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.editBtn} onClick={() => openModal(item)}>
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} style={{ overflowY: "auto", padding: "2rem 0" }}>
          <div className={styles.modalContent} style={{ margin: "auto", maxWidth: "600px" }}>
            <h2>{editingItem?.id ? "Edit Location" : "Add Location"}</h2>
            <form onSubmit={handleSave}>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">City</label>
                  <select 
                    className="form-input" 
                    value={editingItem.city} 
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      city: e.target.value,
                      city_th: e.target.value === "Bangkok" ? "กรุงเทพฯ" : "พัทยา"
                    })}
                    required
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Type</label>
                  <select 
                    className="form-input" 
                    value={editingItem.type} 
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                    required
                  >
                    <option value="hotel">Hotel</option>
                    <option value="apartment">Serviced Apartment</option>
                    <option value="condo">Condominium</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Location Name (EN)</label>
                  <Autocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                    className="form-input"
                    onPlaceSelected={(place) => {
                      const placeName = toTitleCase(place.name || editingItem.name);
                      const placeAddress = place.formatted_address || "";
                      const placeUrl = place.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName || "")}`;
                      setEditingItem((prev) => ({ 
                        ...prev, 
                        name: placeName,
                        address: placeAddress,
                        mapLink: placeUrl
                      }));
                    }}
                    onChange={(e) => setEditingItem((prev) => ({ ...prev, name: toTitleCase(e.target.value) }))}
                    value={editingItem.name}
                    options={{
                      types: ["establishment", "geocode"],
                      componentRestrictions: { country: "th" },
                    }}
                    placeholder="Start typing a location name..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location Name (TH)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingItem.name_th || ""} 
                    onChange={(e) => setEditingItem({ ...editingItem, name_th: e.target.value })}
                    placeholder="ชื่อสถานที่ภาษาไทย..."
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Full Address (EN)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingItem.address || ""} 
                    onChange={(e) => setEditingItem({ ...editingItem, address: e.target.value })}
                    placeholder="e.g. 123 Sukhumvit Road, Bangkok..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Address (TH)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingItem.address_th || ""} 
                    onChange={(e) => setEditingItem({ ...editingItem, address_th: e.target.value })}
                    placeholder="ที่อยู่ภาษาไทย..."
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Google Maps Link</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={editingItem.mapLink || ""} 
                  onChange={(e) => setEditingItem({ ...editingItem, mapLink: e.target.value })}
                />
              </div>

              {/* AI Auto-Fill & Translate Box */}
              <div style={{ marginBottom: "1.5rem", background: "rgba(99, 102, 241, 0.1)", padding: "1rem", borderRadius: "var(--radius)", border: "1px dashed var(--accent)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <h4 style={{ margin: 0, color: "var(--accent)", fontSize: "1rem" }}><i className="fa-solid fa-wand-magic-sparkles"></i> AI Copilot</h4>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "var(--text-light)" }}>Generate details or translate form contents instantly!</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={handleGenerateArticle} 
                      disabled={isGeneratingAI}
                      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                    >
                      {isGeneratingAI ? <><i className="fa-solid fa-spinner fa-spin"></i> Auto-Filling...</> : "✨ Auto-Fill Form"}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-accent" 
                      onClick={handleAutoTranslate} 
                      disabled={isTranslating}
                      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "var(--accent)", color: "white" }}
                    >
                      {isTranslating ? <><i className="fa-solid fa-spinner fa-spin"></i> Translating...</> : "🇹🇭 Translate to TH"}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Stars</label>
                  <input 
                    type="number" 
                    min="1" max="5"
                    className="form-input" 
                    value={editingItem.stars} 
                    onChange={(e) => setEditingItem({ ...editingItem, stars: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Total Rooms</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editingItem.totalRooms} 
                    onChange={(e) => setEditingItem({ ...editingItem, totalRooms: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Avg Price</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. ฿5,000 / month"
                    value={editingItem.averagePrice} 
                    onChange={(e) => setEditingItem({ ...editingItem, averagePrice: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Transport Details (EN)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingItem.transport} 
                    onChange={(e) => setEditingItem({ ...editingItem, transport: e.target.value })}
                    placeholder="e.g. Near BTS Asok"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Transport Details (TH)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingItem.transport_th || ""} 
                    onChange={(e) => setEditingItem({ ...editingItem, transport_th: e.target.value })}
                    placeholder="การเดินทางภาษาไทย..."
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">SEO Article / Description (EN)</label>
                <textarea 
                  className="form-input" 
                  rows="4"
                  value={editingItem.article || ""} 
                  onChange={(e) => setEditingItem({ ...editingItem, article: e.target.value })}
                  placeholder="English SEO article here..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">SEO Article / Description (TH)</label>
                <textarea 
                  className="form-input" 
                  rows="4"
                  value={editingItem.article_th || ""} 
                  onChange={(e) => setEditingItem({ ...editingItem, article_th: e.target.value })}
                  placeholder="บทความภาษาไทย..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="form-group">
                  <label className="form-label">Nearby Amenities (EN)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Shopping Mall, 7-Eleven"
                    value={editingItem.nearbyAmenities} 
                    onChange={(e) => setEditingItem({ ...editingItem, nearbyAmenities: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nearby Amenities (TH)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="สถานที่ใกล้เคียงภาษาไทย..."
                    value={editingItem.nearbyAmenities_th || ""} 
                    onChange={(e) => setEditingItem({ ...editingItem, nearbyAmenities_th: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={closeModal} style={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
