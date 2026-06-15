import styles from "./page.module.css";
import Script from "next/script";
import StoryContent from "../../../components/StoryContent";
import StoryContentTh from "../../../components/StoryContentTh";
import StoryContentCn from "../../../components/StoryContentCn";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  return {
    title: locale === "th" 
      ? "เกี่ยวกับเรา | That Laundry Shop" 
      : locale === "cn" 
        ? "关于我们 | That Laundry Shop" 
        : "About Us | That Laundry Shop",
    description: locale === "th" 
      ? "เรียนรู้เกี่ยวกับความมุ่งมั่นของ That Laundry Shop ในการดูแลเสื้อผ้าพรีเมียม การปฏิบัติที่เป็นมิตรต่อสิ่งแวดล้อม และเรื่องราวของเราในกรุงเทพฯ และพัทยา"
      : locale === "cn"
        ? "了解 That Laundry Shop 对高端衣物护理、环保实践的承诺，以及我们在曼谷和芭堤雅的故事。"
        : "Learn about That Laundry Shop's commitment to premium garment care, eco-friendly practices, and our story in Bangkok and Pattaya.",
    alternates: {
      canonical: "https://www.thatlaundryshop.com/about",
    }
  };
}

export default async function AboutPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": locale === "th" 
      ? "เกี่ยวกับเรา That Laundry Shop" 
      : locale === "cn" 
        ? "关于 That Laundry Shop" 
        : "About That Laundry Shop",
    "description": locale === "th" 
      ? "บริการซักรีดและซักแห้งระดับพรีเมียมในกรุงเทพฯ และพัทยา" 
      : locale === "cn"
        ? "曼谷和芭堤雅的高端洗衣与干洗服务。"
        : "Premium laundry and dry cleaning services in Bangkok and Pattaya.",
    "publisher": {
      "@type": "Organization",
      "name": "That Laundry Shop"
    }
  };

  return (
    <>
      <Script
        id="schema-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <div className="container">
          <h1 style={{ fontSize: "4rem", marginBottom: "1rem", fontWeight: "800", color: "white" }}>
            {locale === "th" ? "เรื่องราวของเรา" : locale === "cn" ? "我们的故事" : "Our Story"}
          </h1>
          <p style={{ fontSize: "1.3rem", color: "rgba(255,255,255,0.9)", maxWidth: "650px", margin: "0 auto", fontWeight: "400", lineHeight: "1.6" }}>
            {locale === "th" 
              ? "ยกระดับการดูแลรักษาเสื้อผ้าด้วยเทคโนโลยี ความเชี่ยวชาญ และความมุ่งมั่นในคุณภาพระดับสูงสุด" 
              : locale === "cn"
                ? "通过技术、专业知识以及对品质的坚持不懈，提升衣物护理品质。"
                : "Elevating garment care through technology, expertise, and an unwavering commitment to quality."}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className={styles.content}>
            <div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>
                {locale === "th" ? "ช่างฝีมือผู้เชี่ยวชาญด้านเนื้อผ้า" : locale === "cn" ? "面料护理的能工巧匠" : "The Artisans of Fabric"}
              </h2>
              <p style={{ fontSize: "1.1rem", color: "var(--text-light)", marginBottom: "1.5rem" }}>
                {locale === "th" 
                  ? "That Laundry Shop ก่อตั้งขึ้นในใจกลางกรุงเทพมหานคร จากความตระหนักรู้พื้นฐานง่ายๆ ว่า เสื้อผ้าตัวโปรดและมีมูลค่าสูงของคุณควรได้รับการดูแลที่ดีกว่าการซักล้างอุตสาหกรรมทั่วไป เสื้อผ้าเหล่านั้นต้องการความใส่ใจเป็นพิเศษ อุณหภูมิที่เหมาะสมกับใยผ้า และสารทำความสะอาดที่ปลอดภัยเป็นพิเศษ"
                  : locale === "cn"
                    ? "That Laundry Shop 创立于曼谷市中心，源于一个简单的理念：我们最珍爱的衣物应当得到比普通工业水洗更好的呵护。它们需要专属的细致关怀、量身定制的洗涤温度以及专业的溶剂。"
                    : "Founded in the heart of Bangkok, That Laundry Shop was born from a simple realization: our most cherished garments deserve better than standard industrial washing. They require bespoke attention, tailored temperatures, and specialized solvents."}
              </p>
              <p style={{ fontSize: "1.1rem", color: "var(--text-light)", marginBottom: "2rem" }}>
                {locale === "th" 
                  ? "เราได้ลงทุนในเครื่องจักรซักแห้งและซักรีดชั้นนำจากยุโรป และทำการฝึกอบรมทีมงานช่างฝีมือภายใต้การแนะนำของช่างตัดเสื้อผู้เชี่ยวชาญ เพื่อเข้าใจโครงสร้างของทุกเส้นใยอย่างแท้จริง ตั้งแต่ผ้าไหมที่ละเอียดอ่อนไปจนถึงชุดสูทสั่งตัดหนานุ่ม"
                  : locale === "cn"
                    ? "我们引进了先进的欧洲干洗和洗衣设备，并在裁缝大师的指导下培训了我们的技师团队，以深刻理解每种织物的结构特性——从精致的真丝到挺括的羊毛西装。"
                    : "We've invested in state-of-the-art European dry cleaning machinery and trained our staff under master tailors to understand the structural integrity of every weave—from delicate silks to structured wool suits."}
              </p>
              
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>2017</div>
                  <div className={styles.statLabel}>{locale === "th" ? "ก่อตั้งขึ้นปี" : locale === "cn" ? "创立年份" : "Established"}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>200k+</div>
                  <div className={styles.statLabel}>{locale === "th" ? "ลูกค้าที่ไว้วางใจ" : locale === "cn" ? "信赖客户" : "Happy Clients"}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>2M+</div>
                  <div className={styles.statLabel}>{locale === "th" ? "เสื้อผ้าที่ซักสะอาด" : locale === "cn" ? "已清洗衣物" : "Garments Cleaned"}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>50+</div>
                  <div className={styles.statLabel}>{locale === "th" ? "ช่างฝีมือผู้เชี่ยวชาญ" : locale === "cn" ? "专业匠人" : "Expert Artisans"}</div>
                </div>
              </div>
            </div>
            
            <div className={styles.imageWrapper}>
              <img src="/assets/about_artisans.png" alt="Master Tailor inspecting garment" />
            </div>
          </div>
        </div>
      </section>

      {/* Render the 2000-word deep dive story */}
      <section style={{ backgroundColor: "var(--background-light)" }}>
        <div className="container">
          {locale === "th" ? <StoryContentTh /> : locale === "cn" ? <StoryContentCn /> : <StoryContent />}
        </div>
      </section>
    </>
  );
}
