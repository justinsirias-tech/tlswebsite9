import styles from "./page.module.css";
import Link from "next/link";
import Script from "next/script";
import { getTranslations } from "next-intl/server";

const benefits = [
  { key: "benefitRates", tiers: { silver: true, gold: true, platinum: true } },
  { key: "benefitDryClean5", tiers: { silver: false, gold: true, platinum: true } },
  { key: "benefitPriority", tiers: { silver: false, gold: true, platinum: true } },
  { key: "benefitTransport", tiers: { silver: false, gold: false, platinum: true } },
  { key: "benefitDuvet", tiers: { silver: false, gold: false, platinum: true } }
];

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Promotions" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: "https://www.thatlaundryshop.com/promotions",
    }
  };
}

export default async function PromotionsPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Promotions" });

  const silverPriceVal = parseInt(t("silverPrice")) || 199;
  const goldPriceVal = parseInt(t("goldPrice")) || 299;
  const vipPriceVal = parseInt(t("vipPrice")) || 399;

  // JSON-LD SEO Schema for Promotions
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Laundry Service Memberships & Promotions",
    "description": "Exclusive memberships and seasonal laundry promotions at That Laundry Shop.",
  };

  return (
    <>
      <Script
        id="schema-promotions"
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

      <section className="section" style={{ background: "var(--background)" }}>
        <div className={`container ${styles.promoContainer}`}>
          
          {/* MEMBERSHIP PACKAGES SECTION */}
          <div>
            <h2 className={styles.sectionTitle}>{t("membershipPackages")}</h2>
            <p className={styles.sectionSubtitle}>{t("memberDesc")}</p>
            <p className={styles.sectionSubtitle} style={{ marginTop: "-2rem", color: "var(--accent)", fontWeight: "600", fontSize: "1.05rem" }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: "8px" }}></i>
              {t("advancePaymentNote")}
            </p>
            
            <div className={styles.membershipGrid}>
              
              {/* Silver Package */}
              <div className={styles.packageCard}>
                <div className={`${styles.creditCardGraphic} ${styles.silverCard}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardBrand}>That Laundry Shop</span>
                    <span className={styles.cardType}>{t("silverTier").toUpperCase()}</span>
                  </div>
                  <div className={styles.cardChip}>
                    <div className={styles.chipLine}></div>
                  </div>
                  <div className={styles.cardNumber}>1990 0000 0000 0199</div>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardFooterCol}>
                      <span className={styles.cardLabel}>PRICE</span>
                      <span className={styles.cardValue}>{t("silverPrice")} THB</span>
                    </div>
                    <div className={styles.cardFooterCol}>
                      <span className={styles.cardLabel}>PERIOD</span>
                      <span className={styles.cardValue}>Monthly</span>
                    </div>
                  </div>
                </div>
                <div className={styles.packageContent}>
                  <h3 className={styles.tierName}>{t("silverTier")}</h3>
                  <p className={styles.tierDesc}>{t("memberDesc")}</p>
                  
                  <div className={styles.advancePaymentOptions}>
                    <div className={styles.advanceOption}>
                      <span className={styles.advanceLabel}>{t("advancePayment6")}</span>
                      <span className={styles.advanceValue}>{(6 * silverPriceVal).toLocaleString()} THB</span>
                    </div>
                    <div className={styles.advanceOption}>
                      <span className={styles.advanceLabel}>{t("advancePayment12")}</span>
                      <span className={styles.advanceValue}>{(12 * silverPriceVal).toLocaleString()} THB</span>
                    </div>
                  </div>

                  <ul className={styles.tierFeatures}>
                    {benefits.filter(b => b.tiers.silver).map(b => (
                      <li key={b.key}>
                        <i className="fa-solid fa-circle-check"></i>
                        {t(b.key)}
                      </li>
                    ))}
                  </ul>
                  <Link href="/booking" className="btn btn-outline" style={{ width: "100%", marginTop: "auto" }}>
                    {t("joinSilver")}
                  </Link>
                </div>
              </div>

              {/* Gold Package */}
              <div className={styles.packageCard}>
                <div className={`${styles.creditCardGraphic} ${styles.goldCard}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardBrand}>That Laundry Shop</span>
                    <span className={styles.cardType}>{t("goldTier").toUpperCase()}</span>
                  </div>
                  <div className={styles.cardChip}>
                    <div className={styles.chipLine}></div>
                  </div>
                  <div className={styles.cardNumber}>2990 0000 0000 0299</div>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardFooterCol}>
                      <span className={styles.cardLabel}>PRICE</span>
                      <span className={styles.cardValue}>{t("goldPrice")} THB</span>
                    </div>
                    <div className={styles.cardFooterCol}>
                      <span className={styles.cardLabel}>PERIOD</span>
                      <span className={styles.cardValue}>Monthly</span>
                    </div>
                  </div>
                </div>
                <div className={styles.packageContent}>
                  <h3 className={styles.tierName}>{t("goldTier")}</h3>
                  <p className={styles.tierDesc}>{t("memberDesc")}</p>
                  
                  <div className={styles.advancePaymentOptions}>
                    <div className={styles.advanceOption}>
                      <span className={styles.advanceLabel}>{t("advancePayment6")}</span>
                      <span className={styles.advanceValue}>{(6 * goldPriceVal).toLocaleString()} THB</span>
                    </div>
                    <div className={styles.advanceOption}>
                      <span className={styles.advanceLabel}>
                        {t("advancePayment12")}
                        <span className={styles.freeBadge}>{t("oneMonthFree")}</span>
                      </span>
                      <span className={styles.advanceValue}>{(11 * goldPriceVal).toLocaleString()} THB</span>
                    </div>
                  </div>

                  <ul className={styles.tierFeatures}>
                    {benefits.filter(b => b.tiers.gold).map(b => (
                      <li key={b.key}>
                        <i className="fa-solid fa-circle-check"></i>
                        {t(b.key)}
                      </li>
                    ))}
                  </ul>
                  <Link href="/booking" className="btn btn-primary" style={{ width: "100%", marginTop: "auto" }}>
                    {t("joinGold")}
                  </Link>
                </div>
              </div>

              {/* Platinum Package */}
              <div className={styles.packageCard}>
                <div className={`${styles.creditCardGraphic} ${styles.vipCard}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardBrand}>That Laundry Shop</span>
                    <span className={styles.cardType}>{t("vipTier").toUpperCase()}</span>
                  </div>
                  <div className={styles.cardChip}>
                    <div className={styles.chipLine}></div>
                  </div>
                  <div className={styles.cardNumber}>3990 0000 0000 0399</div>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardFooterCol}>
                      <span className={styles.cardLabel}>PRICE</span>
                      <span className={styles.cardValue}>{t("vipPrice")} THB</span>
                    </div>
                    <div className={styles.cardFooterCol}>
                      <span className={styles.cardLabel}>PERIOD</span>
                      <span className={styles.cardValue}>Monthly</span>
                    </div>
                  </div>
                </div>
                <div className={styles.packageContent}>
                  <h3 className={styles.tierName}>{t("vipTier")}</h3>
                  <p className={styles.tierDesc}>{t("memberDesc")}</p>
                  
                  <div className={styles.advancePaymentOptions}>
                    <div className={styles.advanceOption}>
                      <span className={styles.advanceLabel}>{t("advancePayment6")}</span>
                      <span className={styles.advanceValue}>{(6 * vipPriceVal).toLocaleString()} THB</span>
                    </div>
                    <div className={styles.advanceOption}>
                      <span className={styles.advanceLabel}>
                        {t("advancePayment12")}
                        <span className={styles.freeBadge}>{t("twoMonthsFree")}</span>
                      </span>
                      <span className={styles.advanceValue}>{(10 * vipPriceVal).toLocaleString()} THB</span>
                    </div>
                  </div>

                  <ul className={styles.tierFeatures}>
                    {benefits.filter(b => b.tiers.platinum).map(b => (
                      <li key={b.key}>
                        <i className="fa-solid fa-circle-check"></i>
                        {t(b.key)}
                      </li>
                    ))}
                  </ul>
                  <Link href="/booking" className="btn btn-primary" style={{ width: "100%", marginTop: "auto", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderColor: "#1e293b" }}>
                    {t("joinVip")}
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* PROMOTIONS SECTION */}
          <div style={{ marginTop: "2rem" }}>
            <h2 className={styles.sectionTitle}>{t("currentPromos")}</h2>
            <div className={styles.promoBannerGrid}>
              
              {/* Promo 1 */}
              <div className={styles.promoBanner}>
                <div className={styles.promoTag}>{t("firstTime")}</div>
                <h3 className={styles.promoTitle}>{t("firstTimeTitle")}</h3>
                <p className={styles.promoDesc}>
                  {t("firstTimeDesc")}
                </p>
                <div className={styles.promoCode}>WELCOME20</div>
              </div>

              {/* Promo 2 */}
              <div className={styles.promoBanner} style={{ background: "linear-gradient(135deg, var(--accent) 0%, #1e293b 100%)" }}>
                <div className={styles.promoTag}>{t("seasonalDeal")}</div>
                <h3 className={styles.promoTitle}>{t("duvetTitle")}</h3>
                <p className={styles.promoDesc}>
                  {t("duvetDesc")}
                </p>
                <div className={styles.promoCode}>FREEDUVET</div>
              </div>

            </div>
          </div>

        </div>
      </section>
    </>
  );
}
