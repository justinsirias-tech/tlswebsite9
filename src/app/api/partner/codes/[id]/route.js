import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getPartnerSession } from "../../../../../lib/partnerAuth";
import { parseDateInput } from "../../../../../lib/dateUtils";

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const partner = await getPartnerSession(request);
    if (!partner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json().catch(() => ({}));

    // Verify ownership
    const existing = await prisma.promoCode.findFirst({
      where: {
        id,
        partnerId: partner.id
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Promo code not found or you do not have permission to edit this code." },
        { status: 404 }
      );
    }

    const updateData = {};
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    if (data.startDate !== undefined) updateData.startDate = parseDateInput(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = parseDateInput(data.endDate);
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.discountValue !== undefined) updateData.discountValue = parseFloat(data.discountValue);
    if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue ? parseFloat(data.minOrderValue) : 0;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;

    const updated = await prisma.promoCode.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, promoCode: updated });
  } catch (error) {
    console.error("[PARTNER_CODE_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
