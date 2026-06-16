import styles from "./page.module.css";
import Script from "next/script";
import Link from "next/link";
import prisma from "../../../lib/prisma";
import DirectorySearch from "../../../components/DirectorySearch";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hotels & Serviced Apartments | That Laundry Shop",
  description: "View our comprehensive directory of premium hotels, serviced apartments, and condominiums in Bangkok and Pattaya that partner with That Laundry Shop.",
  alternates: {
    canonical: "https://www.thatlaundryshop.com/hotels",
  }
};

export default async function HotelsPage() {
  const hotelsData = await prisma.location.findMany();
  
  // SEO Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Hotels & Serviced Apartments in Bangkok & Pattaya",
    "description": "Comprehensive directory of premium hotels, serviced apartments, and condominiums serviced by That Laundry Shop.",
  };

  const hotelsAndApts = hotelsData.filter(h => h.type === "hotel" || h.type === "apartment");

  return (
    <>
      <Script
        id="schema-hotels"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <div className="container">
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>Hotels & Serviced Apartments</h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-light)", maxWidth: "700px", margin: "0 auto" }}>
            We provide premium laundry and dry cleaning services to guests staying at the most prestigious hotels, serviced apartments, and luxury condominiums in Thailand.
          </p>
        </div>
      </div>

      <section className="section" style={{ background: "var(--background)", minHeight: "60vh" }}>
        <div className={`container ${styles.hotelsContainer}`}>
          {/* HOTELS & SERVICED APARTMENTS SECTION */}
          <div style={{ marginBottom: "4rem" }}>
            <DirectorySearch locations={hotelsAndApts} basePath="/hotels" />
          </div>



          {/* AI Generated Content / Article */}
          <article className={styles.seoArticle} style={{ marginTop: "4rem", padding: "3rem", background: "var(--surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "var(--primary)" }}>Experience Unmatched Garment Care at Thailand's Finest Addresses</h2>
            <p style={{ marginBottom: "1rem", lineHeight: "1.8", color: "var(--text)" }}>
              Whether you are enjoying a luxurious staycation in the heart of Bangkok or taking a well-deserved coastal retreat in Pattaya, managing your laundry should be the least of your concerns. <strong>That Laundry Shop</strong> partners with the most prestigious hotels, high-end serviced apartments, and exclusive condominiums across Thailand to bring unparalleled garment care directly to your door.
            </p>
            <p style={{ marginBottom: "1rem", lineHeight: "1.8", color: "var(--text)" }}>
              Our bespoke services go beyond the standard wash and fold. From delicate silk evening gowns and tailored business suits to everyday casual wear, our expert team utilizes state-of-the-art dry cleaning technology, eco-friendly solvents, and meticulous hand-ironing techniques. We understand that your wardrobe is an investment, and we treat every single fiber with the utmost respect and care.
            </p>
            <h3 style={{ fontSize: "1.5rem", marginTop: "2rem", marginBottom: "1rem", color: "var(--primary)" }}>Why Choose Our Premium Hotel Delivery Service?</h3>
            <ul style={{ listStyleType: "none", padding: 0, marginBottom: "2rem" }}>
              <li style={{ marginBottom: "0.8rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <i className="fa-solid fa-check-circle" style={{ color: "var(--accent)", marginTop: "4px" }}></i>
                <span><strong>Seamless Door-to-Door Delivery:</strong> We coordinate directly with your hotel concierge or condo juristic office for hassle-free pickups and drop-offs.</span>
              </li>
              <li style={{ marginBottom: "0.8rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <i className="fa-solid fa-check-circle" style={{ color: "var(--accent)", marginTop: "4px" }}></i>
                <span><strong>Express & Next-Day Turnaround:</strong> Perfect for business travelers and vacationers on a tight schedule who need their garments fresh and ready to wear.</span>
              </li>
              <li style={{ marginBottom: "0.8rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <i className="fa-solid fa-check-circle" style={{ color: "var(--accent)", marginTop: "4px" }}></i>
                <span><strong>Expert Stain Removal:</strong> Specialized treatments for tough stains, ensuring your favorite pieces are restored to their pristine condition.</span>
              </li>
            </ul>
            <p style={{ lineHeight: "1.8", color: "var(--text)", fontStyle: "italic" }}>
              Explore our extensive directory above to find your residence or hotel. Don't see your location? Contact our customer service team, and we will arrange a special pickup just for you. With That Laundry Shop, impeccable style and uncompromising cleanliness are always just a tap away.
            </p>
          </article>

        </div>
      </section>
    </>
  );
}
