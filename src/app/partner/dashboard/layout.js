"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function PartnerDashboardLayout({ children }) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/partner/auth");
        const data = await res.json();
        if (!res.ok || !data.authenticated) {
          router.push("/partner/login");
          return;
        }
        setPartner(data.partner);
      } catch (err) {
        router.push("/partner/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/partner/auth", { method: "DELETE" });
      router.push("/partner/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#64748b", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "#222945", marginBottom: "1rem" }}></i>
          <div>กำลังโหลดข้อมูล Partner Portal...</div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "ภาพรวม (Overview)", href: "/partner/dashboard", icon: "fa-chart-pie" },
    { label: "รายการขาย (Sales)", href: "/partner/dashboard/sales", icon: "fa-receipt" },
    { label: "จัดการโค้ด (My Codes)", href: "/partner/dashboard/codes", icon: "fa-ticket" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Top Navigation Bar */}
      <header style={{
        background: "#222945",
        color: "#ffffff",
        padding: "0.85rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontWeight: "800",
            fontSize: "1.15rem",
            letterSpacing: "0.5px"
          }}>
            <i className="fa-solid fa-handshake" style={{ color: "#38bdf8" }}></i>
            <span>TLS Partner</span>
          </div>

          <span style={{
            background: "rgba(255, 255, 255, 0.12)",
            padding: "0.2rem 0.6rem",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: "600",
            color: "#94a3b8"
          }}>
            PORTAL
          </span>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: "flex", gap: "0.5rem" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  textDecoration: "none",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  background: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.15s ease"
                }}
              >
                <i className={`fa-solid ${item.icon}`} style={{ color: isActive ? "#38bdf8" : "inherit" }}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Partner Profile & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ textAlign: "right", lineHeight: "1.2" }}>
            <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#ffffff" }}>
              {partner?.companyName}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              {partner?.contactName}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="ออกจากระบบ"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "0.45rem 0.85rem",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>ออก</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "1280px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {children}
      </main>
    </div>
  );
}
