import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../../../lib/prisma";
import { parseDateInput } from "../../../../../../lib/dateUtils";

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

export async function GET(request, { params }) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const partner = await prisma.partner.findUnique({
      where: { id },
      select: { id: true, companyName: true }
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const codes = await prisma.partnerCode.findMany({
      where: { partnerId: id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    });

    return NextResponse.json({ success: true, partner, codes });
  } catch (error) {
    console.error("[ADMIN_PARTNER_CODES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const partner = await prisma.partner.findUnique({
      where: { id }
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const data = await request.json().catch(() => ({}));
    if (!data.code || typeof data.code !== "string" || !data.code.trim()) {
      return NextResponse.json({ error: "Partner Code is required." }, { status: 400 });
    }

    const cleanCode = data.code.trim().toUpperCase();

    // Check uniqueness
    const existing = await prisma.partnerCode.findUnique({
      where: { code: cleanCode }
    });

    if (existing) {
      return NextResponse.json(
        { error: `Partner Code '${cleanCode}' already exists.` },
        { status: 400 }
      );
    }

    const partnerCode = await prisma.partnerCode.create({
      data: {
        code: cleanCode,
        partnerId: id,
        discountType: data.discountType || "PERCENTAGE",
        discountValue: data.discountValue ? parseFloat(data.discountValue) : 10,
        minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : 0,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        startDate: parseDateInput(data.startDate),
        endDate: parseDateInput(data.endDate),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        description: data.description || null
      }
    });

    return NextResponse.json({ success: true, partnerCode, promoCode: partnerCode }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_PARTNER_CODES_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
