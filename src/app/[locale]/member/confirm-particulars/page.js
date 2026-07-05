"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Autocomplete from "react-google-autocomplete";
import styles from "./particulars.module.css";

const localizations = {
  en: {
    title: "Confirm Your Particulars",
    subtitle: "Please verify and complete your profile details before proceeding to your dashboard.",
    name: "Full Name",
    email: "Email Address",
    phone: "Mobile Number",
    dob: "Date of Birth",
    address: "Address (powered by Google)",
    roomNo: "Unit / Room No.",
    saveBtn: "Save & Proceed to Dashboard",
    placeholderName: "Enter your full name",
    placeholderPhone: "e.g. +66 9X XXX XXXX",
    placeholderAddress: "Start typing your address...",
    placeholderRoom: "e.g. Room 402, 4th Floor",
    errorAlert: "Failed to update particulars. Please try again.",
    successAlert: "Particulars saved successfully!"
  },
  th: {
    title: "ยืนยันข้อมูลส่วนตัวของคุณ",
    subtitle: "โปรดตรวจสอบและกรอกข้อมูลโปรไฟล์ของคุณให้ครบถ้วนก่อนเข้าสู่แดชบอร์ดสมาชิก",
    name: "ชื่อ-นามสกุล",
    email: "ที่อยู่อีเมล",
    phone: "เบอร์โทรศัพท์มือถือ",
    dob: "วันเดือนปีเกิด",
    address: "ที่อยู่ (ขับเคลื่อนโดย Google)",
    roomNo: "เลขที่ห้อง / บ้านเลขที่",
    saveBtn: "บันทึกและเข้าสู่แดชบอร์ด",
    placeholderName: "ระบุชื่อ-นามสกุลของคุณ",
    placeholderPhone: "เช่น +66 9X XXX XXXX",
    placeholderAddress: "เริ่มพิมพ์ที่อยู่ของคุณ...",
    placeholderRoom: "เช่น ห้อง 402 ชั้น 4",
    errorAlert: "ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
    successAlert: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!"
  },
  cn: {
    title: "确认您的个人信息",
    subtitle: "在进入会员中心之前，请核对并完善您的个人档案信息。",
    name: "完整姓名",
    email: "电子邮箱",
    phone: "手机号码",
    dob: "出生日期",
    address: "居住地址 (由 Google 提供技术支持)",
    roomNo: "单元/门牌号",
    saveBtn: "保存并进入会员中心",
    placeholderName: "输入您的完整姓名",
    placeholderPhone: "例如 +66 9X XXX XXXX",
    placeholderAddress: "输入以自动搜索地址...",
    placeholderRoom: "例如 402室，4层",
    errorAlert: "更新信息失败，请重试。",
    successAlert: "个人信息保存成功！"
  }
};

export default function ConfirmParticularsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale || "en";
  const t = localizations[locale] || localizations.en;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [roomNo, setRoomNo] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Load active member details
    fetch("/api/member/profile")
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          router.push(`/${locale}/member/login`);
          return;
        }
        const m = data.member;
        setName(m.name || "");
        setEmail(m.email || "");
        setPhone(m.phone || "");
        setDob(m.dob || "");
        setAddress(m.address || "");
        setRoomNo(m.roomNo || "");
      })
      .catch(() => {
        setError("Failed to fetch member context");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [locale, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          dob,
          address,
          roomNo
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.errorAlert);

      setMessage(t.successAlert);
      setTimeout(() => {
        router.push(`/${locale}/member/dashboard`);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.particularsCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {message && <div className={styles.successAlert}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Full Name */}
          <div className={styles.inputGroup}>
            <label>{t.name}</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t.placeholderName}
              required 
            />
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label>{t.email}</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {/* Phone / Mobile */}
          <div className={styles.inputGroup}>
            <label>{t.phone}</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder={t.placeholderPhone}
              required 
            />
          </div>

          {/* Date of Birth */}
          <div className={styles.inputGroup}>
            <label>{t.dob}</label>
            <input 
              type="date" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)} 
              required 
            />
          </div>

          {/* Google powered address */}
          <div className={styles.inputGroup}>
            <label>{t.address}</label>
            <Autocomplete
              className={styles.autocompleteInput}
              onPlaceSelected={(place) => {
                setAddress(place.formatted_address || place.name || "");
              }}
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              placeholder={t.placeholderAddress}
              required
            />
          </div>

          {/* Unit / Room No. */}
          <div className={styles.inputGroup}>
            <label>{t.roomNo}</label>
            <input 
              type="text" 
              value={roomNo} 
              onChange={(e) => setRoomNo(e.target.value)} 
              placeholder={t.placeholderRoom}
              required 
            />
          </div>

          <button type="submit" disabled={saving} className={styles.submitBtn}>
            {saving ? "Saving..." : t.saveBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
