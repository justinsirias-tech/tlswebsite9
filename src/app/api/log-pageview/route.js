import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const data = await request.json();
    const path = data.path || "/";
    
    // Ignore admin dashboard routes from customer traffic statistics
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ success: true, ignored: true }, { status: 200 });
    }

    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const device = isTablet ? "Tablet" : (isMobile ? "Mobile" : "Desktop");

    let referrer = "Direct";
    if (data.referrer) {
      const ref = data.referrer.toLowerCase();
      if (ref.includes("google")) referrer = "Google";
      else if (ref.includes("line")) referrer = "LINE";
      else if (ref.includes("whatsapp")) referrer = "WhatsApp";
      else referrer = "Social / Referral";
    }

    await prisma.pageView.create({
      data: {
        path,
        locale: data.locale || "en",
        referrer,
        device,
        country: "Thailand",
        city: "Bangkok"
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Pageview log error:", error);
    return NextResponse.json({ error: "Failed to log pageview" }, { status: 500 });
  }
}
