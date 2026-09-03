import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../../lib/prisma";
import { hashPassword } from "../../../../../lib/partnerAuth";

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
    const data = await request.json().catch(() => ({}));

    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const updateData = {};
    if (data.companyName !== undefined) updateData.companyName = data.companyName.trim();
    if (data.contactName !== undefined) updateData.contactName = data.contactName.trim();
    if (data.phone !== undefined) updateData.phone = data.phone ? data.phone.trim() : null;
    if (data.note !== undefined) updateData.note = data.note ? data.note.trim() : null;
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

    if (data.email !== undefined) {
      const cleanEmail = data.email.trim().toLowerCase();
      if (cleanEmail !== existing.email) {
        const emailTaken = await prisma.partner.findUnique({ where: { email: cleanEmail } });
        if (emailTaken) {
          return NextResponse.json({ error: `อีเมล '${cleanEmail}' มีอยู่ในระบบแล้ว` }, { status: 400 });
        }
        updateData.email = cleanEmail;
      }
    }

    if (data.password && data.password.trim()) {
      updateData.password = await hashPassword(data.password.trim());
    }

    const updated = await prisma.partner.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
        note: true,
        isActive: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ success: true, partner: updated });
  } catch (error) {
    console.error("[ADMIN_PARTNER_PUT_ERROR]", error);
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

    // Check if partner has sales
    const salesCount = await prisma.partnerSale.count({ where: { partnerId: id } });
    if (salesCount > 0) {
      // Soft-disable instead of hard delete to preserve sales records
      await prisma.partner.update({
        where: { id },
        data: { isActive: false }
      });
      return NextResponse.json({
        success: true,
        message: "พาร์ทเนอร์นี้มีประวัติรายการขายในระบบ จึงได้ทำการปิดการใช้งาน (Deactivate) แทนการลบข้อมูล"
      });
    }

    // Unlink codes
    await prisma.promoCode.updateMany({
      where: { partnerId: id },
      data: { partnerId: null }
    });

    await prisma.partner.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ลบพาร์ทเนอร์เรียบร้อยแล้ว" });
  } catch (error) {
    console.error("[ADMIN_PARTNER_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
