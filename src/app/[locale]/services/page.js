import styles from "./page.module.css";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Services" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: "https://www.thatlaundryshop.com/services",
    }
  };
}

export default async function ServicesPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Services" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "Service",
        "position": 1,
        "name": t("washFold"),
        "description": t("washFoldDesc")
      },
      {
        "@type": "Service",
        "position": 2,
        "name": t("dryClean"),
        "description": t("dryCleanDesc")
      },
      {
        "@type": "Service",
        "position": 3,
        "name": t("corpLaundry"),
        "description": t("corpLaundryDesc")
      }
    ]
  };

  return (
    <>
      <Script
        id="schema-services"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <div className="container">
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", color: "white" }}>{t("ourServices")}</h1>
          <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.9)", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            {t("ourServicesSubtitle")}
          </p>
        </div>
      </div>

      <section className="section" style={{ background: "var(--background)" }}>
        <div className="container">
          
          {/* Individual Services Section */}
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--primary)", fontWeight: "800" }}>{t("individualServices")}</h2>
            <div style={{ width: "60px", height: "4px", backgroundColor: "var(--accent)", margin: "1rem auto 1.5rem auto", borderRadius: "2px" }}></div>
            <p style={{ color: "#475569", fontSize: "1.1rem" }}>{t("individualSubtitle")}</p>
          </div>

          <div className={styles.serviceGrid}>
            <div className={`${styles.serviceCard} hover-lift`}>
              <div className={styles.serviceImage}>
                <Image src="/assets/wash_and_fold.webp" alt={t("washFold")} fill style={{ objectFit: "cover" }} sizes="(max-width: 992px) 100vw, 50vw" />
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{t("washFold")}</h3>
                <p className={styles.serviceDesc}>
                  {t("washFoldDesc")}
                </p>
                <Link href="/booking" className="btn btn-primary">{t("bookWashFold")}</Link>
              </div>
            </div>

            <div className={`${styles.serviceCard} hover-lift`}>
              <div className={styles.serviceImage}>
                <Image src="/assets/dry_clean.webp" alt={t("dryClean")} fill style={{ objectFit: "cover" }} sizes="(max-width: 992px) 100vw, 50vw" />
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{t("dryClean")}</h3>
                <p className={styles.serviceDesc}>
                  {t("dryCleanDesc")}
                </p>
                <Link href="/booking" className="btn btn-primary">{t("bookDryClean")}</Link>
              </div>
            </div>

            <div className={`${styles.serviceCard} hover-lift`}>
              <div className={styles.serviceImage}>
                <Image src="/assets/service_ironing.webp" alt={t("ironing")} fill style={{ objectFit: "cover" }} sizes="(max-width: 992px) 100vw, 50vw" />
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{t("ironing")}</h3>
                <p className={styles.serviceDesc}>
                  {t("ironingDesc")}
                </p>
                <Link href="/booking" className="btn btn-primary">{t("bookIroning")}</Link>
              </div>
            </div>

            <div className={`${styles.serviceCard} hover-lift`}>
              <div className={styles.serviceImage}>
                <Image src="/assets/service_carpet.webp" alt={t("carpet")} fill style={{ objectFit: "cover" }} sizes="(max-width: 992px) 100vw, 50vw" />
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{t("carpet")}</h3>
                <p className={styles.serviceDesc}>
                  {t("carpetDesc")}
                </p>
                <Link href="/booking" className="btn btn-primary">{t("bookCarpet")}</Link>
              </div>
            </div>
          </div>

          {/* Corporate Services Section */}
          <div style={{ textAlign: "center", marginTop: "7rem", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", color: "var(--primary)", fontWeight: "800" }}>{t("corporatePartners")}</h2>
            <div style={{ width: "60px", height: "4px", backgroundColor: "var(--accent)", margin: "1rem auto 1.5rem auto", borderRadius: "2px" }}></div>
            <p style={{ color: "#475569", fontSize: "1.1rem" }}>{t("corporateSubtitle")}</p>
          </div>

          <div className={styles.serviceGrid}>
            <div className={`${styles.serviceCard} hover-lift`}>
              <div className={styles.serviceImage}>
                <Image src="/assets/service_corporate.webp" alt={t("corpLaundry")} fill style={{ objectFit: "cover" }} sizes="(max-width: 992px) 100vw, 50vw" />
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{t("corpLaundry")}</h3>
                <p className={styles.serviceDesc}>
                  {t("corpLaundryDesc")}
                </p>
                <Link href="/contact" className="btn btn-outline">{t("partnerWithUs")}</Link>
              </div>
            </div>

            <div className={`${styles.serviceCard} hover-lift`}>
              <div className={styles.serviceImage}>
                <Image src="/assets/service_commercial.webp" alt={t("commLaundry")} fill style={{ objectFit: "cover" }} sizes="(max-width: 992px) 100vw, 50vw" />
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{t("commLaundry")}</h3>
                <p className={styles.serviceDesc}>
                  {t("commLaundryDesc")}
                </p>
                <Link href="/contact" className="btn btn-outline">{t("partnerWithUs")}</Link>
              </div>
            </div>

            <div className={`${styles.serviceCard} hover-lift`}>
              <div className={styles.serviceImage}>
                <Image src="/assets/service_hotel.webp" alt={t("hotelLaundry")} fill style={{ objectFit: "cover" }} sizes="(max-width: 992px) 100vw, 50vw" />
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{t("hotelLaundry")} <span style={{fontSize:"1rem", fontWeight:"400", opacity:0.8}}>{t("hotelLaundryPattayaOnly")}</span></h3>
                <p className={styles.serviceDesc}>
                  {t("hotelLaundryDesc")}
                </p>
                <Link href="/contact" className="btn btn-outline">{t("partnerWithUs")}</Link>
              </div>
            </div>

            <div className={`${styles.serviceCard} hover-lift`}>
              <div className={styles.serviceImage}>
                <Image src="/assets/service_fb.webp" alt={t("fbLaundry")} fill style={{ objectFit: "cover" }} sizes="(max-width: 992px) 100vw, 50vw" />
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{t("fbLaundry")}</h3>
                <p className={styles.serviceDesc}>
                  {t("fbLaundryDesc")}
                </p>
                <Link href="/contact" className="btn btn-outline">{t("partnerWithUs")}</Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
