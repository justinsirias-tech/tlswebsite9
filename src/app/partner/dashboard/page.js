"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PartnerDashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [error, setError] = useState("");
  const [chartTimeframe, setChartTimeframe] = useState("last7Days"); // "last7Days" | "last30Days" | "last6Months"
  const [chartType, setChartType] = useState("area"); // "area" | "bar"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/partner/dashboard");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      } else {
        setError(json.error || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/partner/dashboard");
        const json = await res.json();
        if (!ignore) {
          if (res.ok && json.success) {
            setData(json);
          } else {
            setError(json.error || "Failed to load dashboard data");
          }
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setError("Unable to connect to the server");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyLink = (code) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.thatlaundryshop.com";
    const link = `${origin}/th/booking?promo=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0", color: "#64748b" }}>
        <div style={{
          width: "56px",
          height: "56px",
          margin: "0 auto 1.5rem",
          borderRadius: "16px",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
        }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.6rem", color: "#0284c7" }}></i>
        </div>
        <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>Loading Dashboard Analytics...</div>
        <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.25rem" }}>Calculating real-time sales & promo code statistics</div>
      </div>
    );
  }

  const stats = data?.stats || {
    today: { amount: 0, count: 0 },
    thisMonth: { amount: 0, count: 0 },
    thisYear: { amount: 0, count: 0 },
    allTime: { amount: 0, count: 0 }
  };

  const activeCodes = data?.activeCodes || [];
  const codesBreakdown = data?.codesBreakdown || [];
  const recentSales = data?.recentSales || [];
  const allTimeAmount = stats.allTime.amount || 0;
  const avgOrderValue = stats.allTime.count > 0 ? (stats.allTime.amount / stats.allTime.count) : 0;

  // Chart data extraction & calculations
  const chartData = data?.chartData || {
    last7Days: [],
    last30Days: [],
    last6Months: []
  };
  const currentChartItems = chartData[chartTimeframe] || [];

  const periodTotalAmount = currentChartItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const periodTotalOrders = currentChartItems.reduce((acc, item) => acc + (item.count || 0), 0);
  const periodAvg = currentChartItems.length > 0 ? (periodTotalAmount / currentChartItems.length) : 0;
  const periodPeak = currentChartItems.length > 0 ? Math.max(...currentChartItems.map(i => i.amount || 0)) : 0;

  const svgWidth = 850;
  const svgHeight = 240;
  const padLeft = 65;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const rawMax = Math.max(...currentChartItems.map(i => i.amount || 0), 0);
  const calcCeiling = (maxVal) => {
    if (maxVal <= 0) return 1000;
    if (maxVal <= 500) return 500;
    if (maxVal <= 1000) return 1000;
    if (maxVal <= 2500) return 2500;
    if (maxVal <= 5000) return 5000;
    if (maxVal <= 10000) return 10000;
    if (maxVal <= 25000) return 25000;
    if (maxVal <= 50000) return 50000;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    return Math.ceil(maxVal / magnitude) * magnitude;
  };
  const yCeiling = calcCeiling(rawMax);
  const baselineY = padTop + plotHeight;

  const chartPoints = currentChartItems.map((item, idx) => {
    const x = currentChartItems.length <= 1
      ? padLeft + plotWidth / 2
      : padLeft + (idx / (currentChartItems.length - 1)) * plotWidth;
    const y = padTop + (1 - (item.amount / yCeiling)) * plotHeight;
    return { ...item, x, y, idx };
  });

  const buildSmoothPath = (pts) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(chartPoints);
  const areaPath = chartPoints.length > 0
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${baselineY} L ${chartPoints[0].x} ${baselineY} Z`
    : "";

  const yTicks = [
    { val: yCeiling, y: padTop },
    { val: Math.round(yCeiling * 0.66), y: padTop + plotHeight * 0.34 },
    { val: Math.round(yCeiling * 0.33), y: padTop + plotHeight * 0.67 },
    { val: 0, y: baselineY }
  ];

  const metricCards = [
    {
      title: "Today's Revenue",
      subtitle: "TODAY",
      amount: stats.today.amount,
      count: stats.today.count,
      color: "#0284c7",
      gradient: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
      lightBg: "#f0f9ff",
      borderColor: "#bae6fd",
      icon: "fa-calendar-day",
      badge: "Real-time"
    },
    {
      title: "This Month",
      subtitle: "CURRENT MONTH",
      amount: stats.thisMonth.amount,
      count: stats.thisMonth.count,
      color: "#059669",
      gradient: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
      lightBg: "#ecfdf5",
      borderColor: "#a7f3d0",
      icon: "fa-chart-simple",
      badge: "MTD"
    },
    {
      title: "This Year",
      subtitle: "YEAR TO DATE",
      amount: stats.thisYear.amount,
      count: stats.thisYear.count,
      color: "#7c3aed",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
      lightBg: "#f5f3ff",
      borderColor: "#ddd6fe",
      icon: "fa-award",
      badge: "YTD"
    },
    {
      title: "Lifetime Revenue",
      subtitle: "ALL TIME",
      amount: stats.allTime.amount,
      count: stats.allTime.count,
      color: "#d97706",
      gradient: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
      lightBg: "#fffbeb",
      borderColor: "#fde68a",
      icon: "fa-vault",
      badge: `AOV ฿${Math.round(avgOrderValue).toLocaleString()}`
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 1. Hero Welcome & Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)",
        borderRadius: "24px",
        padding: "2rem 2.25rem",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.25)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        {/* Subtle decorative circles */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0) 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-60px",
          left: "30%",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(124, 58, 237, 0) 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "680px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <span style={{
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: "700",
              letterSpacing: "0.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem"
            }}>
              <i className="fa-solid fa-crown" style={{ color: "#facc15" }}></i>
              PARTNER DASHBOARD
            </span>

            <span style={{
              fontSize: "0.8rem",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem"
            }}>
              <i className="fa-regular fa-clock"></i>
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <h1 style={{
            fontSize: "2rem",
            fontWeight: "900",
            color: "#ffffff",
            margin: "0 0 0.5rem 0",
            letterSpacing: "-0.5px",
            lineHeight: "1.2"
          }}>
            Welcome, {data?.partner?.companyName || "Partner"}
          </h1>

          <p style={{ fontSize: "0.95rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
            Live performance analytics, promo code redemptions, and commission tracking for your property.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            title="Refresh statistics"
            style={{
              padding: "0.75rem 1.1rem",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: refreshing ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (!refreshing) e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            }}
            onMouseLeave={(e) => {
              if (!refreshing) e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
          >
            <i className={`fa-solid fa-arrows-rotate ${refreshing ? "fa-spin" : ""}`}></i>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <Link
            href="/partner/dashboard/sales"
            style={{
              padding: "0.75rem 1.4rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: "800",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 6px 18px rgba(2, 132, 199, 0.4)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 22px rgba(2, 132, 199, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(2, 132, 199, 0.4)";
            }}
          >
            <i className="fa-solid fa-plus"></i>
            <span>Record Sale</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "16px",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#991b1b"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "1.2rem" }}></i>
            <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboard(true)}
            style={{
              background: "#991b1b",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.4rem 0.8rem",
              fontWeight: "700",
              fontSize: "0.8rem",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Elevated Metric KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.25rem"
      }}>
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: "#ffffff",
              border: `1px solid ${card.borderColor}`,
              borderRadius: "20px",
              padding: "1.5rem 1.6rem",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.07)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.03)";
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <div style={{
                  fontSize: "0.75rem",
                  fontWeight: "800",
                  color: "#64748b",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase"
                }}>
                  {card.subtitle}
                </div>
                <div style={{
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: "#0f172a",
                  marginTop: "0.2rem"
                }}>
                  {card.title}
                </div>
              </div>

              <div style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                background: card.gradient,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                boxShadow: `0 6px 14px ${card.color}35`,
                flexShrink: 0
              }}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
            </div>

            {/* Bottom Row with big numbers */}
            <div>
              <div style={{
                fontSize: "1.95rem",
                fontWeight: "900",
                color: card.color,
                lineHeight: "1.1",
                letterSpacing: "-0.5px"
              }}>
                ฿{card.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid #f1f5f9"
              }}>
                <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: "700" }}>
                  <i className="fa-solid fa-bag-shopping" style={{ marginRight: "0.35rem", color: "#94a3b8" }}></i>
                  {card.count.toLocaleString()} {card.count === 1 ? "order" : "orders"}
                </div>

                <span style={{
                  background: card.lightBg,
                  color: card.color,
                  fontSize: "0.75rem",
                  fontWeight: "800",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "6px"
                }}>
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2.5 Sales & Revenue Analytics Chart */}
      <div style={{
        background: "#ffffff",
        borderRadius: "24px",
        padding: "1.75rem 2rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem"
      }}>
        {/* Chart Header & Controls */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
            }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
                Sales & Revenue Analytics
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.2rem 0 0 0" }}>
                Timeline of generated customer sales and order volume
              </p>
            </div>
          </div>

          {/* Timeframe & Chart Type Switchers */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* View Type Toggle (Area vs Bar) */}
            <div style={{
              display: "flex",
              background: "#f1f5f9",
              padding: "0.25rem",
              borderRadius: "10px",
              border: "1px solid #e2e8f0"
            }}>
              <button
                onClick={() => setChartType("area")}
                title="Area Trend Chart"
                style={{
                  padding: "0.4rem 0.65rem",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: chartType === "area" ? "#ffffff" : "transparent",
                  color: chartType === "area" ? "#0284c7" : "#64748b",
                  boxShadow: chartType === "area" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                <i className="fa-solid fa-chart-area"></i>
                <span style={{ display: "none" }} className="partner-chart-label">Area</span>
              </button>

              <button
                onClick={() => setChartType("bar")}
                title="Bar Chart"
                style={{
                  padding: "0.4rem 0.65rem",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: chartType === "bar" ? "#ffffff" : "transparent",
                  color: chartType === "bar" ? "#0284c7" : "#64748b",
                  boxShadow: chartType === "bar" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                <i className="fa-solid fa-chart-simple"></i>
                <span style={{ display: "none" }} className="partner-chart-label">Bars</span>
              </button>
            </div>

            {/* Timeframe Selector */}
            <div style={{
              display: "flex",
              background: "#f1f5f9",
              padding: "0.25rem",
              borderRadius: "10px",
              border: "1px solid #e2e8f0"
            }}>
              {[
                { id: "last7Days", label: "7 Days" },
                { id: "last30Days", label: "30 Days" },
                { id: "last6Months", label: "6 Months" },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => {
                    setChartTimeframe(tf.id);
                    setHoveredPoint(null);
                  }}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "0.8rem",
                    fontWeight: chartTimeframe === tf.id ? "800" : "600",
                    cursor: "pointer",
                    background: chartTimeframe === tf.id ? "#0f172a" : "transparent",
                    color: chartTimeframe === tf.id ? "#ffffff" : "#64748b",
                    boxShadow: chartTimeframe === tf.id ? "0 2px 8px rgba(15, 23, 42, 0.25)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mini KPI Highlights Ribbon */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.85rem",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          padding: "1rem 1.25rem",
          borderRadius: "16px",
          border: "1px solid #e2e8f0"
        }}>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Period Revenue
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#059669", marginTop: "0.15rem" }}>
              ฿{periodTotalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Orders
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a", marginTop: "0.15rem" }}>
              {periodTotalOrders.toLocaleString()} {periodTotalOrders === 1 ? "order" : "orders"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {chartTimeframe === "last6Months" ? "Avg / Month" : "Avg / Day"}
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0284c7", marginTop: "0.15rem" }}>
              ฿{Math.round(periodAvg).toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Peak Performance
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#7c3aed", marginTop: "0.15rem" }}>
              ฿{periodPeak.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Hovered Point Floating Badge (when hovered) */}
        {hoveredPoint && (
          <div style={{
            background: "#0f172a",
            color: "#ffffff",
            padding: "0.6rem 1rem",
            borderRadius: "12px",
            fontSize: "0.85rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            alignSelf: "flex-start"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <i className="fa-regular fa-calendar" style={{ color: "#38bdf8" }}></i>
              <span style={{ fontWeight: "700" }}>{hoveredPoint.fullDate || hoveredPoint.label}</span>
            </div>
            <span>•</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: "#94a3b8" }}>Revenue:</span>
              <span style={{ fontWeight: "900", color: "#34d399" }}>
                ฿{hoveredPoint.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span>•</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: "#94a3b8" }}>Orders:</span>
              <span style={{ fontWeight: "800", color: "#ffffff" }}>{hoveredPoint.count}</span>
            </div>
          </div>
        )}

        {/* The SVG Canvas */}
        <div style={{ width: "100%", position: "relative", overflowX: "auto" }}>
          {currentChartItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#94a3b8" }}>
              <i className="fa-solid fa-chart-line" style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.4 }}></i>
              <div style={{ fontWeight: "700", color: "#475569" }}>No data recorded for this timeframe</div>
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{
                width: "100%",
                height: "auto",
                minWidth: "600px",
                overflow: "visible",
                display: "block"
              }}
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="partnerRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.32" />
                  <stop offset="85%" stopColor="#0284c7" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>

                {/* Bar Gradient */}
                <linearGradient id="partnerBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>

                <linearGradient id="partnerBarHoverGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={tick.y}
                    x2={svgWidth - padRight}
                    y2={tick.y}
                    stroke={i === yTicks.length - 1 ? "#cbd5e1" : "#f1f5f9"}
                    strokeWidth={i === yTicks.length - 1 ? 1.5 : 1}
                    strokeDasharray={i === yTicks.length - 1 ? "none" : "4 4"}
                  />
                  <text
                    x={padLeft - 10}
                    y={tick.y + 4}
                    textAnchor="end"
                    fontSize="10.5"
                    fill="#94a3b8"
                    fontWeight="600"
                    fontFamily="system-ui, sans-serif"
                  >
                    ฿{tick.val >= 1000 ? `${Math.round(tick.val / 1000)}k` : tick.val}
                  </text>
                </g>
              ))}

              {/* Area & Line Mode */}
              {chartType === "area" && (
                <>
                  {/* Gradient Area Fill */}
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="url(#partnerRevenueGrad)"
                      style={{ transition: "all 0.3s ease" }}
                    />
                  )}

                  {/* Main Curved Line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transition: "all 0.3s ease" }}
                    />
                  )}

                  {/* Vertical Guide Line on Hover */}
                  {hoveredPoint && (
                    <line
                      x1={hoveredPoint.x}
                      y1={padTop}
                      x2={hoveredPoint.x}
                      y2={baselineY}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Data Points */}
                  {chartPoints.map((p) => {
                    const isHovered = hoveredPoint?.idx === p.idx;
                    const showDot = currentChartItems.length <= 14 || isHovered || p.amount > 0;

                    return (
                      <g
                        key={p.idx}
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Invisible Larger Hit Target */}
                        <circle cx={p.x} cy={p.y} r={18} fill="transparent" />

                        {/* Outer Glow Halo on Hover */}
                        {isHovered && (
                          <circle cx={p.x} cy={p.y} r={9} fill="#38bdf8" opacity="0.35" />
                        )}

                        {/* Visible Dot */}
                        {showDot && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 6 : (p.amount > 0 ? 4.5 : 3)}
                            fill={isHovered ? "#38bdf8" : (p.amount > 0 ? "#0284c7" : "#cbd5e1")}
                            stroke="#ffffff"
                            strokeWidth={isHovered ? 2.5 : 2}
                            style={{ transition: "all 0.15s ease" }}
                          />
                        )}
                      </g>
                    );
                  })}
                </>
              )}

              {/* Bar Chart Mode */}
              {chartType === "bar" && (
                <>
                  {chartPoints.map((p) => {
                    const isHovered = hoveredPoint?.idx === p.idx;
                    const barWidth = Math.min(34, Math.max(10, (plotWidth / currentChartItems.length) * 0.65));
                    const barHeight = Math.max(baselineY - p.y, p.amount > 0 ? 4 : 0);
                    const barX = p.x - barWidth / 2;
                    const barY = baselineY - barHeight;

                    return (
                      <g
                        key={p.idx}
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Invisible Top Hit Target */}
                        <rect
                          x={p.x - barWidth}
                          y={padTop}
                          width={barWidth * 2}
                          height={plotHeight}
                          fill="transparent"
                        />

                        {/* Rendered Bar */}
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          rx={Math.min(6, barWidth / 2)}
                          fill={isHovered ? "url(#partnerBarHoverGrad)" : "url(#partnerBarGrad)"}
                          opacity={isHovered ? 1 : (p.amount > 0 ? 0.9 : 0.2)}
                          style={{ transition: "all 0.2s ease" }}
                        />
                      </g>
                    );
                  })}
                </>
              )}

              {/* X-Axis Date Labels */}
              {chartPoints.map((p, idx) => {
                let shouldShowLabel = true;
                if (chartTimeframe === "last30Days") {
                  // Show every 5th label + last day
                  shouldShowLabel = idx % 5 === 0 || idx === chartPoints.length - 1;
                }

                if (!shouldShowLabel) return null;

                const isHovered = hoveredPoint?.idx === p.idx;

                return (
                  <text
                    key={idx}
                    x={p.x}
                    y={baselineY + 22}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isHovered ? "800" : "600"}
                    fill={isHovered ? "#0284c7" : "#64748b"}
                    fontFamily="system-ui, sans-serif"
                    style={{ transition: "fill 0.15s ease" }}
                  >
                    {p.label}
                  </text>
                );
              })}
            </svg>
          )}
        </div>

        {/* Chart Footer Info */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "0.5rem",
          borderTop: "1px solid #f1f5f9",
          fontSize: "0.75rem",
          color: "#94a3b8",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}>
          <div>
            <i className="fa-solid fa-circle-info" style={{ marginRight: "0.35rem" }}></i>
            Hover over any point or bar to view exact day revenue and order details.
          </div>
          <div>
            Currency: <span style={{ fontWeight: "700", color: "#475569" }}>Thai Baht (THB)</span>
          </div>
        </div>
      </div>

      {/* 3. Your Promo Codes & Quick Share Widget */}
      <div style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "1.75rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#f0f9ff",
                color: "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem"
              }}>
                <i className="fa-solid fa-ticket"></i>
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                My Promo Codes & Customer Booking Links
              </h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>
              Share your promo code or direct booking link with your guests and customers to record sales.
            </p>
          </div>

          <Link
            href="/partner/dashboard/codes"
            style={{
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "#0284c7",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem"
            }}
          >
            <span>Manage All Codes</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        {activeCodes.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "2.5rem 1rem",
            background: "#f8fafc",
            borderRadius: "14px",
            border: "1px dashed #cbd5e1"
          }}>
            <i className="fa-solid fa-ticket" style={{ fontSize: "2rem", color: "#94a3b8", marginBottom: "0.5rem" }}></i>
            <div style={{ fontWeight: "700", color: "#475569" }}>No Promo Codes Assigned Yet</div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.3rem 0 0 0" }}>
              Please contact That Laundry Shop admin to generate dedicated promo codes for your account.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1rem"
          }}>
            {activeCodes.map((c) => {
              const isCopied = copiedCode === c.code;
              const isLinkCopied = copiedLink === c.code;
              const discountText = c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `฿${c.discountValue} OFF`;

              return (
                <div
                  key={c.id}
                  style={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1rem",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{
                          fontFamily: "monospace",
                          fontWeight: "900",
                          fontSize: "1.2rem",
                          letterSpacing: "1px",
                          color: "#0f172a",
                          background: "#ffffff",
                          padding: "0.25rem 0.65rem",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1"
                        }}>
                          {c.code}
                        </span>

                        <span style={{
                          background: "#ecfdf5",
                          color: "#059669",
                          border: "1px solid #a7f3d0",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "9999px",
                          fontWeight: "800",
                          fontSize: "0.75rem"
                        }}>
                          {discountText}
                        </span>
                      </div>

                      {c.description && (
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.4rem" }}>
                          {c.description}
                        </div>
                      )}
                    </div>

                    <span style={{
                      background: c.isActive ? "#f0fdf4" : "#f1f5f9",
                      color: c.isActive ? "#166534" : "#64748b",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "700"
                    }}>
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>

                  {/* Copy & Share Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {/* Copy Code */}
                    <button
                      onClick={() => handleCopyCode(c.code)}
                      style={{
                        flex: 1,
                        padding: "0.55rem 0.85rem",
                        borderRadius: "8px",
                        background: isCopied ? "#059669" : "#ffffff",
                        color: isCopied ? "#ffffff" : "#0f172a",
                        border: isCopied ? "1px solid #059669" : "1px solid #cbd5e1",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <i className={`fa-solid ${isCopied ? "fa-check" : "fa-copy"}`}></i>
                      <span>{isCopied ? "Code Copied!" : "Copy Code"}</span>
                    </button>

                    {/* Copy Direct Link */}
                    <button
                      onClick={() => handleCopyLink(c.code)}
                      style={{
                        flex: 1,
                        padding: "0.55rem 0.85rem",
                        borderRadius: "8px",
                        background: isLinkCopied ? "#0284c7" : "#f0f9ff",
                        color: isLinkCopied ? "#ffffff" : "#0284c7",
                        border: isLinkCopied ? "1px solid #0284c7" : "1px solid #bae6fd",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <i className={`fa-solid ${isLinkCopied ? "fa-check" : "fa-link"}`}></i>
                      <span>{isLinkCopied ? "Link Copied!" : "Booking Link"}</span>
                    </button>

                    {/* Test Open Link */}
                    <a
                      href={`/th/booking?promo=${encodeURIComponent(c.code)}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open booking page with this promo"
                      style={{
                        padding: "0.55rem 0.75rem",
                        borderRadius: "8px",
                        background: "#ffffff",
                        color: "#64748b",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Two-Column Analytics Grid: Code Breakdown & Recent Sales */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
        gap: "1.5rem"
      }}>
        {/* Left: Code Performance Breakdown */}
        <div style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "1.75rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Revenue by Promo Code
              </h2>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.2rem 0 0 0" }}>
                Total sales contribution and redemption count
              </p>
            </div>

            <span style={{
              background: "#f1f5f9",
              color: "#475569",
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: "700"
            }}>
              {codesBreakdown.length} {codesBreakdown.length === 1 ? "Code" : "Codes"}
            </span>
          </div>

          {codesBreakdown.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3.5rem 1rem", color: "#94a3b8", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-chart-pie" style={{ fontSize: "2.2rem", marginBottom: "0.75rem", opacity: 0.4 }}></i>
              <div style={{ fontWeight: "700", color: "#475569" }}>No Sales Data Yet</div>
              <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Sales will appear here as soon as orders are placed.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {codesBreakdown.map((c, i) => {
                const percentage = allTimeAmount > 0 ? Math.round((c.totalAmount / allTimeAmount) * 100) : 0;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "1rem",
                      borderRadius: "12px",
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{
                          fontFamily: "monospace",
                          fontWeight: "800",
                          color: "#0f172a",
                          background: "#ffffff",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          fontSize: "0.85rem"
                        }}>
                          {c.code}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {c.count} orders
                        </span>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "900", color: "#0f172a", fontSize: "0.95rem" }}>
                          ฿{c.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: "700" }}>
                          {percentage}% of total
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      width: "100%",
                      height: "6px",
                      background: "#e2e8f0",
                      borderRadius: "9999px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${Math.max(percentage, 4)}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)",
                        borderRadius: "9999px",
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Recent Sales Stream */}
        <div style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "1.75rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Recent Sales Orders
              </h2>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.2rem 0 0 0" }}>
                Latest 5 customer transactions using your codes
              </p>
            </div>

            <Link
              href="/partner/dashboard/sales"
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "#0284c7",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
            >
              <span>View All</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3.5rem 1rem", color: "#94a3b8", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-receipt" style={{ fontSize: "2.2rem", marginBottom: "0.75rem", opacity: 0.4 }}></i>
              <div style={{ fontWeight: "700", color: "#475569" }}>No Transactions Recorded Yet</div>
              <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Record a sale or wait for online customer redemptions.</div>
              <Link
                href="/partner/dashboard/sales"
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  background: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  textDecoration: "none"
                }}
              >
                Record First Sale
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentSales.map((s) => {
                const dateObj = new Date(s.createdAt);
                const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                return (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.85rem 1rem",
                      borderRadius: "12px",
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "#e0f2fe",
                        color: "#0369a1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        fontSize: "0.9rem",
                        flexShrink: 0
                      }}>
                        {s.customerName ? s.customerName[0].toUpperCase() : "C"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "0.9rem" }}>
                          {s.customerName || "Customer"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span>{s.customerPhone || "No phone"}</span>
                          <span>•</span>
                          <span style={{ fontFamily: "monospace", color: "#0369a1", fontWeight: "700" }}>
                            {s.partnerCode?.code || s.promoCode?.code}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "900", color: "#059669", fontSize: "1rem" }}>
                        +฿{(s.netAmount !== undefined ? s.netAmount : s.saleAmount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {s.discountAmount > 0 && (
                        <div style={{ fontSize: "0.75rem", color: "#c2410c", fontWeight: "700" }}>
                          -฿{s.discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} (฿{s.originalAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                        </div>
                      )}
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                        {formattedDate} • {formattedTime}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Concierge & Partner Support Banner */}
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
        border: "1px solid #bbf7d0",
        borderRadius: "20px",
        padding: "1.5rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "#059669",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            boxShadow: "0 4px 10px rgba(5, 150, 105, 0.25)"
          }}>
            <i className="fa-solid fa-headset"></i>
          </div>
          <div>
            <div style={{ fontWeight: "800", color: "#064e3b", fontSize: "1rem" }}>
              Need Co-Branded Marketing Materials or Help?
            </div>
            <div style={{ fontSize: "0.85rem", color: "#047857" }}>
              Request guest tent cards, custom promo discount codes, or billing questions with our Partner Desk.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <a
            href="https://line.me/R/ti/p/@thatlaundryshop"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "0.65rem 1.15rem",
              borderRadius: "10px",
              background: "#059669",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.85rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)"
            }}
          >
            <i className="fa-brands fa-line" style={{ fontSize: "1rem" }}></i>
            <span>Line Partner Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}
