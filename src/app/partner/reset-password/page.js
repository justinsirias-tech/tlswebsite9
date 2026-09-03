"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("ไม่พบโทเค็นสำหรับการรีเซ็ตรหัสผ่าน กรุณาตรวจสอบลิงก์ในอีเมลอีกครั้ง");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/partner/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาขอลิงก์ใหม่อีกครั้ง");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/partner/login");
      }, 3000);
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
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
            <i className="fa-solid fa-lock-open"></i>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.4rem 0" }}>
            ตั้งรหัสผ่านใหม่
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
            กำหนดรหัสผ่านใหม่สำหรับบัญชี Partner Portal ของคุณ
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#dcfce7",
              color: "#166534",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              marginBottom: "1rem"
            }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#166534", marginBottom: "0.5rem" }}>
              ตั้งรหัสผ่านใหม่สำเร็จ!
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "1.5rem" }}>
              กำลังนำคุณไปยังหน้าเข้าสู่ระบบใน 3 วินาที...
            </p>
            <Link
              href="/partner/login"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                borderRadius: "10px",
                background: "#222945",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "0.95rem"
              }}
            >
              เข้าสู่ระบบทันที
            </Link>
          </div>
        ) : (
          <>
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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#334155", marginBottom: "0.4rem" }}>
                  รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
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
                    onClick={() => setShowPass(!showPass)}
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
                    <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#334155", marginBottom: "0.4rem" }}>
                  ยืนยันรหัสผ่านใหม่อีกครั้ง
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                  marginTop: "0.5rem",
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
                {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
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
                ยกเลิกและกลับไปหน้าเข้าสู่ระบบ
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function PartnerResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
