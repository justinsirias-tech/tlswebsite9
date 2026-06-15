"use client";

import { Link, usePathname, useRouter } from "../i18n/routing";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header style={{ 
      padding: scrolled ? "0.5rem 0" : "1rem 0",
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(10px)",
      boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
      borderBottom: "1px solid rgba(0,0,0,0.05)",
      transition: "all 0.3s ease"
    }}>
      <div className="container" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center"
      }}>
        <Link href="/" className="logo">
          <img src="/images/logo.png" alt="That Laundry Shop" style={{ height: scrolled ? '55px' : '70px', width: 'auto', transition: 'height 0.3s ease' }} />
        </Link>
        
        <nav className={`nav-links ${isMenuOpen ? "active glass" : ""}`}>
          <Link href="/" className={pathname === "/" ? "active" : ""}>{t('home')}</Link>
          <Link href="/about" className={pathname === "/about" ? "active" : ""}>{t('about')}</Link>
          <Link href="/services" className={pathname === "/services" ? "active" : ""}>{t('services')}</Link>
          <Link href="/pricing" className={pathname === "/pricing" ? "active" : ""}>{t('pricing')}</Link>
          <Link href="/promotions" className={pathname === "/promotions" ? "active" : ""}>{t('promotions')}</Link>
          <Link href="/contact" className={pathname === "/contact" ? "active" : ""}>{t('contact')}</Link>
          {/* Language Switcher Dropdown */}
          <div 
            style={{ position: 'relative', marginLeft: '1rem' }} 
            onMouseEnter={() => setIsLangOpen(true)}
            onMouseLeave={() => setIsLangOpen(false)}
            className="lang-dropdown-wrapper"
          >
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                background: 'rgba(0, 0, 0, 0.03)', 
                border: '1px solid rgba(0,0,0,0.06)', 
                borderRadius: '20px',
                padding: '0.4rem 0.8rem',
                cursor: 'pointer', 
                fontWeight: '600',
                color: 'var(--primary)',
                transition: 'all 0.2s ease',
              }}
              className="lang-trigger-btn"
            >
              <img 
                src={`https://flagcdn.com/w40/${locale === 'en' ? 'gb' : locale === 'th' ? 'th' : 'cn'}.png`} 
                alt={locale.toUpperCase()} 
                style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <span style={{ fontSize: '0.85rem' }}>{locale.toUpperCase()}</span>
              <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem', opacity: 0.7, transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}></i>
            </button>

            {isLangOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                paddingTop: '0.5rem',
                zIndex: 1000,
              }}>
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  padding: '0.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  minWidth: '110px'
                }} className="glass">
                  <button
                    onClick={() => {
                      router.replace(pathname, {locale: 'en'});
                      setIsLangOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: locale === 'en' ? 'rgba(0, 0, 0, 0.04)' : 'none',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.45rem 0.6rem',
                      width: '100%',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: locale === 'en' ? '600' : '500',
                      color: locale === 'en' ? 'var(--primary)' : 'var(--text-light)',
                    }}
                    className="lang-item-btn"
                  >
                    <img src="https://flagcdn.com/w40/gb.png" alt="English" style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.85rem' }}>English</span>
                  </button>

                  <button
                    onClick={() => {
                      router.replace(pathname, {locale: 'th'});
                      setIsLangOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: locale === 'th' ? 'rgba(0, 0, 0, 0.04)' : 'none',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.45rem 0.6rem',
                      width: '100%',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: locale === 'th' ? '600' : '500',
                      color: locale === 'th' ? 'var(--primary)' : 'var(--text-light)',
                    }}
                    className="lang-item-btn"
                  >
                    <img src="https://flagcdn.com/w40/th.png" alt="Thai" style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.85rem' }}>ไทย</span>
                  </button>

                  <button
                    onClick={() => {
                      router.replace(pathname, {locale: 'cn'});
                      setIsLangOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: locale === 'cn' ? 'rgba(0, 0, 0, 0.04)' : 'none',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.45rem 0.6rem',
                      width: '100%',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: locale === 'cn' ? '600' : '500',
                      color: locale === 'cn' ? 'var(--primary)' : 'var(--text-light)',
                    }}
                    className="lang-item-btn"
                  >
                    <img src="https://flagcdn.com/w40/cn.png" alt="Chinese" style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.85rem' }}>中文</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <Link href="/booking" className="btn btn-primary" style={{ padding: "0.5rem 1.5rem", marginLeft: "1rem" }}>{t('bookNow')}</Link>
        </nav>

        <button 
          className="mobile-menu-btn" 
          aria-label="Toggle Navigation"
          onClick={toggleMenu}
        >
          <i className={`fa-solid ${isMenuOpen ? "fa-xmark" : "fa-bars"}`}></i>
        </button>
      </div>
    </header>
  );
}
