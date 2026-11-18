"use client";

import { useState, useMemo } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const ITEM_IMAGES = {
  // Weight services
  "wash/fold": "/assets/wash_and_fold.webp",
  "wash / fold": "/assets/wash_and_fold.webp",
  "wash/iron/fold": "/assets/service_ironing.webp",
  "wash / iron & fold": "/assets/service_ironing.webp",
  "wash / iron & hang": "/assets/dry_clean.webp",
  "wash/iron/hang": "/assets/dry_clean.webp",

  // Garments, Ironing & Dry Cleaning
  "blouse": "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=300&q=80",
  "coat": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=300&q=80",
  "over coat": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80",
  "dress": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80",
  "elegant dress": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=300&q=80",
  "silk dress": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=300&q=80",
  "jacket": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80",
  "jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=300&q=80",
  "neck-tie": "https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=300&q=80",
  "polo-tee": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
  "polo/t-shirt": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
  "polo/ t-shirt": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
  "safari suit 2 pcs": "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=300&q=80",
  "scarf": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=300&q=80",
  "shirt": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80",
  "short": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=300&q=80",
  "skirt": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=300&q=80",
  "socks": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=300&q=80",
  "suit 2 pcs": "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=300&q=80",
  "suit 3 pcs": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80",
  "sweater": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=300&q=80",
  "trousers": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80",
  "trouser": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80",
  "under garments": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=300&q=80",
  "vest": "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=300&q=80",
};

function getItemImage(name, categoryId) {
  const clean = (name || "").trim().toLowerCase();
  if (ITEM_IMAGES[clean]) return ITEM_IMAGES[clean];

  // Pattern matching for sized linens and variations
  if (clean.includes("bed sheet")) return "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80";
  if (clean.includes("duvet cover")) return "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=300&q=80";
  if (clean.includes("duvet")) return "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=80";
  if (clean.includes("comforter")) return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80";
  if (clean.includes("mattress protector") || clean.includes("protector")) return "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=300&q=80";
  if (clean.includes("topper")) return "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80";
  if (clean.includes("pillow case")) return "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=300&q=80";
  if (clean.includes("pillow")) return "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80";
  if (clean.includes("bolster")) return "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80";

  // Category fallbacks
  if (categoryId === "weight") return "/assets/wash_and_fold.webp";
  if (categoryId === "linens") return "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80";
  if (categoryId === "ironing") return "/assets/service_ironing.webp";
  if (categoryId === "dryclean") return "/assets/dry_clean.webp";
  return "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80";
}

function getItemDescription(name, categoryId, locale) {
  const clean = (name || "").trim().toLowerCase();
  if (clean === "wash/fold" || clean === "wash / fold") {
    if (locale === "th") return "ซัก อบแห้ง และพับเรียบร้อย เหมาะสำหรับเสื้อผ้าใส่ประจำวัน";
    if (locale === "cn") return "日常衣物精洗、烘干并整齐折叠";
    return "Premium wash, temperature-controlled dry & neat fold";
  }
  if (clean === "wash/iron/fold" || clean === "wash / iron & fold") {
    if (locale === "th") return "ซัก อบแห้ง รีดเรียบด้วยมือ และพับพร้อมจัดเก็บ";
    if (locale === "cn") return "精洗、烘干、手工精熨并整齐折叠";
    return "Premium wash, hand-pressed & neatly folded for storage";
  }
  if (clean === "wash / iron & hang" || clean === "wash/iron/hang") {
    if (locale === "th") return "ซัก รีดเรียบด้วยมือ และส่งคืนพร้อมไม้แขวนพร้อมสวมใส่";
    if (locale === "cn") return "精洗、手工精熨并挂装送回，即穿免打理";
    return "Premium wash, artisanal hand-pressing & returned on hangers";
  }

  if (categoryId === "linens") {
    if (locale === "th") return "ซักทำความสะอาดล้ำลึก ฆ่าเชื้อโรค และอบนุ่มหอมสดชื่น";
    if (locale === "cn") return "高温深度除菌洗护，蓬松柔软清新";
    return "Hygienic deep-clean, allergen sanitization & crisp finish";
  }
  if (categoryId === "ironing") {
    if (locale === "th") return "บริการรีดเรียบด้วยไอน้ำถนอมใยผ้าโดยช่างผู้เชี่ยวชาญ";
    if (locale === "cn") return "专业匠人手工蒸汽精熨，挺括有型";
    return "Professional steam hand-pressing & crease perfection";
  }
  if (categoryId === "dryclean") {
    if (locale === "th") return "ซักแห้งระบบรักษ์โลก ถนอมเนื้อผ้าหรูและรูปทรงเสื้อผ้า";
    if (locale === "cn") return "欧洲环保溶剂干洗，呵护娇贵面料与版型";
    return "European eco-solvent dry cleaning & bespoke hand finishing";
  }
  if (locale === "th") return "ซักแยกชิ้นอย่างพิถีพิถัน พร้อมรีดเรียบระดับพรีเมียม";
  if (locale === "cn") return "单件独立精细洗护与专业手工熨烫";
  return "Individual piece care, gentle wash & hand-pressed finish";
}

