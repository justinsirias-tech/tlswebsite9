"use client";

import { useEffect, useState } from "react";

export default function PopupBanner() {
  const [popup, setPopup] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Dismiss popup banner if promotion modal is opened
    const handleDismiss = () => {
      setIsVisible(false);
      setIsExpanded(false);
    };
    window.addEventListener("dismiss_popup_banner", handleDismiss);
    return () => window.removeEventListener("dismiss_popup_banner", handleDismiss);
  }, []);

  useEffect(() => {
    async function checkActivePopup() {
      try {
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const hasPromoParam = urlParams.has("promo") || urlParams.has("code") || urlParams.has("deal") || urlParams.has("id");
          const isPromotionsPage = window.location.pathname.includes("/promotions");

          // Suppress website announcement popup if visiting via a direct promotion link or on promotions page
          if (hasPromoParam || isPromotionsPage) {
            return;
          }
        }

        const now = Date.now();
        const cachedData = localStorage.getItem("popup_check_cache");
        const cachedTime = localStorage.getItem("popup_check_time");

        // 1. Client-Side Cache Defense: If checked in the last 15 minutes, reuse the cached response
        if (cachedData && cachedTime && (now - parseInt(cachedTime, 10)) < 15 * 60 * 1000) {
          const parsed = JSON.parse(cachedData);
          if (parsed.success && parsed.popup) {
            const closed = sessionStorage.getItem(`closed_popup_${parsed.popup.id}`);
            if (!closed) {
              setPopup(parsed.popup);
              setIsVisible(true);
            }
          }
          return;
        }

        // 2. Fetch from server if cache is empty or expired
        const res = await fetch("/api/active-popup");
        const data = await res.json();
        
        // Save to client-side localStorage cache
        localStorage.setItem("popup_check_cache", JSON.stringify(data));
        localStorage.setItem("popup_check_time", String(now));

        if (data.success && data.popup) {
          const closed = sessionStorage.getItem(`closed_popup_${data.popup.id}`);
          if (!closed) {
            setPopup(data.popup);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Error checking active popup:", error);
      }
    }
    checkActivePopup();
  }, []);

  const handleClose = () => {
    if (popup) {
      sessionStorage.setItem(`closed_popup_${popup.id}`, "true");
    }
    setIsVisible(false);
    setIsExpanded(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          handleClose();
        }
      }
    };
    if (isVisible) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, isExpanded]);

  if (!isVisible || !popup) return null;

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isExpanded ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
        padding: "16px",
        transition: "background-color 0.25s ease",
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          position: "relative",
          maxWidth: isExpanded ? "95vw" : "480px",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: isExpanded ? "0 25px 60px rgba(0, 0, 0, 0.6)" : "0 20px 40px rgba(0, 0, 0, 0.3)",
          backgroundColor: "transparent",
          transition: "max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Buttons */}
        <div 
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 100000,
          }}
        >
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              color: "#ffffff",
              border: "2px solid rgba(255, 255, 255, 0.8)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "14px",
              transition: "all 0.2s ease",
              outline: "none",
            }}
            title={isExpanded ? "Collapse" : "Expand to fullscreen"}
            aria-label={isExpanded ? "Collapse" : "Expand to fullscreen"}
          >
            {isExpanded ? "🗗" : "⛶"}
          </button>
          <button 
            onClick={handleClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              color: "#ffffff",
              border: "2px solid rgba(255, 255, 255, 0.8)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "18px",
              transition: "all 0.2s ease",
              outline: "none",
            }}
            aria-label="Close announcement popup"
          >
            ✕
          </button>
        </div>

        {popup.imageUrl ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              cursor: isExpanded ? "zoom-out" : "zoom-in",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => setIsExpanded(prev => !prev)}
            title={isExpanded ? "Click to collapse" : "Click to view fullscreen"}
          >
            <img 
              src={popup.imageUrl} 
              alt={popup.name || "Announcement"} 
              style={{
                width: isExpanded ? "auto" : "100%",
                maxWidth: isExpanded ? "95vw" : "100%",
                maxHeight: isExpanded ? "88vh" : "80vh",
                height: "auto",
                display: "block",
                objectFit: "contain",
                borderRadius: "16px",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
            {!isExpanded && (
              <div 
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "14px",
                  background: "rgba(15, 23, 42, 0.75)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  pointerEvents: "none",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                🔍 ขยายรูป
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
