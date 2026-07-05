import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

// GET: Verify reset token
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify token signature and expiry
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (payload.action !== "RESET_PASSWORD") {
      return NextResponse.json({ error: "Invalid token action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, email: payload.email }, { status: 200 });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
}

// POST: Reset password
export async function POST(request) {
  try {
    const rawData = await request.json();
    const token = rawData.token;
    const password = rawData.password;

    if (!token || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.action !== "RESET_PASSWORD") {
      return NextResponse.json({ error: "Invalid token action" }, { status: 400 });
    }

    // Check if user exists
    const member = await prisma.member.findUnique({ where: { email: payload.email } });
    if (!member) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update in database
    await prisma.member.update({
      where: { id: member.id },
      data: { passwordHash }
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
}
