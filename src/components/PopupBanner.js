"use client";

import { useEffect, useState } from "react";

export default function PopupBanner() {
  const [popup, setPopup] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function checkActivePopup() {
      try {
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
  };

  if (!isVisible || !popup) return null;

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
        padding: "20px",
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          position: "relative",
          maxWidth: "480px",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          backgroundColor: "transparent",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "#ffffff",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
            zIndex: 100000,
            transition: "all 0.2s ease",
            outline: "none",
          }}
          aria-label="Close announcement popup"
        >
          ✕
        </button>
        {popup.imageUrl ? (
          <img 
            src={popup.imageUrl} 
            alt={popup.name || "Announcement"} 
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
