"use client";

import { useState, useEffect } from "react";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      } else {
        setError(data.error || "Failed to load analytics.");
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "3rem", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2.5rem", color: "#222945", marginBottom: "1rem" }}></i>
        <p style={{ color: "#64748b", fontWeight: "600" }}>Loading reporting analytics & metrics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "2rem", background: "#fef2f2", color: "#991b1b", borderRadius: "16px", border: "1px solid #fecaca" }}>
        <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }}></i>
        {error || "Unable to load analytics data."}
      </div>
    );
  }

  const { summary, serviceCounts, pickupBreakdown, promoPerformance, monthlyTrends } = analytics;

  const totalServices = Object.values(serviceCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.5rem",
        marginBottom: "2rem",
        background: "#ffffff",
        padding: "1.75rem 2rem",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)"
      }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", color: "#222945", fontWeight: "800", marginBottom: "0.4rem" }}>
            <i className="fa-solid fa-chart-line" style={{ color: "#222945", marginRight: "0.75rem" }}></i>
            Reporting & Analytics Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Overview of booking trends, promo code redemptions, service popularity, and pickup preferences.
          </p>
        </div>
        <button 
          onClick={fetchAnalytics}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "10px",
            background: "#222945",
            color: "#ffffff",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.9rem",
            boxShadow: "0 4px 12px rgba(34, 41, 69, 0.25)"
          }}
        >
          <i className="fa-solid fa-rotate-right" style={{ marginRight: "0.5rem" }}></i>
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        
        <div style={{ background: "#ffffff", padding: "1.75rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Bookings</span>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(34, 41, 69, 0.08)", color: "#222945", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-calendar-check"></i>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#222945" }}>{summary.totalBookings}</div>
          <div style={{ color: "#166534", fontSize: "0.85rem", fontWeight: "600", marginTop: "0.3rem" }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: "0.3rem" }}></i> All time bookings recorded
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.75rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Promo Codes</span>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(34, 41, 69, 0.08)", color: "#222945", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-ticket"></i>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#222945" }}>{summary.activePromoCodes}</div>
          <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600", marginTop: "0.3rem" }}>
            Live coupons in circulation
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.75rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Promo Redemptions</span>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(34, 41, 69, 0.08)", color: "#222945", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-tags"></i>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#222945" }}>{summary.totalPromoRedemptions}</div>
          <div style={{ color: "#2563eb", fontSize: "0.85rem", fontWeight: "600", marginTop: "0.3rem" }}>
            Total coupon uses
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.75rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Promos</span>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(34, 41, 69, 0.08)", color: "#222945", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-rectangle-ad"></i>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#222945" }}>{summary.activePromotions}</div>
          <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600", marginTop: "0.3rem" }}>
            On-site monthly deals
          </div>
        </div>

      </div>

      {/* Analytics Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        
        {/* Promo Code Performance */}
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.3rem", color: "#222945", fontWeight: "800", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fa-solid fa-award" style={{ color: "#222945" }}></i>
            Promo Code Usage & Performance Ranking
          </h2>

          {promoPerformance.length === 0 ? (
            <p style={{ color: "#64748b" }}>No promo codes created yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.85rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "0.9rem 1rem" }}>Promo Code</th>
                    <th style={{ padding: "0.9rem 1rem" }}>Discount Type</th>
                    <th style={{ padding: "0.9rem 1rem" }}>Discount Value</th>
                    <th style={{ padding: "0.9rem 1rem" }}>Redemptions</th>
                    <th style={{ padding: "0.9rem 1rem" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {promoPerformance.map((pc) => (
                    <tr key={pc.code} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ fontFamily: "monospace", background: "#222945", color: "#ffffff", padding: "0.35rem 0.75rem", borderRadius: "6px", fontWeight: "700" }}>
                          {pc.code}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", color: "#475569", fontWeight: "600", fontSize: "0.9rem" }}>
                        {pc.discountType === "PERCENTAGE" ? "Percentage (%)" : "Fixed (THB)"}
                      </td>
                      <td style={{ padding: "1rem", color: "#222945", fontWeight: "800" }}>
                        {pc.discountType === "PERCENTAGE" ? `${pc.discountValue}% OFF` : `${pc.discountValue} THB OFF`}
                        {pc.discountTarget === "DELIVERY" && (
                          <span style={{ marginLeft: "0.5rem", background: "#eff6ff", color: "#1d4ed8", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                            🚚 Delivery Only
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ fontWeight: "800", color: "#222945", fontSize: "1rem" }}>{pc.usedCount}</span>
                          <div style={{ flex: 1, maxWidth: "120px", height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(pc.usedCount * 10, 100)}%`, height: "100%", background: "#222945", borderRadius: "4px" }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          background: pc.isActive ? "#dcfce7" : "#f1f5f9",
                          color: pc.isActive ? "#166534" : "#64748b",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontWeight: "700",
                          fontSize: "0.8rem"
                        }}>
                          {pc.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Service Popularity Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          
          <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <h2 style={{ fontSize: "1.2rem", color: "#222945", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="fa-solid fa-shirt" style={{ color: "#222945" }}></i>
              Service Popularity Breakdown
            </h2>

            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontWeight: "600", color: "#222945", fontSize: "0.95rem" }}>
                  <span>Wash & Fold</span>
                  <span>{serviceCounts.washFold} orders ({Math.round((serviceCounts.washFold / totalServices) * 100)}%)</span>
                </div>
                <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${(serviceCounts.washFold / totalServices) * 100}%`, height: "100%", background: "#222945" }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontWeight: "600", color: "#222945", fontSize: "0.95rem" }}>
                  <span>Wash & Iron</span>
                  <span>{serviceCounts.washIronFold} orders ({Math.round((serviceCounts.washIronFold / totalServices) * 100)}%)</span>
                </div>
                <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${(serviceCounts.washIronFold / totalServices) * 100}%`, height: "100%", background: "#222945" }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontWeight: "600", color: "#222945", fontSize: "0.95rem" }}>
                  <span>Dry Cleaning</span>
                  <span>{serviceCounts.dryCleaning} orders ({Math.round((serviceCounts.dryCleaning / totalServices) * 100)}%)</span>
                </div>
                <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${(serviceCounts.dryCleaning / totalServices) * 100}%`, height: "100%", background: "#222945" }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontWeight: "600", color: "#222945", fontSize: "0.95rem" }}>
                  <span>Express Same-Day</span>
                  <span>{serviceCounts.express} orders ({Math.round((serviceCounts.express / totalServices) * 100)}%)</span>
                </div>
                <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${(serviceCounts.express / totalServices) * 100}%`, height: "100%", background: "#222945" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Preference Breakdown */}
          <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <h2 style={{ fontSize: "1.2rem", color: "#222945", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="fa-solid fa-truck" style={{ color: "#222945" }}></i>
              Pickup Method Preference
            </h2>

            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>Meet in Person</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#222945", marginTop: "0.2rem" }}>
                  {pickupBreakdown.meetInPerson} orders
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>Concierge / Condo Lobby</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#222945", marginTop: "0.2rem" }}>
                  {pickupBreakdown.conciergeLobby} orders
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
