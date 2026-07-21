import styles from "./page.module.css";
import Script from "next/script";
import Link from "next/link";
import prisma from "../../../lib/prisma";
import DirectorySearch from "../../../components/DirectorySearch";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'cn' }];
}

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const locale = resolvedParams.locale;
    const t = await getTranslations({ locale, namespace: "Hotels" });

    return {
      title: t("metaTitle"),
      description: t("metaDesc"),
      alternates: {
        canonical: `https://www.thatlaundryshop.com/${locale}/hotels`,
      }
    };
  } catch (error) {
    return { title: "Hotels | That Laundry Shop" };
  }
}

export default async function HotelsPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";

  try {
    const t = await getTranslations({ locale, namespace: "Hotels" });
    
    let hotelsData = [];
    try {
      hotelsData = await Promise.race([
        prisma.location.findMany(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
      ]);
    } catch (err) {
      console.error("Hotels DB query failed or timed out, retrying:", err);
      try {
        hotelsData = await prisma.location.findMany();
      } catch (retryErr) {
        console.error("Hotels DB retry failed:", retryErr);
        hotelsData = [];
      }
    }

    const hotelsAndApts = (hotelsData || []).filter(h => h.type === "hotel" || h.type === "apartment");

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": t("title"),
      "description": t("metaDesc"),
    };

    return (
      <>
        <Script
          id="schema-hotels"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className={styles.header}>
          <div className="container">
            <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{t("title")}</h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-light)", maxWidth: "700px", margin: "0 auto" }}>
              {t("subtitle")}
            </p>
          </div>
        </div>

        <section className="section" style={{ background: "var(--background)", minHeight: "60vh" }}>
          <div className={`container ${styles.hotelsContainer}`}>
            <div style={{ marginBottom: "4rem" }}>
              <DirectorySearch locations={hotelsAndApts} basePath="/hotels" />
            </div>

            <article className={styles.seoArticle} style={{ marginTop: "4rem", padding: "3rem", background: "var(--surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
              <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "var(--primary)" }}>{t("articleTitle")}</h2>
              <p style={{ marginBottom: "1rem", lineHeight: "1.8", color: "var(--text)" }}>
                {t("articleP1")}
              </p>
              <p style={{ marginBottom: "1rem", lineHeight: "1.8", color: "var(--text)" }}>
                {t("articleP2")}
              </p>
              <h3 style={{ fontSize: "1.5rem", marginTop: "2rem", marginBottom: "1rem", color: "var(--primary)" }}>{t("articleH3")}</h3>
              <ul style={{ listStyleType: "none", padding: 0, marginBottom: "2rem" }}>
                <li style={{ marginBottom: "0.8rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <i className="fa-solid fa-check-circle" style={{ color: "var(--accent)", marginTop: "4px" }}></i>
                  <span>{t("articleL1")}</span>
                </li>
                <li style={{ marginBottom: "0.8rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <i className="fa-solid fa-check-circle" style={{ color: "var(--accent)", marginTop: "4px" }}></i>
                  <span>{t("articleL2")}</span>
                </li>
                <li style={{ marginBottom: "0.8rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <i className="fa-solid fa-check-circle" style={{ color: "var(--accent)", marginTop: "4px" }}></i>
                  <span>{t("articleL3")}</span>
                </li>
              </ul>
              <p style={{ lineHeight: "1.8", color: "var(--text)", fontStyle: "italic" }}>
                {t("articleFooter")}
              </p>
            </article>

          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error("Fatal error rendering HotelsPage:", error);
    return (
      <section className="section" style={{ background: "var(--background)", minHeight: "60vh", paddingTop: "8rem" }}>
        <div className="container">
          <div style={{ marginBottom: "4rem" }}>
            <DirectorySearch locations={[]} basePath="/hotels" />
          </div>
        </div>
      </section>
    );
  }
}
