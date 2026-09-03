import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

async function verifyAdmin(request) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload && (payload.role === "SUPERADMIN" || payload.role === "ADMIN" || payload.role === "EDITOR" || payload.role === "staff");
  } catch (error) {
    return false;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [bookings, promoCodes, promotions] = await Promise.all([
      prisma.booking.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.promoCode.findMany({ orderBy: { usedCount: "desc" } }),
      prisma.promotion.findMany()
    ]);

    const totalBookings = bookings.length;
    const activePromotions = promotions.filter(p => p.isActive).length;
    const activePromoCodes = promoCodes.filter(p => p.isActive).length;

    // Service Breakdown
    const serviceCounts = {
      washFold: 0,
      washIronFold: 0,
      dryCleaning: 0,
      linens: 0,
      express: 0,
      others: 0
    };

    // Promo Code Usage Extracted from Bookings
    const promoCodeUsageMap = {};

    // Delivery Preference
    let meetInPerson = 0;
    let conciergeLobby = 0;

    bookings.forEach(b => {
      const s = (b.service || "").toLowerCase();

      if (s.includes("wash & fold") || s.includes("wash and fold")) serviceCounts.washFold++;
      if (s.includes("iron")) serviceCounts.washIronFold++;
      if (s.includes("dry cleaning") || s.includes("dryclean")) serviceCounts.dryCleaning++;
      if (s.includes("linens") || s.includes("bedding") || s.includes("duvet")) serviceCounts.linens++;
      if (s.includes("express")) serviceCounts.express++;

      if (s.includes("meet in person")) meetInPerson++;
      if (s.includes("concierge") || s.includes("lobby")) conciergeLobby++;

      // Check if promo code is mentioned in service description
      const promoMatch = s.match(/promo code:\s*([a-zA-Z0-9_-]+)/i);
      if (promoMatch && promoMatch[1]) {
        const code = promoMatch[1].toUpperCase();
        promoCodeUsageMap[code] = (promoCodeUsageMap[code] || 0) + 1;
      }
    });

    // Merge database PromoCode usedCount with live booking matches
    const promoPerformance = promoCodes.map(pc => ({
      code: pc.code,
      discountType: pc.discountType,
      discountValue: pc.discountValue,
      discountTarget: pc.discountTarget || "ALL",
      usedCount: Math.max(pc.usedCount, promoCodeUsageMap[pc.code] || 0),
      isActive: pc.isActive,
      expiryDate: pc.expiryDate
    }));

    // Calculate monthly booking trends (last 6 months)
    const monthlyTrends = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      
      const count = bookings.filter(b => {
        const bd = new Date(b.createdAt);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === year;
      }).length;

      monthlyTrends.push({
        month: `${monthName} ${year}`,
        bookings: count
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalBookings,
        activePromotions,
        activePromoCodes,
        totalPromoRedemptions: Object.values(promoCodeUsageMap).reduce((a, b) => a + b, 0)
      },
      serviceCounts,
      pickupBreakdown: {
        meetInPerson,
        conciergeLobby
      },
      promoPerformance,
      monthlyTrends
    }, { status: 200 });

  } catch (error) {
    console.error("Admin analytics GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
