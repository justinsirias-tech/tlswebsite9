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
        balance: true,
        tier: true,
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
