import { NextResponse } from "next/server";
import { getMemberFromSession } from "../../../../lib/memberAuth";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const session = await getMemberFromSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        address: true,
        roomNo: true,
        provider: true,
        providerId: true,
        balance: true,
        tier: true,
        forcePasswordReset: true,
        createdAt: true,
        bookings: {
          orderBy: { createdAt: "desc" }
        },
        transactions: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, member }, { status: 200 });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getMemberFromSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawData = await request.json();
    const name = (rawData.name || "").trim();
    const email = (rawData.email || "").trim().toLowerCase();
    const phone = (rawData.phone || "").trim();
    const dob = (rawData.dob || "").trim();
    const address = (rawData.address || "").trim();
    const roomNo = (rawData.roomNo || "").trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existing = await prisma.member.findFirst({
      where: {
        email,
        NOT: { id: session.id }
      }
    });
    if (existing) {
      return NextResponse.json({ error: "Email is already in use by another account" }, { status: 400 });
    }

    // Update details
    const updatedMember = await prisma.member.update({
      where: { id: session.id },
      data: {
        name: name || undefined,
        email,
        phone,
        dob,
        address,
        roomNo
      }
    });

    return NextResponse.json({ success: true, member: updatedMember }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
