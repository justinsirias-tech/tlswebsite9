"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const FALLBACK_PROMOTIONS = [
  {
    id: "welcome-15",
    title: "First Order 15% Off",
    title_th: "ส่วนลด 15% สำหรับการสั่งซักครั้งแรก",
    title_cn: "首单预约 85 折优惠",
    description: "Enjoy 15% off your very first laundry or dry cleaning booking in Bangkok & Pattaya.",
    desc_th: "รับส่วนลดทันที 15% สำหรับบริการซักพับ ซักอบรีด หรือซักแห้งทุกประเภทในการสั่งครั้งแรก",
    desc_cn: "首次在曼谷或芭堤雅预约洗衣与干洗服务，即可享受 15% 立减优惠。",
    code: "TLSWELCOME15",
    badge: "15% OFF",
    badge_th: "ลด 15%",
    badge_cn: "85折",
    category: "welcome",
    validUntil: "Valid through Sept 30, 2026"
  },
  {
    id: "wash-fold-10",
    title: "Wash & Fold 10kg Bonus",
    title_th: "ซักพับ 10 กก. แถมฟรีกระเป๋าและบริการรีดผ้า",
    title_cn: "水洗 10 公斤赠送精细熨烫",
    description: "Book 10kg or more of wash & fold and get free complimentary shirt pressing and garment bag.",
    desc_th: "เมื่อส่งซักพับครบ 10 กิโลกรัม รับฟรีกระเป๋าบรรจุผ้า premium และบริการอัดรีดเสื้อเชิ้ต",
    desc_cn: "预约 10 公斤及以上水洗折叠服务，免费赠送衬衫熨烫与防尘洗护袋。",
    code: "WASHRIDER10",
    badge: "FREE BONUS",
    badge_th: "แถมฟรี",
    badge_cn: "免费赠送",
    category: "monthly",
    validUntil: "Valid through Oct 15, 2026"
  },
  {
    id: "free-delivery-500",
    title: "Free Delivery Over 500 THB",
    title_th: "ฟรีค่าจัดส่ง เมื่อใช้บริการครบ 500 บาท",
    title_cn: "满 500 泰铢免取送费",
    description: "Get 100% free doorstep pickup & delivery for all hotel, condo, and home bookings over 500 THB.",
    desc_th: "บริการรับ-ส่งผ้าฟรีถึงหน้าห้องคอนโดหรือโรงแรม เมื่อมียอดซักผ้าตั้งแต่ 500 บาทขึ้นไป",
    desc_cn: "在曼谷与芭堤雅订单满 500 泰铢，即享公寓及酒店上门免费取送。",
    code: "FREEDELIVERY",
    badge: "FREE SHIPPING",
    badge_th: "ส่งฟรี",
    badge_cn: "免运费",
    category: "monthly",
    validUntil: "Ongoing Offer"
  },
  {
    id: "express-same-day",
    title: "Same-Day Express 20% Discount",
    title_th: "บริการซักด่วนภายในวัน ลด 20%",
    title_cn: "当日加急服务 20% 折扣",
    description: "Need clothes cleaned fast for your flight or event? Get 20% off express turnaround fee.",
    desc_th: "บริการซักด่วนพิเศษเสร็จภายในวันเดียว รับส่วนลดค่าบริการด่วน 20%",
    desc_cn: "航班หรือ活动急需衣物？享受同日加急加快费用 20% 优惠。",
    code: "EXPRESS20",
    badge: "EXPRESS DEAL",
    badge_th: "ซักด่วนพิเศษ",
    badge_cn: "加急特惠",
    category: "flash",
    validUntil: "Limited Time Flash Deal"
  }
];

