import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../../../../lib/prisma";
import { parseDateInput } from "../../../../../../../lib/dateUtils";

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

    const { id: partnerId, codeId } = await params;
    const data = await request.json().catch(() => ({}));

    const existing = await prisma.partnerCode.findFirst({
      where: {
        id: codeId,
        partnerId
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Partner code not found." }, { status: 404 });
    }

    const updateData = {};

    if (data.code !== undefined) {
      const cleanCode = data.code.trim().toUpperCase();
      if (cleanCode !== existing.code) {
        const codeTaken = await prisma.partnerCode.findUnique({
          where: { code: cleanCode }
        });
        if (codeTaken) {
          return NextResponse.json(
            { error: `Partner Code '${cleanCode}' already exists.` },
            { status: 400 }
          );
        }
        updateData.code = cleanCode;
      }
    }

    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = parseFloat(data.discountValue);
    if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue ? parseFloat(data.minOrderValue) : 0;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;
    if (data.startDate !== undefined) updateData.startDate = parseDateInput(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = parseDateInput(data.endDate);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    if (data.description !== undefined) updateData.description = data.description || null;

    const updated = await prisma.partnerCode.update({
      where: { id: codeId },
      data: updateData
    });

    return NextResponse.json({ success: true, partnerCode: updated, promoCode: updated });
  } catch (error) {
    console.error("[ADMIN_PARTNER_CODE_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: partnerId, codeId } = await params;

    const existing = await prisma.partnerCode.findFirst({
      where: {
        id: codeId,
        partnerId
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Partner code not found." }, { status: 404 });
    }

    // Check if code has sales
    const salesCount = await prisma.partnerSale.count({
      where: { partnerCodeId: codeId }
    });

    if (salesCount > 0) {
      // Deactivate instead of hard deleting to preserve sales integrity
      await prisma.partnerCode.update({
        where: { id: codeId },
        data: { isActive: false }
      });
      return NextResponse.json({
        success: true,
        message: "Partner code has associated sales records and has been deactivated instead of deleted."
      });
    }

    await prisma.partnerCode.delete({
      where: { id: codeId }
    });

    return NextResponse.json({
      success: true,
      message: "Partner code deleted successfully."
    });
  } catch (error) {
    console.error("[ADMIN_PARTNER_CODE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
