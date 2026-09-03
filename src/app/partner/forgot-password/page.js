"use client";

import { useState } from "react";
import Link from "next/link";

export default function PartnerForgotPassword() {
  const [email, setEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg("");
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/partner/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setStatusMsg(data.message || "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว");
    } catch (err) {
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      padding: "1.5rem",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "#ffffff",
        borderRadius: "20px",
        padding: "2.5rem 2rem",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "#222945",
            color: "#ffffff",
            fontSize: "1.5rem",
            marginBottom: "1rem"
          }}>
            <i className="fa-solid fa-key"></i>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.4rem 0" }}>
            ลืมรหัสผ่าน Partner
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
            กรอกอีเมลที่ลงทะเบียนไว้เพื่อรับลิงก์ตั้งรหัสผ่านใหม่
          </p>
        </div>

        {statusMsg && (
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            fontSize: "0.9rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <i className="fa-solid fa-circle-check"></i>
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            fontSize: "0.9rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#334155", marginBottom: "0.4rem" }}>
              อีเมลพาร์ทเนอร์
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
              required
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                color: "#0f172a",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.95rem",
              borderRadius: "10px",
              background: "#222945",
              color: "#ffffff",
              border: "none",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(34, 41, 69, 0.25)",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
          </button>

          <Link
            href="/partner/login"
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#64748b",
              textDecoration: "none",
              fontWeight: "600",
              marginTop: "0.5rem"
            }}
          >
            <i className="fa-solid fa-arrow-left" style={{ marginRight: "0.4rem" }}></i>
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </form>
      </div>
    </div>
  );
}
