"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminAnalyticsPage from "../analytics/page";
import TrafficAnalyticsView from "./TrafficAnalyticsView";
import AdminPromoCodesPage from "../promo-codes/page";
import AdminPromotionsPage from "../promotions/page";
import AdminPopupsPage from "../popups/page";

function MarketingContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "analytics";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Consolidated Header */}
      <div style={{
        background: "#ffffff",
        padding: "1.75rem 2rem",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
        marginBottom: "1.5rem"
      }}>
        <h1 style={{ fontSize: "1.8rem", color: "#222945", fontWeight: "800", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <i className="fa-solid fa-bullhorn" style={{ color: "#222945" }}></i>
          Marketing & Analytics Hub
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
          Consolidated management center for website traffic, booking metrics, promo codes, monthly deals, and popup announcements.
        </p>
      </div>

      {/* Top Sub-Tab Navigation Bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            padding: "0.85rem 1.4rem",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: activeTab === "analytics" ? "#222945" : "#e2e8f0",
            background: activeTab === "analytics" ? "#222945" : "#ffffff",
            color: activeTab === "analytics" ? "#ffffff" : "#475569",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.9rem",
            boxShadow: activeTab === "analytics" ? "0 4px 12px rgba(34, 41, 69, 0.2)" : "none",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-chart-line"></i>
          Booking Analytics
        </button>

        <button
          onClick={() => setActiveTab("traffic")}
          style={{
            padding: "0.85rem 1.4rem",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: activeTab === "traffic" ? "#222945" : "#e2e8f0",
            background: activeTab === "traffic" ? "#222945" : "#ffffff",
            color: activeTab === "traffic" ? "#ffffff" : "#475569",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.9rem",
            boxShadow: activeTab === "traffic" ? "0 4px 12px rgba(34, 41, 69, 0.2)" : "none",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-globe"></i>
          Website Traffic Statistics
        </button>

        <button
          onClick={() => setActiveTab("promo-codes")}
          style={{
            padding: "0.85rem 1.4rem",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: activeTab === "promo-codes" ? "#222945" : "#e2e8f0",
            background: activeTab === "promo-codes" ? "#222945" : "#ffffff",
            color: activeTab === "promo-codes" ? "#ffffff" : "#475569",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.9rem",
            boxShadow: activeTab === "promo-codes" ? "0 4px 12px rgba(34, 41, 69, 0.2)" : "none",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-ticket"></i>
          Promo Codes & Coupons
        </button>

        <button
          onClick={() => setActiveTab("promotions")}
          style={{
            padding: "0.85rem 1.4rem",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: activeTab === "promotions" ? "#222945" : "#e2e8f0",
            background: activeTab === "promotions" ? "#222945" : "#ffffff",
            color: activeTab === "promotions" ? "#ffffff" : "#475569",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.9rem",
            boxShadow: activeTab === "promotions" ? "0 4px 12px rgba(34, 41, 69, 0.2)" : "none",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-rectangle-ad"></i>
          Website Promotions
        </button>

        <button
          onClick={() => setActiveTab("popups")}
          style={{
            padding: "0.85rem 1.4rem",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: activeTab === "popups" ? "#222945" : "#e2e8f0",
            background: activeTab === "popups" ? "#222945" : "#ffffff",
            color: activeTab === "popups" ? "#ffffff" : "#475569",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.9rem",
            boxShadow: activeTab === "popups" ? "0 4px 12px rgba(34, 41, 69, 0.2)" : "none",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-window-restore"></i>
          Popup Announcements
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "analytics" && <AdminAnalyticsPage />}
        {activeTab === "traffic" && <TrafficAnalyticsView />}
        {activeTab === "promo-codes" && <AdminPromoCodesPage />}
        {activeTab === "promotions" && <AdminPromotionsPage />}
        {activeTab === "popups" && <AdminPopupsPage />}
      </div>
    </div>
  );
}

export default function AdminMarketingPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "3rem", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "#222945" }}></i>
        <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading Marketing Hub...</p>
      </div>
    }>
      <MarketingContent />
    </Suspense>
  );
}
