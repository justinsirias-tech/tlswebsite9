"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, CLOSED, CANCELLED
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchAdminUsers();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    }
  };

  const updateBookingStatus = async (id, status) => {
    if (!confirm(`Are you sure you want to change this booking status to ${status}?`)) return;

    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        // Update local state
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      } else {
        alert("Failed to update booking status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    }
  };

  const assignBookingUser = async (id, assignedToId) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, assignedToId })
      });
      if (res.ok) {
        // Update local state
        setBookings(prev => prev.map(b => b.id === id ? { ...b, assignedToId } : b));
      } else {
        alert("Failed to assign user.");
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning user.");
    }
  };

  // Helper to parse the custom service details block
  const parseServiceDetails = (serviceStr) => {
    const details = {
      services: "",
      address: "",
      delivery: "",
      pickupMethod: "",
      time: "",
      notes: "",
      roomNo: "",
      deliveryRoomNo: ""
    };
    
    if (!serviceStr) return details;

    const lines = serviceStr.split("\n");
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("Services:")) {
        details.services = trimmed.replace("Services:", "").trim();
      } else if (trimmed.startsWith("Address:")) {
        const addrValue = trimmed.replace("Address:", "").trim();
        const roomMatch = addrValue.match(/Room\s+([^,]+)/i);
        if (roomMatch) {
          details.roomNo = roomMatch[1].trim();
          details.address = addrValue.replace(/,?\s*Room\s+[^,]+,?/i, "").trim();
        } else {
          details.address = addrValue;
        }
      } else if (trimmed.startsWith("Delivery:")) {
        const delValue = trimmed.replace("Delivery:", "").trim();
        const roomMatch = delValue.match(/Room\s+([^,]+)/i);
        if (roomMatch) {
          details.deliveryRoomNo = roomMatch[1].trim();
          details.delivery = delValue.replace(/,?\s*Room\s+[^,]+,?/i, "").trim();
        } else {
          details.delivery = delValue;
        }
      } else if (trimmed.startsWith("Pickup Method:")) {
        details.pickupMethod = trimmed.replace("Pickup Method:", "").trim();
      } else if (trimmed.startsWith("Time:")) {
        details.time = trimmed.replace("Time:", "").trim();
      } else if (trimmed.startsWith("Notes:")) {
        details.notes = trimmed.replace("Notes:", "").trim();
      }
    });

    // Fallback if formatting was different (e.g. legacy bookings)
    if (!details.services && serviceStr) {
      if (serviceStr.includes("Services:")) {
        details.services = "None selected";
      } else {
        details.services = serviceStr;
      }
    }
    return details;
  };

  const parseServiceList = (servicesStr) => {
    if (!servicesStr) return [];
    if (servicesStr.includes(";")) {
      return servicesStr.split(";").map(s => s.trim()).filter(Boolean);
    }
    
    const optionMappings = [
      {
        canonical: "Wash & Fold (Weight)",
        patterns: ["wash & fold", "wash and fold", "wash & fold (weight)", "wash/fold"]
      },
      {
        canonical: "Wash, Iron & Fold (Weight)",
        patterns: ["wash, iron & fold", "wash, iron and fold", "wash/iron/fold", "wash, iron & fold (weight)", "wash/iron/fold (weight)"]
      },
      {
        canonical: "Wash, Iron & Hang (Weight)",
        patterns: ["wash, iron & hang", "wash, iron and hang", "wash/iron/hang", "wash, iron & hang (weight)", "wash/iron/hang (weight)"]
      },
      {
        canonical: "Dry cleaning",
        patterns: ["dry cleaning", "dry clean", "dry-cleaning"]
      },
      {
        canonical: "Linens & Beddings",
        patterns: ["linens & beddings", "linens and beddings", "linens/beddings", "linens", "beddings", "bedding"]
      },
      {
        canonical: "Mixed Service",
        patterns: ["mixed service", "mixed"]
      },
      {
        canonical: "Ironing & Pressing only",
        patterns: ["ironing & pressing only", "ironing & pressing", "ironing and pressing", "ironing only", "pressing only"]
      },
      {
        canonical: "Others",
        patterns: ["others", "other"]
      }
    ];

    const found = new Set();
    const lowerStr = servicesStr.toLowerCase();
    
    // Normalize whitespace around slashes and ampersands
    const cleanStr = lowerStr.replace(/\s*\/\s*/g, "/").replace(/\s*&\s*/g, "&");

    optionMappings.forEach(mapping => {
      for (const pattern of mapping.patterns) {
        const cleanPattern = pattern.toLowerCase().replace(/\s*\/\s*/g, "/").replace(/\s*&\s*/g, "&");
        if (cleanStr.includes(cleanPattern)) {
          found.add(mapping.canonical);
          break;
        }
      }
    });

    if (found.size > 0) {
      return Array.from(found);
    }

    return servicesStr.split(",").map(s => s.trim()).filter(Boolean);
  };

  // Helper to format clean phone links
  const getWhatsAppLink = (phoneStr) => {
    const cleanNum = phoneStr.replace(/\D/g, "");
    return `https://wa.me/${cleanNum}`;
  };

  // Export individual booking to PDF Receipt
  const exportToPDF = (booking) => {
    const printWindow = window.open('', '_blank');
    const details = parseServiceDetails(booking.service);
    const formattedPickupDate = new Date(booking.pickupDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    const formattedCreatedDate = new Date(booking.createdAt).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const serviceList = parseServiceList(details.services);

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Booking #${booking.id.slice(0,8)}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              padding: 40px;
              background: #ffffff;
              margin: 0;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #222945;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand {
              font-size: 24px;
              font-weight: 800;
              color: #222945;
              letter-spacing: -0.02em;
            }
            .title {
              font-size: 20px;
              font-weight: 700;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .section-title {
              font-size: 13px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 15px;
              letter-spacing: 0.05em;
            }
            .info-group {
              margin-bottom: 12px;
            }
            .info-label {
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.02em;
            }
            .info-value {
              font-size: 15px;
              font-weight: 500;
              margin-top: 2px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 50px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .badge-pending { background: #fef3c7; color: #d97706; }
            .badge-closed { background: #d1fae5; color: #059669; }
            .badge-cancelled { background: #fee2e2; color: #dc2626; }
            
            .service-badge {
              display: inline-block;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              color: #334155;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              margin-right: 8px;
              margin-bottom: 8px;
            }
            .room-box {
              display: inline-block;
              background: #fffbeb;
              border: 1px solid #fef3c7;
              color: #b45309;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 700;
              margin-top: 4px;
            }

            .footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">THAT LAUNDRY SHOP</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium Laundry & Dry Cleaning</div>
            </div>
            <div>
              <div class="title">Booking Invoice</div>
              <div style="font-size: 12px; color: #64748b; text-align: right; margin-top: 4px;">Order ID: #${booking.id.slice(0, 8)}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Customer Information</div>
              <div class="info-group">
                <div class="info-label">Name</div>
                <div class="info-value">${booking.customerName}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Email</div>
                <div class="info-value">${booking.email}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Phone</div>
                <div class="info-value">${booking.phone}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Booking Status</div>
                <div style="margin-top: 5px;">
                  <span class="badge badge-${booking.status.toLowerCase()}">${booking.status}</span>
                </div>
              </div>
            </div>

            <div>
              <div class="section-title">Logistics & Timing</div>
              <div class="info-group">
                <div class="info-label">Scheduled Pickup</div>
                <div class="info-value">${formattedPickupDate}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Booking Placed On</div>
                <div class="info-value">${formattedCreatedDate}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Pickup Method</div>
                <div class="info-value">${details.pickupMethod || 'N/A'}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Preferred Time</div>
                <div class="info-value">${details.time || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section-title">Requested Services</div>
          <div style="background: #f8fafc; padding: 20px 20px 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
            ${serviceList.length === 0 ? 'None selected' : serviceList.map(s => `<span class="service-badge">${s}</span>`).join('')}
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Pickup Address</div>
              <div class="info-value" style="line-height: 1.5; font-size: 14px;">${details.address || 'N/A'}</div>
              ${details.roomNo ? `<div class="room-box">Room ${details.roomNo}</div>` : ''}
            </div>
            <div>
              <div class="section-title">Delivery Address</div>
              <div class="info-value" style="line-height: 1.5; font-size: 14px;">${details.delivery || 'N/A'}</div>
              ${details.deliveryRoomNo ? `<div class="room-box">Room ${details.deliveryRoomNo}</div>` : ''}
            </div>
          </div>

          ${details.notes ? `
            <div style="margin-top: 30px;">
              <div class="section-title">Special Instructions / Notes</div>
              <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; font-style: italic; line-height: 1.5; font-size: 14px;">
                ${details.notes}
              </div>
            </div>
          ` : ''}

          <div class="footer">
            Thank you for choosing That Laundry Shop. For support, call +66 94 691 6668.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtering Logic
  const filteredBookings = bookings
    .filter(b => {
      const nameMatch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = b.email.toLowerCase().includes(searchTerm.toLowerCase());
      const serviceMatch = b.service.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || emailMatch || serviceMatch;
    })
    .filter(b => statusFilter === "ALL" || b.status === statusFilter);

  // Compute Stats
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === "PENDING").length;
  const closedCount = bookings.filter(b => b.status === "CLOSED").length;
  const cancelledCount = bookings.filter(b => b.status === "CANCELLED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Page Header */}
      <div className={styles.pageHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ color: "var(--primary)", fontSize: "2rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fa-solid fa-calendar-check"></i> Bookings Manager
          </h1>
          <p style={{ color: "var(--text-light)", marginTop: "0.25rem" }}>View, filter, close, and print customer laundry service orders.</p>
        </div>
      </div>

      {/* SaaS Style Dashboard Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div style={{ background: "white", padding: "1.25rem 1.5rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)", border: "1px solid rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "rgba(34, 41, 69, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontSize: "1.2rem" }}>
            <i className="fa-solid fa-list-check"></i>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Total Bookings</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary)" }}>{totalCount}</div>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.25rem 1.5rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)", border: "1px solid rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", fontSize: "1.2rem" }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Pending</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>{pendingCount}</div>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.25rem 1.5rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)", border: "1px solid rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", fontSize: "1.2rem" }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Closed</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>{closedCount}</div>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.25rem 1.5rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)", border: "1px solid rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: "1.2rem" }}>
            <i className="fa-solid fa-circle-xmark"></i>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Cancelled</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ef4444" }}>{cancelledCount}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", background: "white", padding: "1rem", borderRadius: "12px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", gap: "0.25rem", background: "rgba(0,0,0,0.03)", padding: "4px", borderRadius: "25px" }}>
          {[
            { id: "ALL", label: "All Bookings" },
            { id: "PENDING", label: "Pending" },
            { id: "CLOSED", label: "Closed" },
            { id: "CANCELLED", label: "Cancelled" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "20px",
                border: "none",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s ease",
                background: statusFilter === f.id ? "var(--primary)" : "transparent",
                color: statusFilter === f.id ? "white" : "var(--text-light)"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", width: "300px" }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
          <input
            type="text"
            placeholder="Search name, email, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 1rem 0.5rem 2.5rem",
              borderRadius: "20px",
              border: "1px solid rgba(0,0,0,0.1)",
              outline: "none",
              fontSize: "0.85rem",
              background: "#fafafa"
            }}
          />
        </div>
      </div>

      {/* Main List */}
      <div>
        {loading ? (
          <div style={{ background: "white", padding: "4rem", borderRadius: "16px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
            <p style={{ color: "var(--text-light)" }}>Loading bookings data...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ background: "white", padding: "4rem", borderRadius: "16px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: "1rem" }}></i>
            <p style={{ color: "var(--text-light)" }}>No bookings match the filters.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {filteredBookings.map(booking => {
              const details = parseServiceDetails(booking.service);
              const serviceList = parseServiceList(details.services);
              const formattedPickup = new Date(booking.pickupDate).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
              });
              const isWhatsapp = booking.phone.includes("WhatsApp");
              
              const primaryPhone = booking.phone.split("|")[0];
              const cleanPhoneDigits = primaryPhone.replace(/\D/g, "");
              const cleanPhoneWithPlus = primaryPhone.includes("+")
                ? "+" + cleanPhoneDigits
                : (cleanPhoneDigits.startsWith("66") ? "+" + cleanPhoneDigits : "+" + cleanPhoneDigits);

              return (
                <div
                  key={booking.id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "var(--shadow)",
                    border: "1px solid rgba(0,0,0,0.03)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                >
                  {/* Card Header */}
                  <div style={{
                    padding: "1.25rem 1.5rem",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    background: "#fcfdfe",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem"
                  }}>
                    <div>
                      <h3 style={{ margin: 0, color: "var(--primary)", fontSize: "1.25rem" }}>
                        {booking.customerName}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
                        <a 
                          href={`mailto:${booking.email}`} 
                          style={{ fontSize: "0.85rem", color: "var(--text-light)", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <i className="fa-solid fa-envelope" style={{ color: "var(--text-muted)" }}></i> {booking.email}
                        </a>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>|</span>
                        <a 
                          href={`tel:${booking.phone.split("|")[0].replace(/\(WhatsApp\)/g, "").trim()}`} 
                          style={{ fontSize: "0.85rem", color: "var(--text-light)", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <i className="fa-solid fa-phone" style={{ color: "var(--text-muted)" }}></i> {booking.phone}
                        </a>
                        
                        {isWhatsapp && (
                          <a
                            href={getWhatsAppLink(booking.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: "rgba(37, 211, 102, 0.08)",
                              color: "#25D366",
                              padding: "0.1rem 0.6rem",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <i className="fa-brands fa-whatsapp"></i> Chat WhatsApp
                          </a>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                      <span style={{
                        padding: "0.4rem 0.9rem",
                        borderRadius: "50px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        background: booking.status === 'PENDING' ? "rgba(245, 158, 11, 0.1)" : booking.status === 'CANCELLED' ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: booking.status === 'PENDING' ? "#f59e0b" : booking.status === 'CANCELLED' ? "#ef4444" : "#10b981"
                      }}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    
                    {/* Selected Services Display */}
                    <div style={{ background: "rgba(34, 41, 69, 0.02)", padding: "1.2rem", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                        Services Requested
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {serviceList.length > 0 ? (
                          serviceList.map((service, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(34, 41, 69, 0.05)",
                                color: "var(--primary)",
                                border: "1px solid rgba(34, 41, 69, 0.1)",
                                padding: "0.4rem 0.8rem",
                                borderRadius: "8px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                              }}
                            >
                              <i className="fa-solid fa-circle-check" style={{ color: "#10b981", fontSize: "0.75rem" }}></i>
                              {service}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No specified services.</span>
                        )}
                      </div>
                    </div>

                    {/* Detailed Columns Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                      
                      {/* Column 1: Logistics info */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Scheduled Pickup</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-dark)", marginTop: "0.15rem" }}>
                            <i className="fa-solid fa-calendar-day" style={{ marginRight: "6px", color: "var(--primary)" }}></i> {formattedPickup}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Pickup Method</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "500", color: "var(--text-dark)", marginTop: "0.15rem" }}>
                            {details.pickupMethod || "Not specified"}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Placed On</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-light)", marginTop: "0.15rem" }}>
                            {new Date(booking.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Addresses */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Pickup Address</div>
                          <div style={{ fontSize: "0.9rem", color: "var(--text-dark)", marginTop: "0.15rem", lineHeight: "1.4" }}>
                            <i className="fa-solid fa-location-dot" style={{ marginRight: "6px", color: "var(--text-muted)" }}></i> {details.address || "No address provided"}
                          </div>
                          {details.roomNo && (
                            <div style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(245, 158, 11, 0.08)",
                              border: "1px solid rgba(245, 158, 11, 0.2)",
                              color: "#d97706",
                              padding: "0.3rem 0.6rem",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              marginTop: "0.4rem"
                            }}>
                              <i className="fa-solid fa-door-open"></i> Room {details.roomNo}
                            </div>
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Delivery Address</div>
                          <div style={{ fontSize: "0.9rem", color: "var(--text-dark)", marginTop: "0.15rem", lineHeight: "1.4" }}>
                            <i className="fa-solid fa-truck" style={{ marginRight: "6px", color: "var(--text-muted)" }}></i> {details.delivery || "Same as pickup"}
                          </div>
                          {details.deliveryRoomNo && (
                            <div style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(245, 158, 11, 0.08)",
                              border: "1px solid rgba(245, 158, 11, 0.2)",
                              color: "#d97706",
                              padding: "0.3rem 0.6rem",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              marginTop: "0.4rem"
                            }}>
                              <i className="fa-solid fa-door-open"></i> Room {details.deliveryRoomNo}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Messaging Channels Quick-Link */}
                    <div style={{
                      background: "rgba(34, 41, 69, 0.01)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: "12px",
                      padding: "1rem",
                      marginTop: "0.5rem"
                    }}>
                      <div style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.6rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="fa-solid fa-signal" style={{ color: "var(--primary)" }}></i> Messaging Channels Quick-Link
                        </span>
                        <span style={{
                          fontSize: "0.7rem",
                          background: "rgba(34, 41, 69, 0.06)",
                          color: "var(--primary)",
                          padding: "2px 8px",
                          borderRadius: "50px",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <i className="fa-solid fa-circle-info" style={{ fontSize: "0.6rem" }}></i> Ready to Verify
                        </span>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                        
                        {/* WhatsApp */}
                        <div style={{
                          background: "white",
                          border: "1px solid rgba(0,0,0,0.04)",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.4rem"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="fa-brands fa-whatsapp" style={{ color: "#25D366", fontSize: "1.15rem" }}></i>
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-dark)" }}>WhatsApp</span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: isWhatsapp ? "#10b981" : "#64748b", fontWeight: "600" }}>
                            {isWhatsapp ? "● Customer Preferred" : "● Unmarked (Click to check)"}
                          </div>
                          <a
                            href={`https://wa.me/${cleanPhoneDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--primary)",
                              fontWeight: "700",
                              textDecoration: "none",
                              marginTop: "0.5rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            Verify WhatsApp <i className="fa-solid fa-chevron-right" style={{ fontSize: "0.6rem" }}></i>
                          </a>
                        </div>

                        {/* Telegram */}
                        <div style={{
                          background: "white",
                          border: "1px solid rgba(0,0,0,0.04)",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.4rem"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="fa-brands fa-telegram" style={{ color: "#0088cc", fontSize: "1.15rem" }}></i>
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-dark)" }}>Telegram</span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600" }}>
                            ● Click to check status
                          </div>
                          <a
                            href={`https://t.me/${cleanPhoneWithPlus}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--primary)",
                              fontWeight: "700",
                              textDecoration: "none",
                              marginTop: "0.5rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            Verify Telegram <i className="fa-solid fa-chevron-right" style={{ fontSize: "0.6rem" }}></i>
                          </a>
                        </div>


                      </div>
                    </div>

                    {/* Notes (Optional) */}
                    {details.notes && (
                      <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "1rem", borderRadius: "8px", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                        <i className="fa-solid fa-circle-info" style={{ color: "#d97706", marginTop: "2px" }}></i>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#b45309", fontWeight: "600", textTransform: "uppercase" }}>Special Instructions</div>
                          <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.9rem", color: "#78350f", fontStyle: "italic", lineHeight: "1.4" }}>
                            {details.notes}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Card Footer Actions */}
                  <div style={{
                    padding: "1rem 1.5rem",
                    background: "#fcfdfe",
                    borderTop: "1px solid rgba(0,0,0,0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <button
                      onClick={() => exportToPDF(booking)}
                      style={{
                        background: "rgba(34, 41, 69, 0.06)",
                        color: "var(--primary)",
                        border: "none",
                        padding: "0.4rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(34, 41, 69, 0.12)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(34, 41, 69, 0.06)"}
                    >
                      <i className="fa-solid fa-file-pdf"></i> Export PDF / Receipt
                    </button>

                    {booking.status === 'PENDING' && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => updateBookingStatus(booking.id, "CLOSED")}
                          style={{
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            padding: "0.4rem 1rem",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)"
                          }}
                        >
                          <i className="fa-solid fa-check"></i> Close Order
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                          style={{
                            background: "transparent",
                            border: "1px solid #ef4444",
                            color: "#ef4444",
                            padding: "0.4rem 1rem",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <i className="fa-solid fa-xmark"></i> Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
