"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./oauth.module.css";

export default function SimulatedOAuthPage() {
  const params = useParams();
  const router = useRouter();
  const provider = (params.provider || "google").toLowerCase();
  const locale = params.locale || "en";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set default mockup profiles depending on selected provider
  useEffect(() => {
    if (provider === "google") {
      setEmail("justin.sirias@gmail.com");
      setName("Justin Sirias");
    } else if (provider === "line") {
      setEmail("line.user@line.me");
      setName("LINE Laundry Guest");
    } else if (provider === "facebook") {
      setEmail("fb.shopper@facebook.com");
      setName("Sarah Connor (Facebook)");
    } else {
      setEmail("x.drycleaner@x.com");
      setName("DryCleaner Pro (X)");
    }
  }, [provider]);

  const handleOAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const providerId = `oauth_${provider}_${Math.floor(100000 + Math.random() * 900000)}`;
      const res = await fetch("/api/member/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          provider,
          providerId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulated OAuth authentication failed");

      if (data.requireConfirmation) {
        router.push(`/${locale}/member/confirm-particulars`);
      } else {
        router.push(`/${locale}/member/dashboard`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProviderInfo = () => {
    switch (provider) {
      case "google":
        return {
          name: "Google (Gmail)",
          color: "#4285F4",
          logo: "fa-google",
          themeClass: styles.googleTheme,
          subText: "to continue to That Laundry Shop"
        };
      case "line":
        return {
          name: "LINE",
          color: "#06C755",
          logo: "fa-comment",
          themeClass: styles.lineTheme,
          subText: "เข้าสู่ระบบด้วยบัญชี LINE"
        };
      case "facebook":
        return {
          name: "Facebook",
          color: "#1877F2",
          logo: "fa-facebook-f",
          themeClass: styles.fbTheme,
          subText: "requests access to your profile and email"
        };
      case "x":
        return {
          name: "X (Twitter)",
          color: "#000000",
          logo: "fa-x-twitter",
          themeClass: styles.xTheme,
          subText: "Authorize app to access your profile"
        };
      default:
        return {
          name: "OAuth Gateway",
          color: "#222945",
          logo: "fa-key",
          themeClass: styles.defaultTheme,
          subText: "Authentication Portal"
        };
    }
  };

  const info = getProviderInfo();

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.authCard} ${info.themeClass}`}>
        
        {/* Brand Banner */}
        <div className={styles.brandHeader}>
          <div className={styles.brandLogoCircle}>
            <i className={`fa-brands ${info.logo} ${styles.providerLogoIcon}`}></i>
          </div>
          <h1 className={styles.providerName}>{info.name}</h1>
          <p className={styles.subText}>{info.subText}</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* Input parameters to let them customize mock sign in details */}
        <form onSubmit={handleOAuthSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Name (Simulated)</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Email Address (Simulated)</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <p className={styles.sandboxNotice}>
            <i className="fa-solid fa-flask" style={{ marginRight: "6px" }}></i>
            Sandbox Developer Mode: You can change the details above to test login routing with any test email.
          </p>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Connecting..." : `Authorize & Continue`}
          </button>
        </form>

        <div className={styles.footerLink}>
          <button onClick={() => router.back()} className={styles.cancelBtn}>
            Cancel Authorization
          </button>
        </div>
      </div>
    </div>
  );
}
