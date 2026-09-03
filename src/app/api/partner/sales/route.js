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
    const promoCodeId = searchParams.get("promoCodeId");

    const where = { partnerId: partner.id };

    if (promoCodeId) {
      where.promoCodeId = promoCodeId;
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
        promoCode: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const totalAmount = sales.reduce((acc, curr) => acc + (curr.saleAmount || 0), 0);

    return NextResponse.json({
      success: true,
      sales,
      summary: {
        totalCount: sales.length,
        totalAmount: Math.round(totalAmount * 100) / 100
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
    const { promoCodeId, customerName, customerPhone, saleAmount, note } = data;

    if (!promoCodeId || !customerName || !customerPhone || saleAmount === undefined || saleAmount === null) {
      return NextResponse.json(
        { error: "กรุณาระบุข้อมูลให้ครบถ้วน: Code, ชื่อลูกค้า, เบอร์โทร, และราคาขาย" },
        { status: 400 }
      );
    }

    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: "ราคาขายต้องเป็นจำนวนเงินที่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Verify promoCode belongs to this partner
    const code = await prisma.promoCode.findFirst({
      where: {
        id: promoCodeId,
        partnerId: partner.id
      }
    });

    if (!code) {
      return NextResponse.json(
        { error: "ไม่พบโค้ดส่วนลดนี้ หรือคุณไม่มีสิทธิ์ใช้งานโค้ดนี้" },
        { status: 404 }
      );
    }

    const newSale = await prisma.partnerSale.create({
      data: {
        partnerId: partner.id,
        promoCodeId: code.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        saleAmount: amount,
        note: note ? note.trim() : null
      },
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

    return NextResponse.json({ success: true, sale: newSale }, { status: 201 });
  } catch (error) {
    console.error("[PARTNER_SALES_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
