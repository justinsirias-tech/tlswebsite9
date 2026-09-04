import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../lib/prisma";
import { parseDateInput } from "../../../../lib/dateUtils";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

async function verifyAdmin(request) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload && (payload.role === "SUPERADMIN" || payload.role === "EDITOR");
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

    const popups = await prisma.popupTemplate.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, popups }, { status: 200 });
  } catch (error) {
    console.error("Admin popups GET error:", error);
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
    if (!data.name || !data.imageUrl || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const popup = await prisma.popupTemplate.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        startDate: parseDateInput(data.startDate),
        endDate: parseDateInput(data.endDate),
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    return NextResponse.json({ success: true, popup }, { status: 201 });
  } catch (error) {
    console.error("Admin popups POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
