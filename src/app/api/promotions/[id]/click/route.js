import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing promotion id" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { button, locale } = body;

    const validButtons = ["book", "line", "whatsapp", "review"];
    if (!button || !validButtons.includes(button)) {
      return NextResponse.json({ error: "Invalid button type. Must be book, line, whatsapp, or review." }, { status: 400 });
    }

    const fieldMap = {
      book: "clicksBook",
      line: "clicksLine",
      whatsapp: "clicksWhatsapp",
      review: "clicksReview"
    };

    const targetField = fieldMap[button];

    // Atomically increment button click counter on the promotion
    const updated = await prisma.promotion.update({
      where: { id },
      data: {
        [targetField]: { increment: 1 }
      },
      select: {
        id: true,
        clicksBook: true,
        clicksLine: true,
        clicksWhatsapp: true,
        clicksReview: true
      }
    });

    // Also record event detail in PromotionClick for analytics & timestamps
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const device = isTablet ? "Tablet" : (isMobile ? "Mobile" : "Desktop");
    const rawReferrer = request.headers.get("referer") || "Direct";

    // Non-blocking log insert
    prisma.promotionClick.create({
      data: {
        promotionId: id,
        buttonType: button,
        locale: locale || "th",
        device,
        referrer: rawReferrer.slice(0, 255)
      }
    }).catch(err => {
      console.warn("Failed to create promotion click log:", err?.message || err);
    });

    return NextResponse.json({
      success: true,
      button,
      stats: updated
    }, { status: 200 });
  } catch (error) {
    console.error("Promotion click tracking error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to record click" }, { status: 500 });
  }
}
