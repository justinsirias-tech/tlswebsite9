import prisma from "../../../../../lib/prisma";
import { verifyPosKey, posJsonResponse, handleCorsPreflight } from "../../../../../lib/posAuth";

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function POST(request) {
  try {
    // 1. Verify POS Authentication
    if (!verifyPosKey(request)) {
      return posJsonResponse(
        { success: false, error: "Unauthorized: Invalid or missing POS API Key." },
        401
      );
    }

    // 2. Parse & Validate Request Body
    const body = await request.json().catch(() => ({}));
    const { code, receiptNo, orderTotal, discountAmount } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return posJsonResponse(
        { success: false, error: "Promo code is required." },
        400
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const now = new Date();

    // 3. Execute Atomic Transaction with Row Locking
    const result = await prisma.$transaction(async (tx) => {
      // Lock the specific promo code row to prevent race conditions during concurrent checkouts
      const promos = await tx.$queryRaw`
        SELECT id, code, "isActive", "startDate", "endDate", "usageLimit", "usedCount"
        FROM "PromoCode"
        WHERE code = ${cleanCode}
        FOR UPDATE
      `;

      if (!promos || promos.length === 0) {
        throw new Error("PROMO_NOT_FOUND");
      }

      const promo = promos[0];

      if (!promo.isActive) {
        throw new Error("PROMO_DISABLED");
      }

      if (promo.startDate && new Date(promo.startDate) > now) {
        throw new Error("PROMO_UPCOMING");
      }

      if (promo.endDate && new Date(promo.endDate) < now) {
        throw new Error("PROMO_EXPIRED");
      }

      if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
        throw new Error("PROMO_LIMIT_REACHED");
      }

      const updated = await tx.promoCode.update({
        where: { id: promo.id },
        data: {
          usedCount: { increment: 1 }
        }
      });

      return updated;
    });

    // 4. Audit Log (Logged to Cloud Run console for reconciliation)
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "direct";
    console.log(
      `[POS_REDEEM] code=${cleanCode} receipt=${receiptNo || "N/A"} orderTotal=${orderTotal ?? "N/A"} discount=${discountAmount ?? "N/A"} newUsedCount=${result.usedCount} ip=${clientIp} ts=${now.toISOString()}`
    );

    const remainingUses = result.usageLimit !== null ? Math.max(0, result.usageLimit - result.usedCount) : null;

    return posJsonResponse(
      {
        success: true,
        code: result.code,
        receiptNo: receiptNo || null,
        usedCount: result.usedCount,
        usageLimit: result.usageLimit,
        remainingUses,
        message: "Promo code redeemed successfully."
      },
      200
    );
  } catch (error) {
    if (error.message === "PROMO_NOT_FOUND") {
      return posJsonResponse({ success: false, error: "Promo code not found." }, 404);
    }
    if (error.message === "PROMO_DISABLED") {
      return posJsonResponse({ success: false, error: "This promo code is currently disabled." }, 400);
    }
    if (error.message === "PROMO_UPCOMING") {
      return posJsonResponse({ success: false, error: "This promo code is not active yet." }, 400);
    }
    if (error.message === "PROMO_EXPIRED") {
      return posJsonResponse({ success: false, error: "This promo code has expired." }, 400);
    }
    if (error.message === "PROMO_LIMIT_REACHED") {
      return posJsonResponse({ success: false, error: "This promo code has reached its maximum redemption limit." }, 400);
    }

    console.error("[POS_PROMO_REDEEM_ERROR]", error);
    return posJsonResponse(
      { success: false, error: "Internal Server Error" },
      500
    );
  }
}
