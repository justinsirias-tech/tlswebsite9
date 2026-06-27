import styles from "./page.module.css";
import Link from "next/link";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import MembershipSection from "./MembershipSection";

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
            
            <MembershipSection 
              locale={locale}
              translations={{
                silverTier: t("silverTier"),
                silverPrice: t("silverPrice"),
                goldTier: t("goldTier"),
                goldPrice: t("goldPrice"),
                vipTier: t("vipTier"),
                vipPrice: t("vipPrice"),
                memberDesc: t("memberDesc"),
                advancePayment6: t("advancePayment6"),
                advancePayment12: t("advancePayment12"),
                oneMonthFree: t("oneMonthFree"),
                twoMonthsFree: t("twoMonthsFree"),
                joinSilver: t("joinSilver"),
                joinGold: t("joinGold"),
                joinVip: t("joinVip"),
                benefitRates: t("benefitRates"),
                benefitDryClean5: t("benefitDryClean5"),
                benefitPriority: t("benefitPriority"),
                benefitTransport: t("benefitTransport"),
                benefitDuvet: t("benefitDuvet"),
                formTitle: t("formTitle"),
                formDesc: t("formDesc"),
                formName: t("formName"),
                formEmail: t("formEmail"),
                formPhone: t("formPhone"),
                formPackage: t("formPackage"),
                formTerm: t("formTerm"),
                formDob: t("formDob"),
                formAddress: t("formAddress"),
                formRoomNo: t("formRoomNo"),
                formNotes: t("formNotes"),
                formConfidentiality: t("formConfidentiality"),
                formAddressPlaceholder: t("formAddressPlaceholder"),
                formSubmit: t("formSubmit"),
                formSubmitting: t("formSubmitting"),
                formSuccessTitle: t("formSuccessTitle"),
                formSuccessDesc: t("formSuccessDesc"),
                formClose: t("formClose")
              }}
              silverPriceVal={silverPriceVal}
              goldPriceVal={goldPriceVal}
              vipPriceVal={vipPriceVal}
            />
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
