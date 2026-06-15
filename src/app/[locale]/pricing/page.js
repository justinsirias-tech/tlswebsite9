import styles from "./page.module.css";
import Script from "next/script";
import PricingTabs from "./PricingTabs";
import prisma from "../../../lib/prisma";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Pricing" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: "https://www.thatlaundryshop.com/pricing",
    }
  };
}

export default async function PricingPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  const allPricing = await prisma.pricing.findMany();
  
  // Group pricing by category for PricingTabs
  const priceData = {
    weight: allPricing.filter(p => p.category === "weight"),
    garments: allPricing.filter(p => p.category === "garments"),
    linen: allPricing.filter(p => p.category === "linen"),
    ironing: allPricing.filter(p => p.category === "ironing"),
    dryclean: allPricing.filter(p => p.category === "dryclean"),
  };
  
  // Dynamically build the SEO Schema
  const schemaOffers = [];
  let position = 1;
  
  // Wash & Fold base
  schemaOffers.push({
    "@type": "Offer",
    "position": position++,
    "name": "Wash & Fold (Per kg)",
    "price": "172.00",
    "priceCurrency": "THB"
  });

  // Ironing
  schemaOffers.push({
    "@type": "Offer",
    "position": position++,
    "name": "Ironing Only",
    "price": "40.00",
    "priceCurrency": "THB"
  });

  // Dry Cleaning
  schemaOffers.push({
    "@type": "Offer",
    "position": position++,
    "name": "Dry Cleaning",
    "price": "450.00",
    "priceCurrency": "THB"
  });

  priceData.garments.forEach(item => {
    schemaOffers.push({
      "@type": "Offer",
      "position": position++,
      "name": `Garment - ${locale === "th" && item.name_th ? item.name_th : item.name}`,
      "price": item.nonMember.toFixed(2),
      "priceCurrency": "THB"
    });
  });

  priceData.linen.forEach(item => {
    schemaOffers.push({
      "@type": "Offer",
      "position": position++,
      "name": `Linen - ${locale === "th" && item.name_th ? item.name_th : item.name}`,
      "price": item.nonMember.toFixed(2),
      "priceCurrency": "THB"
    });
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Laundry Service Pricing Menu",
    "itemListElement": schemaOffers
  };

  return (
    <>
      <Script
        id="schema-pricing"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <div className="container">
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{t("pricingMenu")}</h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-light)", maxWidth: "600px", margin: "0 auto" }}>
            {t("subtitle")}
          </p>
        </div>
      </div>

      <section className="section" style={{ background: "var(--background)", minHeight: "60vh" }}>
        <div className="container">
          <PricingTabs priceData={priceData} locale={locale} />
        </div>
      </section>
    </>
  );
}
