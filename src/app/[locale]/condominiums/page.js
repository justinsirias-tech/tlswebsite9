import styles from "../hotels/page.module.css";
import Script from "next/script";
import Link from "next/link";
import prisma from "../../../lib/prisma";
import DirectorySearch from "../../../components/DirectorySearch";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
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
}

export default async function CondominiumsPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Condominiums" });
  
  const hotelsData = await prisma.location.findMany();
  
  // SEO Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t("title"),
    "description": t("metaDesc"),
  };

  const condos = hotelsData.filter(h => h.type === "condo");

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
}
