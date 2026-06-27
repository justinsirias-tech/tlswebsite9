"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import styles from "./page.module.css";
import Link from "next/link";
import { countryCodes } from "@/utils/countryCodes";
import { useTranslations, useLocale } from "next-intl";

export default function BookingClient() {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState("+66");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [thaiMobile, setThaiMobile] = useState("");
  const [isWhatsapp, setIsWhatsapp] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countryCodes.filter(c => 
    (c.name && c.name.toLowerCase().includes(countrySearch.toLowerCase())) ||
    c.label.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.code.includes(countrySearch)
  );

  const autocompleteRef = useRef(null);
  const [buildingName, setBuildingName] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const [isDifferentDeliveryAddress, setIsDifferentDeliveryAddress] = useState(false);
  const deliveryAutocompleteRef = useRef(null);
  const [deliveryBuildingName, setDeliveryBuildingName] = useState("");
  const [deliveryRoomNo, setDeliveryRoomNo] = useState("");
  const [deliveryFullAddress, setDeliveryFullAddress] = useState("");

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupMethod, setPickupMethod] = useState("");

  const generateTimeSlots = () => {
    const slots = [];
    let currentHour = 9;
    let currentMinute = 0;
    while (currentHour < 19) {
      const startStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      let endHour = currentHour;
      let endMinute = currentMinute + 30;
      if (endMinute >= 60) {
        endHour += 1;
        endMinute = 0;
      }
      const endStr = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      slots.push(`${startStr} - ${endStr}`);
      
      currentHour = endHour;
      currentMinute = endMinute;
    }
    return slots;
  };

  const initAutocomplete = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      if (autocompleteRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
          fields: ["formatted_address", "name"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.name) setBuildingName(place.name);
          if (place.formatted_address) setFullAddress(place.formatted_address);
        });
      }
    }
  };

  useEffect(() => {
    if (isDifferentDeliveryAddress && window.google && window.google.maps && window.google.maps.places && deliveryAutocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(deliveryAutocompleteRef.current, {
        fields: ["formatted_address", "name"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.name) setDeliveryBuildingName(place.name);
        if (place.formatted_address) setDeliveryFullAddress(place.formatted_address);
      });
    }
  }, [isDifferentDeliveryAddress]);

  const handleDateChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 4) val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4, 8)}`;
    else if (val.length > 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
    setPickupDate(val);
  };

  const handleTimeChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length > 2) val = `${val.slice(0, 2)}:${val.slice(2, 4)}`;
    setPickupTime(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError("");

    if (isWhatsapp) {
      if (phoneNumber.startsWith("0")) {
        setPhoneError(t("phoneErrorLeadingZero"));
        return;
      }
      if (phoneNumber.length < 8) {
        setPhoneError(t("phoneErrorInvalid"));
        return;
      }
    }

    const formData = new FormData(e.target);
    const services = formData.getAll('service');

    if (services.length === 0) {
      alert(t("errorServiceRequired"));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const specialInst = e.target.elements.specialInstructions?.value || '';
      
      const fullServiceDesc = `Services: ${services.join('; ')}
