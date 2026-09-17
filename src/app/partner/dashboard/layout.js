"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function PartnerDashboardLayout({ children }) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "56px",
            height: "56px",
            margin: "0 auto 1.25rem",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(56, 189, 248, 0.3)"
          }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.5rem", color: "#ffffff" }}></i>
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: "700", letterSpacing: "0.3px" }}>Loading Partner Portal</div>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.35rem" }}>Verifying credentials...</div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/partner/dashboard", icon: "fa-chart-pie" },
    { label: "Sales Tracking", href: "/partner/dashboard/sales", icon: "fa-receipt" },
    { label: "My Promo Codes", href: "/partner/dashboard/codes", icon: "fa-ticket" },
  ];

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return "P";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f8fafc",
      color: "#0f172a",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Top Luxury Navigation Bar */}
      <header style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
      }}>
        <div style={{
          maxWidth: "1380px",
          margin: "0 auto",
          padding: "0.85rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem"
        }}>
          {/* Brand Logo & Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/partner/dashboard" style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              color: "#ffffff"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(56, 189, 248, 0.35)",
                flexShrink: 0
              }}>
                <i className="fa-solid fa-handshake" style={{ fontSize: "1.1rem", color: "#ffffff" }}></i>
              </div>
              <div>
                <div style={{
                  fontWeight: "800",
                  fontSize: "1.05rem",
                  letterSpacing: "0.5px",
                  lineHeight: "1.2",
                  color: "#ffffff"
                }}>
                  THAT LAUNDRY SHOP
                </div>
                <div style={{
                  fontSize: "0.7rem",
                  color: "#94a3b8",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontWeight: "600"
                }}>
                  Partner Portal
                </div>
              </div>
            </Link>

            <span style={{
              display: "none",
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              color: "#38bdf8",
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: "700",
              letterSpacing: "0.5px"
            }} className="partner-verified-badge">
              <i className="fa-solid fa-circle-check" style={{ marginRight: "0.3rem" }}></i>
              VERIFIED PARTNER
            </span>
          </div>

          {/* Desktop Center Nav Links */}
          <nav style={{
            display: "none",
            gap: "0.35rem",
            background: "rgba(255, 255, 255, 0.05)",
            padding: "0.35rem",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }} className="partner-desktop-nav">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "0.55rem 1.1rem",
                    borderRadius: "9px",
                    fontSize: "0.85rem",
                    fontWeight: isActive ? "700" : "600",
                    textDecoration: "none",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    background: isActive ? "linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(37, 99, 235, 0.25) 100%)" : "transparent",
                    border: isActive ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.2)" : "none"
                  }}
                >
                  <i className={`fa-solid ${item.icon}`} style={{
                    color: isActive ? "#38bdf8" : "#64748b",
                    fontSize: "0.9rem"
                  }}></i>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Partner Profile & Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Partner Info Pill */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "0.35rem 0.85rem 0.35rem 0.45rem",
              borderRadius: "9999px"
            }}>
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "800",
                fontSize: "0.85rem",
                boxShadow: "0 2px 6px rgba(14, 165, 233, 0.3)"
              }}>
                {getInitials(partner?.companyName)}
              </div>
              <div style={{ textAlign: "left", lineHeight: "1.2" }}>
                <div style={{
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#ffffff",
                  maxWidth: "180px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {partner?.companyName || "Partner Account"}
                </div>
                <div style={{
                  fontSize: "0.7rem",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontWeight: "600"
                }}>
                  <span style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                    boxShadow: "0 0 6px #10b981"
                  }}></span>
                  Active
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                color: "#fca5a5",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                padding: "0.55rem 0.95rem",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.22)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                e.currentTarget.style.color = "#fca5a5";
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span style={{ display: "none" }} className="partner-logout-text">Sign Out</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1rem"
              }}
              className="partner-mobile-toggle"
            >
              <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: "#0f172a",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "1rem 1.5rem 1.5rem"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      fontSize: "0.95rem",
                      fontWeight: isActive ? "700" : "600",
                      textDecoration: "none",
                      color: isActive ? "#ffffff" : "#94a3b8",
                      background: isActive ? "rgba(56, 189, 248, 0.15)" : "transparent",
                      border: isActive ? "1px solid rgba(56, 189, 248, 0.3)" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem"
                    }}
                  >
                    <i className={`fa-solid ${item.icon}`} style={{ color: isActive ? "#38bdf8" : "#64748b", width: "20px" }}></i>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: "2rem 1.5rem",
        maxWidth: "1380px",
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box"
      }}>
        {children}
      </main>

      {/* Modern Partner Footer */}
      <footer style={{
        borderTop: "1px solid #e2e8f0",
        background: "#ffffff",
        padding: "1.5rem",
        marginTop: "auto",
        fontSize: "0.85rem",
        color: "#64748b"
      }}>
        <div style={{
          maxWidth: "1380px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontWeight: "800", color: "#0f172a" }}>THAT LAUNDRY SHOP</span>
            <span>•</span>
            <span>Commercial Partner Network</span>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <a
              href="https://line.me/R/ti/p/@thatlaundryshop"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0284c7", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <i className="fa-brands fa-line" style={{ fontSize: "1.1rem" }}></i>
              <span>Partner Support Line</span>
            </a>
            <span>•</span>
            <span>Confidential & Secure</span>
          </div>
        </div>
      </footer>

      {/* Responsive Media Query Styles */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .partner-desktop-nav {
            display: flex !important;
          }
          .partner-mobile-toggle {
            display: none !important;
          }
          .partner-logout-text {
            display: inline !important;
          }
          .partner-verified-badge {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}
