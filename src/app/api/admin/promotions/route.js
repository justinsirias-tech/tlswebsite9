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

    const promotions = await prisma.promotion.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ success: true, promotions }, { status: 200 });
  } catch (error) {
    console.error("Admin promotions GET error:", error);
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

    if (!data.title || !data.description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        title: data.title,
        title_th: data.title_th || null,
        title_cn: data.title_cn || null,
        description: data.description,
        desc_th: data.desc_th || null,
        desc_cn: data.desc_cn || null,
        code: data.code ? data.code.toUpperCase() : null,
        badge: data.badge || null,
        badge_th: data.badge_th || null,
        badge_cn: data.badge_cn || null,
        imageUrl: data.imageUrl || null,
        category: data.category || "monthly",
        validUntil: data.validUntil || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0
      }
    });

    return NextResponse.json({ success: true, promotion }, { status: 201 });
  } catch (error) {
    console.error("Admin promotions POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
