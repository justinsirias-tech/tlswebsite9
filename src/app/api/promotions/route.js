import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ success: true, promotions }, { status: 200 });
  } catch (error) {
    console.error("Public promotions GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
