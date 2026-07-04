"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";

const localizations = {
  en: {
    dashboardTitle: "Member Dashboard",
    welcome: "Welcome back",
    balanceCardTitle: "Account Balance",
    tierCardTitle: "Membership Tier",
    bookingsCount: "Total Bookings",
    joinedDate: "Member Since",
    topupSectionTitle: "Top Up Wallet Credits",
    selectAmount: "Select or Enter Amount",
    customAmount: "Custom Amount (THB)",
    cardNumber: "Card Number",
    cardExpiry: "Expiry Date (MM/YY)",
    cardCvv: "CVV",
    topupBtn: "Top Up Credits Now",
    topupSuccess: "Successfully topped up your credits!",
    bookingsSectionTitle: "My Laundry Bookings",
    transactionsSectionTitle: "Past Transactions",
    noBookings: "You have not made any laundry bookings yet.",
    noTransactions: "No past transactions recorded.",
    bookNow: "Book Laundry Service",
    logoutBtn: "Log Out",
    statusPending: "Pending",
    statusClosed: "Completed",
    statusCancelled: "Cancelled",
    deposit: "Deposit",
    payment: "Service Payment",
    cardHolder: "Cardholder Name"
  },
  th: {
    dashboardTitle: "แดชบอร์ดสมาชิก",
    welcome: "ยินดีต้อนรับกลับคุณ",
    balanceCardTitle: "ยอดเงินคงเหลือ",
    tierCardTitle: "ระดับสมาชิก",
    bookingsCount: "การจองทั้งหมด",
    joinedDate: "เป็นสมาชิกตั้งแต่",
    topupSectionTitle: "เติมเงินในกระเป๋าเงินของคุณ",
    selectAmount: "เลือกหรือกรอกจำนวนเงิน",
    customAmount: "ระบุจำนวนเงิน (บาท)",
    cardNumber: "หมายเลขบัตรเครดิต",
    cardExpiry: "วันหมดอายุ (ดด/ปป)",
    cardCvv: "CVV",
    topupBtn: "เติมเงินตอนนี้",
    topupSuccess: "เติมเงินเข้ากระเป๋าเงินสำเร็จ!",
    bookingsSectionTitle: "รายการจองซักรีดของฉัน",
    transactionsSectionTitle: "ประวัติการทำรายการ",
    noBookings: "คุณยังไม่มีประวัติการจองซักรีด",
    noTransactions: "ไม่มีประวัติการทำรายการเงินเข้า-ออก",
    bookNow: "จองบริการซักรีดตอนนี้",
    logoutBtn: "ออกจากระบบ",
    statusPending: "รอดำเนินการ",
    statusClosed: "เสร็จสิ้น",
    statusCancelled: "ยกเลิกแล้ว",
    deposit: "ฝากเงิน",
    payment: "ชำระค่าบริการ",
    cardHolder: "ชื่อผู้ถือบัตร"
  },
  cn: {
    dashboardTitle: "会员中心",
    welcome: "欢迎回来",
    balanceCardTitle: "账户余额",
    tierCardTitle: "会员等级",
    bookingsCount: "预订总数",
    joinedDate: "注册时间",
    topupSectionTitle: "充值钱包余额",
    selectAmount: "选择或输入充值金额",
    customAmount: "自定义金额 (泰铢)",
    cardNumber: "卡号",
    cardExpiry: "有效期 (月月/年年)",
    cardCvv: "CVV",
    topupBtn: "立即充值",
    topupSuccess: "钱包充值成功！",
    bookingsSectionTitle: "我的洗衣预订",
    transactionsSectionTitle: "交易历史",
    noBookings: "您目前没有洗衣服务预订。",
    noTransactions: "暂无交易记录。",
    bookNow: "预订洗衣服务",
    logoutBtn: "退出登录",
    statusPending: "等待处理",
    statusClosed: "已完成",
    statusCancelled: "已取消",
    deposit: "充值",
    payment: "服务费扣除",
    cardHolder: "持卡人姓名"
  }
};