const CN_TRANSLATIONS = {
  // Weight categories
  "Wash/Fold": "洗涤与折叠 (Wash / Fold)",
  "Wash / Fold": "洗涤与折叠 (Wash / Fold)",
  "Wash/Iron/Fold": "洗涤、熨烫与折叠 (Wash / Iron / Fold)",
  "Wash / Iron & Fold": "洗涤、熨烫与折叠 (Wash / Iron & Fold)",
  "Wash / Iron & Hang": "洗涤、熨烫与挂装 (Wash / Iron & Hang)",

  // Garments / Ironing / Dry cleaning items
  "Shirt": "衬衫",
  "Polo-Tee": "Polo衫/T恤",
  "Polo/ T-Shirt": "Polo衫/T恤",
  "Polo/T-Shirt": "Polo衫/T恤",
  "Polo/T-shirt": "Polo衫/T恤",
  "Dress": "连衣裙",
  "Elegant Dress": "晚礼服/精美礼服",
  "Silk Dress": "真丝连衣裙",
  "Trousers": "西裤/长裤",
  "Trouser": "西裤/长裤",
  "Jeans": "牛仔裤",
  "Blouse": "女式衬衫",
  "Short": "短裤",
  "Skirt": "半身裙",
  "Jacket": "夹克/外套",
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
  "Topper (6.0FT)": "床垫保护垫 (6.0尺 特大床)",
  "Topper (5.0FT Queen)": "床垫保护垫 (5.0尺 大床)",
  "Topper (5.0FT)": "床垫保护垫 (5.0尺 大床)",
  "Topper (3.5FT Single)": "床垫保护垫 (3.5尺 单人床)",
  "Comforter": "舒适被 (6.0尺 特大床)",
  "Comforter (5.0FT Queen)": "舒适被 (5.0尺 大床)",
  "Comforter (3.5FT Single)": "舒适被 (3.5尺 单人床)",
  "Comforter/Protector (6.0FT King)": "舒适被/保护套 (6.0尺 特大床)",
  "Comforter/Protector (5.0FT Queen)": "舒适被/保护套 (5.0尺 大床)",
  "Comforter/Protector (3.5FT Single)": "舒适被/保护套 (3.5尺 单人床)",
  "Mattress Protector (6.0FT King)": "床垫保护套 (6.0尺 特大床)",
  "Mattress Protector (5.0FT Queen)": "床垫保护套 (5.0尺 大床)",
  "Mattress Protector (3.5FT Single)": "床垫保护套 (3.5尺 单人床)",
  "Bolster": "长抱枕",
  "Pillow": "枕头",

  // Dry cleaning
  "Suit 3 Pcs": "西装三件套",
  "Suit 2 Pcs": "西装两件套",
  "Safari Suit 2 Pcs": "猎装/休闲西装两件套",
  "Vest": "西装马甲/背心",
  "Neck-Tie": "领带",
  "Sweater": "针织衫/毛衣",
  "Scarf": "围巾/丝巾",
  "Over Coat": "大衣/风衣",
  "Coat": "外套/大衣",
};

