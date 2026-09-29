"use client";

import { useEffect, useState, useMemo } from "react";
import { toInputDateTime, toISOStringOrNull } from "@/lib/dateUtils";

export default function AdminPartnersPage() {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "accounts" | "sales"

  // Partners State
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  // Sales State
  const [sales, setSales] = useState([]);
  const [salesSummary, setSalesSummary] = useState({ count: 0, totalRevenue: 0 });
  const [loadingSales, setLoadingSales] = useState(false);
  const [filterPartnerId, setFilterPartnerId] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Overview Tab & Analytics State
  const [allSales, setAllSales] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState("last7Days"); // "last7Days" | "last30Days" | "last6Months"
  const [chartType, setChartType] = useState("area"); // "area" | "bar"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Individual Partner Summary Dashboard Modal State
  const [selectedPartnerForDashboard, setSelectedPartnerForDashboard] = useState(null);
  const [partnerDashboardLoading, setPartnerDashboardLoading] = useState(false);
  const [partnerDashboardSales, setPartnerDashboardSales] = useState([]);
  const [partnerDashboardCodes, setPartnerDashboardCodes] = useState([]);
  const [partnerChartTimeframe, setPartnerChartTimeframe] = useState("last7Days"); // "last7Days" | "last30Days" | "last6Months"
  const [partnerChartType, setPartnerChartType] = useState("area"); // "area" | "bar"
  const [partnerHoveredPoint, setPartnerHoveredPoint] = useState(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // Codes Management for a selected Partner
  const [selectedPartnerForCodes, setSelectedPartnerForCodes] = useState(null);
  const [partnerCodes, setPartnerCodes] = useState([]);
  const [loadingPartnerCodes, setLoadingPartnerCodes] = useState(false);
  const [isCreateCodeModalOpen, setIsCreateCodeModalOpen] = useState(false);
  const [isEditCodeModalOpen, setIsEditCodeModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);

  const initialCodeForm = {
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "15",
    minOrderValue: "0",
    maxDiscount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    description: "",
    isActive: true
  };
  const [codeFormData, setCodeFormData] = useState(initialCodeForm);
  const [codeFormError, setCodeFormError] = useState("");
  const [isCodeSubmitting, setIsCodeSubmitting] = useState(false);

  const getCodeStatus = (pc) => {
    if (!pc.isActive) {
      return { label: "Disabled", color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1" };
    }
    const now = new Date();
    if (pc.startDate && new Date(pc.startDate) > now) {
      return { label: "Upcoming (Auto)", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" };
    }
    if (pc.endDate && new Date(pc.endDate) < now) {
      return { label: "Expired (Auto)", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
    }
    return { label: "Active", color: "#166534", bg: "#dcfce7", border: "#bbf7d0" };
  };

  const formatSchedule = (pc) => {
    if (!pc.startDate && !pc.endDate) {
      return "Always Active (No limits)";
    }
    const formatOpt = { dateStyle: "medium", timeStyle: "short" };
    const startStr = pc.startDate ? new Date(pc.startDate).toLocaleString("en-US", formatOpt) : "Now";
    const endStr = pc.endDate ? new Date(pc.endDate).toLocaleString("en-US", formatOpt) : "Ongoing";
    return `${startStr} → ${endStr}`;
  };

  const fetchPartnerCodes = async (partnerId) => {
    try {
      setLoadingPartnerCodes(true);
      const res = await fetch(`/api/admin/partners/${partnerId}/codes`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPartnerCodes(data.codes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPartnerCodes(false);
    }
  };

  const handleOpenCodesModal = (partner) => {
    setSelectedPartnerForCodes(partner);
    fetchPartnerCodes(partner.id);
  };

  const handleOpenCreateCode = () => {
    setCodeFormError("");
    setCodeFormData(initialCodeForm);
    setIsCreateCodeModalOpen(true);
  };

  const handleOpenEditCode = (pc) => {
    setCodeFormError("");
    setEditingCode(pc);
    setCodeFormData({
      code: pc.code,
      discountType: pc.discountType || "PERCENTAGE",
      discountValue: String(pc.discountValue ?? "15"),
      minOrderValue: String(pc.minOrderValue ?? "0"),
      maxDiscount: pc.maxDiscount !== null && pc.maxDiscount !== undefined ? String(pc.maxDiscount) : "",
      usageLimit: pc.usageLimit !== null && pc.usageLimit !== undefined ? String(pc.usageLimit) : "",
      startDate: toInputDateTime(pc.startDate),
      endDate: toInputDateTime(pc.endDate),
      description: pc.description || "",
      isActive: pc.isActive
    });
    setIsEditCodeModalOpen(true);
  };

  const handleToggleCodeActive = async (codeId, currentStatus) => {
    if (!selectedPartnerForCodes) return;
    try {
      const res = await fetch(`/api/admin/partners/${selectedPartnerForCodes.id}/codes/${codeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        fetchPartnerCodes(selectedPartnerForCodes.id);
        fetchPartners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCode = async (codeId) => {
    if (!selectedPartnerForCodes) return;
    if (!window.confirm("Are you sure you want to delete this partner code?")) return;

    try {
      const res = await fetch(`/api/admin/partners/${selectedPartnerForCodes.id}/codes/${codeId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete partner code.");
        return;
      }
      if (data.message && data.message.includes("deactivated")) {
        alert(data.message);
      }
      fetchPartnerCodes(selectedPartnerForCodes.id);
      fetchPartners();
    } catch (err) {
      console.error("Failed to delete partner code:", err);
      alert("Unable to connect to the server.");
    }
  };

  const handleSubmitCreateCode = async (e) => {
    e.preventDefault();
    if (!selectedPartnerForCodes) return;
    setCodeFormError("");
    setIsCodeSubmitting(true);

    try {
      const payload = {
        ...codeFormData,
        startDate: toISOStringOrNull(codeFormData.startDate),
        endDate: toISOStringOrNull(codeFormData.endDate)
      };

      const res = await fetch(`/api/admin/partners/${selectedPartnerForCodes.id}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setCodeFormError(data.error || "An error occurred while creating the promo code.");
        return;
      }

      setIsCreateCodeModalOpen(false);
      fetchPartnerCodes(selectedPartnerForCodes.id);
      fetchPartners();
    } catch (err) {
      setCodeFormError("Unable to connect to the server.");
    } finally {
      setIsCodeSubmitting(false);
    }
  };

  const handleSubmitEditCode = async (e) => {
    e.preventDefault();
    if (!editingCode) return;
    setCodeFormError("");
    setIsCodeSubmitting(true);

    try {
      const payload = {
        ...codeFormData,
        startDate: toISOStringOrNull(codeFormData.startDate),
        endDate: toISOStringOrNull(codeFormData.endDate)
      };

      const res = await fetch(`/api/admin/partners/${selectedPartnerForCodes.id}/codes/${editingCode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setCodeFormError(data.error || "An error occurred while updating the partner code.");
        return;
      }

      setIsEditCodeModalOpen(false);
      setEditingCode(null);
      if (selectedPartnerForCodes) fetchPartnerCodes(selectedPartnerForCodes.id);
      fetchPartners();
    } catch (err) {
      setCodeFormError("Unable to connect to the server.");
    } finally {
      setIsCodeSubmitting(false);
    }
  };

  const initialForm = {
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    phone: "",
    note: "",
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Partners
  const fetchPartners = async () => {
    try {
      setLoadingPartners(true);
      const res = await fetch("/api/admin/partners");
      const data = await res.json();
      if (res.ok && data.success) {
        setPartners(data.partners || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPartners(false);
    }
  };

  // Fetch All Partner Sales
  const fetchSales = async () => {
    try {
      setLoadingSales(true);
      const params = new URLSearchParams();
      if (filterPartnerId) params.append("partnerId", filterPartnerId);
      if (filterPeriod && filterPeriod !== "all") params.append("period", filterPeriod);

      const res = await fetch(`/api/admin/partners/sales?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSales(data.sales || []);
        setSalesSummary(data.summary || { count: 0, totalRevenue: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSales(false);
    }
  };

  // Fetch All Partner Sales (unfiltered master list for Overview analytics)
  const fetchAllSales = async () => {
    try {
      const res = await fetch("/api/admin/partners/sales");
      const data = await res.json();
      if (res.ok && data.success) {
        setAllSales(data.sales || []);
      }
    } catch (err) {
      console.error("Failed to fetch all partner sales for overview:", err);
    }
  };

  const handleRefreshOverview = async () => {
    setLoadingOverview(true);
    await Promise.all([fetchPartners(), fetchAllSales()]);
    setLoadingOverview(false);
  };

  useEffect(() => {
    fetchPartners();
    fetchAllSales();
  }, []);

  useEffect(() => {
    if (activeTab === "sales") {
      fetchSales();
    }
  }, [activeTab, filterPartnerId, filterPeriod]);

  // Overview Analytics & Calculations
  const overviewStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let totalRevenue = 0;
    let todayRevenue = 0;
    let todayOrders = 0;
    let monthRevenue = 0;
    let monthOrders = 0;
    let yearRevenue = 0;
    let yearOrders = 0;

    for (const s of allSales) {
      const amount = Number(s.saleAmount) || 0;
      const sDate = new Date(s.createdAt);

      totalRevenue += amount;

      if (sDate >= startOfToday) {
        todayRevenue += amount;
        todayOrders++;
      }
      if (sDate >= startOfMonth) {
        monthRevenue += amount;
        monthOrders++;
      }
      if (sDate >= startOfYear) {
        yearRevenue += amount;
        yearOrders++;
      }
    }

    const totalOrders = allSales.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const activePartnersCount = partners.filter((p) => p.isActive).length;
    const totalPromoCodes = partners.reduce((acc, p) => acc + (p._count?.codes || 0), 0);

    // Leaderboard sorted by totalRevenue descending
    const partnerRanking = [...partners].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));

    // Generate Chart Data for 7D, 30D, 6M
    // 1. Last 7 Days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const label = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      const fullDate = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

      const daySales = allSales.filter((s) => {
        const sDate = new Date(s.createdAt);
        return sDate >= startOfDay && sDate <= endOfDay;
      });

      const dayAmount = daySales.reduce((acc, s) => acc + (Number(s.saleAmount) || 0), 0);

      last7Days.push({
        date: d.toISOString().split("T")[0],
        label,
        fullDate,
        amount: Math.round(dayAmount * 100) / 100,
        count: daySales.length
      });
    }

    // 2. Last 30 Days
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const fullDate = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

      const daySales = allSales.filter((s) => {
        const sDate = new Date(s.createdAt);
        return sDate >= startOfDay && sDate <= endOfDay;
      });

      const dayAmount = daySales.reduce((acc, s) => acc + (Number(s.saleAmount) || 0), 0);

      last30Days.push({
        date: d.toISOString().split("T")[0],
        label,
        fullDate,
        amount: Math.round(dayAmount * 100) / 100,
        count: daySales.length
      });
    }

    // 3. Last 6 Months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const fullDate = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

      const moSales = allSales.filter((s) => {
        const sDate = new Date(s.createdAt);
        return sDate.getFullYear() === yr && sDate.getMonth() === mo;
      });

      const moAmount = moSales.reduce((acc, s) => acc + (Number(s.saleAmount) || 0), 0);

      last6Months.push({
        label,
        fullDate,
        amount: Math.round(moAmount * 100) / 100,
        count: moSales.length
      });
    }

    return {
      totalRevenue,
      totalOrders,
      todayRevenue,
      todayOrders,
      monthRevenue,
      monthOrders,
      yearRevenue,
      yearOrders,
      avgOrderValue,
      activePartnersCount,
      totalPromoCodes,
      partnerRanking,
      recentSales: allSales.slice(0, 6),
      chartData: {
        last7Days,
        last30Days,
        last6Months
      }
    };
  }, [allSales, partners]);

  // Chart Rendering Calculations
  const currentChartItems = overviewStats.chartData[chartTimeframe] || [];
  const periodTotalAmount = currentChartItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const periodTotalOrders = currentChartItems.reduce((acc, item) => acc + (item.count || 0), 0);
  const periodAvg = currentChartItems.length > 0 ? periodTotalAmount / currentChartItems.length : 0;
  const periodPeak = currentChartItems.length > 0 ? Math.max(...currentChartItems.map((i) => i.amount || 0)) : 0;

  const svgWidth = 850;
  const svgHeight = 240;
  const padLeft = 65;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const rawMax = Math.max(...currentChartItems.map((i) => i.amount || 0), 0);
  const calcCeiling = (maxVal) => {
    if (maxVal <= 0) return 1000;
    if (maxVal <= 500) return 500;
    if (maxVal <= 1000) return 1000;
    if (maxVal <= 2500) return 2500;
    if (maxVal <= 5000) return 5000;
    if (maxVal <= 10000) return 10000;
    if (maxVal <= 25000) return 25000;
    if (maxVal <= 50000) return 50000;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    return Math.ceil(maxVal / magnitude) * magnitude;
  };
  const yCeiling = calcCeiling(rawMax);
  const baselineY = padTop + plotHeight;

  const chartPoints = currentChartItems.map((item, idx) => {
    const x =
      currentChartItems.length <= 1
        ? padLeft + plotWidth / 2
        : padLeft + (idx / (currentChartItems.length - 1)) * plotWidth;
    const y = padTop + (1 - item.amount / yCeiling) * plotHeight;
    return { ...item, x, y, idx };
  });

  const buildSmoothPath = (pts) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(chartPoints);
  const areaPath =
    chartPoints.length > 0
      ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${baselineY} L ${chartPoints[0].x} ${baselineY} Z`
      : "";

  const yTicks = [
    { val: yCeiling, y: padTop },
    { val: Math.round(yCeiling * 0.66), y: padTop + plotHeight * 0.34 },
    { val: Math.round(yCeiling * 0.33), y: padTop + plotHeight * 0.67 },
    { val: 0, y: baselineY }
  ];

  const overviewMetricCards = [
    {
      title: "Total Partner Revenue",
      subtitle: "LIFETIME REVENUE",
      amount: overviewStats.totalRevenue,
      amountPrefix: "฿",
      amountFormat: true,
      subtext: `MTD: ฿${overviewStats.monthRevenue.toLocaleString()} • Today: ฿${overviewStats.todayRevenue.toLocaleString()}`,
      color: "#059669",
      gradient: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
      lightBg: "#ecfdf5",
      borderColor: "#a7f3d0",
      icon: "fa-coins",
      badge: "Aggregated"
    },
    {
      title: "Referred Sales Orders",
      subtitle: "ORDER VOLUME",
      amount: overviewStats.totalOrders,
      amountPrefix: "",
      amountFormat: false,
      amountSuffix: " orders",
      subtext: `MTD: ${overviewStats.monthOrders} orders • Today: ${overviewStats.todayOrders} orders`,
      color: "#0284c7",
      gradient: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
      lightBg: "#f0f9ff",
      borderColor: "#bae6fd",
      icon: "fa-cart-shopping",
      badge: `${overviewStats.totalOrders} total`
    },
    {
      title: "Average Order Value (AOV)",
      subtitle: "CUSTOMER SPEND",
      amount: Math.round(overviewStats.avgOrderValue),
      amountPrefix: "฿",
      amountFormat: true,
      subtext: "Avg. gross revenue per partner transaction",
      color: "#d97706",
      gradient: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
      lightBg: "#fffbeb",
      borderColor: "#fde68a",
      icon: "fa-scale-balanced",
      badge: "Per Order"
    },
    {
      title: "Active Partner Network",
      subtitle: "GROWTH & REACH",
      customValue: `${overviewStats.activePartnersCount} / ${partners.length}`,
      subtext: `${overviewStats.totalPromoCodes} active promo codes deployed`,
      color: "#7c3aed",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
      lightBg: "#f5f3ff",
      borderColor: "#ddd6fe",
      icon: "fa-handshake",
      badge: `${partners.length > 0 ? Math.round((overviewStats.activePartnersCount / partners.length) * 100) : 0}% Active`
    }
  ];

  // Open Single Partner Summary Dashboard
  const handleOpenPartnerDashboard = async (partner) => {
    setSelectedPartnerForDashboard(partner);
    setPartnerDashboardLoading(true);
    setPartnerChartTimeframe("last7Days");
    setPartnerChartType("area");
    setPartnerHoveredPoint(null);

    try {
      const [salesRes, codesRes] = await Promise.all([
        fetch(`/api/admin/partners/sales?partnerId=${partner.id}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/partners/${partner.id}/codes`).then((r) => r.json()).catch(() => null)
      ]);

      if (salesRes && salesRes.success) {
        setPartnerDashboardSales(salesRes.sales || []);
      } else {
        setPartnerDashboardSales(allSales.filter((s) => s.partnerId === partner.id || s.partner?.id === partner.id));
      }

      if (codesRes && codesRes.success) {
        setPartnerDashboardCodes(codesRes.codes || []);
      } else {
        setPartnerDashboardCodes([]);
      }
    } catch (err) {
      console.error("Failed to load partner dashboard data:", err);
      setPartnerDashboardSales(allSales.filter((s) => s.partnerId === partner.id || s.partner?.id === partner.id));
    } finally {
      setPartnerDashboardLoading(false);
    }
  };

  // Partner Summary Dashboard Analytics
  const partnerStats = useMemo(() => {
    if (!selectedPartnerForDashboard) return null;

    const salesList = partnerDashboardSales;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let totalRevenue = 0;
    let todayRevenue = 0;
    let todayOrders = 0;
    let monthRevenue = 0;
    let monthOrders = 0;
    let yearRevenue = 0;
    let yearOrders = 0;

    const codeStatsMap = {};

    for (const s of salesList) {
      const amount = Number(s.saleAmount) || 0;
      const sDate = new Date(s.createdAt);

      totalRevenue += amount;

      if (sDate >= startOfToday) {
        todayRevenue += amount;
        todayOrders++;
      }
      if (sDate >= startOfMonth) {
        monthRevenue += amount;
        monthOrders++;
      }
      if (sDate >= startOfYear) {
        yearRevenue += amount;
        yearOrders++;
      }

      const cCode = s.partnerCode?.code || s.promoCode?.code || "Other";
      if (!codeStatsMap[cCode]) {
        codeStatsMap[cCode] = { code: cCode, count: 0, revenue: 0 };
      }
      codeStatsMap[cCode].count++;
      codeStatsMap[cCode].revenue += amount;
    }

    const totalOrders = salesList.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 1. Last 7 Days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const label = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      const fullDate = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

      const daySales = salesList.filter((s) => {
        const sDate = new Date(s.createdAt);
        return sDate >= startOfDay && sDate <= endOfDay;
      });

      const dayAmount = daySales.reduce((acc, s) => acc + (Number(s.saleAmount) || 0), 0);

      last7Days.push({
        date: d.toISOString().split("T")[0],
        label,
        fullDate,
        amount: Math.round(dayAmount * 100) / 100,
        count: daySales.length
      });
    }

    // 2. Last 30 Days
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const fullDate = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

      const daySales = salesList.filter((s) => {
        const sDate = new Date(s.createdAt);
        return sDate >= startOfDay && sDate <= endOfDay;
      });

      const dayAmount = daySales.reduce((acc, s) => acc + (Number(s.saleAmount) || 0), 0);

      last30Days.push({
        date: d.toISOString().split("T")[0],
        label,
        fullDate,
        amount: Math.round(dayAmount * 100) / 100,
        count: daySales.length
      });
    }

    // 3. Last 6 Months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const fullDate = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

      const moSales = salesList.filter((s) => {
        const sDate = new Date(s.createdAt);
        return sDate.getFullYear() === yr && sDate.getMonth() === mo;
      });

      const moAmount = moSales.reduce((acc, s) => acc + (Number(s.saleAmount) || 0), 0);

      last6Months.push({
        label,
        fullDate,
        amount: Math.round(moAmount * 100) / 100,
        count: moSales.length
      });
    }

    return {
      totalRevenue: totalRevenue || (selectedPartnerForDashboard.totalRevenue || 0),
      totalOrders,
      todayRevenue,
      todayOrders,
      monthRevenue,
      monthOrders,
      yearRevenue,
      yearOrders,
      avgOrderValue,
      codeStatsMap,
      chartData: {
        last7Days,
        last30Days,
        last6Months
      }
    };
  }, [selectedPartnerForDashboard, partnerDashboardSales]);

  // Single Partner Chart Plotting Variables
  const currentPartnerChartItems = partnerStats?.chartData?.[partnerChartTimeframe] || [];
  const partnerPeriodTotalAmount = currentPartnerChartItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const partnerPeriodTotalOrders = currentPartnerChartItems.reduce((acc, item) => acc + (item.count || 0), 0);
  const partnerPeriodAvg = currentPartnerChartItems.length > 0 ? partnerPeriodTotalAmount / currentPartnerChartItems.length : 0;
  const partnerPeriodPeak = currentPartnerChartItems.length > 0 ? Math.max(...currentPartnerChartItems.map((i) => i.amount || 0)) : 0;

  const partnerSvgWidth = 850;
  const partnerSvgHeight = 240;
  const partnerPadLeft = 65;
  const partnerPadRight = 30;
  const partnerPadTop = 30;
  const partnerPadBottom = 40;
  const partnerPlotWidth = partnerSvgWidth - partnerPadLeft - partnerPadRight;
  const partnerPlotHeight = partnerSvgHeight - partnerPadTop - partnerPadBottom;

  const partnerRawMax = Math.max(...currentPartnerChartItems.map((i) => i.amount || 0), 0);
  const partnerYCeiling = calcCeiling(partnerRawMax);
  const partnerBaselineY = partnerPadTop + partnerPlotHeight;

  const partnerChartPoints = currentPartnerChartItems.map((item, idx) => {
    const x =
      currentPartnerChartItems.length <= 1
        ? partnerPadLeft + partnerPlotWidth / 2
        : partnerPadLeft + (idx / (currentPartnerChartItems.length - 1)) * partnerPlotWidth;
    const y = partnerPadTop + (1 - item.amount / partnerYCeiling) * partnerPlotHeight;
    return { ...item, x, y, idx };
  });

  const partnerLinePath = buildSmoothPath(partnerChartPoints);
  const partnerAreaPath =
    partnerChartPoints.length > 0
      ? `${partnerLinePath} L ${partnerChartPoints[partnerChartPoints.length - 1].x} ${partnerBaselineY} L ${partnerChartPoints[0].x} ${partnerBaselineY} Z`
      : "";

  const partnerYTicks = [
    { val: partnerYCeiling, y: partnerPadTop },
    { val: Math.round(partnerYCeiling * 0.66), y: partnerPadTop + partnerPlotHeight * 0.34 },
    { val: Math.round(partnerYCeiling * 0.33), y: partnerPadTop + partnerPlotHeight * 0.67 },
    { val: 0, y: partnerBaselineY }
  ];

  const handleOpenCreate = () => {
    setFormError("");
    setFormData(initialForm);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setFormError("");
    setEditingPartner(p);
    setFormData({
      companyName: p.companyName,
      contactName: p.contactName,
      email: p.email,
      password: "", // Leave blank if keeping current password
      phone: p.phone || "",
      note: p.note || "",
      isActive: p.isActive
    });
    setIsEditModalOpen(true);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        fetchPartners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "An error occurred while creating the partner account.");
        return;
      }

      setIsCreateModalOpen(false);
      fetchPartners();
    } catch (err) {
      setFormError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingPartner) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Do not overwrite password if empty

      const res = await fetch(`/api/admin/partners/${editingPartner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "An error occurred while updating the partner account.");
        return;
      }

      setIsEditModalOpen(false);
      setEditingPartner(null);
      fetchPartners();
    } catch (err) {
      setFormError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#222945", margin: 0 }}>
            Partners & Sales Management
          </h1>
          <p style={{ color: "#64748b", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
            Manage partner accounts, analyze performance trends, and monitor aggregated sales
          </p>
        </div>

        {(activeTab === "overview" || activeTab === "accounts") && (
          <button
            onClick={handleOpenCreate}
            style={{
              background: "#222945",
              color: "#ffffff",
              border: "none",
              padding: "0.75rem 1.25rem",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 10px rgba(34, 41, 69, 0.2)"
            }}
          >
            <i className="fa-solid fa-plus"></i>
            <span>Create Partner Account</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid #e2e8f0", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "overview" ? "3px solid #222945" : "3px solid transparent",
            color: activeTab === "overview" ? "#222945" : "#64748b",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-chart-pie"></i>
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("accounts")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "accounts" ? "3px solid #222945" : "3px solid transparent",
            color: activeTab === "accounts" ? "#222945" : "#64748b",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-users"></i>
          <span>Partner Accounts ({partners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "sales" ? "3px solid #222945" : "3px solid transparent",
            color: activeTab === "sales" ? "#222945" : "#64748b",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <i className="fa-solid fa-receipt"></i>
          <span>All Partner Sales</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* 1. Hero Executive Welcome Banner */}
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)",
            borderRadius: "24px",
            padding: "2rem 2.25rem",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.25)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}>
            {/* Ambient Background Circles */}
            <div style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0) 70%)",
              pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute",
              bottom: "-60px",
              left: "25%",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(124, 58, 237, 0) 70%)",
              pointerEvents: "none"
            }} />

            <div style={{ position: "relative", zIndex: 1, maxWidth: "680px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                <span style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  color: "#38bdf8",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}>
                  <i className="fa-solid fa-chart-pie"></i>
                  PARTNER ANALYTICS DASHBOARD
                </span>

                <span style={{
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}>
                  <i className="fa-regular fa-clock"></i>
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <h2 style={{
                fontSize: "1.85rem",
                fontWeight: "900",
                color: "#ffffff",
                margin: "0 0 0.5rem 0",
                letterSpacing: "-0.5px",
                lineHeight: "1.2"
              }}>
                Partners & Referral Performance
              </h2>

              <p style={{ fontSize: "0.95rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                Consolidated overview of hotel, property, and concierge partner sales, discount code usage, and revenue growth.
              </p>
            </div>

            {/* Quick Actions in Hero */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
              <button
                onClick={handleRefreshOverview}
                disabled={loadingOverview}
                title="Refresh Analytics Data"
                style={{
                  padding: "0.75rem 1.1rem",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  cursor: loadingOverview ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s ease"
                }}
              >
                <i className={`fa-solid fa-arrows-rotate ${loadingOverview ? "fa-spin" : ""}`}></i>
                <span>{loadingOverview ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                onClick={handleOpenCreate}
                style={{
                  padding: "0.75rem 1.35rem",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 6px 18px rgba(2, 132, 199, 0.4)"
                }}
              >
                <i className="fa-solid fa-plus"></i>
                <span>Add Partner</span>
              </button>
            </div>
          </div>

          {/* 2. Top KPI Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.25rem"
          }}>
            {overviewMetricCards.map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  border: `1px solid ${card.borderColor}`,
                  borderRadius: "20px",
                  padding: "1.5rem 1.6rem",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      color: "#64748b",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase"
                    }}>
                      {card.subtitle}
                    </div>
                    <div style={{
                      fontSize: "1.05rem",
                      fontWeight: "800",
                      color: "#0f172a",
                      marginTop: "0.2rem"
                    }}>
                      {card.title}
                    </div>
                  </div>

                  <div style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "14px",
                    background: card.gradient,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    boxShadow: `0 6px 14px ${card.color}35`,
                    flexShrink: 0
                  }}>
                    <i className={`fa-solid ${card.icon}`}></i>
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: "1.85rem",
                    fontWeight: "900",
                    color: card.color,
                    lineHeight: "1.1",
                    letterSpacing: "-0.5px"
                  }}>
                    {card.customValue || (
                      <>
                        {card.amountPrefix}
                        {card.amountFormat
                          ? card.amount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : card.amount?.toLocaleString()}
                        {card.amountSuffix}
                      </>
                    )}
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "0.75rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid #f1f5f9"
                  }}>
                    <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600" }}>
                      {card.subtext}
                    </div>

                    <span style={{
                      background: card.lightBg,
                      color: card.color,
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      padding: "0.2rem 0.55rem",
                      borderRadius: "6px"
                    }}>
                      {card.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Sales & Revenue Analytics Chart Card */}
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "1.75rem 2rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem"
          }}>
            {/* Chart Header & Controls */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
                }}>
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
                    Partner Sales & Revenue Analytics
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.2rem 0 0 0" }}>
                    Real-time aggregated sales revenue and transaction volume across all partners
                  </p>
                </div>
              </div>

              {/* View Type & Timeframe Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                {/* View Type Toggle (Area vs Bar) */}
                <div style={{
                  display: "flex",
                  background: "#f1f5f9",
                  padding: "0.25rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}>
                  <button
                    onClick={() => setChartType("area")}
                    title="Area Trend Chart"
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: chartType === "area" ? "#ffffff" : "transparent",
                      color: chartType === "area" ? "#0284c7" : "#64748b",
                      boxShadow: chartType === "area" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem"
                    }}
                  >
                    <i className="fa-solid fa-chart-area"></i>
                    <span>Area</span>
                  </button>

                  <button
                    onClick={() => setChartType("bar")}
                    title="Bar Chart"
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: chartType === "bar" ? "#ffffff" : "transparent",
                      color: chartType === "bar" ? "#0284c7" : "#64748b",
                      boxShadow: chartType === "bar" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem"
                    }}
                  >
                    <i className="fa-solid fa-chart-simple"></i>
                    <span>Bars</span>
                  </button>
                </div>

                {/* Timeframe Selector */}
                <div style={{
                  display: "flex",
                  background: "#f1f5f9",
                  padding: "0.25rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}>
                  {[
                    { id: "last7Days", label: "7 Days" },
                    { id: "last30Days", label: "30 Days" },
                    { id: "last6Months", label: "6 Months" },
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => {
                        setChartTimeframe(tf.id);
                        setHoveredPoint(null);
                      }}
                      style={{
                        padding: "0.45rem 0.85rem",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: chartTimeframe === tf.id ? "800" : "600",
                        cursor: "pointer",
                        background: chartTimeframe === tf.id ? "#0f172a" : "transparent",
                        color: chartTimeframe === tf.id ? "#ffffff" : "#64748b",
                        boxShadow: chartTimeframe === tf.id ? "0 2px 8px rgba(15, 23, 42, 0.25)" : "none",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Highlights Ribbon */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "0.85rem",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              padding: "1rem 1.25rem",
              borderRadius: "16px",
              border: "1px solid #e2e8f0"
            }}>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Period Revenue
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#059669", marginTop: "0.15rem" }}>
                  ฿{periodTotalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Total Orders
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a", marginTop: "0.15rem" }}>
                  {periodTotalOrders.toLocaleString()} {periodTotalOrders === 1 ? "order" : "orders"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {chartTimeframe === "last6Months" ? "Avg / Month" : "Avg / Day"}
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0284c7", marginTop: "0.15rem" }}>
                  ฿{Math.round(periodAvg).toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Peak Performance
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#7c3aed", marginTop: "0.15rem" }}>
                  ฿{periodPeak.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Hovered Point Tooltip Ribbon */}
            {hoveredPoint && (
              <div style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "0.6rem 1.1rem",
                borderRadius: "12px",
                fontSize: "0.85rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "1rem",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                alignSelf: "flex-start"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <i className="fa-regular fa-calendar" style={{ color: "#38bdf8" }}></i>
                  <span style={{ fontWeight: "700" }}>{hoveredPoint.fullDate || hoveredPoint.label}</span>
                </div>
                <span>•</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ color: "#94a3b8" }}>Revenue:</span>
                  <span style={{ fontWeight: "900", color: "#34d399" }}>
                    ฿{hoveredPoint.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span>•</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ color: "#94a3b8" }}>Orders:</span>
                  <span style={{ fontWeight: "800", color: "#ffffff" }}>{hoveredPoint.count}</span>
                </div>
              </div>
            )}

            {/* The SVG Canvas */}
            <div style={{ width: "100%", position: "relative", overflowX: "auto" }}>
              {currentChartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#94a3b8" }}>
                  <i className="fa-solid fa-chart-line" style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.4 }}></i>
                  <div style={{ fontWeight: "700", color: "#475569" }}>No partner sales data available for this timeframe</div>
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    minWidth: "600px",
                    overflow: "visible",
                    display: "block"
                  }}
                >
                  <defs>
                    <linearGradient id="adminPartnerRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.32" />
                      <stop offset="85%" stopColor="#0284c7" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                    </linearGradient>

                    <linearGradient id="adminPartnerBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>

                    <linearGradient id="adminPartnerBarHoverGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines & Y-Axis Labels */}
                  {yTicks.map((tick, i) => (
                    <g key={i}>
                      <line
                        x1={padLeft}
                        y1={tick.y}
                        x2={svgWidth - padRight}
                        y2={tick.y}
                        stroke={i === yTicks.length - 1 ? "#cbd5e1" : "#f1f5f9"}
                        strokeWidth={i === yTicks.length - 1 ? 1.5 : 1}
                        strokeDasharray={i === yTicks.length - 1 ? "none" : "4 4"}
                      />
                      <text
                        x={padLeft - 10}
                        y={tick.y + 4}
                        textAnchor="end"
                        fontSize="10.5"
                        fill="#94a3b8"
                        fontWeight="600"
                        fontFamily="system-ui, sans-serif"
                      >
                        ฿{tick.val >= 1000 ? `${Math.round(tick.val / 1000)}k` : tick.val}
                      </text>
                    </g>
                  ))}

                  {/* Area Chart Mode */}
                  {chartType === "area" && (
                    <>
                      {areaPath && (
                        <path
                          d={areaPath}
                          fill="url(#adminPartnerRevenueGrad)"
                          style={{ transition: "all 0.3s ease" }}
                        />
                      )}

                      {linePath && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ transition: "all 0.3s ease" }}
                        />
                      )}

                      {hoveredPoint && (
                        <line
                          x1={hoveredPoint.x}
                          y1={padTop}
                          x2={hoveredPoint.x}
                          y2={baselineY}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                      )}

                      {chartPoints.map((p) => {
                        const isHovered = hoveredPoint?.idx === p.idx;
                        const showDot = currentChartItems.length <= 14 || isHovered || p.amount > 0;

                        return (
                          <g
                            key={p.idx}
                            onMouseEnter={() => setHoveredPoint(p)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            style={{ cursor: "pointer" }}
                          >
                            <circle cx={p.x} cy={p.y} r={18} fill="transparent" />

                            {isHovered && (
                              <circle cx={p.x} cy={p.y} r={9} fill="#38bdf8" opacity="0.35" />
                            )}

                            {showDot && (
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={isHovered ? 6 : (p.amount > 0 ? 4.5 : 3)}
                                fill={isHovered ? "#38bdf8" : (p.amount > 0 ? "#0284c7" : "#cbd5e1")}
                                stroke="#ffffff"
                                strokeWidth={isHovered ? 2.5 : 2}
                                style={{ transition: "all 0.15s ease" }}
                              />
                            )}
                          </g>
                        );
                      })}
                    </>
                  )}

                  {/* Bar Chart Mode */}
                  {chartType === "bar" && (
                    <>
                      {chartPoints.map((p) => {
                        const isHovered = hoveredPoint?.idx === p.idx;
                        const barWidth = Math.min(34, Math.max(10, (plotWidth / currentChartItems.length) * 0.65));
                        const barHeight = Math.max(baselineY - p.y, p.amount > 0 ? 4 : 0);
                        const barX = p.x - barWidth / 2;
                        const barY = baselineY - barHeight;

                        return (
                          <g
                            key={p.idx}
                            onMouseEnter={() => setHoveredPoint(p)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            style={{ cursor: "pointer" }}
                          >
                            <rect
                              x={p.x - barWidth}
                              y={padTop}
                              width={barWidth * 2}
                              height={plotHeight}
                              fill="transparent"
                            />

                            <rect
                              x={barX}
                              y={barY}
                              width={barWidth}
                              height={barHeight}
                              rx={Math.min(6, barWidth / 2)}
                              fill={isHovered ? "url(#adminPartnerBarHoverGrad)" : "url(#adminPartnerBarGrad)"}
                              opacity={isHovered ? 1 : (p.amount > 0 ? 0.9 : 0.2)}
                              style={{ transition: "all 0.2s ease" }}
                            />
                          </g>
                        );
                      })}
                    </>
                  )}

                  {/* X-Axis Date Labels */}
                  {chartPoints.map((p, idx) => {
                    let shouldShowLabel = true;
                    if (chartTimeframe === "last30Days") {
                      shouldShowLabel = idx % 5 === 0 || idx === chartPoints.length - 1;
                    }

                    if (!shouldShowLabel) return null;

                    const isHovered = hoveredPoint?.idx === p.idx;

                    return (
                      <text
                        key={idx}
                        x={p.x}
                        y={baselineY + 22}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={isHovered ? "800" : "600"}
                        fill={isHovered ? "#0284c7" : "#64748b"}
                        fontFamily="system-ui, sans-serif"
                        style={{ transition: "fill 0.15s ease" }}
                      >
                        {p.label}
                      </text>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>

          {/* 4. Two-Column Analytics Grid: Leaderboard & Recent Sales Feed */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "1.5rem",
            alignItems: "start"
          }}>
            {/* Left: Top Contributing Partners Leaderboard */}
            <div style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              overflow: "hidden"
            }}>
              <div style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    <i className="fa-solid fa-trophy" style={{ color: "#eab308", marginRight: "0.5rem" }}></i>
                    Partner Leaderboard
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.2rem 0 0 0" }}>
                    Performance ranking by total revenue contribution
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("accounts")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0284c7",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  <span>All Partners ({partners.length})</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.75rem" }}></i>
                </button>
              </div>

              {loadingPartners ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}></i>
                  <div>Loading partner rankings...</div>
                </div>
              ) : overviewStats.partnerRanking.length === 0 ? (
                <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#94a3b8" }}>
                  <i className="fa-solid fa-users" style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.5 }}></i>
                  <div>No partner accounts available</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {overviewStats.partnerRanking.map((p, idx) => {
                    const share = overviewStats.totalRevenue > 0
                      ? Math.round(((p.totalRevenue || 0) / overviewStats.totalRevenue) * 100)
                      : 0;

                    return (
                      <div
                        key={p.id}
                        style={{
                          padding: "1.1rem 1.5rem",
                          borderBottom: idx === overviewStats.partnerRanking.length - 1 ? "none" : "1px solid #f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "1rem",
                          transition: "background 0.15s ease"
                        }}
                      >
                        {/* Rank Badge & Partner Name */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", minWidth: 0, flex: 1 }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: idx === 0 ? "#fef9c3" : idx === 1 ? "#f1f5f9" : idx === 2 ? "#ffedd5" : "#f8fafc",
                            color: idx === 0 ? "#854d0e" : idx === 1 ? "#475569" : idx === 2 ? "#9a3412" : "#94a3b8",
                            fontWeight: "900",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <button
                              onClick={() => handleOpenPartnerDashboard(p)}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                textAlign: "left",
                                cursor: "pointer",
                                fontWeight: "800",
                                color: "#0f172a",
                                fontSize: "0.95rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                transition: "color 0.15s ease"
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#0284c7")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#0f172a")}
                              title="Click to view partner summary dashboard"
                            >
                              <span>{p.companyName}</span>
                              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.7rem", color: "#0284c7", opacity: 0.8 }}></i>
                            </button>
                            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.1rem" }}>
                              {p.contactName} • {p._count?.sales ?? 0} orders • {p._count?.codes ?? 0} codes
                            </div>

                            {/* Revenue Share Progress Bar */}
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.35rem" }}>
                              <div style={{
                                width: "100px",
                                height: "6px",
                                background: "#f1f5f9",
                                borderRadius: "3px",
                                overflow: "hidden"
                              }}>
                                <div style={{
                                  width: `${Math.max(share, p.totalRevenue > 0 ? 5 : 0)}%`,
                                  height: "100%",
                                  background: idx === 0 ? "#10b981" : "#0284c7",
                                  borderRadius: "3px"
                                }} />
                              </div>
                              <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "700" }}>{share}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Revenue & Action */}
                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem", flexShrink: 0 }}>
                          <div style={{ fontWeight: "900", color: "#166534", fontSize: "1.05rem" }}>
                            ฿{(p.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>

                          <div style={{ display: "flex", gap: "0.35rem" }}>
                            <button
                              onClick={() => handleOpenPartnerDashboard(p)}
                              title="View partner dashboard summary"
                              style={{
                                padding: "0.3rem 0.65rem",
                                borderRadius: "6px",
                                background: "#f0f9ff",
                                color: "#0284c7",
                                border: "1px solid #bae6fd",
                                fontWeight: "700",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem"
                              }}
                            >
                              <i className="fa-solid fa-chart-pie"></i>
                              <span>Dashboard</span>
                            </button>
                            <button
                              onClick={() => {
                                setFilterPartnerId(p.id);
                                setActiveTab("sales");
                              }}
                              title="View sales for this partner"
                              style={{
                                padding: "0.3rem 0.65rem",
                                borderRadius: "6px",
                                background: "#f8fafc",
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                fontWeight: "700",
                                fontSize: "0.75rem",
                                cursor: "pointer"
                              }}
                            >
                              Sales
                            </button>
                            <button
                              onClick={() => handleOpenCodesModal(p)}
                              title="Manage promo codes"
                              style={{
                                padding: "0.3rem 0.65rem",
                                borderRadius: "6px",
                                background: "#f8fafc",
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                fontWeight: "700",
                                fontSize: "0.75rem",
                                cursor: "pointer"
                              }}
                            >
                              Codes
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Recent Partner Sales Transactions Feed */}
            <div style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              overflow: "hidden"
            }}>
              <div style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    <i className="fa-solid fa-bolt" style={{ color: "#0284c7", marginRight: "0.5rem" }}></i>
                    Recent Partner Transactions
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.2rem 0 0 0" }}>
                    Latest referral bookings recorded in system
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFilterPartnerId("");
                    setFilterPeriod("all");
                    setActiveTab("sales");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0284c7",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  <span>All Sales ({allSales.length})</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.75rem" }}></i>
                </button>
              </div>

              {allSales.length === 0 ? (
                <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#94a3b8" }}>
                  <i className="fa-solid fa-receipt" style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.5 }}></i>
                  <div>No partner sales recorded yet</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {overviewStats.recentSales.map((s, idx) => (
                    <div
                      key={s.id}
                      style={{
                        padding: "1rem 1.5rem",
                        borderBottom: idx === overviewStats.recentSales.length - 1 ? "none" : "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem"
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "0.92rem" }}>
                            {s.customerName || "Customer"}
                          </span>
                          <span style={{
                            fontFamily: "monospace",
                            fontWeight: "800",
                            fontSize: "0.75rem",
                            color: "#0284c7",
                            background: "#f0f9ff",
                            padding: "0.15rem 0.45rem",
                            borderRadius: "4px",
                            border: "1px solid #bae6fd"
                          }}>
                            {s.partnerCode?.code || s.promoCode?.code || "CODE"}
                          </span>
                        </div>

                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.2rem" }}>
                          <button
                            onClick={() => {
                              const partnerObj = partners.find((p) => p.id === s.partnerId || p.id === s.partner?.id) || s.partner;
                              if (partnerObj) handleOpenPartnerDashboard(partnerObj);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              fontWeight: "700",
                              color: "#0284c7",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              textDecoration: "underline"
                            }}
                            title="Click to view partner summary dashboard"
                          >
                            <span>{s.partner?.companyName}</span>
                            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.65rem" }}></i>
                          </button>
                          {" • "}
                          <span>{new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontWeight: "900", color: "#166534", fontSize: "1.05rem" }}>
                          ฿{(s.saleAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {s.customerPhone && (
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>
                            {s.customerPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNTS */}
      {activeTab === "accounts" && (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {loadingPartners ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "0.8rem" }}></i>
              <div>Loading partner accounts...</div>
            </div>
          ) : partners.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
              <i className="fa-solid fa-handshake" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}></i>
              <h3 style={{ fontSize: "1.2rem", color: "#475569", margin: "0 0 0.5rem 0" }}>No partner accounts found</h3>
              <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.9rem" }}>Click the button below to create the first partner account</p>
              <button
                onClick={handleOpenCreate}
                style={{ background: "#222945", color: "#ffffff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
              >
                + Create Partner Account
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Partner / Company</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Contact Info</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>Promo Codes</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>Sales Orders</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Total Revenue (THB)</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1.1rem 1.25rem" }}>
                        <button
                          onClick={() => handleOpenPartnerDashboard(p)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            textAlign: "left",
                            cursor: "pointer",
                            fontWeight: "800",
                            color: "#0f172a",
                            fontSize: "1rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            transition: "color 0.15s ease"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#0284c7")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#0f172a")}
                          title="Click to view partner summary dashboard"
                        >
                          <span>{p.companyName}</span>
                          <i className="fa-solid fa-chart-line" style={{ fontSize: "0.75rem", color: "#0284c7", opacity: 0.85 }}></i>
                        </button>
                        {p.note && <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>{p.note}</div>}
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem" }}>
                        <div style={{ fontWeight: "700", color: "#334155" }}>{p.contactName}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>
                          <i className="fa-solid fa-envelope" style={{ marginRight: "0.3rem" }}></i>
                          {p.email}
                        </div>
                        {p.phone && (
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.1rem" }}>
                            <i className="fa-solid fa-phone" style={{ marginRight: "0.3rem" }}></i>
                            {p.phone}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleOpenCodesModal(p)}
                          title="Click to view and manage promo codes for this partner"
                          style={{
                            background: "#f0f9ff",
                            color: "#0284c7",
                            border: "1px solid #bae6fd",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem"
                          }}
                        >
                          <i className="fa-solid fa-ticket"></i>
                          <span>{p._count?.codes ?? 0} Codes (Manage)</span>
                        </button>
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "center", fontWeight: "700", color: "#475569" }}>
                        {p._count?.sales ?? 0} orders
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "right", fontWeight: "900", color: "#166534", fontSize: "1.05rem" }}>
                        ฿{p.totalRevenue?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleToggleActive(p.id, p.isActive)}
                          style={{
                            background: p.isActive ? "#dcfce7" : "#f1f5f9",
                            color: p.isActive ? "#166534" : "#64748b",
                            border: `1px solid ${p.isActive ? "#bbf7d0" : "#cbd5e1"}`,
                            padding: "0.3rem 0.75rem",
                            borderRadius: "20px",
                            fontWeight: "700",
                            fontSize: "0.75rem",
                            cursor: "pointer"
                          }}
                        >
                          {p.isActive ? "● Active" : "○ Disabled"}
                        </button>
                      </td>

                      <td style={{ padding: "1.1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleOpenPartnerDashboard(p)}
                            title="View partner summary dashboard"
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                              color: "#ffffff",
                              border: "none",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)"
                            }}
                          >
                            <i className="fa-solid fa-chart-pie"></i>
                            <span>Dashboard</span>
                          </button>
                          <button
                            onClick={() => handleOpenCodesModal(p)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              background: "#222945",
                              color: "#ffffff",
                              border: "none",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem"
                            }}
                          >
                            <i className="fa-solid fa-ticket"></i>
                            <span>Manage Codes</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              background: "#f1f5f9",
                              color: "#334155",
                              border: "1px solid #cbd5e1",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              cursor: "pointer"
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL SALES */}
      {activeTab === "sales" && (
        <div>
          {/* Filters & Total Summary */}
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {/* Partner Dropdown */}
              <select
                value={filterPartnerId}
                onChange={(e) => setFilterPartnerId(e.target.value)}
                style={{ padding: "0.5rem 0.85rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: "600", color: "#334155" }}
              >
                <option value="">All Partners</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.companyName}</option>
                ))}
              </select>

              {/* Period Tabs */}
              <div style={{ display: "flex", background: "#f1f5f9", padding: "0.25rem", borderRadius: "10px" }}>
                {[
                  { id: "all", label: "All" },
                  { id: "today", label: "Today" },
                  { id: "month", label: "This Month" },
                  { id: "year", label: "This Year" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterPeriod(t.id)}
                    style={{
                      padding: "0.45rem 0.85rem",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: filterPeriod === t.id ? "#ffffff" : "transparent",
                      color: filterPeriod === t.id ? "#222945" : "#64748b",
                      boxShadow: filterPeriod === t.id ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sales Metric */}
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Total Revenue: </span>
                <span style={{ fontSize: "1.25rem", fontWeight: "900", color: "#166534" }}>
                  ฿{salesSummary.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Total Orders: </span>
                <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>{salesSummary.count}</span>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {loadingSales ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "0.8rem" }}></i>
                <div>Loading partner sales data...</div>
              </div>
            ) : sales.length === 0 ? (
              <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
                <i className="fa-solid fa-receipt" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}></i>
                <div style={{ fontSize: "1.1rem", color: "#475569" }}>No sales found for the selected filter</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase" }}>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Date & Time</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Partner</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Promo Code</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Customer Name</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Phone Number</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Sale Price (THB)</th>
                      <th style={{ padding: "1rem 1.25rem", textAlign: "left" }}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem 1.25rem", color: "#64748b", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          {new Date(s.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", fontWeight: "700", color: "#0f172a" }}>
                          {s.partner?.companyName}
                        </td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: "800", color: "#222945", background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                            {s.partnerCode?.code || s.promoCode?.code}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 1.25rem", fontWeight: "600", color: "#334155" }}>
                          {s.customerName}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", fontFamily: "monospace", color: "#64748b" }}>
                          {s.customerPhone}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right", fontWeight: "900", color: "#166534" }}>
                          ฿{s.saleAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", color: "#64748b", fontSize: "0.85rem", maxWidth: "200px" }}>
                          {s.note || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Partner */}
      {isCreateModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "520px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Create Partner Account
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Company / Business Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Hotel or Luxury Residence"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe, Operations Manager"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Login Email *
                </label>
                <input
                  type="email"
                  placeholder="partner@hotel.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Initial Password (min. 6 characters) *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 081-234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partnership project 2026"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Partner */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "520px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Edit Partner: {editingPartner?.companyName}
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Company / Business Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password to reset"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="adminPartnerActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="adminPartnerActive" style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155", cursor: "pointer" }}>
                  Account Active
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Partner Codes Management */}
      {selectedPartnerForCodes && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            {/* Header */}
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd", padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                    PARTNER CODES
                  </span>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    {selectedPartnerForCodes.companyName}
                  </h2>
                </div>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Contact: {selectedPartnerForCodes.contactName} ({selectedPartnerForCodes.email})
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button
                  onClick={handleOpenCreateCode}
                  style={{
                    background: "#222945",
                    color: "#ffffff",
                    border: "none",
                    padding: "0.6rem 1.1rem",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    boxShadow: "0 4px 10px rgba(34, 41, 69, 0.15)"
                  }}
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Create Code for Partner</span>
                </button>

                <button
                  onClick={() => setSelectedPartnerForCodes(null)}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.3rem" }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "1.5rem 2rem", overflowY: "auto", flex: 1 }}>
              {loadingPartnerCodes ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "#64748b" }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}></i>
                  <div>Loading partner codes...</div>
                </div>
              ) : partnerCodes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                  <i className="fa-solid fa-ticket" style={{ fontSize: "2.5rem", marginBottom: "0.8rem", opacity: 0.5 }}></i>
                  <h3 style={{ fontSize: "1.1rem", color: "#475569", margin: "0 0 0.4rem 0" }}>No promo codes for this partner</h3>
                  <p style={{ fontSize: "0.85rem", margin: "0 0 1.25rem 0" }}>Click the button below to create promo codes for this partner</p>
                  <button
                    onClick={handleOpenCreateCode}
                    style={{
                      background: "#222945",
                      color: "#ffffff",
                      border: "none",
                      padding: "0.6rem 1.25rem",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    + Create Code for Partner
                  </button>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.75rem", textTransform: "uppercase" }}>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Promo Code</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Discount</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Schedule</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Usage / Limit</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerCodes.map((pc) => {
                      const st = getCodeStatus(pc);
                      return (
                        <tr key={pc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span style={{
                              fontFamily: "monospace",
                              fontWeight: "800",
                              color: "#222945",
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.95rem"
                            }}>
                              {pc.code}
                            </span>
                            {pc.description && (
                              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                                {pc.description}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: "0.85rem 1rem", fontWeight: "700", color: "#0f172a" }}>
                            {pc.discountType === "PERCENTAGE" ? `${pc.discountValue}% OFF` : `${pc.discountValue} THB`}
                          </td>

                          <td style={{ padding: "0.85rem 1rem", color: "#475569", fontSize: "0.8rem", maxWidth: "200px" }}>
                            {formatSchedule(pc)}
                          </td>

                          <td style={{ padding: "0.85rem 1rem", textAlign: "center", fontWeight: "700", color: "#334155" }}>
                            {pc._count?.sales ?? pc.usedCount} {pc.usageLimit ? `/ ${pc.usageLimit}` : "(Unlimited)"}
                          </td>

                          <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                            <span style={{
                              background: st.bg,
                              color: st.color,
                              border: `1px solid ${st.border}`,
                              padding: "0.2rem 0.55rem",
                              borderRadius: "10px",
                              fontWeight: "700",
                              fontSize: "0.75rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem"
                            }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: st.color }}></span>
                              {st.label}
                            </span>
                          </td>

                          <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                              <button
                                onClick={() => handleToggleCodeActive(pc.id, pc.isActive)}
                                style={{
                                  background: "none",
                                  border: "1px solid #cbd5e1",
                                  color: pc.isActive ? "#991b1b" : "#166534",
                                  padding: "0.3rem 0.6rem",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                              >
                                {pc.isActive ? "Turn Off" : "Turn On"}
                              </button>
                              <button
                                onClick={() => handleOpenEditCode(pc)}
                                style={{
                                  background: "#f1f5f9",
                                  border: "1px solid #cbd5e1",
                                  color: "#334155",
                                  padding: "0.3rem 0.6rem",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCode(pc.id)}
                                style={{
                                  background: "#fef2f2",
                                  border: "1px solid #fecaca",
                                  color: "#991b1b",
                                  padding: "0.3rem 0.6rem",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "1rem 2rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedPartnerForCodes(null)}
                style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Create Code for Selected Partner */}
      {isCreateCodeModalOpen && selectedPartnerForCodes && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "540px", padding: "2rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Create Code for {selectedPartnerForCodes.companyName}
                </h3>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  This partner code will be assigned to this partner account automatically
                </p>
              </div>
              <button onClick={() => setIsCreateCodeModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            {codeFormError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {codeFormError}
              </div>
            )}

            <form onSubmit={handleSubmitCreateCode} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Partner Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. GRAND20 or LUXURY15"
                  value={codeFormData.code}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontFamily: "monospace", fontWeight: "800", letterSpacing: "1px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Discount Type
                  </label>
                  <select
                    value={codeFormData.discountType}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (THB)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15"
                    value={codeFormData.discountValue}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontWeight: "700" }}
                  />
                </div>
              </div>

              {/* Start & End Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={codeFormData.startDate}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Leave blank to start immediately</span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={codeFormData.endDate}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Leave blank for no expiration</span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Usage Limit
                </label>
                <input
                  type="number"
                  placeholder="Leave blank for unlimited"
                  value={codeFormData.usageLimit}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Description / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exclusive discount for partner guests"
                  value={codeFormData.description}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateCodeModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCodeSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isCodeSubmitting ? 0.7 : 1 }}
                >
                  {isCodeSubmitting ? "Creating..." : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Modal: Edit Code */}
      {isEditCodeModalOpen && editingCode && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "540px", padding: "2rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Edit Partner Code: {editingCode.code}
                </h3>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Modify conditions, schedule, and active status
                </p>
              </div>
              <button onClick={() => setIsEditCodeModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            {codeFormError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {codeFormError}
              </div>
            )}

            <form onSubmit={handleSubmitEditCode} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Discount Type
                  </label>
                  <select
                    value={codeFormData.discountType}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (THB)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={codeFormData.discountValue}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontWeight: "700" }}
                  />
                </div>
              </div>

              {/* Start & End Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={codeFormData.startDate}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={codeFormData.endDate}
                    onChange={(e) => setCodeFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Description / Notes
                </label>
                <input
                  type="text"
                  value={codeFormData.description}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="adminEditCodeActive"
                  checked={codeFormData.isActive}
                  onChange={(e) => setCodeFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="adminEditCodeActive" style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155", cursor: "pointer" }}>
                  Enable this code (Active)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsEditCodeModalOpen(false)}
                  style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCodeSubmitting}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "#222945", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", opacity: isCodeSubmitting ? 0.7 : 1 }}
                >
                  {isCodeSubmitting ? "Saving..." : "Update Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Individual Partner Summary Dashboard */}
      {selectedPartnerForDashboard && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 110,
          padding: "1rem"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "1140px",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            border: "1px solid #e2e8f0"
          }}>
            {/* 1. Modal Top Bar (Sticky) */}
            <div style={{
              padding: "1.25rem 2rem",
              background: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)"
                }}>
                  <i className="fa-solid fa-chart-pie"></i>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
                      {selectedPartnerForDashboard.companyName}
                    </h2>
                    <span style={{
                      background: selectedPartnerForDashboard.isActive ? "#dcfce7" : "#f1f5f9",
                      color: selectedPartnerForDashboard.isActive ? "#166534" : "#64748b",
                      border: `1px solid ${selectedPartnerForDashboard.isActive ? "#bbf7d0" : "#cbd5e1"}`,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "700"
                    }}>
                      {selectedPartnerForDashboard.isActive ? "● Active Partner" : "○ Disabled"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.15rem" }}>
                    Individual Partner Performance & Sales Overview
                  </div>
                </div>
              </div>

              {/* Partner Quick-Switch Dropdown & Close */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700" }}>Switch:</span>
                  <select
                    value={selectedPartnerForDashboard.id}
                    onChange={(e) => {
                      const nextP = partners.find((p) => p.id === e.target.value);
                      if (nextP) handleOpenPartnerDashboard(nextP);
                    }}
                    style={{
                      padding: "0.45rem 0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "#334155",
                      cursor: "pointer"
                    }}
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.companyName}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setSelectedPartnerForDashboard(null)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    color: "#475569",
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                  title="Close dashboard"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 2. Scrollable Modal Body */}
            <div style={{
              padding: "1.75rem 2rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "1.75rem",
              background: "#f8fafc"
            }}>
              {/* Partner Contact & Action Strip */}
              <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "1.25rem 1.5rem",
                border: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Contact Person</span>
                    <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "0.95rem", marginTop: "0.1rem" }}>
                      {selectedPartnerForDashboard.contactName}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Email Address</span>
                    <div style={{ fontWeight: "700", color: "#0284c7", fontSize: "0.9rem", marginTop: "0.1rem" }}>
                      <i className="fa-solid fa-envelope" style={{ marginRight: "0.35rem" }}></i>
                      {selectedPartnerForDashboard.email}
                    </div>
                  </div>

                  {selectedPartnerForDashboard.phone && (
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Phone</span>
                      <div style={{ fontWeight: "700", color: "#334155", fontSize: "0.9rem", marginTop: "0.1rem" }}>
                        <i className="fa-solid fa-phone" style={{ marginRight: "0.35rem" }}></i>
                        {selectedPartnerForDashboard.phone}
                      </div>
                    </div>
                  )}

                  {selectedPartnerForDashboard.note && (
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Remarks</span>
                      <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "0.1rem" }}>
                        {selectedPartnerForDashboard.note}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      handleOpenCodesModal(selectedPartnerForDashboard);
                    }}
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "8px",
                      background: "#f0f9ff",
                      color: "#0284c7",
                      border: "1px solid #bae6fd",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    <i className="fa-solid fa-ticket"></i>
                    <span>Manage Codes ({partnerDashboardCodes.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      handleOpenEdit(selectedPartnerForDashboard);
                    }}
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "8px",
                      background: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    <i className="fa-solid fa-pen"></i>
                    <span>Edit Partner</span>
                  </button>

                  <button
                    onClick={() => {
                      setFilterPartnerId(selectedPartnerForDashboard.id);
                      setActiveTab("sales");
                      setSelectedPartnerForDashboard(null);
                    }}
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "8px",
                      background: "#222945",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    <i className="fa-solid fa-receipt"></i>
                    <span>View in All Sales</span>
                  </button>
                </div>
              </div>

              {partnerDashboardLoading ? (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "0.8rem", color: "#0284c7" }}></i>
                  <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>Loading Partner Performance...</div>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.25rem" }}>Aggregating sales transactions and promo code analytics</div>
                </div>
              ) : (
                <>
                  {/* KPI Cards Grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1.25rem"
                  }}>
                    {/* Card 1: Total Revenue */}
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid #a7f3d0",
                      borderRadius: "20px",
                      padding: "1.4rem 1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div>
                          <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>LIFETIME REVENUE</div>
                          <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a", marginTop: "0.15rem" }}>Total Generated</div>
                        </div>
                        <div style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem",
                          boxShadow: "0 4px 10px rgba(5, 150, 105, 0.25)"
                        }}>
                          <i className="fa-solid fa-coins"></i>
                        </div>
                      </div>
                      <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#059669", letterSpacing: "-0.5px" }}>
                        ฿{(partnerStats?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                        MTD: ฿{(partnerStats?.monthRevenue || 0).toLocaleString()} • Today: ฿{(partnerStats?.todayRevenue || 0).toLocaleString()}
                      </div>
                    </div>

                    {/* Card 2: Total Orders */}
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid #bae6fd",
                      borderRadius: "20px",
                      padding: "1.4rem 1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div>
                          <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>ORDER VOLUME</div>
                          <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a", marginTop: "0.15rem" }}>Referred Bookings</div>
                        </div>
                        <div style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem",
                          boxShadow: "0 4px 10px rgba(2, 132, 199, 0.25)"
                        }}>
                          <i className="fa-solid fa-cart-shopping"></i>
                        </div>
                      </div>
                      <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#0284c7", letterSpacing: "-0.5px" }}>
                        {partnerStats?.totalOrders || 0} Orders
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                        MTD: {partnerStats?.monthOrders || 0} orders • Today: {partnerStats?.todayOrders || 0} orders
                      </div>
                    </div>

                    {/* Card 3: AOV */}
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid #fde68a",
                      borderRadius: "20px",
                      padding: "1.4rem 1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div>
                          <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>AVERAGE BASKET</div>
                          <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a", marginTop: "0.15rem" }}>Order Value (AOV)</div>
                        </div>
                        <div style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem",
                          boxShadow: "0 4px 10px rgba(217, 119, 6, 0.25)"
                        }}>
                          <i className="fa-solid fa-scale-balanced"></i>
                        </div>
                      </div>
                      <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#d97706", letterSpacing: "-0.5px" }}>
                        ฿{Math.round(partnerStats?.avgOrderValue || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                        Average gross spend per customer order
                      </div>
                    </div>

                    {/* Card 4: Promo Codes */}
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid #ddd6fe",
                      borderRadius: "20px",
                      padding: "1.4rem 1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div>
                          <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>CAMPAIGN REACH</div>
                          <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a", marginTop: "0.15rem" }}>Promo Codes</div>
                        </div>
                        <div style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem",
                          boxShadow: "0 4px 10px rgba(124, 58, 237, 0.25)"
                        }}>
                          <i className="fa-solid fa-ticket"></i>
                        </div>
                      </div>
                      <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#7c3aed", letterSpacing: "-0.5px" }}>
                        {partnerDashboardCodes.filter((c) => c.isActive).length} / {partnerDashboardCodes.length}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                        Active discount codes currently in circulation
                      </div>
                    </div>
                  </div>

                  {/* Partner Sales Analytics Chart */}
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "1.5rem 1.75rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem"
                  }}>
                    {/* Chart Header */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: "#f0f9ff",
                          color: "#0284c7",
                          border: "1px solid #bae6fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1rem"
                        }}>
                          <i className="fa-solid fa-chart-line"></i>
                        </div>
                        <div>
                          <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                            Sales & Revenue Timeline
                          </h3>
                          <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.15rem 0 0 0" }}>
                            Trend of sales generated exclusively by {selectedPartnerForDashboard.companyName}
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        {/* Area / Bar Toggle */}
                        <div style={{ display: "flex", background: "#f1f5f9", padding: "0.2rem", borderRadius: "8px" }}>
                          <button
                            onClick={() => setPartnerChartType("area")}
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "6px",
                              border: "none",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              background: partnerChartType === "area" ? "#ffffff" : "transparent",
                              color: partnerChartType === "area" ? "#0284c7" : "#64748b",
                              boxShadow: partnerChartType === "area" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
                            }}
                          >
                            <i className="fa-solid fa-chart-area" style={{ marginRight: "0.3rem" }}></i>
                            Area
                          </button>
                          <button
                            onClick={() => setPartnerChartType("bar")}
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "6px",
                              border: "none",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              background: partnerChartType === "bar" ? "#ffffff" : "transparent",
                              color: partnerChartType === "bar" ? "#0284c7" : "#64748b",
                              boxShadow: partnerChartType === "bar" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
                            }}
                          >
                            <i className="fa-solid fa-chart-simple" style={{ marginRight: "0.3rem" }}></i>
                            Bars
                          </button>
                        </div>

                        {/* Timeframe */}
                        <div style={{ display: "flex", background: "#f1f5f9", padding: "0.2rem", borderRadius: "8px" }}>
                          {[
                            { id: "last7Days", label: "7D" },
                            { id: "last30Days", label: "30D" },
                            { id: "last6Months", label: "6M" }
                          ].map((tf) => (
                            <button
                              key={tf.id}
                              onClick={() => {
                                setPartnerChartTimeframe(tf.id);
                                setPartnerHoveredPoint(null);
                              }}
                              style={{
                                padding: "0.35rem 0.65rem",
                                borderRadius: "6px",
                                border: "none",
                                fontSize: "0.75rem",
                                fontWeight: partnerChartTimeframe === tf.id ? "800" : "600",
                                cursor: "pointer",
                                background: partnerChartTimeframe === tf.id ? "#0f172a" : "transparent",
                                color: partnerChartTimeframe === tf.id ? "#ffffff" : "#64748b"
                              }}
                            >
                              {tf.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Ribbon */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: "0.75rem",
                      background: "#f8fafc",
                      padding: "0.85rem 1.25rem",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0"
                    }}>
                      <div>
                        <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Period Revenue</div>
                        <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#059669", marginTop: "0.1rem" }}>
                          ฿{partnerPeriodTotalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Period Orders</div>
                        <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#0f172a", marginTop: "0.1rem" }}>
                          {partnerPeriodTotalOrders} orders
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                          {partnerChartTimeframe === "last6Months" ? "Avg / Month" : "Avg / Day"}
                        </div>
                        <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#0284c7", marginTop: "0.1rem" }}>
                          ฿{Math.round(partnerPeriodAvg).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Peak</div>
                        <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#7c3aed", marginTop: "0.1rem" }}>
                          ฿{partnerPeriodPeak.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Hover Tooltip */}
                    {partnerHoveredPoint && (
                      <div style={{
                        background: "#0f172a",
                        color: "#ffffff",
                        padding: "0.5rem 0.9rem",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.8rem",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                        alignSelf: "flex-start"
                      }}>
                        <span style={{ fontWeight: "700", color: "#38bdf8" }}>{partnerHoveredPoint.fullDate || partnerHoveredPoint.label}</span>
                        <span>•</span>
                        <span>Revenue: <strong style={{ color: "#34d399" }}>฿{partnerHoveredPoint.amount.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Orders: <strong>{partnerHoveredPoint.count}</strong></span>
                      </div>
                    )}

                    {/* SVG Chart */}
                    <div style={{ width: "100%", overflowX: "auto" }}>
                      {currentPartnerChartItems.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                          No sales data in this timeframe
                        </div>
                      ) : (
                        <svg
                          viewBox={`0 0 ${partnerSvgWidth} ${partnerSvgHeight}`}
                          style={{ width: "100%", height: "auto", minWidth: "550px", overflow: "visible", display: "block" }}
                        >
                          <defs>
                            <linearGradient id="singlePartnerRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.32" />
                              <stop offset="85%" stopColor="#0284c7" stopOpacity="0.04" />
                              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                            </linearGradient>

                            <linearGradient id="singlePartnerBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#38bdf8" />
                              <stop offset="100%" stopColor="#0284c7" />
                            </linearGradient>

                            <linearGradient id="singlePartnerBarHoverGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#34d399" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          {partnerYTicks.map((tick, i) => (
                            <g key={i}>
                              <line
                                x1={partnerPadLeft}
                                y1={tick.y}
                                x2={partnerSvgWidth - partnerPadRight}
                                y2={tick.y}
                                stroke={i === partnerYTicks.length - 1 ? "#cbd5e1" : "#f1f5f9"}
                                strokeWidth={i === partnerYTicks.length - 1 ? 1.5 : 1}
                                strokeDasharray={i === partnerYTicks.length - 1 ? "none" : "4 4"}
                              />
                              <text
                                x={partnerPadLeft - 10}
                                y={tick.y + 4}
                                textAnchor="end"
                                fontSize="10"
                                fill="#94a3b8"
                                fontWeight="600"
                              >
                                ฿{tick.val >= 1000 ? `${Math.round(tick.val / 1000)}k` : tick.val}
                              </text>
                            </g>
                          ))}

                          {/* Area Mode */}
                          {partnerChartType === "area" && (
                            <>
                              {partnerAreaPath && (
                                <path d={partnerAreaPath} fill="url(#singlePartnerRevenueGrad)" style={{ transition: "all 0.3s ease" }} />
                              )}
                              {partnerLinePath && (
                                <path d={partnerLinePath} fill="none" stroke="#0284c7" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                              )}
                              {partnerHoveredPoint && (
                                <line x1={partnerHoveredPoint.x} y1={partnerPadTop} x2={partnerHoveredPoint.x} y2={partnerBaselineY} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                              )}
                              {partnerChartPoints.map((p) => {
                                const isHovered = partnerHoveredPoint?.idx === p.idx;
                                const showDot = currentPartnerChartItems.length <= 14 || isHovered || p.amount > 0;
                                return (
                                  <g key={p.idx} onMouseEnter={() => setPartnerHoveredPoint(p)} onMouseLeave={() => setPartnerHoveredPoint(null)} style={{ cursor: "pointer" }}>
                                    <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
                                    {isHovered && <circle cx={p.x} cy={p.y} r={8} fill="#38bdf8" opacity="0.35" />}
                                    {showDot && (
                                      <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={isHovered ? 5.5 : p.amount > 0 ? 4 : 2.5}
                                        fill={isHovered ? "#38bdf8" : p.amount > 0 ? "#0284c7" : "#cbd5e1"}
                                        stroke="#ffffff"
                                        strokeWidth={isHovered ? 2 : 1.5}
                                      />
                                    )}
                                  </g>
                                );
                              })}
                            </>
                          )}

                          {/* Bar Mode */}
                          {partnerChartType === "bar" && (
                            <>
                              {partnerChartPoints.map((p) => {
                                const isHovered = partnerHoveredPoint?.idx === p.idx;
                                const barWidth = Math.min(32, Math.max(10, (partnerPlotWidth / currentPartnerChartItems.length) * 0.65));
                                const barHeight = Math.max(partnerBaselineY - p.y, p.amount > 0 ? 4 : 0);
                                const barX = p.x - barWidth / 2;
                                const barY = partnerBaselineY - barHeight;

                                return (
                                  <g key={p.idx} onMouseEnter={() => setPartnerHoveredPoint(p)} onMouseLeave={() => setPartnerHoveredPoint(null)} style={{ cursor: "pointer" }}>
                                    <rect x={p.x - barWidth} y={partnerPadTop} width={barWidth * 2} height={partnerPlotHeight} fill="transparent" />
                                    <rect
                                      x={barX}
                                      y={barY}
                                      width={barWidth}
                                      height={barHeight}
                                      rx={Math.min(5, barWidth / 2)}
                                      fill={isHovered ? "url(#singlePartnerBarHoverGrad)" : "url(#singlePartnerBarGrad)"}
                                      opacity={isHovered ? 1 : p.amount > 0 ? 0.9 : 0.2}
                                      style={{ transition: "all 0.2s ease" }}
                                    />
                                  </g>
                                );
                              })}
                            </>
                          )}

                          {/* X-Axis Labels */}
                          {partnerChartPoints.map((p, idx) => {
                            let shouldShow = true;
                            if (partnerChartTimeframe === "last30Days") {
                              shouldShow = idx % 5 === 0 || idx === partnerChartPoints.length - 1;
                            }
                            if (!shouldShow) return null;
                            const isHovered = partnerHoveredPoint?.idx === p.idx;
                            return (
                              <text
                                key={idx}
                                x={p.x}
                                y={partnerBaselineY + 20}
                                textAnchor="middle"
                                fontSize="10.5"
                                fontWeight={isHovered ? "800" : "600"}
                                fill={isHovered ? "#0284c7" : "#64748b"}
                              >
                                {p.label}
                              </text>
                            );
                          })}
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Promo Codes & Recent Sales Two-Column */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                    gap: "1.5rem",
                    alignItems: "start"
                  }}>
                    {/* Left: Promo Codes for this partner */}
                    <div style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                    }}>
                      <div style={{
                        padding: "1.1rem 1.4rem",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                            <i className="fa-solid fa-ticket" style={{ color: "#0284c7", marginRight: "0.4rem" }}></i>
                            Assigned Promo Codes ({partnerDashboardCodes.length})
                          </h4>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.15rem" }}>
                            Discount campaigns active for this partner
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenCodesModal(selectedPartnerForDashboard)}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "6px",
                            background: "#222945",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          + New Code
                        </button>
                      </div>

                      {partnerDashboardCodes.length === 0 ? (
                        <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#94a3b8" }}>
                          No promo codes found for this partner.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          {partnerDashboardCodes.map((pc, idx) => {
                            const stats = partnerStats?.codeStatsMap?.[pc.code] || { count: 0, revenue: 0 };
                            const st = getCodeStatus(pc);

                            return (
                              <div
                                key={pc.id || idx}
                                style={{
                                  padding: "0.9rem 1.4rem",
                                  borderBottom: idx === partnerDashboardCodes.length - 1 ? "none" : "1px solid #f1f5f9",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "0.75rem"
                                }}
                              >
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span style={{
                                      fontFamily: "monospace",
                                      fontWeight: "900",
                                      fontSize: "0.95rem",
                                      color: "#0f172a",
                                      background: "#f1f5f9",
                                      padding: "0.15rem 0.5rem",
                                      borderRadius: "6px",
                                      border: "1px solid #cbd5e1"
                                    }}>
                                      {pc.code}
                                    </span>
                                    <span style={{
                                      background: st.bg,
                                      color: st.color,
                                      border: `1px solid ${st.border}`,
                                      fontSize: "0.7rem",
                                      fontWeight: "800",
                                      padding: "0.15rem 0.45rem",
                                      borderRadius: "4px"
                                    }}>
                                      {st.label}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                                    Discount: <strong>{pc.discountType === "PERCENTAGE" ? `${pc.discountValue}%` : `฿${pc.discountValue}`} OFF</strong>
                                    {" • "}
                                    {formatSchedule(pc)}
                                  </div>
                                </div>

                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                  <div style={{ fontWeight: "900", color: "#166534", fontSize: "0.95rem" }}>
                                    ฿{(stats.revenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                    {stats.count} {stats.count === 1 ? "sale" : "sales"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right: Partner Sales Orders */}
                    <div style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                    }}>
                      <div style={{
                        padding: "1.1rem 1.4rem",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                            <i className="fa-solid fa-receipt" style={{ color: "#059669", marginRight: "0.4rem" }}></i>
                            Recent Referral Sales ({partnerDashboardSales.length})
                          </h4>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.15rem" }}>
                            Customer transactions completed using this partner's codes
                          </div>
                        </div>

                        {partnerDashboardSales.length > 0 && (
                          <button
                            onClick={() => {
                              setFilterPartnerId(selectedPartnerForDashboard.id);
                              setActiveTab("sales");
                              setSelectedPartnerForDashboard(null);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#0284c7",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            All ({partnerDashboardSales.length}) →
                          </button>
                        )}
                      </div>

                      {partnerDashboardSales.length === 0 ? (
                        <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#94a3b8" }}>
                          No sales recorded yet for this partner.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", maxHeight: "400px", overflowY: "auto" }}>
                          {partnerDashboardSales.slice(0, 8).map((s, idx) => (
                            <div
                              key={s.id || idx}
                              style={{
                                padding: "0.85rem 1.4rem",
                                borderBottom: idx === Math.min(partnerDashboardSales.length, 8) - 1 ? "none" : "1px solid #f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "0.75rem"
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "0.88rem" }}>
                                    {s.customerName || "Customer"}
                                  </span>
                                  <span style={{
                                    fontFamily: "monospace",
                                    fontWeight: "800",
                                    fontSize: "0.72rem",
                                    color: "#0284c7",
                                    background: "#f0f9ff",
                                    padding: "0.1rem 0.4rem",
                                    borderRadius: "4px",
                                    border: "1px solid #bae6fd"
                                  }}>
                                    {s.partnerCode?.code || s.promoCode?.code || "CODE"}
                                  </span>
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.15rem" }}>
                                  {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                  {s.customerPhone && ` • ${s.customerPhone}`}
                                </div>
                              </div>

                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontWeight: "900", color: "#166534", fontSize: "0.95rem" }}>
                                  ฿{(s.saleAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
