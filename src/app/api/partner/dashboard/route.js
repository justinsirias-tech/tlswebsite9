import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getPartnerSession } from "../../../../lib/partnerAuth";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const partner = await getPartnerSession(request);
    if (!partner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Start of Today (local server time)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of Year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Query all sales for this partner with their related partner codes
    const allSales = await prisma.partnerSale.findMany({
      where: { partnerId: partner.id },
      include: {
        partnerCode: {
          select: {
            code: true,
            discountType: true,
            discountValue: true,
            maxDiscount: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Query partner's promo codes
    const activeCodes = await prisma.partnerCode.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        isActive: true,
        startDate: true,
        endDate: true,
        description: true,
        _count: {
          select: { sales: true }
        }
      }
    });

    let todayAmount = 0, todayCount = 0;
    let monthAmount = 0, monthCount = 0;
    let yearAmount = 0, yearCount = 0;
    let allAmount = 0, allCount = allSales.length;

    const codeStatsMap = {};

    for (const s of allSales) {
      const amount = Number(s.saleAmount) || 0;
      const sDate = new Date(s.createdAt);

      allAmount += amount;

      if (sDate >= startOfToday) {
        todayAmount += amount;
        todayCount++;
      }

      if (sDate >= startOfMonth) {
        monthAmount += amount;
        monthCount++;
      }

      if (sDate >= startOfYear) {
        yearAmount += amount;
        yearCount++;
      }

      // Breakdown by code
      const codeName = s.partnerCode?.code || "DELETED_CODE";
      if (!codeStatsMap[codeName]) {
        codeStatsMap[codeName] = {
          code: codeName,
          discountType: s.partnerCode?.discountType || "PERCENTAGE",
          discountValue: s.partnerCode?.discountValue || 0,
          totalAmount: 0,
          count: 0
        };
      }
      codeStatsMap[codeName].totalAmount += amount;
      codeStatsMap[codeName].count += 1;
    }

    const codesBreakdown = Object.values(codeStatsMap).sort((a, b) => b.totalAmount - a.totalAmount);

    // Generate Time-series Chart Data
    // 1. Last 7 Days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const label = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      const fullDate = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

      const daySales = allSales.filter(s => {
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

      const daySales = allSales.filter(s => {
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
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const fullDate = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

      const monthSales = allSales.filter(s => {
        const sDate = new Date(s.createdAt);
        return sDate.getFullYear() === year && sDate.getMonth() === month;
      });

      const monthAmount = monthSales.reduce((acc, s) => acc + (Number(s.saleAmount) || 0), 0);

      last6Months.push({
        label,
        fullDate,
        amount: Math.round(monthAmount * 100) / 100,
        count: monthSales.length
      });
    }

    const chartData = {
      last7Days,
      last30Days,
      last6Months
    };

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email
      },
      stats: {
        today: { amount: Math.round(todayAmount * 100) / 100, count: todayCount },
        thisMonth: { amount: Math.round(monthAmount * 100) / 100, count: monthCount },
        thisYear: { amount: Math.round(yearAmount * 100) / 100, count: yearCount },
        allTime: { amount: Math.round(allAmount * 100) / 100, count: allCount }
      },
      chartData,
      activeCodes,
      codesBreakdown,
      recentSales: allSales.slice(0, 5).map(s => {
        const gross = Number(s.saleAmount) || 0;
        let discount = 0;
        const pc = s.partnerCode;
        if (pc) {
          if (pc.discountType === "PERCENTAGE") {
            const raw = gross * ((Number(pc.discountValue) || 0) / 100);
            discount = pc.maxDiscount ? Math.min(raw, Number(pc.maxDiscount)) : raw;
          } else if (pc.discountType === "FIXED") {
            discount = Math.min(gross, Number(pc.discountValue) || 0);
          }
        }
        discount = Math.round(discount * 100) / 100;
        const net = Math.max(0, Math.round((gross - discount) * 100) / 100);
        return {
          ...s,
          promoCode: pc,
          originalAmount: gross,
          discountAmount: discount,
          netAmount: net
        };
      })
    });
  } catch (error) {
    console.error("[PARTNER_DASHBOARD_STATS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
