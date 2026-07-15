import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const activePopup = await prisma.popupTemplate.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, popup: activePopup }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch active popup:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
