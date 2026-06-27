"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function PricingTabs({ priceData, locale }) {
  const [activeTab, setActiveTab] = useState("weight");
  const t = useTranslations("Pricing");

  const tabs = [
    { id: "weight", label: t("tabWeight") },
    { id: "linens", label: t("tabLinens") },
    { id: "ironing", label: t("tabIroning") },
    { id: "pcs", label: t("tabPcs") },
    { id: "dryclean", label: t("tabDryclean") }
  ];

  const categoryInfo = {
    weight: {
      image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: t("tabWeight"),
      desc: t("descWeight"),
      data: priceData.weight
    },
    linens: {
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: t("tabLinens"),
      desc: t("descLinens"),
      data: priceData.linen
    },
    ironing: {
      image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: t("tabIroning"),
      desc: t("descIroning"),
      data: priceData.ironing
    },
    pcs: {
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: t("tabPcs"),
      desc: t("descPcs"),
      data: priceData.garments
    },
    dryclean: {
      image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: t("tabDryclean"),
      desc: t("descDryclean"),
      data: priceData.dryclean
    }
  };

  const PriceCard = ({ item }) => {
    const cnTranslations = {
      // Weight categories
      "Wash / Fold": "洗涤与折叠",
      "Wash / Iron & Fold": "洗涤、熨烫与折叠",
      "Wash / Iron & Hang": "洗涤、熨烫与挂起",

      // Garments / Ironing / Dry cleaning items
      "Shirt": "衬衫",
      "Polo-Tee": "Polo衫",
      "Polo/ T-Shirt": "Polo衫/T恤",
      "Polo/T-Shirt": "Polo衫/T恤",
      "Dress": "连衣裙",
      "Elegant Dress": "精美礼服",
      "Silk Dress": "真丝连衣裙",
      "Trousers": "西裤/长裤",
      "Trouser": "西裤/长裤",
      "Jeans": "牛仔裤",
      "Blouse": "女衬衫",
      "Blouse ": "女衬衫",
      "Short": "短裤",
      "Short ": "短裤",
      "Skirt": "半身裙",
      "Jacket": "夹克",
      "Under Garments": "内衣裤",
      "Socks": "袜子",
      "Ironing Only (All Items)": "仅限熨烫 (所有衣物)",
      
      // Linens
      "Pillow Case": "枕套",
      "Duvet Cover (6.0FT King)": "被套 (6.0尺 特大床)",
      "Duvet Cover (5.0FT Queen)": "被套 (5.0尺 大床)",
      "Duvet Cover (3.5FT Single)": "被套 (3.5尺 单人床)",
      "Duvet (6.0FT King)": "羽绒被 (6.0尺 特大床)",
      "Duvet (5.0FT Queen)": "羽绒被 (5.0尺 大床)",
      "Duvet (3.5FT Single)": "羽绒被 (3.5尺 单人床)",
      "Bolster Case": "长抱枕套",
      "Bed Sheets (6.0FT King)": "床单 (6.0尺 特大床)",
      "Bed Sheets (5.0FT Queen)": "床单 (5.0尺 大床)",
      "Bed Sheets (3.5FT Single)": "床单 (3.5尺 单人床)",
      "Topper (6.0FT King)": "床垫保护垫 (6.0尺 特大床)",
      "Topper (5.0FT Queen)": "床垫保护垫 (5.0尺 大床)",
      "Topper (3.5FT Single)": "床垫保护垫 (3.5尺 单人床)",
      "Comforter/Protector (6.0FT King)": "舒适被/保护套 (6.0尺 特大床)",
      "Comforter/Protector (5.0FT Queen)": "舒适被/保护套 (5.0尺 大床)",
      "Comforter/Protector (3.5FT Single)": "舒适被/保护套 (3.5尺 单人床)",
      "Bolster": "长抱枕",
      "Pillow": "枕头",
      
      // Dry cleaning
      "Suit 3 Pcs": "西装三件套",
      "Suit 2 Pcs": "西装二件套",
      "Safari Suit 2 Pcs": "沙法利套装二件套",
      "Vest": "西装背心/马甲",
      "Neck-Tie": "领带",
      "Sweater": "针织衫/毛衣",
      "Scarf": "围巾",
      "Over Coat": "呢子大衣",
      "Coat": "外套"
    };

    let itemName = item.name;
    if (locale === "th" && item.name_th) {
      itemName = item.name_th;
    } else if (locale === "cn") {
      const cleanName = item.name ? item.name.trim() : "";
      itemName = cnTranslations[cleanName] || cnTranslations[item.name] || item.name;
    }

    let displayUnit = item.unit || t("unitLabel");
    if (locale === "th") {
      if (displayUnit.includes("piece")) {
        displayUnit = displayUnit.replace("piece", "ชิ้น");
      }
      if (displayUnit.includes("kg")) {
        displayUnit = displayUnit.replace("kg", "กิโลกรัม");
      }
    } else if (locale === "cn") {
      if (displayUnit.includes("piece")) {
        displayUnit = displayUnit.replace("piece", "件");
      }
      if (displayUnit.includes("kg")) {
        displayUnit = displayUnit.replace("kg", "公斤");
      }
    }

    return (
      <div className={styles.priceCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{itemName}</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.rateBox}>
            <div className={styles.rateLabel}>{t("normalRate")}</div>
            <div className={styles.ratePrice}>
              {item.nonMember}
              <span className={styles.rateUnit}>{displayUnit}</span>
            </div>
          </div>
          <div className={`${styles.rateBox} ${styles.member}`}>
            <div className={styles.rateLabel}>{t("memberRate")}</div>
            <div className={styles.ratePrice}>
              {item.member || "-"}
              <span className={styles.rateUnit}>{displayUnit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentCategory = categoryInfo[activeTab];

  return (
    <div className={styles.menuContainer}>
      <div className={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        <div className={styles.categorySection}>
          <div className={styles.categoryBanner}>
            <Image
              src={currentCategory.image}
              alt={currentCategory.title}
              fill
              unoptimized
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            <div className={styles.categoryBannerContent}>
              <h2 className={styles.categoryBannerTitle}>{currentCategory.title}</h2>
              <p className={styles.categoryBannerDesc}>
                {currentCategory.desc}
                {activeTab === "weight" && (
                  <strong style={{ fontSize: "1.45rem", fontWeight: "800", color: "#fff", display: "inline-block", marginLeft: "8px" }}>
                    ({t("minChargeWeight")})
                  </strong>
                )}
              </p>
            </div>
          </div>
          <div className={styles.cardGrid} style={{ padding: "0 2rem" }}>
            {currentCategory.data && currentCategory.data.length > 0 ? (
              currentCategory.data.map((item, idx) => (
                <PriceCard key={idx} item={item} />
              ))
            ) : (
              <p style={{ textAlign: "center", width: "100%", padding: "2rem", color: "var(--text-light)" }}>{t("noItems")}</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <Link href="/booking" className="btn btn-primary" style={{ padding: "1rem 3rem", fontSize: "1.2rem", boxShadow: "var(--shadow)" }}>
          {t("bookPickup")}
        </Link>
      </div>
    </div>
  );
}
