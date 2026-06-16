import prisma from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import styles from "../../hotels/[slug]/page.module.css";
import Link from "next/link";
import Script from "next/script";
import { getTranslations } from "next-intl/server";

// Generate static params so Next.js can pre-render these pages
export async function generateStaticParams() {
  try {
    const condos = await prisma.location.findMany({ where: { type: "condo" } });
    const locales = ['en', 'th', 'cn'];
    const params = [];
    for (const locale of locales) {
      for (const condo of condos) {
        params.push({
          locale,
          slug: condo.slug
        });
      }
    }
    return params;
  } catch (error) {
    console.error("Failed to generate static params at build time:", error);
    return [];
  }
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const condo = await prisma.location.findUnique({ where: { slug: resolvedParams.slug } });
  
  if (!condo) {
    return { title: "Condominium Not Found | That Laundry Shop" };
  }

  const name = locale === "th" && condo.name_th ? condo.name_th : condo.name;
  const city = locale === "th" && condo.city_th ? condo.city_th : condo.city;

  return {
    title: locale === "th"
      ? `บริการซักรีดสำหรับ ${name} | That Laundry Shop`
      : `Laundry Service for ${name} | That Laundry Shop`,
    description: locale === "th"
      ? `เพลิดเพลินกับบริการซักรีดและซักแห้งระดับพรีเมียมพร้อมบริการรับและส่งฟรีถึงหน้าประตูห้องชุดของคุณที่ ${name} ใน ${city}`
      : `Enjoy premium laundry and dry cleaning service with convenient pickup and delivery directly to your residence at ${name} in ${city}.`,
    alternates: {
      canonical: `https://www.thatlaundryshop.com/condominiums/${condo.slug}`,
    }
  };
}

