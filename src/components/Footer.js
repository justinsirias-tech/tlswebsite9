import { Link } from "../i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Navigation");
  const locale = useLocale();

  return (
    <footer style={{ background: "var(--primary)", color: "white", padding: "4rem 0 2rem 0", marginTop: "4rem" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "3rem", marginBottom: "3rem" }}>
        
        <div>
          <h3 style={{ marginBottom: "1rem" }}>
            <Image src="/images/logo_light.webp" alt="That Laundry Shop" width={165} height={120} unoptimized style={{ height: '120px', width: 'auto', objectFit: 'contain' }} />
          </h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            {t("aboutText")}
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "white" }}>{t("quickLinks")}</h4>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <li><Link href="/about" style={{ color: "var(--text-muted)" }}>{nav("about")}</Link></li>
            <li><Link href="/services" style={{ color: "var(--text-muted)" }}>{nav("services")}</Link></li>
            <li><Link href="/pricing" style={{ color: "var(--text-muted)" }}>{nav("pricing")}</Link></li>
            <li><Link href="/hotels" style={{ color: "var(--text-muted)" }}>{nav("hotels")}</Link></li>
            <li><Link href="/condominiums" style={{ color: "var(--text-muted)" }}>{nav("condos")}</Link></li>
            <li><Link href="/articles" style={{ color: "var(--text-muted)" }}>{nav("blog")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "white" }}>{t("contactUs")}</h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.8rem" }}>
            
            {/* Location */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-location-dot" style={{ color: "var(--accent)", fontSize: "0.95rem" }}></i>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                {locale === 'th' ? 'กรุงเทพฯ และ พัทยา, ประเทศไทย' : 'Bangkok & Pattaya, Thailand'}
              </span>
            </div>

            {/* Hotline */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-phone" style={{ color: "var(--accent)", fontSize: "0.95rem" }}></i>
              </div>
              <a href="tel:+66946916668" className="footer-contact-link">
                +66 94 691 6668
              </a>
            </div>

            {/* WhatsApp */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(37, 211, 102, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-brands fa-whatsapp" style={{ color: "#25D366", fontSize: "1.05rem" }}></i>
              </div>
              <a href="https://wa.me/message/7BO67YACZI6SH1" target="_blank" rel="noopener noreferrer" className="footer-contact-link">
                WhatsApp
              </a>
            </div>

            {/* LINE */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(0, 185, 0, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-brands fa-line" style={{ color: "#00B900", fontSize: "1.05rem" }}></i>
              </div>
              <a href="https://lin.ee/B2monGQ" target="_blank" rel="noopener noreferrer" className="footer-contact-link">
                LINE: @ThatLaundryShop
              </a>
            </div>

            {/* Email */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-envelope" style={{ color: "var(--accent)", fontSize: "0.95rem" }}></i>
              </div>
              <a href="mailto:sales@thatlaundryshop.com" className="footer-contact-link">
                sales@thatlaundryshop.com
              </a>
            </div>

          </div>

          {/* Social Icons */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a href="https://www.facebook.com/thatlaundryshop" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/thatlaundryshop/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" className="footer-social-btn" aria-label="Twitter">
              <i className="fa-brands fa-twitter"></i>
            </a>
          </div>
        </div>

      </div>
      
      <div className="container" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
        <p>&copy; {new Date().getFullYear()} That Laundry Shop. {t("allRightsReserved")}</p>
      </div>
    </footer>
  );
}
