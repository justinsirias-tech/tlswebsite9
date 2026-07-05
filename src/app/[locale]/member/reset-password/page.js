"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import styles from "../login/login.module.css";

const localizations = {
  en: {
    title: "Reset Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    placeholder: "••••••••",
    submitBtn: "Update Password",
    verifying: "Verifying reset token...",
    successMsg: "Password updated successfully! Redirecting to login...",
    errorMismatch: "Passwords do not match.",
    invalidToken: "Invalid or expired reset token. Please request a new link from the login screen."
  },
  th: {
    title: "รีเซ็ตรหัสผ่านใหม่",
    newPassword: "รหัสผ่านใหม่",
    confirmPassword: "ยืนยันรหัสผ่านใหม่",
    placeholder: "••••••••",
    submitBtn: "อัปเดตรหัสผ่าน",
    verifying: "กำลังตรวจสอบข้อมูลลิงก์รีเซ็ตรหัสผ่าน...",
    successMsg: "อัปเดตรหัสผ่านสำเร็จ! กำลังนำคุณกลับไปที่หน้าเข้าสู่ระบบ...",
    errorMismatch: "รหัสผ่านไม่ตรงกัน",
    invalidToken: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาส่งลิงก์ใหม่อีกครั้งจากหน้าเข้าสู่ระบบ"
  },
  cn: {
    title: "重置密码",
    newPassword: "新密码",
    confirmPassword: "确认新密码",
    placeholder: "••••••••",
    submitBtn: "更新密码",
    verifying: "正在验证重置链接...",
    successMsg: "密码更新成功！正在重定向到登录页面...",
    errorMismatch: "两次输入的密码不一致。",
    invalidToken: "重置链接无效或已过期。请从登录页面重新请求链接。"
  }
};

function ResetPasswordForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale || "en";
  const t = localizations[locale] || localizations.en;

  const token = searchParams.get("token");
  const force = searchParams.get("force") === "true";

  const [verifying, setVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Verify token on mount
  useEffect(() => {
    if (force) {
      setIsValidToken(true);
      setVerifying(false);
      return;
    }

    if (!token) {
      setIsValidToken(false);
      setVerifying(false);
      return;
    }

    fetch(`/api/member/reset-password?token=${token}`)
      .then(res => {
        if (res.ok) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      })
      .catch(() => setIsValidToken(false))
      .finally(() => setVerifying(false));
  }, [token, force]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError(t.errorMismatch);
      return;
    }

    if (password.length < 6) {
      setError(locale === "th" ? "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" : locale === "cn" ? "密码必须至少为 6 个字符" : "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = force ? "/api/member/change-password" : "/api/member/reset-password";
      const payload = force ? { password } : { token, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      setMessage(force ? 
        (locale === "th" ? "อัปเดตรหัสผ่านสำเร็จ! กำลังนำคุณไปยังแดชบอร์ด..." : locale === "cn" ? "密码更新成功！正在前往会员中心..." : "Password updated successfully! Redirecting to dashboard...") : 
        t.successMsg
      );
      setTimeout(() => {
        if (force) {
          router.push(`/${locale}/member/dashboard`);
        } else {
          router.push(`/${locale}/member/login`);
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#222945", fontWeight: "600" }}>{t.verifying}</p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className={styles.errorAlert} style={{ margin: "2rem 0", lineHeight: "1.5" }}>
        {t.invalidToken}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label>{t.newPassword}</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder={t.placeholder}
          required 
        />
      </div>

      <div className={styles.inputGroup}>
        <label>{t.confirmPassword}</label>
        <input 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          placeholder={t.placeholder}
          required 
        />
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {message && <div className={styles.successAlert}>{message}</div>}

      <button type="submit" disabled={loading} className={styles.submitBtn}>
        {loading ? "..." : t.submitBtn}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const params = useParams();
  const locale = params.locale || "en";
  const t = localizations[locale] || localizations.en;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t.title}</h1>
        </div>
        <Suspense fallback={
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "#222945", fontWeight: "600" }}>Loading...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
