"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

const localizations = {
  en: {
    signIn: "Member Sign In",
    signUp: "Create Member Account",
    email: "Email Address",
    password: "Password",
    name: "Full Name",
    phone: "Phone Number",
    loginSuccess: "Successfully logged in!",
    signupSuccess: "Successfully registered! Please sign in.",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    loginBtn: "Log In",
    signupBtn: "Register Account",
    passwordPlaceholder: "••••••••",
    emailPlaceholder: "name@example.com",
    namePlaceholder: "John Doe",
    phonePlaceholder: "e.g. 0946916668"
  },
  th: {
    signIn: "เข้าสู่ระบบสมาชิก",
    signUp: "สมัครบัญชีสมาชิก",
    email: "ที่อยู่อีเมล",
    password: "รหัสผ่าน",
    name: "ชื่อ-นามสกุล",
    phone: "เบอร์โทรศัพท์",
    loginSuccess: "เข้าสู่ระบบสำเร็จ!",
    signupSuccess: "สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ",
    noAccount: "ยังไม่มีบัญชี?",
    haveAccount: "มีบัญชีอยู่แล้ว?",
    loginBtn: "เข้าสู่ระบบ",
    signupBtn: "สมัครสมาชิก",
    passwordPlaceholder: "••••••••",
    emailPlaceholder: "name@example.com",
    namePlaceholder: "สมชาย ดีใจ",
    phonePlaceholder: "เช่น 0946916668"
  },
  cn: {
    signIn: "会员登录",
    signUp: "注册会员账号",
    email: "电子邮箱",
    password: "密码",
    name: "完整姓名",
    phone: "电话号码",
    loginSuccess: "登录成功！",
    signupSuccess: "注册成功！请登录。",
    noAccount: "还没有账号？",
    haveAccount: "已有账号？",
    loginBtn: "登录",
    signupBtn: "注册账号",
    passwordPlaceholder: "••••••••",
    emailPlaceholder: "name@example.com",
    namePlaceholder: "张三",
    phonePlaceholder: "例如 0946916668"
  }
};

export default function MemberLoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale || "en";
  const t = localizations[locale] || localizations.en;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
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
      if (isLogin) {
        // Handle Login
        const res = await fetch("/api/member/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        
        setMessage(t.loginSuccess);
        setTimeout(() => {
          router.push(`/${locale}/member/dashboard`);
        }, 1000);
      } else {
        // Handle Signup
        const res = await fetch("/api/member/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        setMessage(t.signupSuccess);
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>{isLogin ? t.signIn : t.signUp}</h1>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {message && <div className={styles.successAlert}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>{t.name}</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder={t.namePlaceholder}
                required 
              />
            </div>
          )}

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

          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>{t.phone}</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder={t.phonePlaceholder}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>{t.password}</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder={t.passwordPlaceholder}
              required 
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "..." : isLogin ? t.loginBtn : t.signupBtn}
          </button>
        </form>

        <div className={styles.toggleText}>
          {isLogin ? t.noAccount : t.haveAccount}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className={styles.toggleBtn}>
            {isLogin ? t.signUp : t.signIn}
          </button>
        </div>
      </div>
    </div>
  );
}
