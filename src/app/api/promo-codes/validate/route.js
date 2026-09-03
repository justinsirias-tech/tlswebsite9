import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Promo code is required." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode }
    });

    if (!promo) {
      return NextResponse.json({ valid: false, error: "Invalid promo code." }, { status: 404 });
    }

    // Check manual toggle
    if (!promo.isActive) {
      return NextResponse.json({ valid: false, error: "This promo code is currently disabled." }, { status: 400 });
    }

    const now = new Date();

    // Check Start Date (Auto-activate)
    if (promo.startDate && new Date(promo.startDate) > now) {
      const startStr = new Date(promo.startDate).toLocaleDateString("en-US", { dateStyle: "medium" });
      return NextResponse.json({ 
        valid: false, 
        error: `This promo code will become active on ${startStr}.` 
      }, { status: 400 });
    }

    // Check End Date (Auto-deactivate)
    if (promo.endDate && new Date(promo.endDate) < now) {
      const endStr = new Date(promo.endDate).toLocaleDateString("en-US", { dateStyle: "medium" });
      return NextResponse.json({ 
        valid: false, 
        error: `This promo code expired on ${endStr}.` 
      }, { status: 400 });
    }

    // Check Usage Limit
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return NextResponse.json({ 
        valid: false, 
        error: "This promo code has reached its maximum redemption limit." 
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountTarget: promo.discountTarget || "ALL",
      minOrderValue: promo.minOrderValue || 0,
      maxDiscount: promo.maxDiscount,
      description: promo.description
    }, { status: 200 });
  } catch (error) {
    console.error("Promo code validation error:", error);
    return NextResponse.json({ valid: false, error: "Internal Server Error" }, { status: 500 });
  }
}
