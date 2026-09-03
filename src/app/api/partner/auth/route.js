import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { comparePassword, createPartnerToken, getPartnerSession } from "../../../../lib/partnerAuth";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const partner = await getPartnerSession(request);
    if (!partner) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, partner }, { status: 200 });
  } catch (error) {
    console.error("[PARTNER_AUTH_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const partner = await prisma.partner.findUnique({
      where: { email: cleanEmail }
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!partner.isActive) {
      return NextResponse.json(
        { error: "This partner account has been disabled. Please contact the administrator." },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, partner.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createPartnerToken(partner);

    const response = NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
        phone: partner.phone
      }
    });

    response.cookies.set("partnerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error("[PARTNER_LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("partnerToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
