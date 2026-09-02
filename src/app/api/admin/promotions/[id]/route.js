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

export async function PUT(request, { params }) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.title_th !== undefined) updateData.title_th = data.title_th;
    if (data.title_cn !== undefined) updateData.title_cn = data.title_cn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.desc_th !== undefined) updateData.desc_th = data.desc_th;
    if (data.desc_cn !== undefined) updateData.desc_cn = data.desc_cn;
    if (data.code !== undefined) updateData.code = data.code ? data.code.toUpperCase() : null;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.badge_th !== undefined) updateData.badge_th = data.badge_th;
    if (data.badge_cn !== undefined) updateData.badge_cn = data.badge_cn;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.validUntil !== undefined) updateData.validUntil = data.validUntil;
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    if (data.sortOrder !== undefined) updateData.sortOrder = parseInt(data.sortOrder);

    const promotion = await prisma.promotion.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, promotion }, { status: 200 });
  } catch (error) {
    console.error("Admin promotions PUT error:", error);
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
    await prisma.promotion.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Promotion deleted" }, { status: 200 });
  } catch (error) {
    console.error("Admin promotions DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
