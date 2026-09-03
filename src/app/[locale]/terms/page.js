import styles from "./page.module.css";
import Image from "next/image";
import Script from "next/script";
import prisma from "../../../lib/prisma";

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'cn' }];
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  return {
    title: locale === "th" 
      ? "ข้อกำหนดและเงื่อนไขการให้บริการ | That Laundry Shop" 
      : locale === "cn" 
        ? "服务条款与条件 | That Laundry Shop" 
        : "Terms & Conditions | That Laundry Shop",
    description: locale === "th" 
      ? "อ่านและทำความเข้าใจข้อกำหนดและเงื่อนไขการให้บริการซักรีด ซักแห้ง การรับส่งผ้า และการชำระเงินของ That Laundry Shop ก่อนทำการจอง"
      : locale === "cn"
        ? "预订前请阅读并了解 That Laundry Shop 的洗衣、干洗、取送货及支付服务条款与条件。"
        : "Read and understand That Laundry Shop's terms and conditions for laundry, dry cleaning, pickup & delivery, and payments before booking.",
    alternates: {
      canonical: "https://www.thatlaundryshop.com/terms",
    }
  };
}

async function getStoredTerms() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["terms_en", "terms_th", "terms_cn", "terms_last_updated"]
        }
      }
    });

    const map = {};
    settings.forEach(s => {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    });

    return map;
  } catch (err) {
    console.error("Error loading terms settings:", err);
    return {};
  }
}

