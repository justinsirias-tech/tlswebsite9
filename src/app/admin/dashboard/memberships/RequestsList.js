"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./RequestsList.module.css";

const cleanPhone = (phone) => {
  if (!phone) return "";
  return phone.replace(/[^0-9]/g, "");
};

function AttachmentManager({ attachments = [], onChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      const newAttachments = [...attachments, data.url];
      onChange(newAttachments);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach(file => {
        handleUpload(file);
      });
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      Array.from(e.target.files).forEach(file => {
        handleUpload(file);
      });
    }
  };

  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      Array.from(e.clipboardData.files).forEach(file => {
        handleUpload(file);
      });
    }
  };

  const handleDelete = (indexToDelete) => {
    const newAttachments = attachments.filter((_, idx) => idx !== indexToDelete);
    onChange(newAttachments);
  };

  const getFileName = (url) => {
    const parts = url.split("/");
    const fullName = parts[parts.length - 1];
    const underscoreIdx = fullName.indexOf("_");
    return underscoreIdx !== -1 ? fullName.substring(underscoreIdx + 1) : fullName;
  };

  const isImage = (url) => {
    const ext = url.split(".").pop().toLowerCase();
    return ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h4 style={{ color: "#222945", marginTop: 0, marginBottom: "0.75rem", fontSize: "0.95rem" }}>
        <i className="fa-solid fa-paperclip"></i> Attachments / Documents
      </h4>

      {/* Upload Dropzone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        style={{
          border: "2px dashed " + (dragActive ? "#222945" : "rgba(34, 41, 69, 0.2)"),
          background: dragActive ? "rgba(34, 41, 69, 0.02)" : "rgba(34, 41, 69, 0.01)",
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.2s ease"
        }}
        onClick={() => document.getElementById("file-input-attachments").click()}
      >
        <input 
          id="file-input-attachments"
          type="file" 
          multiple
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "1.8rem", color: "#222945", marginBottom: "0.5rem" }}></i>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#222945", fontWeight: "600" }}>
          Drag & Drop files here, Paste from clipboard, or click to upload
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
          Supports PDF, Images, Word, Excel, etc.
        </p>
        {uploading && <p style={{ margin: "8px 0 0 0", fontSize: "0.8rem", color: "#222945", fontWeight: "bold" }}>Uploading files...</p>}
        {uploadError && <p style={{ margin: "8px 0 0 0", fontSize: "0.8rem", color: "#ef4444" }}>{uploadError}</p>}
      </div>

      {/* List of Attachments */}
      {attachments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
          {attachments.map((url, idx) => (
            <div 
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0.75rem",
                background: "rgba(34, 41, 69, 0.02)",
                border: "1px solid rgba(34, 41, 69, 0.08)",
                borderRadius: "8px"
              }}
            >
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#222945",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "85%"
                }}
              >
                {isImage(url) ? (
                  <img 
                    src={url} 
                    alt="attachment" 
                    style={{ width: "30px", height: "30px", objectFit: "cover", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.1)" }}
                  />
                ) : (
                  <i className="fa-solid fa-file" style={{ fontSize: "1.2rem", color: "#222945" }}></i>
                )}
                <span>{getFileName(url)}</span>
              </a>

              <button 
                type="button"
                onClick={() => handleDelete(idx)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  padding: "2px",
                  transition: "color 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
                onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MembershipRequestsList({ initialRequests = [], initialMembers = [] }) {
  const router = useRouter();
  
  // Tab states: "applications" | "expiring" | "members"
  const [activeTab, setActiveTab] = useState("applications");
  
  // Data states
  const [requests, setRequests] = useState(initialRequests);
  const [members, setMembers] = useState(initialMembers);
  
  // Modal states
  const [activeItem, setActiveItem] = useState(null); // Can be a membershipRequest OR a member
  const [itemType, setItemType] = useState("request"); // "request" | "member"
  const [modalMode, setModalMode] = useState("details"); // "details" | "edit"

  // Form states (requests & profile)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    tier: "",
    term: "",
    dob: "",
    address: "",
    roomNo: "",
    notes: "",
    balance: 0.0,
    startDate: "",
    endDate: "",
    attachments: [],
    password: ""
  });

  // Status form states (for requests only)
  const [statusForm, setStatusForm] = useState({
    status: "",
    startDate: "",
    endDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatDate = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get list of expiring members (ending within 1 month, or already expired)
  const getExpiringMembers = () => {
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    return members.filter(m => {
      if (!m.endDate) return false;
      const end = new Date(m.endDate);
      if (isNaN(end.getTime())) return false;
      return end <= oneMonthLater;
    });
  };

  const handleOpenRequestDetails = (req) => {
    setActiveItem(req);
    setItemType("request");
    setModalMode("details");
    setStatusForm({
      status: req.status || "PENDING",
      startDate: req.startDate || "",
      endDate: req.endDate || ""
    });
    setEditForm({
      name: req.name || "",
      email: req.email || "",
      phone: req.phone || "",
      tier: req.tier || "",
      term: req.term || "",
      dob: req.dob || "",
      address: req.address || "",
      roomNo: req.roomNo || "",
      notes: req.notes || "",
      startDate: req.startDate || "",
      endDate: req.endDate || "",
      attachments: req.attachments || []
    });
    setError("");
    setSuccess("");
  };

  const handleOpenMemberDetails = (mbr) => {
    setActiveItem(mbr);
    setItemType("member");
    setModalMode("details");
    setEditForm({
      name: mbr.name || "",
      email: mbr.email || "",
      phone: mbr.phone || "",
      tier: mbr.tier || "None",
      dob: mbr.dob || "",
      address: mbr.address || "",
      roomNo: mbr.roomNo || "",
      balance: mbr.balance || 0.0,
      startDate: mbr.startDate || "",
      endDate: mbr.endDate || "",
      attachments: mbr.attachments || [],
      password: ""
    });
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setActiveItem(null);
  };

  const calculateEndDate = (startDateStr, termStr) => {
    if (!startDateStr || !termStr) return "";
    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return "";
    
    let monthsToAdd = 1;
    const termLower = termStr.toLowerCase();
    if (termLower.includes("12 month")) monthsToAdd = 12;
    else if (termLower.includes("6 month")) monthsToAdd = 6;
    else if (termLower.includes("3 month")) monthsToAdd = 3;
    else if (termLower.includes("1 month")) monthsToAdd = 1;
    
    date.setMonth(date.getMonth() + monthsToAdd);
    return date.toISOString().split("T")[0];
  };

  const handleStartDateChange = (val) => {
    if (itemType === "request") {
      const calculated = calculateEndDate(val, activeItem.term);
      setStatusForm(prev => ({
        ...prev,
        startDate: val,
        endDate: calculated
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        startDate: val
      }));
    }
  };

  const handleSaveRequestStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/memberships", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeItem.id,
          ...editForm,
          status: statusForm.status,
          startDate: statusForm.startDate,
          endDate: statusForm.endDate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Update local requests
      setRequests(requests.map(r => r.id === activeItem.id ? data.request : r));
      setActiveItem(data.request);
      
      setSuccess("Membership request status updated successfully!");
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRequestProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/memberships", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeItem.id,
          ...editForm,
          status: statusForm.status,
          startDate: statusForm.startDate,
          endDate: statusForm.endDate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setRequests(requests.map(r => r.id === activeItem.id ? data.request : r));
      setActiveItem(data.request);
      
      setSuccess("Profile information saved successfully!");
      setModalMode("details");
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMemberProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeItem.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          tier: editForm.tier,
          dob: editForm.dob,
          address: editForm.address,
          roomNo: editForm.roomNo,
          balance: editForm.balance,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
          attachments: editForm.attachments,
          password: editForm.password
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Update local members state list
      const updatedList = members.map(m => m.id === activeItem.id ? data.member : m);
      setMembers(updatedList);
      setActiveItem(data.member);
      
      setSuccess("Member profile and validity dates saved successfully!");
      setModalMode("details");
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const expiringMembersList = getExpiringMembers();

  return (
    <div>
      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid rgba(34, 41, 69, 0.05)", marginBottom: "2rem", overflowX: "auto" }}>
        <button 
          onClick={() => setActiveTab("applications")}
          style={{
            background: "none",
            border: "none",
            padding: "1rem 0.5rem",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "applications" ? "#222945" : "#94a3b8",
            borderBottom: "3px solid " + (activeTab === "applications" ? "#222945" : "transparent"),
            marginBottom: "-2px",
            whiteSpace: "nowrap"
          }}
        >
          <i className="fa-solid fa-file-invoice" style={{ marginRight: "6px" }}></i>
          Applications ({requests.length})
        </button>
        <button 
          onClick={() => setActiveTab("expiring")}
          style={{
            background: "none",
            border: "none",
            padding: "1rem 0.5rem",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "expiring" ? "#e11d48" : "#94a3b8",
            borderBottom: "3px solid " + (activeTab === "expiring" ? "#e11d48" : "transparent"),
            marginBottom: "-2px",
            whiteSpace: "nowrap"
          }}
        >
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "6px" }}></i>
          Expiring / Expired ({expiringMembersList.length})
        </button>
        <button 
          onClick={() => setActiveTab("members")}
          style={{
            background: "none",
            border: "none",
            padding: "1rem 0.5rem",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: "pointer",
            color: activeTab === "members" ? "#222945" : "#94a3b8",
            borderBottom: "3px solid " + (activeTab === "members" ? "#222945" : "transparent"),
            marginBottom: "-2px",
            whiteSpace: "nowrap"
          }}
        >
          <i className="fa-solid fa-users" style={{ marginRight: "6px" }}></i>
          Active Members ({members.length})
        </button>
      </div>

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <div className={styles.container}>
          {requests.length === 0 ? (
            <p style={{ color: "var(--text-light)", textAlign: "center", padding: "2rem" }}>No applications found.</p>
          ) : (
            requests.map(req => (
              <div key={req.id} className={styles.requestCard} onClick={() => handleOpenRequestDetails(req)}>
                <div className={styles.cardHeader}>
                  <div className={styles.nameGroup}>
                    <span className={styles.name}>{req.name}</span>
                    <span className={styles.contactInfo}><i className="fa-solid fa-envelope"></i> {req.email}</span>
                    <span className={styles.contactInfo}><i className="fa-solid fa-phone"></i> {req.phone}</span>
                    {req.attachments && req.attachments.length > 0 && (
                      <span className={styles.contactInfo} style={{ color: "#222945", fontWeight: "700" }}>
                        <i className="fa-solid fa-paperclip"></i> {req.attachments.length}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span className={`${styles.statusBadge} ${styles["badge" + req.status]}`}>{req.status}</span>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>{formatDate(req.createdAt)}</span>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  <div>
                    <div className={styles.gridItemLabel}>Requested Package</div>
                    <div className={styles.gridItemValue} style={{ textTransform: "capitalize" }}>{req.tier} Package</div>
                  </div>
                  <div>
                    <div className={styles.gridItemLabel}>Subscription Term</div>
                    <div className={styles.gridItemValue}>{req.term}</div>
                  </div>
                  {req.startDate && (
                    <div>
                      <div className={styles.gridItemLabel}>Validity Period</div>
                      <div className={styles.gridItemValue} style={{ fontSize: "0.95rem" }}>
                        {formatDate(req.startDate)} - {formatDate(req.endDate)}
                      </div>
                    </div>
                  )}
                  {req.address && (
                    <div style={{ gridColumn: "span 2" }}>
                      <div className={styles.gridItemLabel}>Address</div>
                      <div className={styles.gridItemValue}>
                        {req.address} {req.roomNo && <span style={{ background: "rgba(34, 41, 69, 0.05)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem", marginLeft: "6px", fontWeight: "bold" }}>Room {req.roomNo}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
                  <a href={`https://wa.me/${cleanPhone(req.phone)}`} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnWhatsApp}`}>
                    <i className="fa-brands fa-whatsapp"></i> Chat WhatsApp
                  </a>
                  <button onClick={() => handleOpenRequestDetails(req)} className={`${styles.btn} ${styles.btnManage}`}>
                    <i className="fa-solid fa-gear"></i> Manage Application
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Expiring Tab */}
      {activeTab === "expiring" && (
        <div className={styles.container}>
          {expiringMembersList.length === 0 ? (
            <p style={{ color: "var(--text-light)", textAlign: "center", padding: "2rem" }}>No members expiring within 1 month.</p>
          ) : (
            expiringMembersList.map(mbr => {
              const isExpired = new Date(mbr.endDate) < new Date();
              return (
                <div key={mbr.id} className={styles.requestCard} style={{ borderLeft: "4px solid #e11d48" }} onClick={() => handleOpenMemberDetails(mbr)}>
                  <div className={styles.cardHeader}>
                    <div className={styles.nameGroup}>
                      <span className={styles.name}>{mbr.name}</span>
                      <span className={styles.contactInfo}><i className="fa-solid fa-envelope"></i> {mbr.email}</span>
                      <span className={styles.contactInfo}><i className="fa-solid fa-phone"></i> {mbr.phone}</span>
                      {mbr.attachments && mbr.attachments.length > 0 && (
                        <span className={styles.contactInfo} style={{ color: "#e11d48", fontWeight: "700" }}>
                          <i className="fa-solid fa-paperclip"></i> {mbr.attachments.length}
                        </span>
                      )}
                    </div>
                    <div>
                      <span style={{ 
                        display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "700",
                        background: isExpired ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                        color: isExpired ? "#e11d48" : "#d97706"
                      }}>
                        {isExpired ? "EXPIRED" : "EXPIRING SOON"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.detailsGrid}>
                    <div>
                      <div className={styles.gridItemLabel}>Active Package</div>
                      <div className={styles.gridItemValue} style={{ textTransform: "capitalize" }}>{mbr.tier}</div>
                    </div>
                    <div>
                      <div className={styles.gridItemLabel}>Expiry Date</div>
                      <div className={styles.gridItemValue} style={{ color: isExpired ? "#e11d48" : "#d97706" }}>
                        {formatDate(mbr.endDate)}
                      </div>
                    </div>
                    <div>
                      <div className={styles.gridItemLabel}>Validity Period</div>
                      <div className={styles.gridItemValue} style={{ fontSize: "0.95rem" }}>
                        {formatDate(mbr.startDate)} - {formatDate(mbr.endDate)}
                      </div>
                    </div>
                    {mbr.address && (
                      <div style={{ gridColumn: "span 2" }}>
                        <div className={styles.gridItemLabel}>Address</div>
                        <div className={styles.gridItemValue}>
                          {mbr.address} {mbr.roomNo && <span style={{ background: "rgba(34, 41, 69, 0.05)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem", marginLeft: "6px", fontWeight: "bold" }}>Room {mbr.roomNo}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
                    <a href={`https://wa.me/${cleanPhone(mbr.phone)}`} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnWhatsApp}`}>
                      <i className="fa-brands fa-whatsapp"></i> Contact to Renew
                    </a>
                    <button onClick={() => handleOpenMemberDetails(mbr)} className={`${styles.btn} ${styles.btnManage}`}>
                      <i className="fa-solid fa-user-pen"></i> Edit Member Profile
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Active Members Tab */}
      {activeTab === "members" && (
        <div className={styles.container}>
          {members.length === 0 ? (
            <p style={{ color: "var(--text-light)", textAlign: "center", padding: "2rem" }}>No active members found.</p>
          ) : (
            members.map(mbr => (
              <div key={mbr.id} className={styles.requestCard} onClick={() => handleOpenMemberDetails(mbr)}>
                <div className={styles.cardHeader}>
                  <div className={styles.nameGroup}>
                    <span className={styles.name}>{mbr.name}</span>
                    <span className={styles.contactInfo}><i className="fa-solid fa-envelope"></i> {mbr.email}</span>
                    <span className={styles.contactInfo}><i className="fa-solid fa-phone"></i> {mbr.phone}</span>
                    {mbr.attachments && mbr.attachments.length > 0 && (
                      <span className={styles.contactInfo} style={{ color: "#222945", fontWeight: "700" }}>
                        <i className="fa-solid fa-paperclip"></i> {mbr.attachments.length}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={`${styles.statusBadge} ${styles.badgeAPPROVED}`} style={{ textTransform: "capitalize" }}>
                      {mbr.tier} Member
                    </span>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  <div>
                    <div className={styles.gridItemLabel}>Package Tier</div>
                    <div className={styles.gridItemValue} style={{ textTransform: "capitalize" }}>{mbr.tier}</div>
                  </div>
                  <div>
                    <div className={styles.gridItemLabel}>Validity Period</div>
                    <div className={styles.gridItemValue} style={{ fontSize: "0.95rem" }}>
                      {mbr.startDate && mbr.endDate ? `${formatDate(mbr.startDate)} - ${formatDate(mbr.endDate)}` : "Not set"}
                    </div>
                  </div>
                  <div>
                    <div className={styles.gridItemLabel}>Account Balance</div>
                    <div className={styles.gridItemValue}>฿{mbr.balance.toFixed(2)}</div>
                  </div>
                  {mbr.address && (
                    <div style={{ gridColumn: "span 2" }}>
                      <div className={styles.gridItemLabel}>Address</div>
                      <div className={styles.gridItemValue}>
                        {mbr.address} {mbr.roomNo && <span style={{ background: "rgba(34, 41, 69, 0.05)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem", marginLeft: "6px", fontWeight: "bold" }}>Room {mbr.roomNo}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
                  <a href={`https://wa.me/${cleanPhone(mbr.phone)}`} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnWhatsApp}`}>
                    <i className="fa-brands fa-whatsapp"></i> Chat WhatsApp
                  </a>
                  <button onClick={() => handleOpenMemberDetails(mbr)} className={`${styles.btn} ${styles.btnManage}`}>
                    <i className="fa-solid fa-user-pen"></i> Edit Member Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Popup Manager (MembershipRequest vs Active Member) */}
      {activeItem && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {itemType === "request" ? "Membership Application Manager" : "Member Profile Manager"}
              </h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>&times;</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.tabHeader}>
                <button 
                  className={`${styles.tabBtn} ${modalMode === "details" ? styles.tabBtnActive : ""}`}
                  onClick={() => setModalMode("details")}
                >
                  <i className="fa-solid fa-circle-info"></i> {itemType === "request" ? "Process Application" : "Subscription Dates"}
                </button>
                <button 
                  className={`${styles.tabBtn} ${modalMode === "edit" ? styles.tabBtnActive : ""}`}
                  onClick={() => setModalMode("edit")}
                >
                  <i className="fa-solid fa-user-pen"></i> Edit Profile Info
                </button>
              </div>

              {error && <div className={styles.errorAlert} style={{ padding: "0.75rem", marginBottom: "1rem" }}>{error}</div>}
              {success && <div className={styles.successAlert} style={{ padding: "0.75rem", marginBottom: "1rem" }}>{success}</div>}

              {/* REQUEST FLOW */}
              {itemType === "request" && modalMode === "details" && (
                <form onSubmit={handleSaveRequestStatus}>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>Applicant Name</label>
                      <input type="text" value={editForm.name} disabled style={{ background: "#f1f5f9", cursor: "not-allowed" }} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Package / Term</label>
                      <input type="text" value={`${editForm.tier} (${editForm.term})`} disabled style={{ background: "#f1f5f9", cursor: "not-allowed" }} />
                    </div>

                    <div className={styles.inputGroup + " " + styles.fullWidth}>
                      <label>Application Status</label>
                      <select 
                        value={statusForm.status} 
                        onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  {statusForm.status === "APPROVED" && (
                    <div className={styles.dateRangeBox}>
                      <h4 style={{ color: "#222945", marginTop: 0, marginBottom: "1rem", fontSize: "0.95rem" }}>
                        <i className="fa-solid fa-calendar-days"></i> Set Subscription Dates
                      </h4>
                      <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                          <label>Start Date</label>
                          <input 
                            type="date" 
                            value={statusForm.startDate} 
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Ending Date</label>
                          <input 
                            type="date" 
                            value={statusForm.endDate} 
                            onChange={(e) => setStatusForm(prev => ({ ...prev, endDate: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <AttachmentManager 
                    attachments={editForm.attachments}
                    onChange={(newAtts) => setEditForm(prev => ({ ...prev, attachments: newAtts }))}
                  />

                  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className={`${styles.btn} ${styles.btnManage}`} disabled={loading}>
                      {loading ? "..." : "Save Application Status"}
                    </button>
                  </div>
                </form>
              )}

              {itemType === "request" && modalMode === "edit" && (
                <form onSubmit={handleSaveRequestProfile}>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        value={editForm.email} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        value={editForm.phone} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Date of Birth</label>
                      <input 
                        type="text" 
                        placeholder="YYYY-MM-DD"
                        value={editForm.dob} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))} 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Requested Package</label>
                      <select 
                        value={editForm.tier} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, tier: e.target.value }))}
                      >
                        <option value="Gold Package">Gold Package</option>
                        <option value="Silver Package">Silver Package</option>
                        <option value="Platinum Package">Platinum Package</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Subscription Term</label>
                      <select 
                        value={editForm.term} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, term: e.target.value }))}
                      >
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="12 Months">12 Months</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup + " " + styles.fullWidth}>
                      <label>Building Address</label>
                      <input 
                        type="text" 
                        value={editForm.address} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))} 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Room Number</label>
                      <input 
                        type="text" 
                        value={editForm.roomNo} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, roomNo: e.target.value }))} 
                      />
                    </div>
                    <div className={styles.inputGroup + " " + styles.fullWidth}>
                      <label>Additional Notes</label>
                      <textarea 
                        rows={3} 
                        value={editForm.notes} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))} 
                      />
                    </div>
                  </div>

                  <AttachmentManager 
                    attachments={editForm.attachments}
                    onChange={(newAtts) => setEditForm(prev => ({ ...prev, attachments: newAtts }))}
                  />

                  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setModalMode("details")}>Cancel</button>
                    <button type="submit" className={`${styles.btn} ${styles.btnManage}`} disabled={loading}>
                      {loading ? "..." : "Save Profile Details"}
                    </button>
                  </div>
                </form>
              )}

              {/* MEMBER FLOW */}
              {itemType === "member" && modalMode === "details" && (
                <form onSubmit={handleSaveMemberProfile}>
                  <div className={styles.dateRangeBox} style={{ marginTop: 0 }}>
                    <h4 style={{ color: "#222945", marginTop: 0, marginBottom: "1rem", fontSize: "0.95rem" }}>
                      <i className="fa-solid fa-calendar-days"></i> Set Member Validity Dates
                    </h4>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label>Start Date</label>
                        <input 
                          type="date" 
                          value={editForm.startDate} 
                          onChange={(e) => handleStartDateChange(e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Ending Date</label>
                        <input 
                          type="date" 
                          value={editForm.endDate} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <AttachmentManager 
                    attachments={editForm.attachments}
                    onChange={(newAtts) => setEditForm(prev => ({ ...prev, attachments: newAtts }))}
                  />

                  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className={`${styles.btn} ${styles.btnManage}`} disabled={loading}>
                      {loading ? "..." : "Save Member Validity Dates"}
                    </button>
                  </div>
                </form>
              )}

              {itemType === "member" && modalMode === "edit" && (
                <form onSubmit={handleSaveMemberProfile}>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        value={editForm.email} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        value={editForm.phone} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Date of Birth</label>
                      <input 
                        type="text" 
                        placeholder="YYYY-MM-DD"
                        value={editForm.dob} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))} 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Membership Tier</label>
                      <select 
                        value={editForm.tier} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, tier: e.target.value }))}
                      >
                        <option value="None">None</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Wallet Balance (฿)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={editForm.balance} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, balance: e.target.value }))} 
                      />
                    </div>
                    <div className={styles.inputGroup + " " + styles.fullWidth}>
                      <label>Building Address</label>
                      <input 
                        type="text" 
                        value={editForm.address} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))} 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Room Number</label>
                      <input 
                        type="text" 
                        value={editForm.roomNo} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, roomNo: e.target.value }))} 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Set Member Password</label>
                      <input 
                        type="password" 
                        placeholder="Leave blank to keep unchanged"
                        value={editForm.password || ""} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))} 
                      />
                    </div>
                  </div>

                  <AttachmentManager 
                    attachments={editForm.attachments}
                    onChange={(newAtts) => setEditForm(prev => ({ ...prev, attachments: newAtts }))}
                  />

                  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setModalMode("details")}>Cancel</button>
                    <button type="submit" className={`${styles.btn} ${styles.btnManage}`} disabled={loading}>
                      {loading ? "..." : "Save Profile Details"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
