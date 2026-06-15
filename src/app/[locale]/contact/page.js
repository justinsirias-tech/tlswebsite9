import styles from "./page.module.css";
import Script from "next/script";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Contact" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: "https://www.thatlaundryshop.com/contact",
    }
  };
}

export default async function ContactPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Contact" });
  
  // LocalBusiness SEO Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "That Laundry Shop",
    "image": "https://www.thatlaundryshop.com/logo.png",
    "@id": "https://www.thatlaundryshop.com",
    "url": "https://www.thatlaundryshop.com/contact",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support"
    },
    "location": [
      {
        "@type": "LocalBusiness",
        "name": "That Laundry Shop - Head Office",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "140, One Pacific Place, #16-02, Sukhumvit Road, Khlong Toey",
          "addressLocality": "Bangkok",
          "postalCode": "10110",
          "addressCountry": "TH"
        }
      },
      {
        "@type": "LocalBusiness",
        "name": "That Laundry Shop - Sukhumvit Branch",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "12/500, 15 Sukhumvit Residences, Sukhumvit 13/15 North Klongtoey, Wattana",
          "addressLocality": "Bangkok",
          "postalCode": "10110",
          "addressCountry": "TH"
        }
      },
      {
        "@type": "LocalBusiness",
        "name": "That Laundry Shop - Phattanakarn Branch",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "1735, Kamphaeng Phet 7 Road, Unit B21, Suan Luang",
          "addressLocality": "Bangkok",
          "postalCode": "10250",
          "addressCountry": "TH"
        }
      },
      {
        "@type": "LocalBusiness",
        "name": "That Laundry Shop - Pattaya Branch",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "157/33 Soi Kho Pai 4, Non Prue, Bang Lamung",
          "addressLocality": "Chon Buri",
          "postalCode": "20150",
          "addressCountry": "TH"
        }
      }
    ]
  };

  return (
    <>
      <Script
        id="schema-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <div className="container">
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{t("contactBranches")}</h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-light)", maxWidth: "700px", margin: "0 auto" }}>
            {t("subtitle")}
          </p>
        </div>
      </div>

      <section className="section" style={{ background: "var(--background)", minHeight: "60vh" }}>
        <div className={`container ${styles.contactContainer}`}>
          
          {/* Global Contact Info (Full Width) */}
          <div className={styles.branchCard} style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, var(--primary) 0%, #1e293b 100%)', color: 'white' }}>
            <h2 className={styles.branchTitle} style={{ justifyContent: 'center', marginBottom: '2rem', color: 'white' }}>
              <i className="fa-solid fa-headset" style={{ color: 'var(--accent)' }}></i> {t("onlineContact")}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              
              {/* Hotline */}
              <div className={styles.contactItem}>
                <div className={styles.contactIcon} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}><i className="fa-solid fa-phone"></i></div>
                <div className={styles.contactDetails}>
                  <h4 style={{ color: 'rgba(255,255,255,0.7)' }}>{t("hotline")}</h4>
                  <a href="tel:+66946916668" style={{ color: 'white' }}>+66 94 691 6668</a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className={styles.contactItem}>
                <div className={styles.contactIcon} style={{ background: 'rgba(255,255,255,0.1)', color: '#25D366' }}><i className="fa-brands fa-whatsapp"></i></div>
                <div className={styles.contactDetails}>
                  <h4 style={{ color: 'rgba(255,255,255,0.7)' }}>{t("whatsapp")}</h4>
                  <a href="https://wa.me/message/7BO67YACZI6SH1" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>{t("messageUs")}</a>
                </div>
              </div>

              {/* LINE */}
              <div className={styles.contactItem}>
                <div className={styles.contactIcon} style={{ background: 'rgba(255,255,255,0.1)', color: '#00B900' }}><i className="fa-brands fa-line"></i></div>
                <div className={styles.contactDetails}>
                  <h4 style={{ color: 'rgba(255,255,255,0.7)' }}>{t("line")}</h4>
                  <a href="https://lin.ee/B2monGQ" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>@ThatLaundryShop</a>
                </div>
              </div>

              {/* Email */}
              <div className={styles.contactItem}>
                <div className={styles.contactIcon} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}><i className="fa-solid fa-envelope"></i></div>
                <div className={styles.contactDetails}>
                  <h4 style={{ color: 'rgba(255,255,255,0.7)' }}>{t("email")}</h4>
                  <a href="mailto:sales@thatlaundryshop.com" style={{ color: 'white' }}>{t("emailUs")}</a>
                </div>
              </div>

              {/* Facebook */}
              <div className={styles.contactItem}>
                <div className={styles.contactIcon} style={{ background: 'rgba(255,255,255,0.1)', color: '#1877F2' }}><i className="fa-brands fa-facebook"></i></div>
                <div className={styles.contactDetails}>
                  <h4 style={{ color: 'rgba(255,255,255,0.7)' }}>{t("facebook")}</h4>
                  <a href="https://www.facebook.com/thatlaundryshop" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>That Laundry Shop</a>
                </div>
              </div>

              {/* Instagram */}
              <div className={styles.contactItem}>
                <div className={styles.contactIcon} style={{ background: 'rgba(255,255,255,0.1)', color: '#E1306C' }}><i className="fa-brands fa-instagram"></i></div>
                <div className={styles.contactDetails}>
                  <h4 style={{ color: 'rgba(255,255,255,0.7)' }}>{t("instagram")}</h4>
                  <a href="https://www.instagram.com/thatlaundryshop/" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>@ThatLaundryShop</a>
                </div>
              </div>

            </div>
          </div>

          {/* Head Office */}
          <div className={styles.branchCard}>
            <h2 className={styles.branchTitle}>
              <i className="fa-solid fa-building"></i> {t("headOffice")}
            </h2>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><i className="fa-solid fa-location-dot"></i></div>
                <div className={styles.contactDetails}>
                  <h4>{t("addressLabel")}</h4>
                  <p>
                    {locale === "th" 
                      ? "140 อาคารวันแปซิฟิกเพลส ชั้น 16 ห้อง 1602 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                      : "140, One Pacific Place, #16-02, Sukhumvit Road, Khlong Toey, Bangkok 10110"}
                  </p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><i className="fa-solid fa-clock"></i></div>
                <div className={styles.contactDetails}>
                  <h4>{t("officeHoursLabel")}</h4>
                  <p>
                    {locale === "th" 
                      ? "วันจันทร์ - วันศุกร์\n09:00 - 18:00\n" 
                      : "Monday - Friday\n09:00 - 18:00\n"}
                    <span style={{color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600}}>{t("closedHolidays")}</span>
                  </p>
                </div>
              </div>
            </div>
            <a 
              href="https://maps.app.goo.gl/P3tivFLR57LNAsWo7" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline" 
              style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "center", gap: "0.5rem" }}
            >
              <i className="fa-solid fa-map-location-dot"></i> {t("googleMapsBtn")}
            </a>
          </div>

          {/* Sukhumvit Branch */}
          <div className={styles.branchCard}>
            <h2 className={styles.branchTitle}>
              <i className="fa-solid fa-store"></i> {t("sukhumvitBranch")}
            </h2>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><i className="fa-solid fa-location-dot"></i></div>
                <div className={styles.contactDetails}>
                  <h4>{t("addressLabel")}</h4>
                  <p>
                    {locale === "th"
                      ? "12/500 คอนโด 15 สุขุมวิท เรสซิเดนเซส ซอยสุขุมวิท 13/15 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110"
                      : "12/500, 15 Sukhumvit Residences, Sukhumvit 13/15, North Klongtoey, Wattana, Bangkok 10110"}
                  </p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><i className="fa-solid fa-clock"></i></div>
                <div className={styles.contactDetails}>
                  <h4>{t("hoursLabel")}</h4>
                  <p>
                    {locale === "th"
                      ? "วันจันทร์ - วันอาทิตย์\n09:00 - 19:00\n"
                      : "Monday - Sunday\n09:00 - 19:00\n"}
                    <span style={{color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600}}>{t("closedHolidays")}</span>
                  </p>
                </div>
              </div>
            </div>
            <a 
              href="https://maps.app.goo.gl/viSpR5JkawVEFxwAA" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline" 
              style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "center", gap: "0.5rem" }}
            >
              <i className="fa-solid fa-map-location-dot"></i> {t("googleMapsBtn")}
            </a>
          </div>

          {/* Phattanakarn Branch */}
          <div className={styles.branchCard}>
            <h2 className={styles.branchTitle}>
              <i className="fa-solid fa-store"></i> {t("phattanakarnBranch")}
            </h2>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><i className="fa-solid fa-location-dot"></i></div>
                <div className={styles.contactDetails}>
                  <h4>{t("addressLabel")}</h4>
                  <p>
                    {locale === "th"
                      ? "1735 ถนนกำแพงเพชร 7 ยูนิต B21 แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250"
                      : "1735, Kamphaeng Phet 7 Road, Unit B21, Suan Luang, Bangkok 10250"}
                  </p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><i className="fa-solid fa-clock"></i></div>
                <div className={styles.contactDetails}>
                  <h4>{t("hoursLabel")}</h4>
                  <p>
                    {locale === "th"
                      ? "วันจันทร์ - วันอาทิตย์\n09:00 - 19:00\n"
                      : "Monday - Sunday\n09:00 - 19:00\n"}
                    <span style={{color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600}}>{t("closedHolidays")}</span>
                  </p>
                </div>
              </div>
            </div>
            <a 
              href="https://maps.app.goo.gl/FG2X7nUz7jqvwje38" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline" 
              style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "center", gap: "0.5rem" }}
            >
              <i className="fa-solid fa-map-location-dot"></i> {t("googleMapsBtn")}
            </a>
          </div>

          {/* Pattaya Branch */}
          <div className={styles.branchCard}>
            <h2 className={styles.branchTitle}>
              <i className="fa-solid fa-store"></i> {t("pattayaBranch")}
            </h2>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><i className="fa-solid fa-location-dot"></i></div>
                <div className={styles.contactDetails}>
                  <h4>{t("addressLabel")}</h4>
                  <p>
                    {locale === "th"
                      ? "157/33 ซอยกอไผ่ 4 ต.หนองปรือ อ.บางละมุง จ.ชลบุรี 20150"
                      : "157/33 Soi Kho Pai 4, Nong Prue, Bang Lamung, Chon Buri 20150"}
                  </p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><i className="fa-solid fa-clock"></i></div>
                <div className={styles.contactDetails}>
                  <h4>{t("hoursLabel")}</h4>
                  <p>
                    {locale === "th"
                      ? "วันจันทร์ - วันอาทิตย์\n09:00 - 19:00\n"
                      : "Monday - Sunday\n09:00 - 19:00\n"}
                    <span style={{color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600}}>{t("closedHolidays")}</span>
                  </p>
                </div>
              </div>
            </div>
            <a 
              href="https://maps.app.goo.gl/RgaazUQTRY5jwhGi7" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline" 
              style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "center", gap: "0.5rem" }}
            >
              <i className="fa-solid fa-map-location-dot"></i> {t("googleMapsBtn")}
            </a>
          </div>

        </div>
      </section>
    </>
  );
}
