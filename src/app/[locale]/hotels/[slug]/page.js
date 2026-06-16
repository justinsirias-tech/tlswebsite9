import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import prisma from "../../../../lib/prisma";

// Generate static params so Next.js can pre-render these pages
export async function generateStaticParams() {
  try {
    const hotels = await prisma.location.findMany({ where: { type: "hotel" } });
    const locales = ['en', 'th', 'cn'];
    const params = [];
    for (const locale of locales) {
      for (const hotel of hotels) {
        params.push({
          locale,
          slug: hotel.slug
        });
      }
    }
    return params;
  } catch (error) {
    console.error("Failed to generate static params at build time:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  let hotel = null;
  try {
    hotel = await prisma.location.findUnique({ where: { slug: resolvedParams.slug } });
  } catch (error) {
    console.error("Failed to fetch hotel metadata at build time:", error);
  }
  
  if (!hotel) {
    return { title: "Hotel | That Laundry Shop" };
  }

  const name = locale === "th" && hotel.name_th ? hotel.name_th : hotel.name;
  const city = locale === "th" && hotel.city_th ? hotel.city_th : hotel.city;

  return {
    title: locale === "th" 
      ? `บริการซักรีดสำหรับ ${name} | That Laundry Shop`
      : `Laundry Service for ${name} | That Laundry Shop`,
    description: locale === "th"
      ? `เพลิดเพลินกับบริการซักรีดระดับพรีเมียมพร้อมบริการรับและส่งฟรีถึงห้องพักของคุณที่ ${name} ใน ${city}`
      : `Enjoy premium laundry service with convenient pickup and delivery directly to your room at ${name} in ${city}.`,
    alternates: {
      canonical: `https://www.thatlaundryshop.com/hotels/${hotel.slug}`,
    }
  };
}

export default async function HotelArticlePage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Directory" });

  const hotel = await prisma.location.findUnique({ where: { slug: resolvedParams.slug } });

  if (!hotel) {
    notFound();
  }

  // Get localized content
  const name = locale === "th" && hotel.name_th ? hotel.name_th : hotel.name;
  const city = locale === "th" && hotel.city_th ? hotel.city_th : hotel.city;
  const transport = locale === "th" && hotel.transport_th ? hotel.transport_th : hotel.transport;
  const address = locale === "th" && hotel.address_th ? hotel.address_th : hotel.address;
  const article = locale === "th" && hotel.article_th ? hotel.article_th : hotel.article;
  const nearbyAmenities = locale === "th" && hotel.nearbyAmenities_th && hotel.nearbyAmenities_th.length > 0
    ? hotel.nearbyAmenities_th
    : hotel.nearbyAmenities;

  // Generate dynamic map embed URL (using English properties for map search stability)
  const mapQuery = encodeURIComponent(`${hotel.name} ${hotel.city} Thailand`);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // SEO Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Premium Laundry Service for ${hotel.name} Guests`,
    "publisher": {
      "@type": "Organization",
      "name": "That Laundry Shop"
    }
  };

  return (
    <>
      <Script
        id={`schema-hotel-${hotel.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section with Hotel Image */}
      <div 
        className={styles.heroSection} 
        style={{ backgroundImage: `url('${hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"}')` }}
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
                      `สัมผัสความหรูหราใจกลางเมือง ${city} ที่ ${name} มอบการพักผ่อนอันน่าจดจำสำหรับแขกผู้เข้าพัก ตั้งแต่ห้องอาหารระดับโลกไปจนถึงสถาปัตยกรรมที่สวยงามและการบริการที่เป็นเลิศ ทุกรายละเอียดในการเข้าพักของคุณได้รับการออกแบบอย่างยอดเยี่ยม ขณะที่คุณเพลิดเพลินกับการสำรวจสถานที่ท่องเที่ยวใกล้เคียง ให้เราช่วยดูแลเสื้อผ้าตัวโปรดของคุณ`
                    ) : (
                      `An oasis of luxury in the vibrant heart of ${city}, ${name} offers guests an unforgettable experience. From world-class dining to stunning architecture and exceptional service, every detail of your stay is designed to be spectacular. While you spend your days exploring nearby attractions, allow us to take care of the essentials.`
                    )}
                  </p>
                  <p>
                    <strong>That Laundry Shop</strong> {locale === "th" ? (
                      `ภูมิใจที่ได้ร่วมเป็นส่วนหนึ่งในการให้บริการผู้เข้าพักที่ ${name} เพื่อมอบการดูแลเสื้อผ้าที่ดีที่สุด ไม่ว่าจะเป็นบริการซักรีดทั่วไปหรือซักแห้งเฉพาะทาง เรามั่นใจว่าคุณจะดูดีที่สุดในทุกช่วงเวลาโดยไม่ต้องกังวล`
                    ) : (
                      `is proud to partner with discerning guests staying at ${name} to provide unparalleled garment care. Whether you need a simple laundry service or specialized dry cleaning, we ensure you always look your absolute best without lifting a finger.`
                    )}
                  </p>

                  <h2>{locale === "th" ? "ความสะดวกสบายสูงสุด: บริการรับและส่งถึงที่" : "Ultimate Convenience: Direct Pickup & Delivery"}</h2>
                  <p>
                    {locale === "th" ? (
                      `เวลาของคุณในเมือง ${city} นั้นมีค่าอย่างยิ่ง ไม่ว่าคุณจะเตรียมตัวสำหรับการประชุมทางธุรกิจที่สำคัญ แต่งตัวไปทานอาหารค่ำมื้อหรู หรือเพียงแค่ผ่อนคลายหลังจากท่องเที่ยวมาทั้งวัน สิ่งสุดท้ายที่คุณต้องการกังวลคือเรื่องงานซักรีด`
                    ) : (
                      `Your time in ${city} is incredibly valuable. Whether you are preparing for a crucial business meeting, dressing up for a formal dinner, or simply relaxing after a long day of sightseeing, the last thing you want to worry about is laundry.`
                    )}
                  </p>
                  <p>
                    {locale === "th" ? (
                      `นั่นคือเหตุผลที่เราเสนอการบริการซักรีดระดับพรีเมียมแบบรับและส่งโดยตรงถึงห้องพักโรงแรมของคุณ เพียงนัดหมายเวลา เจ้าหน้าที่ผู้เชี่ยวชาญของเราจะเดินทางไปรับเสื้อผ้าที่ล็อบบี้ของ ${name} และส่งกลับคืนคุณในเวลาอันรวดเร็ว สะอาดหมดจด รีดเรียบประณีต และบรรจุหีบห่ออย่างสวยงาม`
                    ) : (
                      `That is why we offer a seamless, white-glove pickup and delivery laundry service directly to your hotel room. Simply schedule a pickup, and our professional concierge will arrive at the lobby of ${name} to collect your garments. Within hours, your clothes will be returned to you—fresh, perfectly pressed, and meticulously packaged.`
                    )}
                  </p>

                  <h2>{locale === "th" ? "ทำไมแขกผู้เข้าพักระดับลักชัวรีถึงเลือกเรา" : "The Final Touch: Why Luxury Guests Choose Us"}</h2>
                  <p>
                    {locale === "th" ? (
                      `เมื่อเข้าพักในสถานที่ระดับหรูหราอย่าง ${name} คุณย่อมต้องการสิ่งที่ดีที่สุด That Laundry Shop ตอบสนองมาตรฐานระดับสูงเหล่านั้นด้วยความมุ่งมั่นในการดูแลรักษาเนื้อผ้าอย่างดีเยี่ยม`
                    ) : (
                      `When staying at a premium establishment like ${name}, you expect nothing less than perfection. That Laundry Shop meets those exacting standards through our commitment to premium fabric care.`
                    )}
                  </p>
                  <ul>
                    {locale === "th" ? (
                      <>
                        <li><strong>น้ำยาซักแห้งสูตรอ่อนโยนระดับสูง:</strong> เราใช้ผลิตภัณฑ์ทำความสะอาดที่เป็นมิตรต่อสิ่งแวดล้อมและอ่อนโยนเพื่อถนอมใยผ้าและคงความสดใหม่ให้เสื้อผ้าดีไซเนอร์ของคุณ</li>
                        <li><strong>ผู้เชี่ยวชาญด้านการขจัดคราบ:</strong> เจ้าหน้าที่ของเราได้รับการฝึกอบรมมาเป็นพิเศษเพื่อระบุและขจัดคราบฝังลึกอย่างปลอดภัยโดยไม่ทำลายเส้นใยผ้า</li>
                        <li><strong>รีดมือประณีตทุกชิ้น:</strong> เสื้อผ้าทุกชิ้นผ่านการรีดและตกแต่งด้วยมือโดยช่างผู้ชำนาญเพื่อให้เรียบกริบอย่างไร้ที่ติ</li>
                        <li><strong>ฝ่ายบริการลูกค้าสองภาษา:</strong> เราให้บริการประสานงานที่รวดเร็ว ชัดเจน ตั้งแต่เริ่มจองบริการไปจนถึงการส่งมอบผ้าคืนที่ ${name}</li>
                      </>
                    ) : (
                      <>
                        <li><strong>Advanced Dry Cleaning Solvents:</strong> We use gentle, eco-friendly cleaning agents that protect delicate fabrics, keeping your designer garments looking brand new.</li>
                        <li><strong>Expert Stain Removal:</strong> Our technicians are highly trained in identifying and safely removing stubborn stains without damaging fibers.</li>
                        <li><strong>Meticulous Pressing:</strong> Every item is hand-finished and pressed to perfection by our experienced team.</li>
                        <li><strong>English-Speaking Concierge:</strong> We provide seamless, clear communication from the moment you book our laundry service until your clothes are delivered back to ${name}.</li>
                      </>
                    )}
                  </ul>

                  <p>
                    {locale === "th" ? (
                      `สัมผัสบริการซักผ้าคุณภาพสูงโดยไม่ต้องออกจากความสะดวกสบายของ ${name} สั่งจองบริการซักอบรีดหรือซักแห้งวันนี้ ให้เราช่วยเติมเต็มความสมบูรณ์แบบให้กับการเดินทางของคุณ`
                    ) : (
                      `Experience the luxury of professionally cleaned clothes without ever leaving the comfort of ${name}. Book your dry cleaning and laundry service pickup today and let us add the perfect finishing touch to your stay in ${city}.`
                    )}
                  </p>
                </>
              )}

              <div className={styles.actionSection}>
                <Link href="/booking" className={styles.btnPrimary}>
                  <i className="fa-solid fa-calendar-check"></i> {t("bookServiceNow")}
                </Link>
                <a href={hotel.website || "#"} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
                  <i className="fa-solid fa-globe"></i> {t("visitWebsite")}
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar Area: Rich Hotel Data */}
          <div className={styles.sidebar}>
            
            {/* Hotel Stats */}
            <div className={styles.statsCard}>
              <h3 className={styles.amenitiesTitle}>
                <i className="fa-solid fa-circle-info"></i> {t("details")}
              </h3>
              
              <div className={styles.statItem}>
                <div className={styles.statIcon}><i className="fa-solid fa-star"></i></div>
                <div className={styles.statInfo}>
                  <h4>{t("classification")}</h4>
                  <p>{hotel.stars} {t("luxury")}</p>
                </div>
              </div>
              
              <div className={styles.statItem}>
                <div className={styles.statIcon}><i className="fa-solid fa-bed"></i></div>
                <div className={styles.statInfo}>
                  <h4>{locale === "th" ? "จำนวนห้องทั้งหมด" : "Total Rooms"}</h4>
                  <p>{hotel.totalRooms} {locale === "th" ? "ห้อง" : "Rooms"}</p>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}><i className="fa-solid fa-tag"></i></div>
                <div className={styles.statInfo}>
                  <h4>{locale === "th" ? "ราคาเฉลี่ย" : "Average Price"}</h4>
                  <p>{hotel.averagePrice}</p>
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
                  <a href={hotel.website || "#"} target="_blank" rel="noopener noreferrer">{locale === "th" ? "เปิดเว็บไซต์" : "Visit Website"}</a>
                </div>
              </div>
            </div>

            {/* Tourist Amenities */}
            {nearbyAmenities && nearbyAmenities.length > 0 && (
              <div className={styles.amenitiesCard}>
                <h3 className={styles.amenitiesTitle}>
                  <i className="fa-solid fa-map-pin"></i> {t("exploreArea")}
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
