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
            discountValue: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    let todayAmount = 0, todayCount = 0;
    let monthAmount = 0, monthCount = 0;
    let yearAmount = 0, yearCount = 0;
    let allAmount = 0, allCount = allSales.length;

    const codeStatsMap = {};

    for (const s of allSales) {
      const amount = s.saleAmount || 0;
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
      codesBreakdown,
      recentSales: allSales.slice(0, 5).map(s => ({
        ...s,
        promoCode: s.partnerCode
      }))
    });
  } catch (error) {
    console.error("[PARTNER_DASHBOARD_STATS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