export default function PromotionsClient({ locale, initialPromotions = [] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedCode, setCopiedCode] = useState(null);

  const displayPromotions = (initialPromotions && initialPromotions.length > 0) 
    ? initialPromotions 
    : FALLBACK_PROMOTIONS;

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  const filteredPromotions = activeCategory === "all"
    ? displayPromotions
    : displayPromotions.filter(p => p.category === activeCategory);

  const getLocalizedField = (promo, field) => {
    if (locale === "th" && promo[`${field}_th`]) return promo[`${field}_th`];
    if (locale === "cn" && promo[`${field}_cn`]) return promo[`${field}_cn`];
    return promo[field] || "";
  };

  const getSocialLineUrl = (code) => {
    const msg = encodeURIComponent(`Hello! I would like to use promo code: ${code || 'TLSDEAL'}`);
    return `https://lin.ee/B2monGQ?text=${msg}`;
  };

  const getSocialWhatsappUrl = (code) => {
    const msg = encodeURIComponent(`Hello! I would like to use promo code: ${code || 'TLSDEAL'}`);
    return `https://wa.me/message/7BO67YACZI6SH1?text=${msg}`;
  };

  return (
    <div>
      {/* Highlight Banner */}
      <div className={styles.highlightBanner}>
        <div>
          <h3>
            <i className="fa-solid fa-gift" style={{ marginRight: "0.75rem", color: "#ffffff" }}></i>
            {locale === "th" ? "ข้อเสนอพิเศษประจำเดือน & โซเชียลมีเดีย" : locale === "cn" ? "本月精选与社媒专属特惠" : "Monthly Special & Social Media Promo Codes"}
          </h3>
          <p>
            {locale === "th" 
              ? "โค้ดส่วนลดทั้งหมดสามารถใช้ได้ทั้งเมื่อจองผ่านเว็บไซต์ หรือส่งโค้ดทาง LINE OA (@ThatLaundryShop) และ WhatsApp ได้ทันที!" 
              : locale === "cn"
                ? "所有优惠码均可在官网在线预订时使用，也可直接在 LINE OA (@ThatLaundryShop) 或 WhatsApp 发送优惠码享受折扣！"
                : "All promo codes can be redeemed during online website booking OR sent directly to our staff via LINE OA (@ThatLaundryShop) or WhatsApp!"}
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <a href="https://lin.ee/B2monGQ" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#00B900", color: "#ffffff", padding: "0.5rem 1rem", borderRadius: "20px", fontWeight: "700", textDecoration: "none", fontSize: "0.9rem" }}>
              <i className="fa-brands fa-line" style={{ fontSize: "1.1rem" }}></i>
              <span>LINE OA: @ThatLaundryShop</span>
            </a>
            <a href="https://wa.me/message/7BO67YACZI6SH1" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#25D366", color: "#ffffff", padding: "0.5rem 1rem", borderRadius: "20px", fontWeight: "700", textDecoration: "none", fontSize: "0.9rem" }}>
              <i className="fa-brands fa-whatsapp" style={{ fontSize: "1.1rem" }}></i>
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href={`/${locale}/booking`} className="btn btn-primary" style={{ padding: "0.9rem 2rem", fontSize: "1.05rem", fontWeight: "800", background: "#ffffff", color: "#222945" }}>
            {locale === "th" ? "จองบริการทางเว็บ" : locale === "cn" ? "官网在线预订" : "Book On Website"}
          </Link>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className={styles.filterBar}>
        <button 
          onClick={() => setActiveCategory("all")}
          className={`${styles.filterBtn} ${activeCategory === "all" ? styles.activeFilterBtn : ""}`}
        >
          {locale === "th" ? "ทั้งหมด" : locale === "cn" ? "全部优惠" : "All Offers"}
        </button>
        <button 
          onClick={() => setActiveCategory("monthly")}
          className={`${styles.filterBtn} ${activeCategory === "monthly" ? styles.activeFilterBtn : ""}`}
        >
          {locale === "th" ? "โปรประจำเดือน" : locale === "cn" ? "每月特惠" : "Monthly Deals"}
        </button>
        <button 
          onClick={() => setActiveCategory("welcome")}
          className={`${styles.filterBtn} ${activeCategory === "welcome" ? styles.activeFilterBtn : ""}`}
        >
          {locale === "th" ? "ลูกค้าใหม่" : locale === "cn" ? "新客首单" : "Welcome Offers"}
        </button>
        <button 
          onClick={() => setActiveCategory("flash")}
          className={`${styles.filterBtn} ${activeCategory === "flash" ? styles.activeFilterBtn : ""}`}
        >
          {locale === "th" ? "แฟลชดีล" : locale === "cn" ? "限时抢购" : "Flash Sales"}
        </button>
      </div>

      {/* Deals Grid */}
      <div className={styles.dealsGrid}>
        {filteredPromotions.map((promo) => {
          const title = getLocalizedField(promo, "title");
          const description = getLocalizedField(promo, "description");
          const badge = getLocalizedField(promo, "badge") || promo.badge;

          return (
            <div key={promo.id} className={styles.dealCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardCategory}>{promo.category || "Monthly Deal"}</span>
                {badge && <span className={styles.badge}>{badge}</span>}
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.dealTitle}>{title}</h3>
                <p className={styles.dealDesc}>{description}</p>

                {promo.validUntil && (
                  <div className={styles.validityTag}>
                    <i className="fa-solid fa-clock"></i>
                    <span>{promo.validUntil}</span>
                  </div>
                )}

                {promo.code && (
                  <div className={styles.codeBox}>
                    <span className={styles.codeText}>{promo.code}</span>
                    <button 
                      onClick={() => handleCopyCode(promo.code)}
                      className={`${styles.copyBtn} ${copiedCode === promo.code ? styles.copiedBtn : ""}`}
                    >
                      {copiedCode === promo.code ? (
                        <>
                          <i className="fa-solid fa-check" style={{ marginRight: "0.3rem" }}></i>
                          {locale === "th" ? "คัดลอกแล้ว" : locale === "cn" ? "已复制" : "Copied!"}
                        </>
                      ) : (
                        <>
                          <i className="fa-regular fa-copy" style={{ marginRight: "0.3rem" }}></i>
                          {locale === "th" ? "คัดลอกโค้ด" : locale === "cn" ? "复制优惠码" : "Copy Code"}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Primary Booking Link */}
                <Link 
                  href={`/${locale}/booking${promo.code ? `?promo=${promo.code}` : ""}`}
                  className={styles.bookBtn}
                  style={{ marginBottom: "0.75rem" }}
                >
                  <span>{locale === "th" ? "จองทางเว็บพร้อมโค้ดนี้" : locale === "cn" ? "官网使用优惠码预订" : "Book Online With Code"}</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>

                {/* Social Media Quick Claim Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <a 
                    href={getSocialLineUrl(promo.code)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.socialClaimBtn}
                    style={{ background: "rgba(0, 185, 0, 0.08)", color: "#00B900", border: "1px solid rgba(0, 185, 0, 0.2)" }}
                  >
                    <i className="fa-brands fa-line" style={{ fontSize: "1.05rem" }}></i>
                    <span>LINE OA</span>
                  </a>
                  <a 
                    href={getSocialWhatsappUrl(promo.code)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.socialClaimBtn}
                    style={{ background: "rgba(37, 211, 102, 0.08)", color: "#25D366", border: "1px solid rgba(37, 211, 102, 0.2)" }}
                  >
                    <i className="fa-brands fa-whatsapp" style={{ fontSize: "1.05rem" }}></i>
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
