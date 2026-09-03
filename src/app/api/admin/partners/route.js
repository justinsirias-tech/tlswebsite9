import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/partnerAuth";

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

    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
        note: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            codes: true,
            sales: true
          }
        },
        sales: {
          select: {
            saleAmount: true
          }
        }
      }
    });

    const partnersWithTotal = partners.map(p => {
      const totalRevenue = p.sales.reduce((acc, s) => acc + (s.saleAmount || 0), 0);
      const { sales, ...rest } = p;
      return {
        ...rest,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      };
    });

    return NextResponse.json({ success: true, partners: partnersWithTotal });
  } catch (error) {
    console.error("[ADMIN_PARTNERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json().catch(() => ({}));
    const { companyName, contactName, email, password, phone, note, isActive } = data;

    if (!companyName || !contactName || !email || !password) {
      return NextResponse.json(
        { error: "กรุณาระบุข้อมูลจำเป็นให้ครบถ้วน: ชื่อบริษัท/ร้าน, ชื่อผู้ติดต่อ, อีเมล, รหัสผ่าน" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await prisma.partner.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      return NextResponse.json(
        { error: `อีเมล '${cleanEmail}' มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น` },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const partner = await prisma.partner.create({
      data: {
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        note: note ? note.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
        note: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, partner }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_PARTNERS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
