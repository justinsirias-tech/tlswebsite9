import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../../lib/prisma";

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

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId");
    const promoCodeId = searchParams.get("promoCodeId");
    const period = searchParams.get("period");

    const where = {};
    if (partnerId) where.partnerId = partnerId;
    if (promoCodeId) where.promoCodeId = promoCodeId;

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
        partner: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true
          }
        },
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

    const totalRevenue = sales.reduce((acc, s) => acc + (s.saleAmount || 0), 0);

    return NextResponse.json({
      success: true,
      sales,
      summary: {
        count: sales.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      }
    });
  } catch (error) {
    console.error("[ADMIN_PARTNER_SALES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