export default async function CondoArticlePage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Directory" });

  const condo = await prisma.location.findUnique({ where: { slug: resolvedParams.slug } });

  if (!condo || condo.type !== "condo") {
    notFound();
  }

  // Get localized content
  const name = locale === "th" && condo.name_th ? condo.name_th : condo.name;
  const city = locale === "th" && condo.city_th ? condo.city_th : condo.city;
  const transport = locale === "th" && condo.transport_th ? condo.transport_th : condo.transport;
  const address = locale === "th" && condo.address_th ? condo.address_th : condo.address;
  const article = locale === "th" && condo.article_th ? condo.article_th : condo.article;
  const nearbyAmenities = locale === "th" && condo.nearbyAmenities_th && condo.nearbyAmenities_th.length > 0
    ? condo.nearbyAmenities_th
    : condo.nearbyAmenities;

  // Generate dynamic map embed URL (using English properties for map search stability)
  const mapQuery = encodeURIComponent(`${condo.name} ${condo.city} Thailand`);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // SEO Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Premium Laundry Service for ${condo.name} Residents`,
    "publisher": {
      "@type": "Organization",
      "name": "That Laundry Shop"
    }
  };

  return (
    <>
      <Script
        id={`schema-condo-${condo.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section with Condo Image */}
      <div 
        className={styles.heroSection} 
        style={{ backgroundImage: `url('${condo.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80"}')` }}
      >
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.hotelTitle}>{name}</h1>
          <div className={styles.hotelLocation}>
            <i className="fa-solid fa-location-dot"></i> {city}, {locale === "th" ? "ประเทศไทย" : "Thailand"}
          </div>
        </div>
      </div>

      <section className="section" style={{ background: "var(--background)", minHeight: "60vh", paddingTop: 0 }}>
        <div className={styles.mainGrid}>
          
          {/* Main Article Area */}
          <div className={styles.articleCard}>
            <div className={styles.articleContent}>
              
              {article ? (
                <div className="article-content" dangerouslySetInnerHTML={{ __html: article }} />
              ) : (
                <>
                  <h2>{locale === "th" ? `ยินดีต้อนรับสู่ ${name}` : `Welcome to ${name}`}</h2>
                  <p>
                    {locale === "th" ? (
                      `ในฐานะที่พักอาศัยระดับพรีเมียมในย่านใจกลางเมือง ${city} โครงการ <strong>${name}</strong> มอบมาตรฐานการใช้ชีวิตที่เหนือระดับแก่ผู้อยู่อาศัย ด้วยสิ่งอำนวยความสะดวกระดับโลกและการออกแบบที่โดดเด่น ทุกรายละเอียดของบ้านคุณจึงงดงามตระการตา ขณะที่คุณใช้เวลาไปกับการทำงานหรือทำกิจกรรม ให้เราช่วยดูแลเสื้อผ้าตัวโปรดของคุณ`
                    ) : (
                      `As a premier residential address in the vibrant heart of ${city}, <strong>${name}</strong> offers residents an unparalleled standard of living. With world-class amenities and exceptional design, every detail of your home is spectacular. While you spend your days working or exploring nearby attractions, allow us to take care of the essentials.`
                    )}
                  </p>
                  <p>
                    <strong>That Laundry Shop</strong> {locale === "th" ? (
                      `ภูมิใจที่ได้เป็นพันธมิตรร่วมกับผู้อยู่อาศัยในโครงการ ${name} เพื่อมอบบริการดูแลรักษาเสื้อผ้าคุณภาพสูงสุด ไม่ว่าคุณจะต้องการบริการซักรีดทั่วไปหรือซักแห้งเสื้อผ้าเฉพาะทาง เรามั่นใจว่าคุณจะดูดีที่สุดอยู่เสมอในทุกๆ วันโดยไม่ต้องลงมือทำเอง`
                    ) : (
                      `is proud to partner with the discerning residents of ${name} to provide unparalleled garment care. Whether you need a simple laundry service or specialized dry cleaning, we ensure you always look your absolute best without lifting a finger.`
                    )}
                  </p>

                  <h2>{locale === "th" ? "ความสะดวกสบายสูงสุด: บริการรับและส่งถึงหน้าห้องชุด" : "Ultimate Convenience: Direct Pickup & Delivery"}</h2>
                  <p>
                    {locale === "th" ? (
                      `เวลาของคุณนั้นมีค่าอย่างยิ่ง ไม่ว่าคุณจะเตรียมตัวสำหรับการประชุมที่สำคัญ แต่งตัวออกงาน หรือเพียงแค่พักผ่อนสบายๆ อยู่ที่บ้าน สิ่งสุดท้ายที่คุณต้องการกังวลคือเรื่องงานบ้านและซักผ้า`
                    ) : (
                      `Your time is incredibly valuable. Whether you are preparing for a crucial business meeting, dressing up for an event, or simply relaxing at home, the last thing you want to worry about is laundry chores.`
                    )}
                  </p>
                  <p>
                    {locale === "th" ? (
                      `นั่นคือเหตุผลที่เรามอบบริการซักแห้งและซักรีดระดับพรีเมียมแบบบริการรับและส่งฟรีถึงห้องชุดของคุณ เพียงจองเวลานัดหมาย เจ้าหน้าที่ของเราจะเดินทางไปรับเสื้อผ้าที่ล็อบบี้หรือนิติบุคคลของ ${name} และส่งมอบคืนคุณในเวลาอันรวดเร็ว สะอาด รีดเรียบประณีต และพับหรือแขวนบรรจุหีบห่ออย่างสวยงาม`
                    ) : (
                      `That is why we offer a seamless, white-glove pickup and delivery laundry service directly to your residence. Simply schedule a pickup, and our professional concierge will arrive at the lobby of ${name} to collect your garments. Within hours, your clothes will be returned to you—fresh, perfectly pressed, and meticulously packaged.`
                    )}
                  </p>

                  <h2>{locale === "th" ? "ทำไมผู้พักอาศัยระดับลักชัวรีถึงเลือกเรา" : "The Final Touch: Why Residents Choose Us"}</h2>
                  <p>
                    {locale === "th" ? (
                      `เมื่ออยู่อาศัยในโครงการที่หรูหราอย่าง ${name} คุณย่อมคาดหวังมาตรฐานที่ดีที่สุดในทุกๆ ด้าน That Laundry Shop ตอบสนองมาตรฐานระดับสูงเหล่านั้นด้วยความเอาใจใส่และพิถีพิถัน`
                    ) : (
                      `When living at an exclusive address like ${name}, you expect nothing less than perfection. That Laundry Shop meets those exacting standards through our commitment to premium fabric care.`
                    )}
                  </p>
                  <ul>
                    {locale === "th" ? (
                      <>
                        <li><strong>การซักแห้งสูตรถนอมใยผ้าชั้นสูง:</strong> เราใช้ผลิตภัณฑ์ทำความสะอาดที่เป็นมิตรต่อสิ่งแวดล้อมเพื่อปกป้องผ้าเนื้อบางและถนอมสีสันให้แบรนด์เนมของคุณคงสภาพเหมือนใหม่</li>
                        <li><strong>ผู้เชี่ยวชาญด้านการกำจัดคราบฝังลึก:</strong> ทีมงานของเรามีความชำนาญในการระบุและขจัดคราบเปื้อนอย่างปลอดภัยโดยไม่ทำลายโครงสร้างของเส้นใยผ้า</li>
                        <li><strong>รีดมือประณีตระดับมืออาชีพ:</strong> เสื้อผ้าทุกชิ้นผ่านการรีดและเก็บรายละเอียดด้วยมือโดยช่างผู้เชี่ยวชาญเพื่อความเนี้ยบในทุกมุมมอง</li>
                        <li><strong>เจ้าหน้าที่บริการลูกค้าสองภาษา:</strong> เราให้บริการติดต่อประสานงานที่รวดเร็ว ชัดเจน ตั้งแต่การรับผ้าไปจนถึงการส่งคืนถึงโครงการ ${name}</li>
                      </>
                    ) : (
                      <>
                        <li><strong>Advanced Dry Cleaning Solvents:</strong> We use gentle, eco-friendly cleaning agents that protect delicate fabrics, keeping your designer garments looking brand new.</li>
                        <li><strong>Expert Stain Removal:</strong> Our technicians are highly trained in identifying and safely removing stubborn stains without damaging fibers.</li>
                        <li><strong>Meticulous Pressing:</strong> Every item is hand-finished and pressed to perfection by our experienced team.</li>
                        <li><strong>English-Speaking Concierge:</strong> We provide seamless, clear communication from the moment you book our laundry service until your clothes are safely delivered back to ${name}.</li>
                      </>
                    )}
                  </ul>

                  <p>
                    {locale === "th" ? (
                      `สัมผัสประสบการณ์ซักรีดและซักแห้งคุณภาพสูงโดยไม่ต้องออกนอกบ้านของคุณที่ ${name} สั่งจองเวลารับเสื้อผ้าวันนี้ ให้เราเพิ่มความเรียบร้อยและมีระดับให้กับตู้เสื้อผ้าของคุณ`
                    ) : (
                      `Experience the luxury of professionally cleaned clothes without ever leaving the comfort of your home at ${name}. Book your dry cleaning and laundry service pickup today and let us add the perfect finishing touch to your lifestyle in ${city}.`
                    )}
                  </p>
                </>
              )}

              <div className={styles.actionSection}>
                <Link href="/booking" className={styles.btnPrimary}>
                  <i className="fa-solid fa-calendar-check"></i> {t("bookServiceNow")}
                </Link>
                <a href={condo.website || "#"} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
                  <i className="fa-solid fa-globe"></i> {t("visitWebsite")}
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar Area: Rich Condo Data */}
          <div className={styles.sidebar}>
            
            {/* Condo Stats */}
            <div className={styles.statsCard}>
              <h3 className={styles.amenitiesTitle}>
                <i className="fa-solid fa-circle-info"></i> {t("details")}
              </h3>
              
              <div className={styles.statItem}>
                <div className={styles.statIcon}><i className="fa-solid fa-building"></i></div>
                <div className={styles.statInfo}>
                  <h4>{t("propertyType")}</h4>
                  <p>{t("condominium")}</p>
                </div>
              </div>
              
              <div className={styles.statItem}>
                <div className={styles.statIcon}><i className="fa-solid fa-key"></i></div>
                <div className={styles.statInfo}>
                  <h4>{t("totalUnits")}</h4>
                  <p>{condo.totalRooms} {locale === "th" ? "ยูนิต" : "Units"}</p>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}><i className="fa-solid fa-train-subway"></i></div>
                <div className={styles.statInfo}>
                  <h4>{t("transport")}</h4>
                  <p style={{ fontSize: "1rem" }}>{transport}</p>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}><i className="fa-solid fa-globe"></i></div>
                <div className={styles.statInfo}>
                  <h4>{t("website")}</h4>
                  <a href={condo.website || "#"} target="_blank" rel="noopener noreferrer">{locale === "th" ? "เปิดเว็บไซต์" : "Visit Website"}</a>
                </div>
              </div>
            </div>

            {/* Tourist Amenities */}
            {nearbyAmenities && nearbyAmenities.length > 0 && (
              <div className={styles.amenitiesCard}>
                <h3 className={styles.amenitiesTitle}>
                  <i className="fa-solid fa-map-pin"></i> {t("neighborhood")}
                </h3>
                <p style={{ color: "var(--text-light)", marginBottom: "1rem", fontSize: "0.95rem" }}>
                  {t("nearbyAttractions", { name })}
                </p>
                <ul className={styles.amenitiesList}>
                  {nearbyAmenities.map((amenity, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-check"></i>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Embedded Google Map */}
            <div className={styles.mapCard}>
              <div className={styles.mapContainer}>
                <iframe 
                  src={mapEmbedUrl}
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title={locale === "th" ? `แผนที่กูเกิลสำหรับ ${name}` : `Google Map for ${name}`}
                ></iframe>
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
