import styles from "../hotels/page.module.css";
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
    const t = await getTranslations({ locale, namespace: "Condominiums" });

    return {
      title: t("metaTitle"),
      description: t("metaDesc"),
      alternates: {
        canonical: `https://www.thatlaundryshop.com/${locale}/condominiums`,
      }
    };
  } catch (error) {
    return { title: "Condominiums | That Laundry Shop" };
  }
}

export default async function CondominiumsPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";

  try {
    const t = await getTranslations({ locale, namespace: "Condominiums" });
    
    let hotelsData = [];
    try {
      hotelsData = await Promise.race([
        prisma.location.findMany(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
      ]);
    } catch (err) {
      console.error("Condos DB query failed or timed out, retrying:", err);
      try {
        hotelsData = await prisma.location.findMany();
      } catch (retryErr) {
        console.error("Condos DB retry failed:", retryErr);
        hotelsData = [];
      }
    }

    const condos = (hotelsData || []).filter(h => h.type === "condo");

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": t("title"),
      "description": t("metaDesc"),
    };

    return (
      <>
        <Script
          id="schema-condos"
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
            <DirectorySearch locations={condos} basePath="/condominiums" />
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error("Fatal error rendering CondominiumsPage:", error);
    return (
      <section className="section" style={{ background: "var(--background)", minHeight: "60vh", paddingTop: "8rem" }}>
        <div className="container">
          <DirectorySearch locations={[]} basePath="/condominiums" />
        </div>
      </section>
    );
  }
}
