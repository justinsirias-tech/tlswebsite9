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

    const codes = await prisma.promoCode.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    });

    return NextResponse.json({ success: true, codes });
  } catch (error) {
    console.error("[PARTNER_CODES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const partner = await getPartnerSession(request);
    if (!partner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json().catch(() => ({}));
    if (!data.code || typeof data.code !== "string" || !data.code.trim()) {
      return NextResponse.json({ error: "Promo Code is required." }, { status: 400 });
    }

    const cleanCode = data.code.trim().toUpperCase();

    // Check uniqueness
    const existing = await prisma.promoCode.findUnique({
      where: { code: cleanCode }
    });

    if (existing) {
      return NextResponse.json({ error: `Promo Code '${cleanCode}' already exists.` }, { status: 400 });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: cleanCode,
        partnerId: partner.id,
        discountType: data.discountType || "PERCENTAGE",
        discountValue: data.discountValue ? parseFloat(data.discountValue) : 10,
        discountTarget: data.discountTarget || "ALL",
        minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : 0,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        description: data.description || null
      }
    });

    return NextResponse.json({ success: true, promoCode }, { status: 201 });
  } catch (error) {
    console.error("[PARTNER_CODES_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
