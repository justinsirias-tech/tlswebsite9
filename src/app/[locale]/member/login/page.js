"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

const localizations = {
  en: {
    signIn: "Member Sign In",
    forgotTitle: "Forgot Password",
    email: "Email Address",
    password: "Password",
    loginSuccess: "Successfully logged in!",
    passwordPlaceholder: "••••••••",
    emailPlaceholder: "name@example.com",
    membersOnly: "This is meant for members only.",
    keenToSubscribe: "Keen to be our member? Click here to subscribe",
    forgotLink: "Forgot Password?",
    forgotText: "Enter the email address registered with your account. If it is in our system, we will send you a link to reset your password.",
    forgotSubmitBtn: "Send Reset Link",
    backToLogin: "Back to Login",
    loginBtn: "Log In"
  },
  th: {
    signIn: "เข้าสู่ระบบสมาชิก",
    forgotTitle: "ลืมรหัสผ่าน",
    email: "ที่อยู่อีเมล",
    password: "รหัสผ่าน",
    loginSuccess: "เข้าสู่ระบบสำเร็จ!",
    passwordPlaceholder: "••••••••",
    emailPlaceholder: "name@example.com",
    membersOnly: "หน้านี้สำหรับสมาชิกเท่านั้น",
    keenToSubscribe: "สนใจสมัครเป็นสมาชิกกับเรา? คลิกที่นี่เพื่อสมัครสมาชิก",
    forgotLink: "ลืมรหัสผ่าน?",
    forgotText: "กรอกอีเมลที่ลงทะเบียนไว้กับระบบ หากมีอีเมลนี้ในระบบ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้คุณทางอีเมล",
    forgotSubmitBtn: "ส่งลิงก์รีเซ็ตรหัสผ่าน",
    backToLogin: "กลับไปหน้าเข้าสู่ระบบ",
    loginBtn: "เข้าสู่ระบบ"
  },
  cn: {
    signIn: "会员登录",
    forgotTitle: "忘记密码",
    email: "电子邮箱",
    password: "密码",
    loginSuccess: "登录成功！",
    passwordPlaceholder: "••••••••",
    emailPlaceholder: "name@example.com",
    membersOnly: "本页面仅限会员访问。",
    keenToSubscribe: "想要成为我们的会员？点击这里订阅",
    forgotLink: "忘记密码？",
    forgotText: "输入您注册的电子邮箱地址。如果该邮箱存在于我们的系统中，我们将为您发送重置密码的链接。",
    forgotSubmitBtn: "发送重置链接",
    backToLogin: "返回登录",
    loginBtn: "登录"
  }
};

export default function MemberLoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale || "en";
  const t = localizations[locale] || localizations.en;

  const [view, setView] = useState("login"); // "login" or "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Check if already logged in
  useEffect(() => {
    fetch("/api/member/profile")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          router.push(`/${locale}/member/dashboard`);
        }
      })
      .catch(() => {});
  }, [locale, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (view === "login") {
        // Handle Login
        const res = await fetch("/api/member/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        
        if (data.forcePasswordReset) {
          setMessage(locale === "th" ? "คุณจำเป็นต้องตั้งรหัสผ่านใหม่ กำลังนำทาง..." : locale === "cn" ? "您需要设置新密码。正在重定向..." : "You need to set a new password. Redirecting...");
          setTimeout(() => {
            router.push(`/${locale}/member/reset-password?force=true`);
          }, 1000);
          return;
        }

        setMessage(t.loginSuccess);
        setTimeout(() => {
          router.push(`/${locale}/member/dashboard`);
        }, 1000);
      } else {
        // Handle Forgot Password
        const res = await fetch("/api/member/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, locale })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        
        setMessage(data.message);
        setEmail("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView) => {
    setView(newView);
    setError("");
    setMessage("");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {view === "login" ? t.signIn : t.forgotTitle}
          </h1>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {message && <div className={styles.successAlert}>{message}</div>}

        {view === "login" ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>{t.email}</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder={t.emailPlaceholder}
                required 
              />
            </div>

            <div className={styles.inputGroup}>
              <label>{t.password}</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder={t.passwordPlaceholder}
                required 
              />
              <button 
                type="button" 
                onClick={() => switchView("forgot")} 
                className={styles.forgotBtn}
              >
                {t.forgotLink}
              </button>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "..." : t.loginBtn}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p style={{ fontSize: "0.95rem", lineHeight: "1.5", color: "rgba(34, 41, 69, 0.8)", margin: "0 0 1rem 0" }}>
              {t.forgotText}
            </p>
            
            <div className={styles.inputGroup}>
              <label>{t.email}</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder={t.emailPlaceholder}
                required 
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "..." : t.forgotSubmitBtn}
            </button>

            <button 
              type="button" 
              onClick={() => switchView("login")} 
              style={{
                background: "none",
                border: "none",
                color: "#222945",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "center",
                marginTop: "0.5rem",
                textDecoration: "underline",
                fontSize: "0.95rem"
              }}
            >
              {t.backToLogin}
            </button>
          </form>
        )}

        <div className={styles.subscribeSection}>
          <p className={styles.membersOnlyText}>{t.membersOnly}</p>
          <Link href={`/${locale}/promotions`} className={styles.subscribeLink}>
            {t.keenToSubscribe} <i className="fa-solid fa-arrow-right-long" style={{ marginLeft: '4px' }}></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