export default async function TermsPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || 'en';

  const storedMap = await getStoredTerms();

  const defaultLastUpdated = locale === "th" ? "1 กันยายน 2026" : locale === "cn" ? "2026年9月1日" : "September 1, 2026";
  const lastUpdated = storedMap["terms_last_updated"] || defaultLastUpdated;

  const defaultTerms = {
    en: {
      title: "Terms & Conditions",
      subtitle: "Please read and understand our terms and policies before booking or using our services.",
      s1Title: "1. Overview & General Agreement",
      s1Content: "By placing a booking, requesting a pickup, or utilizing any services provided by That Laundry Shop (including wash & fold, wash & iron, dry cleaning, and express services), you acknowledge that you have read, understood, and agreed to these Terms & Conditions. These terms apply to all service orders fulfilled across Bangkok and Pattaya via our website, LINE, WhatsApp, telephone bookings, or direct store visits.",
      s2Title: "2. Pickup & Delivery Policies",
      s2Content: "Please have your clothes bagged and ready prior to your scheduled window. If leaving clothes with hotel front desk, concierge, or condo juristic office, please provide your exact full name and room/unit number during booking. We strive to adhere to chosen windows; in cases of severe traffic or adverse weather, our dispatch team will notify you promptly.",
      s3Title: "3. Garment Care & Inspection",
      s3Content: "We employ master garment handling techniques and premium eco-friendly detergents. However, customers are required to check pockets prior to handover. That Laundry Shop is not liable for loss or damage to items left in pockets (e.g., cash, jewelry, electronics, keys), nor for secondary damage caused by such items to other garments.",
      s4Title: "4. Pricing, Minimum Orders & Payment",
      s4Content: "Prices follow our published rate sheet. Kilogram wash & fold services are subject to minimum order weights. We accept PromptPay QR, bank transfer, credit cards, store wallet credits, or cash upon/prior to final delivery.",
      s5Title: "5. Turnaround & Express Service",
      s5Content: "Standard turnaround time is 24 to 48 hours for general wash & fold/iron orders. Specialized dry cleaning or delicate items may require 48 to 72 hours. Same-day express option is available for an additional premium.",
      s6Title: "6. Loss & Damage Liability",
      s6Content: "We take extreme care in handling all garments. In the rare event of lost or damaged items caused directly by our processing, maximum reimbursement is capped at up to 10 times the individual cleaning fee of the affected item. Any claim must be submitted to customer support within 48 hours of item delivery with photo evidence.",
      s7Title: "7. Unclaimed Garments Policy",
      s7Content: "Garments left unclaimed after 30 days from notification of completion may incur storage charges or be donated to charity if customer cannot be contacted."
    },
    th: {
      title: "ข้อกำหนดและเงื่อนไข",
      subtitle: "โปรดอ่านและทำความเข้าใจข้อตกลงและเงื่อนไขก่อนทำการนัดหมายหรือใช้บริการของเรา",
      s1Title: "1. ขอบเขตบริการและข้อตกลงทั่วไป",
      s1Content: "เมื่อท่านทำการนัดหมาย รับ-ส่งผ้า หรือใช้บริการของ That Laundry Shop (รวมถึงบริการซักพับ ซักอบรีด ซักแห้ง และซักรีดด่วน) ถือว่าท่านได้ยอมรับและตกลงปฏิบัติตามข้อกำหนดและเงื่อนไขฉบับนี้โดยสมบูรณ์ ข้อกำหนดเหล่านี้ครอบคลุมการให้บริการทั้งในพื้นที่กรุงเทพมหานครและพัทยา ผ่านช่องทางเว็บไซต์ แอปพลิเคชัน LINE, WhatsApp, โทรศัพท์ และการรับบริการที่หน้าร้าน",
      s2Title: "2. การนัดหมายและบริการรับ-ส่งผ้า",
      s2Content: "โปรดบรรจุผ้าลงในถุงให้เรียบร้อยก่อนเวลานัดหมาย พนักงานไรเดอร์จะทำการชั่งน้ำหนักและตรวจนับถุงผ้า ณ จุดรับ กรณีฝากผ้าไว้ที่ล็อบบี้ นิติบุคคล หรือแผนกคอนเซียร์จ โปรดแจ้งชื่อ-นามสกุล และหมายเลขห้องพักให้ชัดเจนในระบบจอง ไรเดอร์จะเข้าตามช่วงเวลาที่ท่านเลือก แต่อาจเกิดความล่าช้าจากสภาพการจราจรหรือฝนตกหนัก ซึ่งทางร้านจะแจ้งให้ทราบล่วงหน้า",
      s3Title: "3. การตรวจนับและการดูแลเสื้อผ้า",
      s3Content: "ร้านใช้น้ำยาซักผ้าคุณภาพสูง เทคโนโลยีปรับอุณหภูมิ และมาตรฐานการถนอมเนื้อผ้า อย่างไรก็ตามโปรดตรวจสอบสิ่งของในกระเป๋าเสื้อผ้าของท่านให้ถี่ถ้วนก่อนส่งซัก ทางร้านไม่รับผิดชอบต่อการสูญหายหรือเสียหายของสิ่งของ เงินสด เครื่องประดับ กุญแจ หรืออุปกรณ์อิเล็กทรอนิกส์ที่ถูกตกค้างอยู่ในกระเป๋าเสื้อผ้า รวมถึงความเสียหายที่เกิดจากสิ่งของเหล่านั้นต่อผ้าผืนอื่น",
      s4Title: "4. ราคา อัตราขั้นต่ำ และการชำระเงิน",
      s4Content: "คิดราคาตามตารางราคาปัจจุบันของทางร้าน ผ้าซักเป็นกิโลกรัมมีน้ำหนักขั้นต่ำสำหรับการเข้ารับบริการ รองรับการชำระเงินผ่านการสแกน QR PromptPay, เงินโอนธนาคาร, บัตรเครดิต, ตัดผ่านยอดเงินสมาชิก Wallet หรือเงินสดก่อน/ขณะส่งมอบผ้า",
      s5Title: "5. ระยะเวลาซักและบริการด่วน",
      s5Content: "ระยะเวลามาตรฐานคือ 24 - 48 ชั่วโมง สำหรับบริการซักพับและซักอบรีด สำหรับงานซักแห้งเฉพาะทางหรือผ้าชุดสูทอาจใช้เวลา 48 - 72 ชั่วโมง หากต้องการบริการด่วนภายในวัน (Same-Day Express) จะมีค่าบริการด่วนเพิ่มเติมตามตารางราคา",
      s6Title: "6. ความรับผิดชอบและการเคลมสินค้า",
      s6Content: "ร้านเราให้ความสำคัญสูงสุดในการดูแลรักษาผ้าทุกชิ้น หากเกิดกรณีสูญหายหรือเสียหายอันเนื่องมาจากความผิดพลาดในกระบวนการของทางร้าน วงเงินชดเชยสูงสุดไม่เกิน 10 เท่าของค่าซักของเสื้อผ้าชิ้นนั้น โปรดแจ้งเคลมหรือทักท้วงภายใน 48 ชั่วโมงหลังจากได้รับผ้าคืน พร้อมหลักฐานภาพถ่าย",
      s7Title: "7. ผ้าที่ตกค้างไม่ได้มารับเกินกำหนด",
      s7Content: "ผ้าที่ซักเสร็จเรียบร้อยและไม่สามารถติดต่อผู้ใช้บริการได้ หรือไม่มารับคืนภายใน 30 วัน นับจากวันเสร็จสิ้นบริการ ทางร้านขอสงวนสิทธิ์ในการคิดค่ารับฝากผ้า หรือนำผ้าเข้าสู่กระบวนการบริจาคตามความเหมาะสม"
    },
    cn: {
      title: "服务条款与条件",
      subtitle: "在使用我们的服务或安排取件前，请仔细阅读并了解以下条款与条件。",
      s1Title: "1. 服务概述与协议",
      s1Content: "当您在 That Laundry Shop 预约取送件或使用我们的任何服务（包括水洗烘干折叠、洗熨、干洗及快捷服务）时，即表示您已阅读、理解并同意受本条款与条件的约束。本条款适用于通过我们的网站、微信/LINE/WhatsApp、电话或门店在曼谷和芭堤雅地区提供的所有服务。",
      s2Title: "2. 取件与送件服务政策",
      s2Content: "请在预约取件时间前打包好衣物。如将衣物留于前台、礼宾部或物业，请在预订时提供准确的姓名及房间号。我们努力在预订窗口内到达。若因交通拥堵或极端天气导致延误，客服将及时联系您。",
      s3Title: "3. 衣物检查与护理",
      s3Content: "我们采用高标准洗涤设备与面料专护理方案。但取件前请务必仔细检查所有口袋。对于遗留在口袋中的现金、钥匙、饰品或电子设备损坏或丢失，以及此类物品对其他衣物造成的二次损坏，本店家概不负责。",
      s4Title: "4. 价格、最低消费与支付",
      s4Content: "按照门店公布的价格表计费。按公斤计费水洗有最低起洗重量。支持扫码支付、银行转账、信用卡、会员钱包余额或交付时支付现金。",
      s5Title: "5. 周转时间与加急服务",
      s5Content: "普通水洗折叠及洗熨的标称周转时间为 24 - 48 小时。特殊干洗或西装可能需要 48 - 72 小时。同日加急服务（Same-Day Express）需支付额外的加急费用。",
      s6Title: "6. 遗失与损坏赔偿标准",
      s6Content: "我们将尽最大努力妥善保管每件衣物。如因本店家原因导致衣物遗失或无法修复的损坏，赔偿金额最高不超过该件衣物洗涤费用的 10 倍。请在收到衣物后 48 小时内附照片与客服联系提出索赔。",
      s7Title: "7. 无人领取衣物处理政策",
      s7Content: "若清洗完毕后超过 30 天仍未领取且无法联系到客户，本店家有权收取保管费或将衣物捐赠给慈善机构。"
    }
  };

  const storedLocaleTerms = storedMap[`terms_${locale}`] || {};
  const terms = { ...defaultTerms[locale], ...storedLocaleTerms };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": terms.title,
    "description": terms.subtitle,
    "publisher": {
      "@type": "Organization",
      "name": "That Laundry Shop"
    }
  };

  return (
    <>
      <Script
        id="schema-terms"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <div className={styles.header}>
        <Image
          src="/assets/hero_bg_v2.webp"
          alt="That Laundry Shop Terms and Conditions"
          fill
          priority
          unoptimized
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className={styles.headerOverlay}></div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", fontWeight: "800", color: "white" }}>
            {terms.title}
          </h1>
          <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.9)", maxWidth: "650px", margin: "0 auto", fontWeight: "400", lineHeight: "1.6" }}>
            {terms.subtitle}
          </p>
        </div>
      </div>

      {/* Content Body */}
      <section className="section" style={{ backgroundColor: "#f8fafc", paddingTop: "0" }}>
        <div className={styles.container}>
          <div className={styles.contentWrapper}>

            <div className={styles.lastUpdated}>
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span>
                {locale === "th" ? `อัปเดตล่าสุด: ${lastUpdated}` : locale === "cn" ? `最近更新: ${lastUpdated}` : `Last Updated: ${lastUpdated}`}
              </span>
            </div>

            {/* 1. Overview */}
            {terms.s1Title && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}><i className="fa-solid fa-file-contract"></i></span>
                  {terms.s1Title}
                </h2>
                <p className={styles.paragraph}>{terms.s1Content}</p>
              </div>
            )}

            {/* 2. Pickup & Delivery */}
            {terms.s2Title && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}><i className="fa-solid fa-truck-ramp-box"></i></span>
                  {terms.s2Title}
                </h2>
                <p className={styles.paragraph}>{terms.s2Content}</p>
              </div>
            )}

            {/* 3. Garment Inspection & Care */}
            {terms.s3Title && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}><i className="fa-solid fa-shirt"></i></span>
                  {terms.s3Title}
                </h2>
                <p className={styles.paragraph}>{terms.s3Content}</p>
              </div>
            )}

            {/* 4. Pricing & Payments */}
            {terms.s4Title && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}><i className="fa-solid fa-tags"></i></span>
                  {terms.s4Title}
                </h2>
                <p className={styles.paragraph}>{terms.s4Content}</p>
              </div>
            )}

            {/* 5. Turnaround & Express */}
            {terms.s5Title && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}><i className="fa-solid fa-bolt"></i></span>
                  {terms.s5Title}
                </h2>
                <p className={styles.paragraph}>{terms.s5Content}</p>
              </div>
            )}

            {/* 6. Loss & Damage Liability */}
            {terms.s6Title && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}><i className="fa-solid fa-shield-halved"></i></span>
                  {terms.s6Title}
                </h2>
                <p className={styles.paragraph}>{terms.s6Content}</p>
              </div>
            )}

            {/* 7. Unclaimed Garments */}
            {terms.s7Title && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}><i className="fa-solid fa-box-archive"></i></span>
                  {terms.s7Title}
                </h2>
                <p className={styles.paragraph}>{terms.s7Content}</p>
              </div>
            )}

            {/* Contact Box */}
            <div className={styles.contactBox}>
              <h3>
                <i className="fa-solid fa-headset" style={{ marginRight: "0.5rem" }}></i>
                {locale === "th" ? "ต้องการสอบถามข้อมูลเพิ่มเติม?" : locale === "cn" ? "需要协助或有疑问？" : "Have Questions Regarding Our Terms?"}
              </h3>
              <p>
                {locale === "th"
                  ? "ทีมงาน That Laundry Shop พร้อมช่วยเหลือและตอบคำถามเกี่ยวกับนโยบายบริการตลอดเวลา"
                  : locale === "cn"
                    ? "That Laundry Shop 客服团队随时准备为您解答有关我们服务政策的疑问。"
                    : "Our dedicated support team is available to assist you with any policy questions or special requests."}
              </p>
              <div className={styles.contactGrid}>
                <a href="tel:+66946916668" className={styles.contactItem}>
                  <i className="fa-solid fa-phone"></i>
                  <span>+66 94 691 6668</span>
                </a>
                <a href="https://wa.me/message/7BO67YACZI6SH1" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>WhatsApp</span>
                </a>
                <a href="https://lin.ee/B2monGQ" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                  <i className="fa-brands fa-line"></i>
                  <span>LINE: @ThatLaundryShop</span>
                </a>
                <a href="mailto:sales@thatlaundryshop.com" className={styles.contactItem}>
                  <i className="fa-solid fa-envelope"></i>
                  <span>sales@thatlaundryshop.com</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
