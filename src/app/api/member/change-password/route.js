import { NextResponse } from "next/server";
import { getMemberFromSession } from "../../../../lib/memberAuth";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma-webapp";

export async function POST(request) {
  try {
    const session = await getMemberFromSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update in database and clear forcePasswordReset flag
    await prisma.member.update({
      where: { id: session.id },
      data: {
        passwordHash,
        forcePasswordReset: false
      }
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
