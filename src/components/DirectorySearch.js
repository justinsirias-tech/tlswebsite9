"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import styles from "../app/[locale]/hotels/page.module.css";

export default function DirectorySearch({ locations, basePath }) {
  const t = useTranslations("Directory");
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = useState("");

  const getLocalizedName = (loc) => {
    return locale === "th" && loc.name_th ? loc.name_th : loc.name;
  };

  const filteredLocations = locations.filter(loc => {
    const name = getLocalizedName(loc);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const bangkokLocations = filteredLocations.filter(h => h.city === "Bangkok");
  const pattayaLocations = filteredLocations.filter(h => h.city === "Pattaya");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      
      {/* Search Bar */}
      <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto", width: "100%", marginBottom: "1rem" }}>
        <i 
          className="fa-solid fa-magnifying-glass" 
          style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }}
        ></i>
        <input 
          type="text" 
          placeholder={t("searchPlaceholder")} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "1rem 1rem 1rem 3.5rem",
            fontSize: "1.1rem",
            borderRadius: "50px",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            outline: "none",
            transition: "all 0.3s ease",
            background: "white"
          }}
          onFocus={(e) => e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"}
          onBlur={(e) => e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)"}
        />
      </div>

      {filteredLocations.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-light)", padding: "3rem" }}>
          <i className="fa-solid fa-building-circle-xmark" style={{ fontSize: "3rem", marginBottom: "1rem", color: "var(--border)" }}></i>
          <p>{t("noBuildings", { query: searchTerm })}</p>
        </div>
      )}

      {bangkokLocations.length > 0 && (
        <div className={styles.citySection}>
          <h3 className={styles.cityTitle} style={{ fontSize: "1.8rem" }}>
            <i className="fa-solid fa-city"></i> {t("bangkok")}
          </h3>
          <div className={styles.hotelGrid}>
            {bangkokLocations.map((hotel) => (
              <Link href={`${basePath}/${hotel.slug}`} key={hotel.slug} className={styles.hotelCard}>
                <span className={styles.hotelName}>
                  <i className={`fa-solid ${hotel.type === "condo" ? "fa-house" : (hotel.type === "apartment" ? "fa-building" : "fa-hotel")} ${styles.hotelIcon}`}></i>
                  {getLocalizedName(hotel)}
                </span>
                <i className={`fa-solid fa-arrow-right ${styles.mapIcon}`}></i>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pattayaLocations.length > 0 && (
        <div className={styles.citySection}>
          <h3 className={styles.cityTitle} style={{ fontSize: "1.8rem" }}>
            <i className="fa-solid fa-umbrella-beach"></i> {t("pattaya")}
          </h3>
          <div className={styles.hotelGrid}>
            {pattayaLocations.map((hotel) => (
              <Link href={`${basePath}/${hotel.slug}`} key={hotel.slug} className={styles.hotelCard}>
                <span className={styles.hotelName}>
                  <i className={`fa-solid ${hotel.type === "condo" ? "fa-house" : (hotel.type === "apartment" ? "fa-building" : "fa-hotel")} ${styles.hotelIcon}`}></i>
                  {getLocalizedName(hotel)}
                </span>
                <i className={`fa-solid fa-arrow-right ${styles.mapIcon}`}></i>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
