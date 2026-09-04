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

export async function POST() {
  return NextResponse.json(
    { error: "ไม่อนุญาตให้พาร์ทเนอร์สร้างโค้ดเอง กรุณาติดต่อผู้ดูแลระบบ TLS เพื่อสร้างโค้ดโปรโมชั่น" },
    { status: 403 }
  );
}
