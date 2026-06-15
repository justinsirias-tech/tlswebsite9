"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
    permissions: []
  });

  const availablePermissions = [
    { id: "bookings", label: "Bookings" },
    { id: "contacts", label: "Contact Requests" },
    { id: "locations", label: "Hotel Directory" },
    { id: "pricing", label: "Pricing Menu" },
    { id: "articles", label: "Articles" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        password: "", // Leave blank unless they want to change it
        role: user.role,
        permissions: user.permissions || []
      });
    } else {
      setFormData({
        id: null,
        name: "",
        email: "",
        password: "",
        role: "EDITOR",
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId) => {
    setFormData(prev => {
      const hasPerm = prev.permissions.includes(permId);
      if (hasPerm) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!formData.id && !formData.password)) {
      alert("Please fill out all required fields.");
      return;
    }

    const payload = { ...formData };
    if (!payload.password) delete payload.password; // Don't send empty password on update

    const url = formData.id ? `/api/admin/users/${formData.id}` : `/api/admin/users`;
    const method = formData.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save user.");
      }
    } catch (err) {
      alert("An error occurred.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
      else alert("Failed to delete user.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1><i className="fa-solid fa-users-gear"></i> User Management</h1>
          <p style={{ color: "var(--text-light)" }}>Manage staff accounts and their access permissions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fa-solid fa-plus"></i> Add New User
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "0.8rem", 
                      background: user.role === 'SUPERADMIN' ? 'rgba(58, 123, 213, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: user.role === 'SUPERADMIN' ? 'var(--primary)' : 'var(--text-light)',
                      fontWeight: "bold"
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.role === 'SUPERADMIN' ? (
                      <span style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>All Access</span>
                    ) : (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {user.permissions.length === 0 ? <span style={{ color: "var(--text-light)", fontSize: "0.8rem" }}>No access</span> : null}
                        {user.permissions.map(p => (
                          <span key={p} style={{ background: "var(--background)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem", color: "var(--text)" }}>{p}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.editBtn} onClick={() => handleOpenModal(user)}>
                        <i className="fa-solid fa-pen"></i> Edit
                      </button>
                      {user.role !== 'SUPERADMIN' && (
                        <button className={styles.deleteBtn} onClick={() => handleDelete(user.id)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: "500px" }}>
            <h2>{formData.id ? "Edit User" : "Add New User"}</h2>
            <form onSubmit={handleSave}>
              
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">{formData.id ? "New Password (leave blank to keep current)" : "Password"}</label>
                <input type="password" className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!formData.id} />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Role</label>
                <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="EDITOR">Editor (Restricted Access)</option>
                  <option value="SUPERADMIN">Superadmin (Full Access)</option>
                </select>
              </div>

              {formData.role !== 'SUPERADMIN' && (
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>Section Permissions</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {availablePermissions.map(perm => (
                      <label key={perm.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          checked={formData.permissions.includes(perm.id)} 
                          onChange={() => handleTogglePermission(perm.id)}
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
