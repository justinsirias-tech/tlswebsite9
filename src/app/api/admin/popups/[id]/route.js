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
    return payload && (payload.role === "SUPERADMIN" || payload.role === "EDITOR");
  } catch (error) {
    return false;
  }
}

export async function PUT(request, { params }) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const data = await request.json();

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.startDate !== undefined) updateData.startDate = parseDateInput(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = parseDateInput(data.endDate);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const popup = await prisma.popupTemplate.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, popup }, { status: 200 });
  } catch (error) {
    console.error("Admin popups PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await prisma.popupTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Popup template deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Admin popups DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
