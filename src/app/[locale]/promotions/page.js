import styles from "./page.module.css";
import Image from "next/image";
import Script from "next/script";
import prisma from "../../../lib/prisma";
import PromotionsClient from "./PromotionsClient";

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'cn' }];
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  return {
    title: locale === "th" 
      ? "โปรโมชั่นและข้อเสนอพิเศษ | That Laundry Shop" 
      : locale === "cn" 
        ? "优惠与特别活动 | That Laundry Shop" 
        : "Promotions & Special Deals | That Laundry Shop",
    description: locale === "th" 
      ? "รับข้อเสนอพิเศษ โปรโมชั่นประจำเดือน และโค้ดส่วนลดซักรีดและซักแห้งในกรุงเทพฯ และพัทยา"
      : locale === "cn"
        ? "获取曼谷和芭堤雅最新的每月洗衣干洗优惠与专属折扣码。"
        : "Discover monthly deals, flash discounts, and instant promo codes for laundry and dry cleaning in Bangkok and Pattaya.",
    alternates: {
      canonical: "https://www.thatlaundryshop.com/promotions",
    }
  };
}

async function getPromotions() {
  try {
    const promos = await prisma.promotion.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ]
    });
    return promos;
  } catch (err) {
    console.error("Failed to load promotions from DB:", err);
    return [];
  }
}

export default async function PromotionsPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || 'en';

  const dbPromotions = await getPromotions();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": locale === "th" ? "โปรโมชั่นและข้อเสนอพิเศษ" : locale === "cn" ? "优惠与特别活动" : "Promotions & Special Deals",
    "description": "Monthly laundry promotions and discount codes at That Laundry Shop.",
    "publisher": {
      "@type": "Organization",
      "name": "That Laundry Shop"
    }
  };

  return (
    <>
      <Script
        id="schema-promotions"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <div className={styles.header}>
        <Image
          src="/assets/hero_bg_v2.webp"
          alt="That Laundry Shop Special Deals & Promotions"
          fill
          priority
          unoptimized
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className={styles.headerOverlay}></div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", fontWeight: "800", color: "white" }}>
            {locale === "th" ? "โปรโมชั่นและข้อเสนอพิเศษ" : locale === "cn" ? "优惠与特别活动" : "Promotions & Special Deals"}
          </h1>
          <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.9)", maxWidth: "700px", margin: "0 auto", fontWeight: "400", lineHeight: "1.6" }}>
            {locale === "th" 
              ? "รับข้อเสนอพิเศษประจำเดือน โค้ดส่วนลด และสิทธิประโยชน์สำหรับการดูแลเสื้อผ้าในกรุงเทพฯ และพัทยา" 
              : locale === "cn"
                ? "探索曼谷与芭堤雅每月最新洗衣干洗优惠、限时折扣与专属优惠码。"
                : "Discover our monthly deals, flash discounts, and instant promo codes for laundry & dry cleaning in Bangkok and Pattaya."}
          </p>
        </div>
      </div>

      <section className="section" style={{ backgroundColor: "#f8fafc" }}>
        <div className={styles.promoContainer}>
          <PromotionsClient locale={locale} initialPromotions={dbPromotions} />
        </div>
      </section>
    </>
  );
}
