import styles from "./page.module.css";
import Script from "next/script";
import PricingTabs from "./PricingTabs";
import prisma from "../../../lib/prisma";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  try {
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
  } catch (error) {
    return { title: "Pricing | That Laundry Shop" };
  }
}

export default async function PricingPage({ params }) {
  try {
    const resolvedParams = await params;
    const locale = resolvedParams.locale;
    const t = await getTranslations({ locale, namespace: "Pricing" });
    const allPricing = await prisma.pricing.findMany();
    
    const sortPricingItems = (items) => {
      const toppers = [];
      const others = [];
      items.forEach(item => {
        if (item.name && item.name.toLowerCase().includes("topper")) {
          toppers.push(item);
        } else {
          others.push(item);
        }
      });
      toppers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return [...others, ...toppers];
    };

    // Group pricing by category for PricingTabs
    const priceData = {
      weight: allPricing.filter(p => p.category === "weight"),
      garments: allPricing.filter(p => p.category === "garments"),
      linen: sortPricingItems(allPricing.filter(p => p.category === "linen")),
      ironing: allPricing.filter(p => p.category === "ironing"),
      dryclean: allPricing.filter(p => p.category === "dryclean"),
    };
    
    // Dynamically build the SEO Schema
    const schemaOffers = [];
    let position = 1;
    
    schemaOffers.push({
      "@type": "Offer",
      "position": position++,
      "name": "Wash & Fold (Per kg)",
      "price": "172.00",
      "priceCurrency": "THB"
    });

    schemaOffers.push({
      "@type": "Offer",
      "position": position++,
      "name": "Ironing Only",
      "price": "40.00",
      "priceCurrency": "THB"
    });

    schemaOffers.push({
      "@type": "Offer",
      "position": position++,
      "name": "Dry Cleaning",
      "price": "450.00",
      "priceCurrency": "THB"
    });

    priceData.garments.forEach(item => {
      const priceVal = typeof item.nonMember === 'number' ? item.nonMember.toFixed(2) : String(item.nonMember || '0');
      schemaOffers.push({
        "@type": "Offer",
        "position": position++,
        "name": `Garment - ${locale === "th" && item.name_th ? item.name_th : item.name}`,
        "price": priceVal,
        "priceCurrency": "THB"
      });
    });

    priceData.linen.forEach(item => {
      const priceVal = typeof item.nonMember === 'number' ? item.nonMember.toFixed(2) : String(item.nonMember || '0');
      schemaOffers.push({
        "@type": "Offer",
        "position": position++,
        "name": `Linen - ${locale === "th" && item.name_th ? item.name_th : item.name}`,
        "price": priceVal,
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
  } catch (error) {
    return (
      <div style={{ padding: "10rem 2rem", background: "white", color: "red", minHeight: "100vh" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Pricing Page Error</h1>
          <p style={{ fontWeight: "bold" }}>Error: {error.message}</p>
          <pre style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "8px", overflowX: "auto", fontSize: "0.85rem" }}>
            {error.stack}
          </pre>
        </div>
      </div>
    );
  }
}
