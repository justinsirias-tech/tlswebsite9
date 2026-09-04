import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getPartnerSession } from "../../../../../lib/partnerAuth";

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const partner = await getPartnerSession(request);
    if (!partner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json().catch(() => ({}));

    // Verify sale exists and belongs to this partner
    const existingSale = await prisma.partnerSale.findFirst({
      where: {
        id,
        partnerId: partner.id
      }
    });

    if (!existingSale) {
      return NextResponse.json(
        { error: "Sale record not found or you do not have permission to edit it." },
        { status: 404 }
      );
    }

    const updateData = {};

    if (data.customerName !== undefined) updateData.customerName = data.customerName.trim();
    if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone.trim();
    if (data.note !== undefined) updateData.note = data.note ? data.note.trim() : null;

    if (data.saleAmount !== undefined) {
      const amount = parseFloat(data.saleAmount);
      if (isNaN(amount) || amount < 0) {
        return NextResponse.json({ error: "Sale price must be a valid positive number." }, { status: 400 });
      }
      updateData.saleAmount = amount;
    }

    if (data.promoCodeId !== undefined) {
      const code = await prisma.promoCode.findFirst({
        where: {
          id: data.promoCodeId,
          partnerId: partner.id
        }
      });
      if (!code) {
        return NextResponse.json({ error: "Invalid promo code." }, { status: 400 });
      }
      updateData.promoCodeId = code.id;
    }

    const updatedSale = await prisma.partnerSale.update({
      where: { id },
      data: updateData,
      include: {
        promoCode: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, sale: updatedSale });
  } catch (error) {
    console.error("[PARTNER_SALE_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
