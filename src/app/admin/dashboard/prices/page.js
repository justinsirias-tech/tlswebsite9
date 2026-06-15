"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

export default function ManagePrices() {
  const [priceCategories, setPriceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [categoryName, setCategoryName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "prices"));
      const pricesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPriceCategories(pricesData);
    } catch (err) {
      console.error("Error fetching prices:", err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (itemName.trim() && itemPrice.trim()) {
      setItems([...items, { name: itemName.trim(), price: itemPrice.trim() }]);
      setItemName("");
      setItemPrice("");
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName) return;

    try {
      await addDoc(collection(db, "prices"), {
        category: categoryName,
        items
      });
      // Reset form
      setCategoryName("");
      setItems([]);
      fetchPrices();
    } catch (err) {
      console.error("Error adding price category:", err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this price category?")) {
      try {
        await deleteDoc(doc(db, "prices", id));
        fetchPrices();
      } catch (err) {
        console.error("Error deleting price category:", err);
      }
    }
  };

  if (loading) return <div>Loading prices...</div>;

  return (
    <div>
      <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "2rem" }}>Manage Prices</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* ADD CATEGORY FORM */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Add Price Category</h2>
          <form onSubmit={handleAddCategory}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Category Name (e.g. Wash & Fold)</label>
              <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "8px" }} />
            </div>

            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <label style={{ display: "block", marginBottom: "1rem", fontWeight: 600 }}>Pricing Items</label>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} style={{ flex: 2, padding: "0.5rem", border: "1px solid #ccc", borderRadius: "8px" }} placeholder="Item Name (e.g. T-Shirt)" />
                <input type="text" value={itemPrice} onChange={e => setItemPrice(e.target.value)} style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: "8px" }} placeholder="Price (e.g. 50 THB)" />
                <button type="button" onClick={addItem} className="btn btn-outline" style={{ padding: "0.5rem 1rem" }}>Add</button>
              </div>
              
              <ul style={{ listStyle: "none", padding: 0 }}>
                {items.map((item, index) => (
                  <li key={index} style={{ display: "flex", justifyContent: "space-between", background: "white", padding: "0.5rem 1rem", marginBottom: "0.5rem", borderRadius: "4px", border: "1px solid #e5e7eb" }}>
                    <span>{item.name} <strong style={{ marginLeft: "1rem", color: "var(--primary)" }}>{item.price}</strong></span>
                    <button type="button" onClick={() => removeItem(index)} style={{ color: "red", border: "none", background: "transparent", cursor: "pointer" }}>x</button>
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Save Category</button>
          </form>
        </div>

        {/* LIST EXISTING CATEGORIES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Existing Categories</h2>
          {priceCategories.length === 0 ? (
            <p>No price categories found.</p>
          ) : (
            priceCategories.map(cat => (
              <div key={cat.id} style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>
                  <h3 style={{ color: "var(--primary)" }}>{cat.category}</h3>
                  <button onClick={() => handleDelete(cat.id)} className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", borderColor: "red", color: "red" }}>Delete</button>
                </div>
                <ul style={{ listStyle: "none" }}>
                  {cat.items?.map((item, idx) => (
                    <li key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span>{item.name}</span>
                      <strong>{item.price}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
