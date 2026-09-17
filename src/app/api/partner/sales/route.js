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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period"); // "today", "month", "year", "all"
    const partnerCodeId = searchParams.get("partnerCodeId") || searchParams.get("promoCodeId");

    const where = { partnerId: partner.id };

    if (partnerCodeId) {
      where.partnerCodeId = partnerCodeId;
    }

    if (period) {
      const now = new Date();
      if (period === "today") {
        where.createdAt = {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        };
      } else if (period === "month") {
        where.createdAt = {
          gte: new Date(now.getFullYear(), now.getMonth(), 1)
        };
      } else if (period === "year") {
        where.createdAt = {
          gte: new Date(now.getFullYear(), 0, 1)
        };
      }
    }

    const sales = await prisma.partnerSale.findMany({
      where,
      include: {
        partnerCode: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
            maxDiscount: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    let totalGrossAmount = 0;
    let totalDiscountAmount = 0;
    let totalNetAmount = 0;

    const formattedSales = sales.map(s => {
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

      totalGrossAmount += gross;
      totalDiscountAmount += discount;
      totalNetAmount += net;

      return {
        ...s,
        promoCode: pc,
        originalAmount: gross,
        discountAmount: discount,
        netAmount: net
      };
    });

    return NextResponse.json({
      success: true,
      sales: formattedSales,
      summary: {
        totalCount: sales.length,
        totalGrossAmount: Math.round(totalGrossAmount * 100) / 100,
        totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
        totalNetAmount: Math.round(totalNetAmount * 100) / 100,
        totalAmount: Math.round(totalNetAmount * 100) / 100
      }
    });
  } catch (error) {
    console.error("[PARTNER_SALES_GET_ERROR]", error);
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
    const partnerCodeId = data.partnerCodeId || data.promoCodeId;
    const { customerName, customerPhone, saleAmount, note } = data;

    if (!partnerCodeId || !customerName || !customerPhone || saleAmount === undefined || saleAmount === null) {
      return NextResponse.json(
        { error: "Please fill in all required fields: Partner Code, Customer Name, Phone Number, and Sale Price." },
        { status: 400 }
      );
    }

    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: "Sale price must be a valid positive number." },
        { status: 400 }
      );
    }

    // Verify partnerCode belongs to this partner
    const code = await prisma.partnerCode.findFirst({
      where: {
        id: partnerCodeId,
        partnerId: partner.id
      }
    });

    if (!code) {
      return NextResponse.json(
        { error: "Partner code not found or you do not have permission to use it." },
        { status: 404 }
      );
    }

    const newSale = await prisma.partnerSale.create({
      data: {
        partnerId: partner.id,
        partnerCodeId: code.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        saleAmount: amount,
        note: note ? note.trim() : null
      },
      include: {
        partnerCode: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      sale: {
        ...newSale,
        promoCode: newSale.partnerCode
      }
    }, { status: 201 });
  } catch (error) {
    console.error("[PARTNER_SALES_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
