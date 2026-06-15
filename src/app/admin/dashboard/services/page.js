"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconPath, setIconPath] = useState("/assets/wash_and_fold.png");
  const [feature, setFeature] = useState("");
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "services"));
      const servicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (feature.trim()) {
      setFeatures([...features, feature.trim()]);
      setFeature("");
    }
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      await addDoc(collection(db, "services"), {
        title,
        description,
        iconPath,
        features
      });
      // Reset form
      setTitle("");
      setDescription("");
      setIconPath("/assets/wash_and_fold.png");
      setFeatures([]);
      fetchServices();
    } catch (err) {
      console.error("Error adding service:", err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteDoc(doc(db, "services", id));
        fetchServices();
      } catch (err) {
        console.error("Error deleting service:", err);
      }
    }
  };

  if (loading) return <div>Loading services...</div>;

  return (
    <div>
      <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "2rem" }}>Manage Services</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* ADD SERVICE FORM */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Add New Service</h2>
          <form onSubmit={handleAddService}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "8px" }} />
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows="4" style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "8px" }}></textarea>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Image Path</label>
              <select value={iconPath} onChange={e => setIconPath(e.target.value)} style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <option value="/assets/wash_and_fold.png">Wash & Fold</option>
                <option value="/assets/dry_clean.png">Dry Clean</option>
                <option value="none">None (Ironing Icon)</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Features</label>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <input type="text" value={feature} onChange={e => setFeature(e.target.value)} style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: "8px" }} placeholder="e.g. Color sorting" />
                <button type="button" onClick={addFeature} className="btn btn-outline" style={{ padding: "0.5rem 1rem" }}>Add</button>
              </div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {features.map((feat, index) => (
                  <li key={index} style={{ display: "flex", justifyContent: "space-between", background: "#f3f4f6", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px" }}>
                    <span>{feat}</span>
                    <button type="button" onClick={() => removeFeature(index)} style={{ color: "red", border: "none", background: "transparent", cursor: "pointer" }}>x</button>
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Save Service</button>
          </form>
        </div>

        {/* LIST EXISTING SERVICES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Existing Services</h2>
          {services.length === 0 ? (
            <p>No services found in database.</p>
          ) : (
            services.map(service => (
              <div key={service.id} style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius)", boxShadow: "var(--shadow-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ color: "var(--primary)" }}>{service.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-light)", marginTop: "0.5rem" }}>{service.description.substring(0, 60)}...</p>
                </div>
                <button onClick={() => handleDelete(service.id)} className="btn btn-outline" style={{ padding: "0.5rem 1rem", borderColor: "red", color: "red" }}>Delete</button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
