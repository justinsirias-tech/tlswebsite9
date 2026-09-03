"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PartnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/partner/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      router.push("/partner/dashboard");
      router.refresh();
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
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
            <i className="fa-solid fa-handshake"></i>
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.4rem 0" }}>
            Partner Portal
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
            That's Laundry Shop — สำหรับพาร์ทเนอร์
          </p>
        </div>

        {error && (
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
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155" }}>
                รหัสผ่าน
              </label>
              <Link 
                href="/partner/forgot-password" 
                style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "none", fontWeight: "600" }}
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "0.85rem 2.5rem 0.85rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "0.25rem"
                }}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "0.95rem",
              borderRadius: "10px",
              background: "#222945",
              color: "#ffffff",
              border: "none",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s ease",
              boxShadow: "0 4px 12px rgba(34, 41, 69, 0.25)",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ Partner"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: "1.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
            ยังไม่มีบัญชีพาร์ทเนอร์? ติดต่อผู้ดูแลระบบ TLS เพื่อเปิดบัญชี
          </span>
        </div>
      </div>
    </div>
  );
}