export default function MemberDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale || "en";
  const t = localizations[locale] || localizations.en;

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Top up states
  const [topupAmount, setTopupAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMessage, setTopupMessage] = useState("");

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/member/profile");
      const data = await res.json();
      if (!res.ok) {
        router.push(`/${locale}/member/login`);
        return;
      }
      setMember(data.member);
    } catch (err) {
      setError("Failed to load profile. Please try logging in again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [locale, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/member/logout", { method: "POST" });
      router.push(`/${locale}/member/login`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    setTopupLoading(true);
    setTopupMessage("");
    setError("");

    const finalAmount = customAmount ? parseFloat(customAmount) : topupAmount;

    try {
      const res = await fetch("/api/member/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          cardNumber,
          cardExpiry,
          cardCvv,
          cardHolder
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Top-up failed");

      setTopupMessage(t.topupSuccess);
      setCustomAmount("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardHolder("");
      
      // Refresh member profile data to show updated balance
      await loadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setTopupLoading(false);
    }
  };

  const getTierClass = (tier) => {
    switch (tier?.toLowerCase()) {
      case "silver": return styles.silverTier;
      case "gold": return styles.goldTier;
      case "platinum": return styles.platinumTier;
      default: return styles.normalTier;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "th" ? "th-TH" : locale === "cn" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className="container">
        
        {/* Profile Welcome Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>{t.dashboardTitle}</h1>
            <p className={styles.welcomeText}>
              {t.welcome}, <strong style={{ color: "var(--accent)" }}>{member?.name}</strong>
            </p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> {t.logoutBtn}
          </button>
        </div>

        {/* Info Cards Grid */}
        <div className={styles.statsGrid}>
          {/* Wallet Balance Card */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>{t.balanceCardTitle}</span>
              <i className="fa-solid fa-wallet" style={{ color: "#10b981" }}></i>
            </div>
            <div className={styles.balanceValue}>
              ฿{member?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Membership Tier Card */}
          <div className={`${styles.statCard} ${getTierClass(member?.tier)}`}>
            <div className={styles.statHeader}>
              <span>{t.tierCardTitle}</span>
              <i className="fa-solid fa-crown"></i>
            </div>
            <div className={styles.tierValue}>
              {member?.tier || "None"}
            </div>
          </div>

          {/* Total Bookings Card */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>{t.bookingsCount}</span>
              <i className="fa-solid fa-calendar-check" style={{ color: "var(--accent)" }}></i>
            </div>
            <div className={styles.bookingsCountValue}>
              {member?.bookings?.length || 0}
            </div>
          </div>

          {/* Registration Date Card */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>{t.joinedDate}</span>
              <i className="fa-solid fa-user-clock" style={{ color: "#a855f7" }}></i>
            </div>
            <div className={styles.joinedValue}>
              {formatDate(member?.createdAt)}
            </div>
          </div>
        </div>

        {/* Main Dashboard Panel Layout */}
        <div className={styles.dashboardPanelGrid}>
          
          {/* Left Column: Bookings and Transactions */}
          <div className={styles.leftColumn}>
            
            {/* Bookings Section */}
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>
                  <i className="fa-solid fa-list-check" style={{ marginRight: "10px", color: "var(--accent)" }}></i>
                  {t.bookingsSectionTitle}
                </h2>
                <Link href="/booking" className={styles.bookNowBtn}>
                  <i className="fa-solid fa-plus"></i> {t.bookNow}
                </Link>
              </div>

              {(!member?.bookings || member?.bookings.length === 0) ? (
                <div className={styles.emptyState}>{t.noBookings}</div>
              ) : (
                <div className={styles.bookingsList}>
                  {member.bookings.map(booking => (
                    <div key={booking.id} className={styles.bookingItem}>
                      <div className={styles.bookingInfo}>
                        <h4 className={styles.bookingService}>{booking.service?.split('/').join(' • ')}</h4>
                        <p className={styles.bookingDate}>
                          <i className="fa-solid fa-calendar-day" style={{ marginRight: "6px" }}></i>
                          {formatDate(booking.pickupDate)}
                        </p>
                      </div>
                      <span className={`${styles.statusBadge} ${
                        booking.status === "CLOSED" ? styles.statusClosed : 
                        booking.status === "CANCELLED" ? styles.statusCancelled : styles.statusPending
                      }`}>
                        {booking.status === "CLOSED" ? t.statusClosed : 
                         booking.status === "CANCELLED" ? t.statusCancelled : t.statusPending}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions Section */}
            <div className={styles.panelCard} style={{ marginTop: "2rem" }}>
              <div className={styles.panelHeader}>
                <h2>
                  <i className="fa-solid fa-receipt" style={{ marginRight: "10px", color: "#10b981" }}></i>
                  {t.transactionsSectionTitle}
                </h2>
              </div>

              {(!member?.transactions || member?.transactions.length === 0) ? (
                <div className={styles.emptyState}>{t.noTransactions}</div>
              ) : (
                <div className={styles.transactionsList}>
                  {member.transactions.map(tx => (
                    <div key={tx.id} className={styles.transactionItem}>
                      <div className={styles.txInfo}>
                        <h4 className={styles.txDesc}>{tx.description}</h4>
                        <p className={styles.txDate}>{formatDate(tx.createdAt)}</p>
                      </div>
                      <div className={`${styles.txAmount} ${tx.amount > 0 ? styles.txPositive : styles.txNegative}`}>
                        {tx.amount > 0 ? `+฿${tx.amount.toFixed(2)}` : `-฿${Math.abs(tx.amount).toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Top Up Wallet Form */}
          <div className={styles.rightColumn}>
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>
                  <i className="fa-solid fa-circle-dollar-to-slot" style={{ marginRight: "10px", color: "#10b981" }}></i>
                  {t.topupSectionTitle}
                </h2>
              </div>

              {topupMessage && <div className={styles.successAlert}>{topupMessage}</div>}
              {error && <div className={styles.errorAlert}>{error}</div>}

              <form onSubmit={handleTopup} className={styles.topupForm}>
                
                {/* Preset Amounts Grid */}
                <div className={styles.inputGroup}>
                  <label>{t.selectAmount}</label>
                  <div className={styles.presetGrid}>
                    {[200, 500, 1000, 2000, 5000].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setTopupAmount(amount);
                          setCustomAmount("");
                        }}
                        className={`${styles.presetBtn} ${topupAmount === amount && !customAmount ? styles.presetActive : ""}`}
                      >
                        ฿{amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div className={styles.inputGroup}>
                  <label>{t.customAmount}</label>
                  <input 
                    type="number" 
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setTopupAmount(0);
                    }}
                    placeholder="e.g. 1500"
                    min="50"
                  />
                </div>

                {/* Cardholder name */}
                <div className={styles.inputGroup}>
                  <label>{t.cardHolder}</label>
                  <input 
                    type="text" 
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Card Number */}
                <div className={styles.inputGroup}>
                  <label>{t.cardNumber}</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      placeholder="4111 2222 3333 4444"
                      maxLength={19}
                      required
                    />
                    <i className="fa-solid fa-credit-card" style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}></i>
                  </div>
                </div>

                {/* Grid for Expiry and CVV */}
                <div className={styles.cardInfoGrid}>
                  <div className={styles.inputGroup}>
                    <label>{t.cardExpiry}</label>
                    <input 
                      type="text" 
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/29"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>{t.cardCvv}</label>
                    <input 
                      type="password" 
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={topupLoading} className={styles.submitTopupBtn}>
                  {topupLoading ? "..." : t.topupBtn}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
