import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

export async function POST(request) {
  try {
    const rawData = await request.json();
    const name = (rawData.name || "").trim();
    const email = (rawData.email || "").trim().toLowerCase();
    const password = rawData.password || "";
    const phone = (rawData.phone || "").trim();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create member (mapped to Customer table)
    const member = await prisma.member.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        balance: 0.0,
        tier: "None",
        defaultAddress: "",
        defaultLat: 13.736717,
        defaultLng: 100.523186,
        isMember: true
      }
    });

    return NextResponse.json({ success: true, memberId: member.id }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
