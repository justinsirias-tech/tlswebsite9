import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/partnerAuth";

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json().catch(() => ({}));

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch (jwtErr) {
      return NextResponse.json(
        { error: "ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง กรุณาทำรายการใหม่อีกครั้ง" },
        { status: 400 }
      );
    }

    if (payload?.type !== "PARTNER_RESET" || !payload?.partnerId) {
      return NextResponse.json(
        { error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.findFirst({
      where: {
        id: payload.partnerId,
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!partner) {
      return NextResponse.json(
        { error: "ลิงก์นี้ถูกใช้งานไปแล้วหรือหมดอายุ กรุณาขอลิงก์รีเซ็ตใหม่อีกครั้ง" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.partner.update({
      where: { id: partner.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({
      success: true,
      message: "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที"
    });
  } catch (error) {
    console.error("[PARTNER_RESET_PASSWORD_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