const TH_TRANSLATIONS = {
  "Wash/Fold": "ซัก อบ และพับ (Wash / Fold)",
  "Wash / Fold": "ซัก อบ และพับ (Wash / Fold)",
  "Wash/Iron/Fold": "ซัก รีด และพับ (Wash / Iron / Fold)",
  "Wash / Iron & Fold": "ซัก รีด และพับ (Wash / Iron & Fold)",
  "Wash / Iron & Hang": "ซัก รีด และแขวน (Wash / Iron & Hang)",
  "Shirt": "เสื้อเชิ้ต (Shirt)",
  "Polo-Tee": "เสื้อโปโล / เสื้อยืด (Polo-Tee)",
  "Polo/T-shirt": "เสื้อโปโล / เสื้อยืด (Polo/T-Shirt)",
  "Polo/ T-Shirt": "เสื้อโปโล / เสื้อยืด (Polo/T-Shirt)",
  "Dress": "ชุดเดรส (Dress)",
  "Elegant Dress": "ชุดราตรี / เดรสหรู (Elegant Dress)",
  "Silk Dress": "ชุดเดรสผ้าไหม (Silk Dress)",
  "Trousers": "กางเกงขายาว (Trousers)",
  "Jeans": "กางเกงยีนส์ (Jeans)",
  "Blouse": "เสื้อเบลาส์สตรี (Blouse)",
  "Short": "กางเกงขาสั้น (Short)",
  "Skirt": "กระโปรง (Skirt)",
  "Jacket": "เสื้อแจ็คเก็ต (Jacket)",
  "Under Garments": "ชุดชั้นใน (Under Garments)",
  "Socks": "ถุงเท้า (Socks)",
  "Suit 2 Pcs": "ชุดสูท 2 ชิ้น (Suit 2 Pcs)",
  "Suit 3 Pcs": "ชุดสูท 3 ชิ้น (Suit 3 Pcs)",
  "Safari Suit 2 Pcs": "ชุดซาฟารี 2 ชิ้น (Safari Suit 2 Pcs)",
  "Vest": "เสื้อกั๊กสูท (Vest)",
  "Neck-Tie": "เนคไท (Neck-Tie)",
  "Sweater": "เสื้อสเวตเตอร์ (Sweater)",
  "Scarf": "ผ้าพันคอ (Scarf)",
  "Over Coat": "เสื้อโอเวอร์โค้ท (Over Coat)",
  "Coat": "เสื้อโค้ท (Coat)",
  "Pillow": "หมอน (Pillow)",
  "Pillow Case": "ปลอกหมอน (Pillow Case)",
  "Bolster": "หมอนข้าง (Bolster)",
  "Bolster Case": "ปลอกหมอนข้าง (Bolster Case)",
  "Duvet Cover (6.0FT King)": "ปลอกผ้านวม (คิงไซส์ 6.0 ฟุต)",
  "Duvet Cover (5.0FT Queen)": "ปลอกผ้านวม (ควีนไซส์ 5.0 ฟุต)",
  "Duvet Cover (3.5FT Single)": "ปลอกผ้านวม (เตียงเดี่ยว 3.5 ฟุต)",
};

