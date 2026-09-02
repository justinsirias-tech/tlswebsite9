"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";

const DEFAULT_TERMS = {
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

export default function AdminTermsPage() {
  const [activeTab, setActiveTab] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastUpdated, setLastUpdated] = useState("September 1, 2026");

  const [termsData, setTermsData] = useState(DEFAULT_TERMS);

  useEffect(() => {
    fetchTerms();
  }, []);

  async function fetchTerms() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/terms");
      const data = await res.json();
      if (data.success && data.terms) {
        setTermsData({
          en: { ...DEFAULT_TERMS.en, ...(data.terms.en || {}) },
          th: { ...DEFAULT_TERMS.th, ...(data.terms.th || {}) },
          cn: { ...DEFAULT_TERMS.cn, ...(data.terms.cn || {}) }
        });
        if (data.terms.lastUpdated) {
          setLastUpdated(data.terms.lastUpdated);
        }
      }
    } catch (err) {
      console.error("Failed to load terms:", err);
      setError("Failed to load current Terms and Conditions.");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field, value) => {
    setTermsData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          en: termsData.en,
          th: termsData.th,
          cn: termsData.cn,
          lastUpdated: lastUpdated
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Terms & Conditions updated successfully!");
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(data.error || "Failed to save Terms & Conditions");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset active tab to default template text? Unsaved changes will be replaced.")) {
      setTermsData(prev => ({
        ...prev,
        [activeTab]: DEFAULT_TERMS[activeTab]
      }));
    }
  };

  const current = termsData[activeTab] || DEFAULT_TERMS[activeTab];

  const sections = [
    { key: "1", titleKey: "s1Title", contentKey: "s1Content", defaultTitle: "1. Overview & General Agreement" },
    { key: "2", titleKey: "s2Title", contentKey: "s2Content", defaultTitle: "2. Pickup & Delivery Policies" },
    { key: "3", titleKey: "s3Title", contentKey: "s3Content", defaultTitle: "3. Garment Care & Inspection" },
    { key: "4", titleKey: "s4Title", contentKey: "s4Content", defaultTitle: "4. Pricing, Minimum Orders & Payment" },
    { key: "5", titleKey: "s5Title", contentKey: "s5Content", defaultTitle: "5. Turnaround & Express Service" },
    { key: "6", titleKey: "s6Title", contentKey: "s6Content", defaultTitle: "6. Loss & Damage Liability" },
    { key: "7", titleKey: "s7Title", contentKey: "s7Content", defaultTitle: "7. Unclaimed Garments Policy" }
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Header Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.5rem",
        marginBottom: "2rem",
        background: "#ffffff",
        padding: "1.75rem 2rem",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)"
      }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", color: "#222945", fontWeight: "800", marginBottom: "0.4rem" }}>
            <i className="fa-solid fa-file-contract" style={{ color: "#222945", marginRight: "0.75rem" }}></i>
            Terms & Conditions Settings
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Easily update terms and policy guidelines for customers across English, Thai, and Chinese.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button 
            onClick={handleResetDefaults}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#475569",
              border: "1px solid #cbd5e1",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "all 0.2s ease"
            }}
          >
            <i className="fa-solid fa-rotate-left" style={{ marginRight: "0.5rem" }}></i>
            Reset Default
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.75rem 1.75rem",
              borderRadius: "10px",
              background: "#222945",
              color: "#ffffff",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "0.95rem",
              boxShadow: "0 4px 12px rgba(34, 41, 69, 0.25)",
              transition: "all 0.2s ease"
            }}
          >
            <i className="fa-solid fa-floppy-disk" style={{ marginRight: "0.5rem" }}></i>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", padding: "1rem 1.25rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #fecaca", fontWeight: "500" }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }}></i>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: "#f0fdf4", color: "#166534", padding: "1rem 1.25rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #bbf7d0", fontWeight: "500" }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: "0.5rem" }}></i>
          {success}
        </div>
      )}

      {/* Last Updated Bar */}
      <div style={{
        background: "#ffffff",
        padding: "1.25rem 2rem",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        marginBottom: "1.75rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <label style={{ color: "#222945", fontWeight: "700", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color: "#222945" }}></i>
            Last Updated Date text:
          </label>
          <input 
            type="text" 
            value={lastUpdated}
            onChange={(e) => setLastUpdated(e.target.value)}
            placeholder="e.g. September 1, 2026"
            style={{
              padding: "0.65rem 1rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#222945",
              fontWeight: "600",
              fontSize: "0.95rem",
              flex: "1",
              maxWidth: "360px"
            }}
          />
        </div>
      </div>

      {/* Language Selector Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <button
          onClick={() => setActiveTab("en")}
          style={{
            padding: "0.85rem 1.75rem",
            borderRadius: "12px 12px 0 0",
            border: "1px solid",
            borderColor: activeTab === "en" ? "#222945" : "#e2e8f0",
            borderBottom: "none",
            background: activeTab === "en" ? "#222945" : "#ffffff",
            color: activeTab === "en" ? "#ffffff" : "#475569",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.95rem",
            boxShadow: activeTab === "en" ? "0 4px 12px rgba(34, 41, 69, 0.2)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          🇬🇧 English (EN)
        </button>
        <button
          onClick={() => setActiveTab("th")}
          style={{
            padding: "0.85rem 1.75rem",
            borderRadius: "12px 12px 0 0",
            border: "1px solid",
            borderColor: activeTab === "th" ? "#222945" : "#e2e8f0",
            borderBottom: "none",
            background: activeTab === "th" ? "#222945" : "#ffffff",
            color: activeTab === "th" ? "#ffffff" : "#475569",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.95rem",
            boxShadow: activeTab === "th" ? "0 4px 12px rgba(34, 41, 69, 0.2)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          🇹🇭 ภาษาไทย (TH)
        </button>
        <button
          onClick={() => setActiveTab("cn")}
          style={{
            padding: "0.85rem 1.75rem",
            borderRadius: "12px 12px 0 0",
            border: "1px solid",
            borderColor: activeTab === "cn" ? "#222945" : "#e2e8f0",
            borderBottom: "none",
            background: activeTab === "cn" ? "#222945" : "#ffffff",
            color: activeTab === "cn" ? "#ffffff" : "#475569",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.95rem",
            boxShadow: activeTab === "cn" ? "0 4px 12px rgba(34, 41, 69, 0.2)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          🇨🇳 中文 (CN)
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ background: "#ffffff", padding: "3rem", borderRadius: "0 16px 16px 16px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#222945" }}></i>
          <p style={{ fontWeight: "500" }}>Loading terms editor...</p>
        </div>
      ) : (
        <div style={{
          background: "#ffffff",
          padding: "2.5rem",
          borderRadius: "0 16px 16px 16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)"
        }}>
          <div style={{ display: "grid", gap: "2rem" }}>

            {/* Header Titles Card */}
            <div style={{
              background: "#f8fafc",
              padding: "1.75rem",
              borderRadius: "14px",
              border: "1px solid #e2e8f0"
            }}>
              <h3 style={{ fontSize: "1.1rem", color: "#222945", fontWeight: "700", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <i className="fa-solid fa-heading" style={{ color: "#222945" }}></i>
                Page Header & Banner ({activeTab.toUpperCase()})
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    Main Page Title
                  </label>
                  <input 
                    type="text" 
                    value={current.title || ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#222945",
                      fontWeight: "600",
                      fontSize: "1rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#222945", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    Subtitle Description
                  </label>
                  <input 
                    type="text" 
                    value={current.subtitle || ""}
                    onChange={(e) => handleChange("subtitle", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#222945",
                      fontWeight: "500",
                      fontSize: "0.95rem"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sections */}
            {sections.map((sec) => {
              return (
                <div key={sec.key} style={{
                  background: "#f8fafc",
                  padding: "1.75rem",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", color: "#222945", fontWeight: "700", fontSize: "1rem", marginBottom: "0.5rem" }}>
                      Section {sec.key} Heading:
                    </label>
                    <input 
                      type="text" 
                      value={current[sec.titleKey] || ""}
                      onChange={(e) => handleChange(sec.titleKey, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#222945",
                        fontWeight: "700",
                        fontSize: "1.05rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", color: "#475569", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                      Section {sec.key} Policy Content Body:
                    </label>
                    <textarea 
                      rows={5}
                      value={current[sec.contentKey] || ""}
                      onChange={(e) => handleChange(sec.contentKey, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#222945",
                        fontWeight: "400",
                        fontSize: "1rem",
                        lineHeight: "1.6",
                        resize: "vertical",
                        minHeight: "120px"
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Save Button Bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "0.9rem 2.5rem",
                  borderRadius: "10px",
                  background: "#222945",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 14px rgba(34, 41, 69, 0.3)",
                  transition: "all 0.2s ease"
                }}
              >
                <i className="fa-solid fa-floppy-disk" style={{ marginRight: "0.6rem" }}></i>
                {saving ? "Saving Changes..." : "Save All Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
