import styles from "../hotels/page.module.css";
import Script from "next/script";
import Link from "next/link";
import prisma from "../../../lib/prisma";
import DirectorySearch from "../../../components/DirectorySearch";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Serviced Condominiums | That Laundry Shop",
  description: "View the list of premium residential condominiums in Bangkok and Pattaya that partner with That Laundry Shop for professional garment care.",
  alternates: {
    canonical: "https://www.thatlaundryshop.com/condominiums",
  }
};

export default async function CondominiumsPage() {
  const hotelsData = await prisma.location.findMany();
  
  // SEO Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Serviced Condominiums in Bangkok & Pattaya",
    "description": "List of premium condominiums serviced by That Laundry Shop.",
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
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>Serviced Condominiums</h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-light)", maxWidth: "700px", margin: "0 auto" }}>
            We provide premium laundry and dry cleaning services directly to residents living in the most exclusive condominiums in Thailand.
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
