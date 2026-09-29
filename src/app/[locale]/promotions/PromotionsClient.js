"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function PromotionsClient({ locale, initialPromotions = [], initialPromoKey = null }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showReviewModal) {
          setShowReviewModal(false);
        } else if (expandedImage) {
          setExpandedImage(null);
        } else if (selectedPromo) {
          setSelectedPromo(null);
        }
      }
    };
    if (selectedPromo || expandedImage || showReviewModal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPromo, expandedImage, showReviewModal]);

  const displayPromotions = Array.isArray(initialPromotions) ? initialPromotions : [];

  // Deep Link / Direct URL: Auto-open modal if ?promo=CODE or ?id=... is in URL
  useEffect(() => {
    let key = initialPromoKey;
    if (!key && typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      key = sp.get("promo") || sp.get("code") || sp.get("deal") || sp.get("id");
    }
    if (key && displayPromotions.length > 0) {
      const clean = key.trim().toLowerCase();
      const match = displayPromotions.find(p =>
        (p.code && p.code.toLowerCase() === clean) ||
        (p.id && p.id.toLowerCase() === clean)
      );
      if (match) {
        setSelectedPromo(match);
      }
    }
  }, [initialPromoKey, displayPromotions]);

  // Synchronize browser address bar with current open modal & dismiss global announcement popup
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (selectedPromo) {
      window.dispatchEvent(new CustomEvent("dismiss_popup_banner"));
      const key = selectedPromo.code || selectedPromo.id;
      url.searchParams.set("promo", key);
      window.history.replaceState(null, "", url.toString());
    } else {
      if (url.searchParams.has("promo") || url.searchParams.has("code") || url.searchParams.has("deal") || url.searchParams.has("id")) {
        url.searchParams.delete("promo");
        url.searchParams.delete("code");
        url.searchParams.delete("deal");
        url.searchParams.delete("id");
        window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
      }
    }
  }, [selectedPromo]);

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
    : displayPromotions.filter(p => (p.category || "").toLowerCase() === activeCategory.toLowerCase());

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

  const handleTrackClick = (promoId, buttonType) => {
    if (!promoId || !buttonType) return;
    try {
      const payload = JSON.stringify({ button: buttonType, locale });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`/api/promotions/${promoId}/click`, blob);
      } else {
        fetch(`/api/promotions/${promoId}/click`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {
      // Fail silently to never interrupt user interaction
    }
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
        <button 
          onClick={() => setActiveCategory("partner")}
          className={`${styles.filterBtn} ${activeCategory === "partner" ? styles.activeFilterBtn : ""}`}
        >
          {locale === "th" ? "โปรพาร์ทเนอร์" : locale === "cn" ? "合作特惠" : "Partner Deals"}
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
                <div 
                  className={styles.modalImageWrapper}
                  onClick={() => setExpandedImage({ url: selectedPromo.imageUrl, title: modalTitle })}
                  title={locale === "th" ? "คลิกเพื่อขยายรูปเต็มจอ" : locale === "cn" ? "点击全屏查看大图" : "Click to view full screen"}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedImage({ url: selectedPromo.imageUrl, title: modalTitle });
                    }
                  }}
                >
                  <img 
                    src={selectedPromo.imageUrl} 
                    alt={modalTitle} 
                    className={styles.modalImage}
                  />
                  <div className={styles.imageZoomBadge}>
                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                    <span>{locale === "th" ? "ขยายรูปเต็มจอ" : locale === "cn" ? "查看大图" : "Zoom"}</span>
                  </div>
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

                {/* Primary Booking Action (Only if bookUrl is provided) */}
                {(() => {
                  const rawBookUrl = (selectedPromo.bookUrl || "").trim();
                  if (!rawBookUrl) return null;

                  const targetBookUrl = rawBookUrl.replace(/\[locale\]/g, locale);
                  const isExternal = targetBookUrl.startsWith("http://") || targetBookUrl.startsWith("https://");

                  if (isExternal) {
                    return (
                      <a 
                        href={targetBookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleTrackClick(selectedPromo.id, "book")}
                        className={styles.bookBtn}
                        style={{ marginBottom: "0.5rem", padding: "0.75rem", fontSize: "0.9rem", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <span>{locale === "th" ? "จองบริการพร้อมโค้ดนี้" : locale === "cn" ? "官网使用优惠码预订" : "Book Online With Code"}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </a>
                    );
                  }

                  return (
                    <Link 
                      href={targetBookUrl}
                      className={styles.bookBtn}
                      style={{ marginBottom: "0.5rem", padding: "0.75rem", fontSize: "0.9rem" }}
                      onClick={() => {
                        handleTrackClick(selectedPromo.id, "book");
                        setSelectedPromo(null);
                      }}
                    >
                      <span>{locale === "th" ? "จองทางเว็บพร้อมโค้ดนี้" : locale === "cn" ? "官网使用优惠码预订" : "Book Online With Code"}</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  );
                })()}

                {/* Secondary Actions (LINE OA, WhatsApp, Click To Review) */}
                {(() => {
                  const hasLine = Boolean(selectedPromo.lineUrl && selectedPromo.lineUrl.trim());
                  const hasWhatsapp = Boolean(selectedPromo.whatsappUrl && selectedPromo.whatsappUrl.trim());
                  const hasReview = Boolean(
                    (selectedPromo.reviewContent && selectedPromo.reviewContent.trim()) || 
                    (selectedPromo.reviewUrl && selectedPromo.reviewUrl.trim())
                  );

                  const buttons = [];

                  if (hasLine) {
                    buttons.push(
                      <a 
                        key="line"
                        href={selectedPromo.lineUrl.trim()}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => handleTrackClick(selectedPromo.id, "line")}
                        className={styles.socialClaimBtn}
                        style={{ width: "100%", background: "rgba(0, 185, 0, 0.08)", color: "#00B900", border: "1px solid rgba(0, 185, 0, 0.2)", padding: "0.55rem" }}
                      >
                        <i className="fa-brands fa-line" style={{ fontSize: "1.1rem" }}></i>
                        <span>LINE OA</span>
                      </a>
                    );
                  }

                  if (hasWhatsapp) {
                    buttons.push(
                      <a 
                        key="whatsapp"
                        href={selectedPromo.whatsappUrl.trim()}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => handleTrackClick(selectedPromo.id, "whatsapp")}
                        className={styles.socialClaimBtn}
                        style={{ width: "100%", background: "rgba(37, 211, 102, 0.08)", color: "#25D366", border: "1px solid rgba(37, 211, 102, 0.2)", padding: "0.55rem" }}
                      >
                        <i className="fa-brands fa-whatsapp" style={{ fontSize: "1.1rem" }}></i>
                        <span>WhatsApp</span>
                      </a>
                    );
                  }

                  if (hasReview) {
                    buttons.push(
                      <button
                        key="review"
                        type="button"
                        onClick={() => {
                          handleTrackClick(selectedPromo.id, "review");
                          setShowReviewModal(true);
                        }}
                        className={styles.socialClaimBtn}
                        style={{ 
                          width: "100%", 
                          background: "rgba(37, 99, 235, 0.08)", 
                          color: "#2563eb", 
                          border: "1px solid rgba(37, 99, 235, 0.25)", 
                          padding: "0.55rem",
                          cursor: "pointer",
                          outline: "none"
                        }}
                        aria-label="Click To Review"
                      >
                        <i className="fa-solid fa-file-lines" style={{ fontSize: "1rem" }}></i>
                        <span>Click To Review</span>
                      </button>
                    );
                  }

                  if (buttons.length === 0) return null;

                  if (buttons.length === 1) {
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.6rem" }}>
                        {buttons[0]}
                      </div>
                    );
                  }

                  if (buttons.length === 2) {
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                        {buttons[0]}
                        {buttons[1]}
                      </div>
                    );
                  }

                  // 3 buttons: row of 2, row of 1 full width
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                      {buttons[0]}
                      {buttons[1]}
                      <div style={{ gridColumn: "span 2" }}>
                        {buttons[2]}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          </div>
        );
      })()}

      {/* Fullscreen Lightbox Modal */}
      {expandedImage && (
        <div 
          className={styles.lightboxOverlay}
          onClick={() => setExpandedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Header Bar */}
          <div 
            className={styles.lightboxHeader}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lightboxTitle}>
              <i className="fa-regular fa-image" style={{ color: "#38bdf8" }}></i>
              <span>{expandedImage.title || (locale === "th" ? "รูปโปรโมชั่น" : locale === "cn" ? "优惠海报" : "Promotion Poster")}</span>
            </div>

            <div className={styles.lightboxActions}>
              <a 
                href={expandedImage.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.lightboxActionBtn}
                title={locale === "th" ? "เปิดรูปต้นฉบับในแท็บใหม่" : locale === "cn" ? "在新标签页打开原图" : "Open original image in new tab"}
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                <span>{locale === "th" ? "รูปต้นฉบับ" : locale === "cn" ? "查看原图" : "Original"}</span>
              </a>

              <button 
                type="button"
                className={styles.lightboxCloseBtn}
                onClick={() => setExpandedImage(null)}
                aria-label="Close fullscreen preview (Esc)"
                title={locale === "th" ? "ปิด (Esc)" : locale === "cn" ? "关闭 (Esc)" : "Close (Esc)"}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Lightbox Image */}
          <div 
            className={styles.lightboxImageContainer}
            onClick={() => setExpandedImage(null)}
            title={locale === "th" ? "คลิกเพื่อปิด" : locale === "cn" ? "点击关闭" : "Click to close"}
          >
            <img 
              src={expandedImage.url} 
              alt={expandedImage.title || "Preview"} 
              className={styles.lightboxImage}
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImage(null);
              }}
            />
          </div>

          <div className={styles.lightboxHint}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: "0.35rem" }}></i>
            {locale === "th" ? "คลิกที่รูปหรือกด Esc เพื่อปิด" : locale === "cn" ? "点击图片或按 Esc 关闭" : "Click image or press Esc to close"}
          </div>
        </div>
      )}

      {/* Review Information Pop Up Modal */}
      {showReviewModal && selectedPromo && (() => {
        const reviewText = getLocalizedField(selectedPromo, "reviewContent") || selectedPromo.reviewContent || "";
        const promoTitle = getLocalizedField(selectedPromo, "title");

        return (
          <div 
            className={styles.reviewModalOverlay}
            onClick={() => setShowReviewModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div 
              className={styles.reviewModalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={styles.reviewModalHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flex: 1, minWidth: 0 }}>
                  <div className={styles.reviewIconWrapper}>
                    <i className="fa-solid fa-file-lines"></i>
                  </div>
                  <h3 className={styles.reviewModalTitle}>
                    {promoTitle}
                  </h3>
                </div>

                <button 
                  type="button"
                  className={styles.reviewModalCloseBtn}
                  onClick={() => setShowReviewModal(false)}
                  aria-label="Close review modal (Esc)"
                  title={locale === "th" ? "ปิด (Esc)" : locale === "cn" ? "关闭 (Esc)" : "Close (Esc)"}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Body */}
              <div className={styles.reviewModalBody}>
                {reviewText && (
                  <div className={styles.reviewTextBox}>
                    {reviewText}
                  </div>
                )}

                {/* External Review URL if provided */}
                {selectedPromo.reviewUrl && (
                  <a 
                    href={selectedPromo.reviewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.reviewExternalBtn}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>{locale === "th" ? "เปิดดูข้อมูลเพิ่มเติม / ลิงก์ต้นทาง" : locale === "cn" ? "查看更多信息 / 来源链接" : "Open More Information / Link"}</span>
                  </a>
                )}
              </div>

              {/* Footer */}
              <div className={styles.reviewModalFooter}>
                <button
                  type="button"
                  className={styles.reviewModalOkBtn}
                  onClick={() => setShowReviewModal(false)}
                >
                  {locale === "th" ? "ปิดหน้าต่าง" : locale === "cn" ? "关闭" : "Close"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