Address: ${buildingName}, Room ${roomNo}, ${fullAddress}
Delivery: ${isDifferentDeliveryAddress ? `${deliveryBuildingName}, Room ${deliveryRoomNo}, ${deliveryFullAddress}` : 'Same as pickup'}
Pickup Method: ${pickupMethod}
Time: ${pickupTime}
Notes: ${specialInst}`.trim();

      const [d, m, y] = pickupDate.split('/');
      const timeStart = (pickupTime || '12:00').split(' ')[0];
      const formattedDate = new Date(`${y}-${m}-${d}T${timeStart}:00`);

      const bookingData = {
        customerName: e.target.elements.customerName.value,
        email: e.target.elements.email.value,
        phone: `${countryCode} ${phoneNumber} ${isWhatsapp ? '(WhatsApp)' : ''} ${thaiMobile ? `| TH: ${thaiMobile}` : ''}`,
        pickupDate: formattedDate.toISOString(),
        service: fullServiceDesc
      };

      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      
      if (res.ok) {
        const resData = await res.json();
        if (resData.emailPreviewUrl) {
          console.log("%c📧 Automated Email Sent!", "color: #10b981; font-weight: bold; font-size: 14px;");
          console.log("%cPreview the email here: " + resData.emailPreviewUrl, "color: #3b82f6; font-size: 14px;");
        }
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(t("bookingError"));
      }
    } catch (err) {
      console.error(err);
      alert(t("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} 
        strategy="lazyOnload"
        onLoad={initAutocomplete}
      />
      <section className={styles.bookingSection}>
      <div className={`container ${styles.bookingContainer}`}>
        
        {/* Left Info Panel */}
        <div className={styles.infoPanel}>
          <h1 className={styles.infoTitle}>{t("schedulePickup")}</h1>
          <p className={styles.infoSubtitle}>
            {t("subtitle")}
          </p>

          <div className={styles.contactCards}>
            <div className={styles.contactCard}>
              <div className={styles.cardIcon}>
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className={styles.cardText}>
                <h4>{t("fastTurnaround")}</h4>
                <p>{t("fastTurnaroundDesc")}</p>
              </div>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.cardIcon}>
                <i className="fa-solid fa-truck-fast"></i>
              </div>
              <div className={styles.cardText}>
                <h4>{t("doorToDoor")}</h4>
                <p>{t("doorToDoorDesc")}</p>
              </div>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.cardIcon}>
                <i className="fa-solid fa-headset"></i>
              </div>
              <div className={styles.cardText}>
                <h4>{t("needAssistance")}</h4>
                <p>
                  {t.rich("needAssistanceDesc", {
                    phone: (chunks) => <a href="tel:+66946916668" style={{ color: "var(--accent)" }}>{chunks}</a>
                  })}
                </p>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(58, 123, 213, 0.05)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid rgba(58, 123, 213, 0.2)", marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-light)" }}>
            <h4 style={{ color: "var(--primary)", marginBottom: "1rem", fontSize: "1.1rem" }}>
              <i className="fa-solid fa-circle-info" style={{ color: "var(--accent)", marginRight: "8px" }}></i> 
              {t("disclaimerTitle")}
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h5 style={{ color: "var(--text)", marginBottom: "0.5rem", fontSize: "1rem" }}>{t("disclaimerTurnaround")}</h5>
                <ul style={{ margin: "0", paddingLeft: "1.2rem", lineHeight: "1.6" }}>
                  {[1, 2, 3, 4].map((num) => {
                    const text = t(`disclaimerTurnaroundDesc${num}`);
                    const lastParenIndex = text.lastIndexOf("(");
                    const mainText = lastParenIndex !== -1 ? text.substring(0, lastParenIndex) : text;
                    const subText = lastParenIndex !== -1 ? text.substring(lastParenIndex) : "";
                    const parts = mainText.split(":");
                    return (
                      <li key={num} style={{ marginBottom: "0.8rem" }}>
                        <strong>{parts[0]}:</strong>{parts.slice(1).join(":")}
                        {subText && (
                          <>
                            <br/>
                            <em style={{ fontSize: "0.85rem", opacity: 0.85 }}>{subText}</em>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p style={{ marginTop: "0.8rem", fontStyle: "italic", fontSize: "0.85rem", opacity: 0.9 }}>
                  {t("disclaimerExpressNote")}
                </p>
              </div>
              
              <div>
                <h5 style={{ color: "var(--text)", marginBottom: "0.5rem", fontSize: "1rem" }}>{t("disclaimerLogistics")}</h5>
                <p style={{ marginBottom: "0.5rem", lineHeight: "1.6" }}>{t("disclaimerLogisticsDesc")}</p>
                <ul style={{ margin: "0", paddingLeft: "1.2rem", lineHeight: "1.6" }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    {(() => {
                      const parts = t("disclaimerLogisticsMin").split(":");
                      return <><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</>;
                    })()}
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    {(() => {
                      const parts = t("disclaimerLogisticsRate").split(":");
                      return <><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</>;
                    })()}
                  </li>
                </ul>
                <p style={{ marginTop: "0.8rem", fontStyle: "italic", fontSize: "0.85rem", opacity: 0.9 }}>
                  {t("disclaimerLogisticsExample")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className={styles.formWrapper}>
          {isSubmitted ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2>{t("bookingReceived")}</h2>
              <p style={{ marginBottom: "1rem" }}>{t("bookingReceivedSuccess")}</p>
              <div style={{ background: "rgba(58, 123, 213, 0.05)", padding: "1.5rem", borderRadius: "var(--radius)", marginBottom: "2rem", border: "1px solid rgba(58, 123, 213, 0.2)", textAlign: "left" }}>
                <h5 style={{ color: "var(--primary)", fontSize: "1.1rem", marginBottom: "1rem" }}>{t("verificationTitle")}</h5>
                <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.8rem", color: "var(--text-light)", lineHeight: "1.6" }}>
                  <li>
                    {(() => {
                      const parts = t("verificationDesc1").split(":");
                      return <><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</>;
                    })()}
                  </li>
                  <li>
                    {(() => {
                      const parts = t("verificationDesc2").split(":");
                      return <><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</>;
                    })()}
                  </li>
                  <li>
                    {(() => {
                      const parts = t("verificationDesc3").split(":");
                      return <><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</>;
                    })()}
                  </li>
                </ul>
              </div>
              <button onClick={() => setIsSubmitted(false)} className="btn btn-outline" style={{ padding: "0.8rem 2rem" }}>
                {t("bookAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              
              <div className={styles.fullWidth}>
                <h3 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "0.5rem" }}>
                  <i className="fa-solid fa-user" style={{ color: "var(--accent)", marginRight: "10px" }}></i>
                  {t("contactInfo")}
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className={styles.inputGroup}>
                  <label>{t("fullName")}</label>
                  <input type="text" name="customerName" placeholder={t("fullNamePlaceholder")} required />
                </div>

                <div className={styles.inputGroup}>
                  <label>{t("email")}</label>
                  <input type="email" name="email" placeholder={t("emailPlaceholder")} required />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className={styles.inputGroup}>
                  <label>{t("phone")}</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div className={styles.customSelect} ref={dropdownRef}>
                    <div 
                      className={styles.selectTrigger} 
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    >
                      {countryCodes.find(c => c.code === countryCode)?.label || "TH +66"}
                      <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.8rem", color: "var(--text-light)" }}></i>
                    </div>
                    
                    {isCountryDropdownOpen && (
                      <div className={styles.selectMenu}>
                        <input 
                          type="text" 
                          placeholder={locale === 'th' ? "ค้นหาประเทศ..." : "Search country..."} 
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className={styles.searchInput}
                          autoFocus
                        />
                        <div className={styles.optionsList}>
                          {filteredCountries.map((country, index) => (
                            <div 
                              key={index} 
                              className={styles.optionItem}
                              onClick={() => {
                                setCountryCode(country.code);
                                setIsCountryDropdownOpen(false);
                                setCountrySearch("");
                              }}
                            >
                              {country.name ? `${country.name} (${country.label})` : country.label}
                            </div>
                          ))}
                          {filteredCountries.length === 0 && (
                            <div style={{ padding: "0.8rem", color: "var(--text-light)", fontSize: "0.9rem", textAlign: "center" }}>{locale === 'th' ? "ไม่พบผลลัพธ์" : "No results found"}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                    <input 
                      type="tel" 
                      placeholder={t("phonePlaceholder")}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9 ]/g, ''))}
                      required 
                      style={{ flexGrow: 1, minWidth: "120px" }}
                    />
                    <label className={styles.whatsappCheckbox} title={t("whatsappTooltip")} style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "var(--text-light)", padding: "0.5rem", border: "2px solid rgba(0,0,0,0.08)", borderRadius: "var(--radius)", background: isWhatsapp ? "rgba(37, 211, 102, 0.1)" : "white", transition: "all 0.3s ease" }}>
                      <input 
                        type="checkbox" 
                        checked={isWhatsapp} 
                        onChange={(e) => setIsWhatsapp(e.target.checked)} 
                        style={{ width: "auto", marginRight: "6px", cursor: "pointer" }}
                      />
                      <i className="fa-brands fa-whatsapp" style={{ color: "#25D366", fontSize: "1.3rem" }}></i>
                    </label>
                  </div>
                  {phoneError && <span style={{ color: "var(--vivid-red)", fontSize: "0.85rem", marginTop: "5px" }}>{phoneError}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label>{t("thaiMobile")}</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ padding: "1rem 1.2rem", background: "rgba(0,0,0,0.02)", border: "2px solid rgba(0,0,0,0.08)", borderRadius: "var(--radius)", color: "var(--text-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      🇹🇭
                    </div>
                    <input 
                      type="tel" 
                      placeholder={t("thaiMobilePlaceholder")}
                      value={thaiMobile}
                      onChange={(e) => setThaiMobile(e.target.value.replace(/[^0-9 ]/g, ''))}
                      style={{ flexGrow: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.fullWidth} style={{ marginTop: "1rem" }}>
                <h3 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "0.5rem" }}>
                  <i className="fa-solid fa-location-dot" style={{ color: "var(--accent)", marginRight: "10px" }}></i>
                  {t("pickupDeliveryDetails")}
                </h3>
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>{t("buildingLabel")}</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-brands fa-google" style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", color: "#DB4437" }}></i>
                  <input 
                    type="text" 
                    placeholder={t("buildingPlaceholder")}
                    ref={autocompleteRef}
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    required 
                    style={{ paddingRight: "40px" }}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>{t("roomNo")}</label>
                <input 
                  type="text" 
                  placeholder={t("roomNoPlaceholder")}
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>{t("fullAddress")}</label>
                <input 
                  type="text" 
                  placeholder={t("fullAddressPlaceholder")}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  required 
                />
              </div>

              <div className={styles.fullWidth}>
                <label className={styles.checkboxItem} style={{ border: "none", padding: "0.5rem 0", background: "transparent", marginTop: "0" }}>
                  <input 
                    type="checkbox" 
                    checked={isDifferentDeliveryAddress} 
                    onChange={(e) => setIsDifferentDeliveryAddress(e.target.checked)} 
                  />
                  <span className={styles.checkmark}></span>
                  <span className={styles.labelName} style={{ color: "var(--text)", fontWeight: "500" }}>{t("differentDelivery")}</span>
                </label>
              </div>

              {isDifferentDeliveryAddress && (
                <>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`} style={{ marginTop: "1rem" }}>
                    <h3 style={{ fontSize: "1.3rem", color: "var(--primary)", marginBottom: "1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "0.5rem" }}>
                      <i className="fa-solid fa-truck" style={{ color: "var(--accent)", marginRight: "10px" }}></i>
                      {t("deliveryDetails")}
                    </h3>
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>{t("deliveryBuilding")}</label>
                    <div style={{ position: "relative" }}>
                      <i className="fa-brands fa-google" style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", color: "#DB4437" }}></i>
                      <input 
                        type="text" 
                        placeholder={t("buildingPlaceholder")}
                        ref={deliveryAutocompleteRef}
                        value={deliveryBuildingName}
                        onChange={(e) => setDeliveryBuildingName(e.target.value)}
                        required={isDifferentDeliveryAddress}
                        style={{ paddingRight: "40px" }}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>{t("deliveryRoom")}</label>
                    <input 
                      type="text" 
                      placeholder={t("roomNoPlaceholder")}
                      value={deliveryRoomNo}
                      onChange={(e) => setDeliveryRoomNo(e.target.value)}
                      required={isDifferentDeliveryAddress} 
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>{t("deliveryAddress")}</label>
                    <input 
                      type="text" 
                      placeholder={t("fullAddressPlaceholder")}
                      value={deliveryFullAddress}
                      onChange={(e) => setDeliveryFullAddress(e.target.value)}
                      required={isDifferentDeliveryAddress}
                    />
                  </div>
                </>
              )}

              <div className={styles.inputGroup}>
                <label>{t("date")}</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type="text" 
                    placeholder="dd/mm/yyyy" 
                    value={pickupDate}
                    onChange={handleDateChange}
                    required 
                    maxLength={10}
                  />
                  <input 
                    type="date"
                    style={{ position: 'absolute', opacity: 0, right: 0, top: 0, bottom: 0, width: '50px', cursor: 'pointer', zIndex: 10 }}
                    onChange={(e) => {
                      const val = e.target.value; // YYYY-MM-DD
                      if(val) {
                        const [y, m, d] = val.split('-');
                        setPickupDate(`${d}/${m}/${y}`);
                      }
                    }}
                  />
                  <i className="fa-regular fa-calendar" style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", pointerEvents: "none", zIndex: 5 }}></i>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>{t("time")}</label>
                <div style={{ position: "relative" }}>
                  <select 
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "1rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      outline: "none",
                      fontSize: "1rem",
                      background: "white",
                      cursor: "pointer",
                      appearance: "none"
                    }}
                  >
                    <option value="" disabled hidden>{t("selectTimeSlot") || "Select a time slot"}</option>
                    {generateTimeSlots().map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", pointerEvents: "none", zIndex: 5 }}></i>
                </div>
              </div>

              <div className={styles.fullWidth} style={{ marginTop: "1rem" }}>
                <label style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--primary)", marginBottom: "1rem", display: "block" }}>
                  {t("howToPickup")}
                </label>
                <div className={styles.checkboxGrid} style={{ gridTemplateColumns: "1fr 1fr", marginTop: "0" }}>
                  <label className={styles.checkboxItem}>
                    <input 
                      type="radio" 
                      name="pickupMethod" 
                      value="Meet in person" 
                      checked={pickupMethod === "Meet in person"}
                      onChange={(e) => setPickupMethod(e.target.value)}
                      required 
                    />
                    <span className={styles.checkmark} style={{ borderRadius: "50%" }}></span>
                    <span className={styles.labelName}>{t("meetInPerson")}</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input 
                      type="radio" 
                      name="pickupMethod" 
                      value="Leave it with the concierge/lobby" 
                      checked={pickupMethod === "Leave it with the concierge/lobby"}
                      onChange={(e) => setPickupMethod(e.target.value)}
                      required 
                    />
                    <span className={styles.checkmark} style={{ borderRadius: "50%" }}></span>
                    <span className={styles.labelName}>{t("leaveConcierge")}</span>
                  </label>
                </div>
              </div>

              <div className={styles.fullWidth} style={{ marginTop: "1rem" }}>
                <h3 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1rem", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "0.5rem" }}>
                  <i className="fa-solid fa-shirt" style={{ color: "var(--accent)", marginRight: "10px" }}></i>
                  {t("typeOfLaundry")}
                </h3>
                
                <div className={styles.checkboxGrid}>
                  <label className={styles.checkboxItem}>
                    <input type="checkbox" name="service" value="Wash & Fold (Weight)" />
                    <span className={styles.checkmark}></span>
                    <span className={styles.labelName}>{t("typeWashFold")}</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" name="service" value="Wash, Iron & Fold (Weight)" />
                    <span className={styles.checkmark}></span>
                    <span className={styles.labelName}>{t("typeWashIronFold")}</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" name="service" value="Wash, Iron & Hang (Weight)" />
                    <span className={styles.checkmark}></span>
                    <span className={styles.labelName}>{t("typeWashIronHang")}</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" name="service" value="Dry cleaning" />
                    <span className={styles.checkmark}></span>
                    <span className={styles.labelName}>{t("typeDryCleaning")}</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" name="service" value="Linens & Beddings" />
                    <span className={styles.checkmark}></span>
                    <span className={styles.labelName}>{t("typeLinensBeddings")}</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" name="service" value="Mixed Service" />
                    <span className={styles.checkmark}></span>
                    <span className={styles.labelName}>{t("typeMixed")}</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" name="service" value="Ironing & Pressing only" />
                    <span className={styles.checkmark}></span>
                    <span className={styles.labelName}>{t("typeIroningPressing")}</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" name="service" value="Others" />
                    <span className={styles.checkmark}></span>
                    <span className={styles.labelName}>{t("typeOthers")}</span>
                  </label>
                </div>
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`} style={{ marginTop: "1rem" }}>
                <label>{t("specialInstructions")}</label>
                <textarea name="specialInstructions" placeholder={t("specialInstructionsPlaceholder")}></textarea>
              </div>

              <div className={styles.fullWidth}>
                <div style={{ fontSize: "0.9rem", color: "var(--text-light)", textAlign: "left", marginBottom: "1.5rem", lineHeight: "1.6", background: "rgba(0,0,0,0.02)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <h5 style={{ color: "var(--primary)", fontSize: "1.05rem", marginBottom: "1rem" }}>{t("verificationTitle")}</h5>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <li>
                      {(() => {
                        const parts = t("verificationDesc1").split(":");
                        return <><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</>;
                      })()}
                    </li>
                    <li>
                      {(() => {
                        const parts = t("verificationDesc2").split(":");
                        return <><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</>;
                      })()}
                    </li>
                    <li>
                      {(() => {
                        const parts = t("verificationDesc3").split(":");
                        return <><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</>;
                      })()}
                    </li>
                  </ul>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? t("processing") : t("confirmBooking")}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </section>
    </>
  );
}
