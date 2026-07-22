import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

// Server-Side In-Memory Cache (Persists across requests within the same server container lifecycle)
let cachedPopup = null;
let lastFetchedTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // Cache database query results for 5 minutes

export async function GET() {
  try {
    const now = Date.now();

    // 1. Server-Side Cache Defense: Return cached result if within TTL
    if (cachedPopup !== null && (now - lastFetchedTime) < CACHE_TTL) {
      return NextResponse.json({ success: true, popup: cachedPopup.data }, { status: 200 });
    }

    // 2. Fetch fresh data from PostgreSQL if cache expired
    const nowDb = new Date();
    const activePopup = await prisma.popupTemplate.findFirst({
      where: {
        isActive: true,
        startDate: { lte: nowDb },
        endDate: { gte: nowDb }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Update server-side in-memory cache
    cachedPopup = { data: activePopup };
    lastFetchedTime = now;

    return NextResponse.json({ success: true, popup: activePopup }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch active popup from database:", error);

    // Fallback: If database is down or timed out, return stale cache if available to prevent page error
    if (cachedPopup !== null) {
      console.log("Serving stale popup cache due to database error...");
      return NextResponse.json({ success: true, popup: cachedPopup.data }, { status: 200 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
