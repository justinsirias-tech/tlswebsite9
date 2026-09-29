"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PartnerCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);

  const formatSchedule = (pc) => {
    if (!pc.startDate && !pc.endDate) {
      return "Always Active (No expiration)";
    }
    const formatOpt = { dateStyle: "medium", timeStyle: "short" };
    const startStr = pc.startDate ? new Date(pc.startDate).toLocaleString("en-US", formatOpt) : "Now";
    const endStr = pc.endDate ? new Date(pc.endDate).toLocaleString("en-US", formatOpt) : "No expiration";
    return `${startStr} → ${endStr}`;
  };

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partner/codes");
      const data = await res.json();
      if (res.ok && data.success) {
        setCodes(data.codes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadCodes() {
      try {
        const res = await fetch("/api/partner/codes");
        const data = await res.json();
        if (!ignore && res.ok && data.success) {
          setCodes(data.codes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadCodes();
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Link
              href="/partner/dashboard"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                textDecoration: "none"
              }}
              title="Back to Overview"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
              My Promo Codes
            </h1>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.3rem 0 0 0" }}>
            View promo codes, discount rates, schedule validity, and copy direct referral booking links for your guests.
          </p>
        </div>

        <div style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          color: "#0369a1",
          padding: "0.6rem 1.1rem",
          borderRadius: "12px",
          fontSize: "0.85rem",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <i className="fa-solid fa-shield-halved" style={{ color: "#0284c7" }}></i>
          <span>Official Partner Code Portfolio</span>
        </div>
      </div>

      {/* Codes Table Container */}
      <div style={{
        background: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
        overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.8rem", marginBottom: "0.8rem", color: "#0284c7" }}></i>
            <div>Loading promo codes...</div>
          </div>
        ) : codes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              color: "#94a3b8"
            }}>
              <i className="fa-solid fa-ticket" style={{ fontSize: "1.6rem" }}></i>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", margin: "0 0 0.35rem 0" }}>
              No promo codes found
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0" }}>
              Please reach out to the TLS Partner Desk to generate a custom code for your property.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Promo Code & Quick Copy</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Discount Rate</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Schedule / Validity</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>Orders Used</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((pc) => {
                  const isCopied = copiedCode === pc.code;
                  const isLinkCopied = copiedLink === pc.code;

                  return (
                    <tr key={pc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {/* Code & Quick Copy */}
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{
                            fontFamily: "monospace",
                            fontWeight: "900",
                            color: "#0f172a",
                            background: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            padding: "0.3rem 0.65rem",
                            borderRadius: "8px",
                            fontSize: "1rem",
                            letterSpacing: "1px"
                          }}>
                            {pc.code}
                          </span>

                          <button
                            onClick={() => handleCopyCode(pc.code)}
                            title="Copy code"
                            style={{
                              background: isCopied ? "#059669" : "#ffffff",
                              color: isCopied ? "#ffffff" : "#475569",
                              border: isCopied ? "1px solid #059669" : "1px solid #cbd5e1",
                              padding: "0.3rem 0.55rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <i className={`fa-solid ${isCopied ? "fa-check" : "fa-copy"}`}></i>
                            <span>{isCopied ? "Copied" : "Copy Code"}</span>
                          </button>

                          <button
                            onClick={() => handleCopyLink(pc.code)}
                            title="Copy direct booking link with promo code"
                            style={{
                              background: isLinkCopied ? "#0284c7" : "#f0f9ff",
                              color: isLinkCopied ? "#ffffff" : "#0284c7",
                              border: isLinkCopied ? "1px solid #0284c7" : "1px solid #bae6fd",
                              padding: "0.3rem 0.55rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <i className={`fa-solid ${isLinkCopied ? "fa-check" : "fa-link"}`}></i>
                            <span>{isLinkCopied ? "Link Copied" : "Booking Link"}</span>
                          </button>
                        </div>

                        {pc.description && (
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.35rem" }}>
                            {pc.description}
                          </div>
                        )}
                      </td>

                      {/* Discount */}
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <span style={{
                          background: "#ecfdf5",
                          color: "#059669",
                          border: "1px solid #a7f3d0",
                          padding: "0.3rem 0.7rem",
                          borderRadius: "9999px",
                          fontWeight: "800",
                          fontSize: "0.85rem"
                        }}>
                          {pc.discountType === "PERCENTAGE" ? `${pc.discountValue}% OFF` : `฿${pc.discountValue} OFF`}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td style={{ padding: "1rem 1.25rem", color: "#475569", fontSize: "0.85rem", maxWidth: "240px", lineHeight: "1.4" }}>
                        {formatSchedule(pc)}
                      </td>

                      {/* Orders Used */}
                      <td style={{ padding: "1rem 1.25rem", textAlign: "center", fontWeight: "800", color: "#0f172a" }}>
                        {pc._count?.sales ?? pc.usedCount ?? 0} {pc.usageLimit ? `/ ${pc.usageLimit}` : "orders"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



