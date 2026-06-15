import styles from "../admin.module.css";
import Link from "next/link";
import prisma from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let hotelsCount = 0;
  let bookingsCount = 0;
  let contactsCount = 0;
  let recentBookings = [];
  let recentContacts = [];

  try {
    hotelsCount = await prisma.location.count();
    bookingsCount = await prisma.booking.count();
    contactsCount = await prisma.contactRequest.count();
    
    recentBookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });
    
    recentContacts = await prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });
  } catch (err) {
    console.error("Error reading dashboard stats:", err);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ color: "var(--primary)" }}>Dashboard Overview</h1>
          <p style={{ color: "var(--text-light)" }}>Welcome back to your Local CMS</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
        
        {/* Stat Card */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ background: "rgba(34, 41, 69, 0.1)", width: "60px", height: "60px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontSize: "1.5rem" }}>
            <i className="fa-solid fa-building"></i>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "0.2rem" }}>{hotelsCount}</h3>
            <p style={{ color: "var(--text-light)", fontWeight: "500" }}>Active Properties</p>
          </div>
        </div>

        {/* Stat Card */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ background: "rgba(71, 85, 105, 0.1)", width: "60px", height: "60px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontSize: "1.5rem" }}>
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "0.2rem" }}>{bookingsCount}</h3>
            <p style={{ color: "var(--text-light)", fontWeight: "500" }}>Total Bookings</p>
          </div>
        </div>

        {/* Stat Card */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", width: "60px", height: "60px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", fontSize: "1.5rem" }}>
            <i className="fa-solid fa-envelope"></i>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "0.2rem" }}>{contactsCount}</h3>
            <p style={{ color: "var(--text-light)", fontWeight: "500" }}>Contact Requests</p>
          </div>
        </div>

      </div>

      <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* Recent Bookings List */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <p style={{ color: "var(--text-light)" }}>No bookings submitted yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {recentBookings.map(booking => (
                <div key={booking.id} style={{ padding: "1rem", background: "var(--background)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <strong>{booking.customerName}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent)" }}>{new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
                    {booking.service} • {booking.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contacts List */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Recent Contact Requests</h2>
          {recentContacts.length === 0 ? (
            <p style={{ color: "var(--text-light)" }}>No contact requests yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {recentContacts.map(contact => (
                <div key={contact.id} style={{ padding: "1rem", background: "var(--background)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <strong>{contact.name}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>{new Date(contact.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-color)" }}>
                    {contact.message.length > 50 ? contact.message.substring(0, 50) + "..." : contact.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
