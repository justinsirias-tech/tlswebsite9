import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import prisma from "../../../../lib/prisma-webapp";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

export async function POST(request) {
  try {
    const rawData = await request.json();
    const email = (rawData.email || "").trim().toLowerCase();
    const name = (rawData.name || "").trim();
    const provider = (rawData.provider || "").trim().toLowerCase();
    const providerId = (rawData.providerId || "").trim();

    if (!email || !provider || !providerId) {
      return NextResponse.json({ error: "Missing OAuth fields" }, { status: 400 });
    }

    // Find member by email
    let member = await prisma.member.findUnique({ where: { email } });
    let isNew = false;

    if (!member) {
      // Create new member profile for social login
      member = await prisma.member.create({
        data: {
          name,
          email,
          provider,
          providerId,
          balance: 0.0,
          tier: "None",
          address: "",
          defaultLat: 13.736717,
          defaultLng: 100.523186,
          isMember: true,
          phone: ""
        }
      });
      isNew = true;
    } else {
      // Link provider if not set
      if (member.provider === "local" || !member.providerId) {
        member = await prisma.member.update({
          where: { id: member.id },
          data: {
            provider,
            providerId
          }
        });
      }
    }

    // Check if particulars confirmation is required (if dob, address, or phone is missing)
    const requireConfirmation = isNew || !member.dob || !member.address || !member.phone;

    // Generate session JWT
    const token = await new SignJWT({
      id: member.id,
      name: member.name,
      email: member.email,
      role: "MEMBER"
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set({
      name: "memberToken",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    return NextResponse.json({ 
      success: true, 
      requireConfirmation,
      member: { id: member.id, name: member.name, email: member.email }
    }, { status: 200 });

  } catch (error) {
    console.error("OAuth API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