export default function PricingTabs({ priceData, locale }) {
  const [activeTab, setActiveTab] = useState("weight");
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations("Pricing");

  const tabs = [
    { id: "weight", label: t("tabWeight"), icon: "fa-scale-balanced" },
    { id: "linens", label: t("tabLinens"), icon: "fa-bed" },
    { id: "ironing", label: t("tabIroning"), icon: "fa-temperature-high" },
    { id: "pcs", label: t("tabPcs"), icon: "fa-shirt" },
    { id: "dryclean", label: t("tabDryclean"), icon: "fa-user-tie" }
  ];

  const categoryInfo = {
    weight: {
      image: "/assets/wash_and_fold.webp",
      title: t("tabWeight"),
      desc: t("descWeight"),
      data: priceData.weight
    },
    linens: {
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: t("tabLinens"),
      desc: t("descLinens"),
      data: priceData.linen
    },
    ironing: {
      image: "/assets/service_ironing.webp",
      title: t("tabIroning"),
      desc: t("descIroning"),
      data: priceData.ironing
    },
    pcs: {
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: t("tabPcs"),
      desc: t("descPcs"),
      data: priceData.garments
    },
    dryclean: {
      image: "/assets/dry_clean.webp",
      title: t("tabDryclean"),
      desc: t("descDryclean"),
      data: priceData.dryclean
    }
  };

  const currentCategory = categoryInfo[activeTab];

  // Helper to normalize spacing around slashes (e.g. "Wash/Fold" -> "Wash / Fold") for clean display & A-Z sorting
  const normalizeDisplayName = (rawName) => {
    return (rawName || "").trim().replace(/\s*\/\s*/g, " / ");
  };

  // Strictly sort items alphabetically (A -> Z) by normalized name and filter by search
  const sortedItems = useMemo(() => {
    const raw = Array.isArray(currentCategory?.data) ? currentCategory.data : [];
    const sorted = [...raw].sort((a, b) =>
      normalizeDisplayName(a.name).localeCompare(normalizeDisplayName(b.name), undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.trim().toLowerCase();
    return sorted.filter(item => {
      const cleanName = (item.name || "").trim();
      const normName = normalizeDisplayName(cleanName);
      const thName = TH_TRANSLATIONS[cleanName] || item.name_th || "";
      const cnName = CN_TRANSLATIONS[cleanName] || "";
      return (
        normName.toLowerCase().includes(q) ||
        cleanName.toLowerCase().includes(q) ||
        thName.toLowerCase().includes(q) ||
        cnName.toLowerCase().includes(q)
      );
    });
  }, [currentCategory, searchQuery]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery("");
  };

  const PriceRowCard = ({ item, index }) => {
    const cleanName = (item.name || "").trim();
    const normName = normalizeDisplayName(cleanName);
    let itemName = normName;
    if (locale === "th") {
      itemName = TH_TRANSLATIONS[cleanName] || TH_TRANSLATIONS[normName] || item.name_th || normName;
    } else if (locale === "cn") {
      itemName = CN_TRANSLATIONS[cleanName] || CN_TRANSLATIONS[normName] || CN_TRANSLATIONS[item.name] || normName;
    }

    let displayUnit = item.unit || t("unitLabel");
    if (!displayUnit.toUpperCase().includes("THB")) {
      displayUnit = `THB / ${displayUnit}`;
    }
    if (locale === "th") {
      displayUnit = displayUnit.replace(/piece/i, "ชิ้น").replace(/kg/i, "กก.");
    } else if (locale === "cn") {
      displayUnit = displayUnit.replace(/piece/i, "件").replace(/kg/i, "公斤");
    }

    const description = getItemDescription(cleanName, activeTab, locale);
    const normalVal = Number(item.nonMember) || 0;
    const memberVal = Number(item.member) || 0;
    const savings = normalVal > memberVal && memberVal > 0 ? normalVal - memberVal : 0;

    return (
      <div className={styles.menuRowCard}>
        {/* Left: Item Details */}
        <div className={styles.itemMediaWrap}>
          <div className={styles.itemDetails}>
            <div className={styles.itemTitleRow}>
              <h3 className={styles.itemTitle}>{itemName}</h3>
              {savings > 0 && (
                <span className={styles.savingsBadge}>
                  <i className="fa-solid fa-tag" style={{ fontSize: "0.7rem" }}></i>
                  {locale === "th"
                    ? `สมาชิกประหยัด ฿${savings}`
                    : locale === "cn"
                    ? `会员立省 ฿${savings}`
                    : `Member saves ฿${savings}`}
                </span>
              )}
            </div>
            <p className={styles.itemSubtitle}>{description}</p>
            <div className={styles.itemMetaRow}>
              <span className={styles.unitPill}>
                <i className="fa-regular fa-circle-check" style={{ color: "#0f766e" }}></i>
                {displayUnit}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Dual Normal & Member Rate Comparison */}
        <div className={styles.ratesGroup}>
          <div className={styles.rateBoxNormal}>
            <span className={styles.rateLabel}>{t("normalRate")}</span>
            <div className={styles.ratePrice}>
              <span className={styles.currencySymbol}>฿</span>
              {item.nonMember}
            </div>
            <span className={styles.rateUnit}>{displayUnit}</span>
          </div>

          <div className={styles.rateBoxMember}>
            <span className={styles.rateLabelMember}>{t("memberRate")}</span>
            <div className={styles.ratePriceMember}>
              <span className={styles.currencySymbolMember}>฿</span>
              {item.member || "-"}
            </div>
            <span className={styles.rateUnitMember}>{displayUnit}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.menuContainer}>
      {/* Category Navigation Pill Tabs */}
      <div className={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ""}`}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ marginRight: "0.5rem", fontSize: "0.95rem" }}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        <div className={styles.categorySection}>
          {/* Redesigned Editorial Category Header */}
          <div className={styles.categoryBanner}>
            <Image
              src={currentCategory.image}
              alt={currentCategory.title}
              fill
              unoptimized
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
            <div className={styles.categoryBannerContent}>
              <h2 className={styles.categoryBannerTitle}>{currentCategory.title}</h2>
              <p className={styles.categoryBannerDesc}>{currentCategory.desc}</p>

              {activeTab === "weight" && (
                <div className={styles.minChargeBadge}>
                  <i className="fa-solid fa-scale-balanced"></i>
                  <span>{t("minChargeWeight")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Menu List: Strictly Alphabetical with Picture Beside Each Item */}
          <div className={styles.menuListContainer}>
            {sortedItems.length > 0 ? (
              sortedItems.map((item, idx) => (
                <PriceRowCard key={`${item.id || item.name}-${idx}`} item={item} index={idx} />
              ))
            ) : (
              <p style={{ textAlign: "center", width: "100%", padding: "2.5rem", color: "var(--text-light)" }}>
                {t("noItems")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
        <Link href="/booking" className="btn btn-primary" style={{ padding: "1rem 3rem", fontSize: "1.15rem", boxShadow: "var(--shadow)" }}>
          {t("bookPickup")} <i className="fa-solid fa-arrow-right" style={{ marginLeft: "0.4rem" }}></i>
        </Link>
      </div>
    </div>
  );
}
