import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

export async function POST(request) {
  try {
    const rawData = await request.json();
    const email = (rawData.email || "").trim().toLowerCase();
    const password = rawData.password || "";

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find member
    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, member.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT
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
      forcePasswordReset: member.forcePasswordReset || false,
      member: { id: member.id, name: member.name, email: member.email } 
    }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
