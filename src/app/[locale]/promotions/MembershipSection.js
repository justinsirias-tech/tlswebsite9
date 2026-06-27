"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import styles from "./page.module.css";

const benefits = [
  { key: "benefitRates", tiers: { silver: true, gold: true, platinum: true } },
  { key: "benefitDryClean5", tiers: { silver: false, gold: true, platinum: true } },
  { key: "benefitPriority", tiers: { silver: false, gold: true, platinum: true } },
  { key: "benefitTransport", tiers: { silver: false, gold: false, platinum: true } },
  { key: "benefitDuvet", tiers: { silver: false, gold: false, platinum: true } }
];

export default function MembershipSection({ locale, translations, silverPriceVal, goldPriceVal, vipPriceVal }) {
  const t = (key) => translations[key] || key;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("silver"); // "silver" | "gold" | "platinum"
  const [selectedTerm, setSelectedTerm] = useState("6 Months"); // "6 Months" | "12 Months"
  
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    dob: "", 
    address: "", 
    roomNo: "", 
    notes: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const autocompleteRef = useRef(null);

  const initAutocomplete = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      if (autocompleteRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
          fields: ["formatted_address"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setFormData(prev => ({ ...prev, address: place.formatted_address }));
          }
        });
      }
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        initAutocomplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const openSubscriptionModal = (tier) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
    setIsSuccess(false);
    setErrorMsg("");
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.roomNo) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          address: formData.address,
          roomNo: formData.roomNo,
          tier: selectedTier,
          term: selectedTerm,
          notes: formData.notes
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setIsSuccess(true);
        setFormData({ name: "", email: "", phone: "", dob: "", address: "", roomNo: "", notes: "" });
      } else {
        setErrorMsg(result.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} 
        onLoad={initAutocomplete} 
      />

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
            <button 
              onClick={() => openSubscriptionModal("silver")} 
              className="btn btn-outline" 
              style={{ width: "100%", marginTop: "auto", cursor: "pointer" }}
            >
              {t("joinSilver")}
            </button>
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
            <button 
              onClick={() => openSubscriptionModal("gold")} 
              className="btn btn-primary" 
              style={{ width: "100%", marginTop: "auto", cursor: "pointer" }}
            >
              {t("joinGold")}
            </button>
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
            <button 
              onClick={() => openSubscriptionModal("platinum")} 
              className="btn btn-primary" 
              style={{ width: "100%", marginTop: "auto", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderColor: "#1e293b", cursor: "pointer" }}
            >
              {t("joinVip")}
            </button>
          </div>
        </div>

      </div>

      {/* SUBSCRIPTION MODAL */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "1rem"
        }} onClick={() => setIsModalOpen(false)}>
          
          <div style={{
            background: "white",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "95vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            animation: "fadeInUp 0.3s ease-out"
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              padding: "1.5rem 2rem",
              position: "relative",
              color: "white",
              borderTopLeftRadius: "19px",
              borderTopRightRadius: "19px"
            }}>
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", color: "#ffffff" }}>{t("formTitle")}</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", opacity: 0.8, color: "white" }}>
                {t("formDesc")}
              </p>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: "absolute",
                  top: "1.5rem", right: "1.5rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px", height: "30px",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  color: "white", cursor: "pointer", fontSize: "0.9rem"
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "1.5rem 2rem 2rem 2rem" }}>
              {isSuccess ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <div style={{
                    width: "70px", height: "70px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    margin: "0 auto 1.5rem auto",
                    fontSize: "2.5rem"
                  }}>
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <h4 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#1e293b", margin: "0 0 0.5rem 0" }}>
                    {t("formSuccessTitle")}
                  </h4>
                  <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 2rem 0" }}>
                    {t("formSuccessDesc")}
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-primary"
                    style={{ padding: "0.75rem 2rem", width: "100%" }}
                  >
                    {t("formClose")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  
                  {/* Package & Term Selection */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                        {t("formPackage")}
                      </label>
                      <select 
                        name="tier"
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        style={{
                          width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1",
                          fontSize: "0.95rem", fontWeight: "600", textTransform: "capitalize", background: "#ffffff", color: "#0f172a"
                        }}
                      >
                        <option value="silver">{t("silverTier")}</option>
                        <option value="gold">{t("goldTier")}</option>
                        <option value="platinum">{t("vipTier")}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                        {t("formTerm")}
                      </label>
                      <select 
                        name="term"
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                        style={{
                          width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1",
                          fontSize: "0.95rem", fontWeight: "600", background: "#ffffff", color: "#0f172a"
                        }}
                      >
                        <option value="6 Months">{t("advancePayment6")}</option>
                        <option value="12 Months">{t("advancePayment12")}</option>
                      </select>
                    </div>
                  </div>

                  {/* Name & DOB Input */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                        {t("formName")} <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        required
                        placeholder="John Doe"
                        value={formData.name} 
                        onChange={handleFormChange}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                        {t("formDob")}
                      </label>
                      <input 
                        type="date" 
                        name="dob" 
                        value={formData.dob} 
                        onChange={handleFormChange}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                        {t("formEmail")} <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        required
                        placeholder="john@example.com"
                        value={formData.email} 
                        onChange={handleFormChange}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                        {t("formPhone")} <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input 
                        type="tel" 
                        name="phone" 
                        required
                        placeholder="+66 9X XXX XXXX"
                        value={formData.phone} 
                        onChange={handleFormChange}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                      />
                    </div>
                  </div>

                  {/* Address & Room Number */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                        {t("formAddress")} <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input 
                        ref={autocompleteRef}
                        type="text" 
                        name="address" 
                        required
                        placeholder={t("formAddressPlaceholder")}
                        value={formData.address} 
                        onChange={handleFormChange}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                        {t("formRoomNo")} <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        name="roomNo" 
                        required
                        placeholder="e.g. 1204"
                        value={formData.roomNo} 
                        onChange={handleFormChange}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                      {t("formNotes")}
                    </label>
                    <textarea 
                      name="notes" 
                      rows="2"
                      placeholder="e.g. Preferred callback time, pickup preferences..."
                      value={formData.notes} 
                      onChange={handleFormChange}
                      style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", resize: "none", backgroundColor: "#ffffff", color: "#0f172a" }}
                    />
                  </div>

                  {errorMsg && (
                    <div style={{ color: "#ef4444", fontSize: "0.9rem", fontWeight: "600", background: "rgba(239, 68, 68, 0.05)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "6px" }}></i>
                      {errorMsg}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ padding: "0.9rem", fontSize: "1rem", fontWeight: "700", marginTop: "0.25rem", cursor: "pointer" }}
                  >
                    {isSubmitting ? (
                      <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i> {t("formSubmitting")}</>
                    ) : t("formSubmit")}
                  </button>

                  {/* Confidentiality Notice */}
                  <div style={{ fontSize: "0.75rem", color: "#334155", textAlign: "center", marginTop: "0.2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", lineHeight: "1.4" }}>
                    <i className="fa-solid fa-lock" style={{ color: "#10b981" }}></i>
                    <span>{t("formConfidentiality")}</span>
                  </div>

                </form>
              )}
            </div>

          </div>

        </div>
      )}
    </>
  );
}
