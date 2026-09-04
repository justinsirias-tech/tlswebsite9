"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function PromotionsClient({ locale, initialPromotions = [] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedPromo(null);
      }
    };
    if (selectedPromo) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPromo]);

  const displayPromotions = Array.isArray(initialPromotions) ? initialPromotions : [];

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
      {filteredPromotions.length > 0 ? (
        <div className={styles.dealsGrid}>
          {filteredPromotions.map((promo) => {
            const title = getLocalizedField(promo, "title");
            const description = getLocalizedField(promo, "description");
            const badge = getLocalizedField(promo, "badge") || promo.badge;

            return (
              <div 
                key={promo.id} 
                className={styles.dealCard}
                onClick={() => setSelectedPromo(promo)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPromo(promo);
                  }
                }}
              >
                {promo.imageUrl && (
                  <div className={styles.cardImageWrapper}>
                    <img 
                      src={promo.imageUrl} 
                      alt={title} 
                      className={styles.cardImage}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className={`${styles.cardHeader} ${promo.imageUrl ? styles.cardHeaderWithImage : ""}`}>
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
                    <div className={styles.codeSnippet}>
                      <span className={styles.codeSnippetLabel}>
                        <i className="fa-solid fa-ticket" style={{ marginRight: "0.35rem", color: "#2563eb" }}></i>
                        {locale === "th" ? "โค้ด:" : locale === "cn" ? "优惠码:" : "Code:"}
                      </span>
                      <span className={styles.codeSnippetValue}>{promo.code}</span>
                    </div>
                  )}

                  <div className={styles.cardActionHint}>
                    <span>
                      {locale === "th" ? "ดูรายละเอียดและรับสิทธิ์" : locale === "cn" ? "查看详情并领取" : "View Details & Claim"}
                    </span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px dashed #cbd5e1",
          margin: "1rem 0"
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", color: "#94a3b8" }}>
            <i className="fa-solid fa-tags"></i>
          </div>
          <h4 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#334155", marginBottom: "0.5rem" }}>
            {displayPromotions.length === 0
              ? (locale === "th" ? "ยังไม่มีโปรโมชั่นที่เปิดใช้งานในขณะนี้" : locale === "cn" ? "暂无正在进行的优惠活动" : "No active promotions at this time")
              : (locale === "th" ? "ไม่พบโปรโมชั่นในหมวดหมู่นี้" : locale === "cn" ? "该分类下暂无优惠活动" : "No promotions found in this category")}
          </h4>
          <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.5rem", lineHeight: "1.6" }}>
            {displayPromotions.length === 0
              ? (locale === "th" 
                  ? "โปรดติดตามโปรโมชั่นและข้อเสนอพิเศษใหม่ๆ ได้ในเร็วๆ นี้ หรือสอบถามเจ้าหน้าที่ทาง LINE หรือ WhatsApp ได้ตลอดเวลา"
                  : locale === "cn"
                    ? "最新优惠活动即将推出，敬请期待！您也可随时通过 LINE 或 WhatsApp 联系客服咨询。"
                    : "Check back soon for new special deals, or contact our friendly team via LINE or WhatsApp anytime.")
              : (locale === "th"
                  ? "ลองเลือกหมวดหมู่อื่นเพื่อดูโปรโมชั่นที่กำลังเปิดใช้งาน"
                  : locale === "cn"
                    ? "请尝试选择其他分类查看正在进行的优惠活动。"
                    : "Try selecting another category to see currently active offers.")}
          </p>
          <Link href={`/${locale}/booking`} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.75rem", fontWeight: "700" }}>
            <span>{locale === "th" ? "จองบริการซักผ้า" : locale === "cn" ? "立即预约洗衣" : "Book Laundry Service"}</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      )}

      {/* Promotion Detail Pop Up Modal */}
      {selectedPromo && (() => {
        const modalTitle = getLocalizedField(selectedPromo, "title");
        const modalDescription = getLocalizedField(selectedPromo, "description");
        const modalBadge = getLocalizedField(selectedPromo, "badge") || selectedPromo.badge;

        return (
          <div 
            className={styles.modalOverlay} 
            onClick={() => setSelectedPromo(null)}
            role="dialog"
            aria-modal="true"
          >
            <div 
              className={`${styles.modalContent} ${selectedPromo.imageUrl ? styles.modalContentWithImage : styles.modalContentNoImage}`} 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedPromo(null)}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              {/* Banner Image */}
              {selectedPromo.imageUrl && (
                <div className={styles.modalImageWrapper}>
                  <img 
                    src={selectedPromo.imageUrl} 
                    alt={modalTitle} 
                    className={styles.modalImage}
                  />
                </div>
              )}

              <div className={styles.modalBody}>
                {/* Meta Row: Category, Badge & Validity */}
                <div className={styles.modalMetaRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className={styles.cardCategory}>{selectedPromo.category || "Special Deal"}</span>
                    {modalBadge && <span className={styles.badge}>{modalBadge}</span>}
                  </div>
                  {selectedPromo.validUntil && (
                    <div className={styles.validityTag} style={{ marginBottom: 0, padding: "0.25rem 0.55rem", fontSize: "0.76rem" }}>
                      <i className="fa-solid fa-clock" style={{ marginRight: "0.25rem" }}></i>
                      <span>{selectedPromo.validUntil}</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h2 className={styles.modalTitle}>{modalTitle}</h2>

                {/* Description */}
                <div className={styles.modalDesc}>
                  {modalDescription}
                </div>

                {/* Promo Code Box */}
                {selectedPromo.code && (
                  <div className={styles.modalCodeSection}>
                    <div className={styles.codeBox} style={{ marginBottom: 0, padding: "0.45rem 0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <i className="fa-solid fa-ticket" style={{ color: "#2563eb", fontSize: "0.9rem" }}></i>
                        <span className={styles.codeText} style={{ fontSize: "1rem" }}>{selectedPromo.code}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopyCode(selectedPromo.code)}
                        className={`${styles.copyBtn} ${copiedCode === selectedPromo.code ? styles.copiedBtn : ""}`}
                        style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                      >
                        {copiedCode === selectedPromo.code ? (
                          <>
                            <i className="fa-solid fa-check" style={{ marginRight: "0.25rem" }}></i>
                            {locale === "th" ? "คัดลอกแล้ว" : locale === "cn" ? "已复制" : "Copied!"}
                          </>
                        ) : (
                          <>
                            <i className="fa-regular fa-copy" style={{ marginRight: "0.25rem" }}></i>
                            {locale === "th" ? "คัดลอกโค้ด" : locale === "cn" ? "复制优惠码" : "Copy Code"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Booking Action */}
                <Link 
                  href={`/${locale}/booking${selectedPromo.code ? `?promo=${selectedPromo.code}` : ""}`}
                  className={styles.bookBtn}
                  style={{ marginBottom: "0.5rem", padding: "0.75rem", fontSize: "0.9rem" }}
                  onClick={() => setSelectedPromo(null)}
                >
                  <span>{locale === "th" ? "จองทางเว็บพร้อมโค้ดนี้" : locale === "cn" ? "官网使用优惠码预订" : "Book Online With Code"}</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>

                {/* Social Quick Claim */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <a 
                    href={getSocialLineUrl(selectedPromo.code)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.socialClaimBtn}
                    style={{ background: "rgba(0, 185, 0, 0.08)", color: "#00B900", border: "1px solid rgba(0, 185, 0, 0.2)", padding: "0.55rem" }}
                  >
                    <i className="fa-brands fa-line" style={{ fontSize: "1.1rem" }}></i>
                    <span>LINE OA</span>
                  </a>
                  <a 
                    href={getSocialWhatsappUrl(selectedPromo.code)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.socialClaimBtn}
                    style={{ background: "rgba(37, 211, 102, 0.08)", color: "#25D366", border: "1px solid rgba(37, 211, 102, 0.2)", padding: "0.55rem" }}
                  >
                    <i className="fa-brands fa-whatsapp" style={{ fontSize: "1.1rem" }}></i>
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
