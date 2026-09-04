import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../../lib/prisma";
import { parseDateInput } from "../../../../../lib/dateUtils";

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

export async function PUT(request, { params }) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const updateData = {};
    if (data.code !== undefined) updateData.code = data.code.trim().toUpperCase();
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = parseFloat(data.discountValue);
    if (data.discountTarget !== undefined) updateData.discountTarget = data.discountTarget;
    if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue ? parseFloat(data.minOrderValue) : 0;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;
    if (data.usedCount !== undefined) updateData.usedCount = parseInt(data.usedCount);
    if (data.startDate !== undefined) updateData.startDate = parseDateInput(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = parseDateInput(data.endDate);
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate || null;
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    if (data.description !== undefined) updateData.description = data.description || null;

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, promoCode }, { status: 200 });
  } catch (error) {
    console.error("Admin promo-codes PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.promoCode.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Promo Code deleted" }, { status: 200 });
  } catch (error) {
    console.error("Admin promo-codes DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
