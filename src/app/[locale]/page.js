import styles from "./page.module.css";
import { Link } from "../../i18n/routing";
import Script from "next/script";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Home");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DryCleaningOrLaundry",
    "name": "That Laundry Shop",
    "image": "https://www.thatlaundryshop.com/assets/hero_laundry.png",
    "@id": "https://www.thatlaundryshop.com",
    "url": "https://www.thatlaundryshop.com",
    "telephone": "+6621234567",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Sukhumvit Road",
      "addressLocality": "Bangkok",
      "addressRegion": "BKK",
      "postalCode": "10110",
      "addressCountry": "TH"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 13.7563,
      "longitude": 100.5018
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "08:00",
      "closes": "20:00"
    },
    "priceRange": "$$"
  };

  return (
    <>
      <Script
        id="schema-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{t('heroTitle')}</h1>
            <p className={styles.heroSubtitle}>
              {t('heroSubtitle')}
            </p>
            <div className={styles.heroActions}>
              <Link href="/booking" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
                {t('schedulePickup')} <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <Link href="/services" className="btn btn-outline" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
                {t('viewServices')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{t('goldStandardTitle')}</h2>
            <p style={{ color: "var(--text-light)", fontSize: "1.1rem" }}>
              {t('goldStandardDesc')}
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <i className="fa-solid fa-leaf"></i>
              </div>
              <h3 className={styles.featureTitle}>{t('ecoFriendlyTitle')}</h3>
              <p style={{ color: "var(--text-light)" }}>{t('ecoFriendlyDesc')}</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <h3 className={styles.featureTitle}>{t('turnaroundTitle')}</h3>
              <p style={{ color: "var(--text-light)" }}>{t('turnaroundDesc')}</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <i className="fa-solid fa-shirt"></i>
              </div>
              <h3 className={styles.featureTitle}>{t('artisanalTitle')}</h3>
              <p style={{ color: "var(--text-light)" }}>{t('artisanalDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 style={{ fontSize: "3rem", marginBottom: "1.5rem", color: "white" }}>{t('ctaTitle')}</h2>
            <p style={{ fontSize: "1.2rem", marginBottom: "2.5rem", opacity: 0.9 }}>
              {t('ctaDesc')}
            </p>
            <Link href="/booking" className="btn btn-accent" style={{ padding: "1rem 3rem", fontSize: "1.2rem" }}>
              {t('ctaButton')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
