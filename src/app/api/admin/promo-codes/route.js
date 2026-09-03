import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../lib/prisma";

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

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, promoCodes }, { status: 200 });
  } catch (error) {
    console.error("Admin promo-codes GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.code) {
      return NextResponse.json({ error: "Promo Code is required" }, { status: 400 });
    }

    const cleanCode = data.code.trim().toUpperCase();

    const existing = await prisma.promoCode.findUnique({
      where: { code: cleanCode }
    });

    if (existing) {
      return NextResponse.json({ error: `Promo Code '${cleanCode}' already exists.` }, { status: 400 });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: cleanCode,
        discountType: data.discountType || "PERCENTAGE",
        discountValue: data.discountValue ? parseFloat(data.discountValue) : 15,
        discountTarget: data.discountTarget || "ALL",
        minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : 0,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        expiryDate: data.expiryDate || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        description: data.description || null
      }
    });

    return NextResponse.json({ success: true, promoCode }, { status: 201 });
  } catch (error) {
    console.error("Admin promo-codes POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
