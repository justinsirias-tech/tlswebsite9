"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PartnerDashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partner/dashboard");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "1rem" }}></i>
        <div>กำลังโหลดสถิติและข้อมูลยอดขาย...</div>
      </div>
    );
  }

  const stats = data?.stats || {
    today: { amount: 0, count: 0 },
    thisMonth: { amount: 0, count: 0 },
    thisYear: { amount: 0, count: 0 },
    allTime: { amount: 0, count: 0 }
  };

  const metricCards = [
    {
      title: "ยอดขายวันนี้",
      subtitle: "Today",
      amount: stats.today.amount,
      count: stats.today.count,
      color: "#0284c7",
      bg: "#f0f9ff",
      border: "#bae6fd",
      icon: "fa-calendar-day"
    },
    {
      title: "ยอดขายเดือนนี้",
      subtitle: "This Month",
      amount: stats.thisMonth.amount,
      count: stats.thisMonth.count,
      color: "#059669",
      bg: "#ecfdf5",
      border: "#a7f3d0",
      icon: "fa-calendar-week"
    },
    {
      title: "ยอดขายปีนี้",
      subtitle: "This Year",
      amount: stats.thisYear.amount,
      count: stats.thisYear.count,
      color: "#7c3aed",
      bg: "#f5f3ff",
      border: "#ddd6fe",
      icon: "fa-calendar"
    },
    {
      title: "ยอดขายทั้งหมด",
      subtitle: "All Time",
      amount: stats.allTime.amount,
      count: stats.allTime.count,
      color: "#222945",
      bg: "#ffffff",
      border: "#cbd5e1",
      icon: "fa-chart-line"
    }
  ];

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        background: "#ffffff",
        padding: "1.5rem 2rem",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.3rem 0" }}>
            ยินดีต้อนรับ, {data?.partner?.companyName}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
            สรุปยอดขายด้วย Promo Code พาร์ทเนอร์ประจำวันที่ {new Date().toLocaleDateString("th-TH", { dateStyle: "long" })}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={fetchDashboard}
            title="รีเฟรชข้อมูล"
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <i className="fa-solid fa-arrows-rotate"></i>
            <span>รีเฟรช</span>
          </button>

          <Link
            href="/partner/dashboard/sales"
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "10px",
              background: "#222945",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 10px rgba(34, 41, 69, 0.2)"
            }}
          >
            <i className="fa-solid fa-plus"></i>
            <span>บันทึกรายการขาย</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem"
      }}>
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              borderRadius: "16px",
              padding: "1.5rem",
              boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {card.subtitle}
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", marginTop: "0.2rem" }}>
                  {card.title}
                </div>
              </div>
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#ffffff",
                color: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "1.9rem", fontWeight: "900", color: card.color, lineHeight: "1" }}>
                ฿{card.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600", marginTop: "0.5rem" }}>
                {card.count.toLocaleString()} รายการขาย
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Codes Breakdown & Recent Sales */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Codes Breakdown */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              ยอดขายแยกตามโค้ดโปรโมชั่น
            </h2>
            <Link
              href="/partner/dashboard/codes"
              style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: "700", textDecoration: "none" }}
            >
              จัดการโค้ด →
            </Link>
          </div>

          {(!data?.codesBreakdown || data.codesBreakdown.length === 0) ? (
            <div style={{ textAlign: "center", padding: "2.5rem 0", color: "#94a3b8" }}>
              <i className="fa-solid fa-ticket" style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.5 }}></i>
              <div>ยังไม่มีข้อมูลยอดขายจากโค้ด</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", textAlign: "left", fontSize: "0.8rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>โค้ด (Code)</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>จำนวนขาย</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>ยอดรวม (THB)</th>
                </tr>
              </thead>
              <tbody>
                {data.codesBreakdown.map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.85rem 0.5rem" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: "800", color: "#222945", background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "6px" }}>
                        {c.code}
                      </span>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                        {c.discountType === "PERCENTAGE" ? `ลด ${c.discountValue}%` : `ลด ${c.discountValue} บาท`}
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", textAlign: "center", fontWeight: "700", color: "#475569" }}>
                      {c.count}
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", textAlign: "right", fontWeight: "800", color: "#0f172a" }}>
                      ฿{c.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent 5 Sales */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              รายการขายล่าสุด
            </h2>
            <Link
              href="/partner/dashboard/sales"
              style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: "700", textDecoration: "none" }}
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {(!data?.recentSales || data.recentSales.length === 0) ? (
            <div style={{ textAlign: "center", padding: "2.5rem 0", color: "#94a3b8" }}>
              <i className="fa-solid fa-receipt" style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.5 }}></i>
              <div>ยังไม่มีรายการขายที่บันทึก</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", textAlign: "left", fontSize: "0.8rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>ลูกค้า</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>โค้ด</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>ราคาขาย</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.85rem 0.5rem" }}>
                      <div style={{ fontWeight: "700", color: "#0f172a" }}>{s.customerName}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.customerPhone}</div>
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: "700", color: "#222945", background: "#f8fafc", padding: "0.2rem 0.4rem", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                        {s.promoCode?.code}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 0.5rem", textAlign: "right", fontWeight: "800", color: "#166534" }}>
                      ฿{s.saleAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
