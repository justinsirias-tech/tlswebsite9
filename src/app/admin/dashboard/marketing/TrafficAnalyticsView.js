"use client";

import { useState, useEffect } from "react";

export default function TrafficAnalyticsView() {
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchTraffic();
  }, []);

  async function fetchTraffic() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/traffic");
      const data = await res.json();
      if (data.success) {
        setTrafficData(data);
      } else {
        setError(data.error || "Failed to load traffic statistics.");
      }
    } catch (err) {
      console.error("Failed to load traffic stats:", err);
      setError("An unexpected error occurred while loading traffic stats.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetTraffic() {
    if (!confirm("Are you sure you want to clear all recorded traffic logs? This will reset visitor tracking to 0.")) return;
    try {
      setResetting(true);
      const res = await fetch("/api/admin/traffic", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Traffic logs reset successfully!");
        fetchTraffic();
      } else {
        alert(data.error || "Failed to reset traffic logs.");
      }
    } catch (err) {
      alert("Failed to reset traffic logs.");
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ background: "#ffffff", padding: "3rem", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "#222945", marginBottom: "1rem" }}></i>
        <p style={{ fontWeight: "600" }}>Loading visitor demographics and traffic statistics...</p>
      </div>
    );
  }

  if (error || !trafficData) {
    return (
      <div style={{ padding: "1.5rem", background: "#fef2f2", color: "#991b1b", borderRadius: "16px", border: "1px solid #fecaca" }}>
        <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }}></i>
        {error || "Unable to load traffic stats."}
      </div>
    );
  }

  const { summary, topPages, trafficChannels, languageDemographics, devices, locations, peakHours } = trafficData;

  return (
    <div style={{ display: "grid", gap: "2rem" }}>

      {/* Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "1rem 1.5rem", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <i className="fa-solid fa-circle" style={{ color: "#22c55e", fontSize: "0.6rem" }}></i>
          Live Real-Time Database Tracking (100% Raw Data)
        </div>

        <button
          onClick={handleResetTraffic}
          disabled={resetting}
          style={{
            padding: "0.5rem 1rem",
            background: "#fff1f2",
            color: "#be123c",
            border: "1px solid #fecdd3",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <i className="fa-solid fa-trash-can"></i>
          {resetting ? "Resetting..." : "Reset Traffic Logs"}
        </button>
      </div>

      {/* Traffic KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
        
        <div style={{ background: "#ffffff", padding: "1.75rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>Total Pageviews</span>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(34, 41, 69, 0.08)", color: "#222945", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-eye"></i>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#222945" }}>
            {summary.totalPageviews.toLocaleString()}
          </div>
          <div style={{ color: "#166534", fontSize: "0.85rem", fontWeight: "600", marginTop: "0.3rem" }}>
            <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: "0.3rem" }}></i> Real database views logged
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.75rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>Unique Visitors</span>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(34, 41, 69, 0.08)", color: "#222945", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#222945" }}>
            {summary.uniqueVisitors.toLocaleString()}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600", marginTop: "0.3rem" }}>
            Estimated unique users
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.75rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>Avg Session Time</span>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(34, 41, 69, 0.08)", color: "#222945", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-stopwatch"></i>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#222945" }}>
            {summary.avgDuration}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600", marginTop: "0.3rem" }}>
            Time spent on website
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.75rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>Bounce Rate</span>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(34, 41, 69, 0.08)", color: "#222945", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-chart-pie"></i>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#222945" }}>
            {summary.bounceRate}
          </div>
          <div style={{ color: "#166534", fontSize: "0.85rem", fontWeight: "600", marginTop: "0.3rem" }}>
            High user retention
          </div>
        </div>

      </div>

      {/* Demographics Row 1: Language & Customer Demographics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* Language & Expat vs Local Demographics */}
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#222945", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fa-solid fa-language" style={{ color: "#222945" }}></i>
            Visitor Language & Customer Demographics
          </h2>

          <div style={{ display: "grid", gap: "1.25rem" }}>
            {languageDemographics.map((lang) => (
              <div key={lang.code} style={{ background: "#f8fafc", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: "700", color: "#222945" }}>
                    <span style={{ fontSize: "1.2rem" }}>{lang.flag}</span>
                    <span>{lang.language}</span>
                  </div>
                  <span style={{ fontWeight: "800", color: "#222945" }}>{lang.count} visits ({lang.percentage}%)</span>
                </div>
                <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${lang.percentage}%`, height: "100%", background: "#222945", borderRadius: "4px" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Visiting Hours Demographics */}
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#222945", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fa-solid fa-clock" style={{ color: "#222945" }}></i>
            Peak Visiting Hours Demographics
          </h2>

          <div style={{ display: "grid", gap: "1rem" }}>
            {peakHours.map((peak) => (
              <div key={peak.period} style={{ background: "#f8fafc", padding: "0.9rem 1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontWeight: "700", color: "#222945" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <i className={`fa-solid ${peak.icon}`} style={{ color: "#222945" }}></i>
                    {peak.period}
                  </span>
                  <span>{peak.count} visits ({peak.percentage}%)</span>
                </div>
                <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${peak.percentage}%`, height: "100%", background: "#222945", borderRadius: "4px" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Grid: Top Pages & Traffic Channels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* Top Visited Pages */}
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#222945", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fa-solid fa-fire" style={{ color: "#222945" }}></i>
            Most Visited Pages Ranking
          </h2>

          <div style={{ display: "grid", gap: "1.25rem" }}>
            {topPages.length > 0 ? topPages.map((page) => (
              <div key={page.path}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontWeight: "700", color: "#222945", fontSize: "0.95rem" }}>
                  <span style={{ fontFamily: "monospace", background: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>{page.path}</span>
                  <span>{page.views.toLocaleString()} views ({page.percentage}%)</span>
                </div>
                <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${page.percentage}%`, height: "100%", background: "#222945", borderRadius: "5px" }}></div>
                </div>
              </div>
            )) : (
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", textAlign: "center", padding: "2rem" }}>No pageviews logged yet. Navigating customer pages will build your real ranking!</p>
            )}
          </div>
        </div>

        {/* Traffic Acquisition Channels */}
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#222945", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fa-solid fa-diagram-project" style={{ color: "#222945" }}></i>
            Traffic Acquisition Channels
          </h2>

          <div style={{ display: "grid", gap: "1.25rem" }}>
            {trafficChannels.map((channel) => (
              <div key={channel.name} style={{ background: "#f8fafc", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: "700", color: "#222945" }}>
                    <i className={channel.icon} style={{ color: channel.color, fontSize: "1.1rem" }}></i>
                    <span>{channel.name}</span>
                  </div>
                  <span style={{ fontWeight: "800", color: "#222945" }}>{channel.count.toLocaleString()} ({channel.percentage}%)</span>
                </div>
                <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${channel.percentage}%`, height: "100%", background: channel.color, borderRadius: "4px" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Secondary Grid: Device Types & Visitor Locations */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* Device Breakdown */}
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.2rem", color: "#222945", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fa-solid fa-mobile-screen-button" style={{ color: "#222945" }}></i>
            Visitor Device Types
          </h2>

          <div style={{ display: "grid", gap: "1rem" }}>
            {devices.map((dev) => (
              <div key={dev.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <i className={dev.icon} style={{ fontSize: "1.3rem", color: "#222945" }}></i>
                  <div>
                    <div style={{ fontWeight: "700", color: "#222945" }}>{dev.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{dev.count.toLocaleString()} sessions</div>
                  </div>
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#222945" }}>
                  {dev.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor Location Demographics */}
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.2rem", color: "#222945", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fa-solid fa-location-dot" style={{ color: "#222945" }}></i>
            Geographic Location Demographics
          </h2>

          <div style={{ display: "grid", gap: "1rem" }}>
            {locations.map((loc) => (
              <div key={loc.city} style={{ background: "#f8fafc", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontWeight: "700", color: "#222945" }}>
                  <span>{loc.city}</span>
                  <span>{loc.count.toLocaleString()} ({loc.percentage}%)</span>
                </div>
                <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${loc.percentage}%`, height: "100%", background: "#222945", borderRadius: "4px" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
