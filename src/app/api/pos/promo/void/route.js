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
    const { code, receiptNo, reason } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return posJsonResponse(
        { success: false, error: "Promo code is required." },
        400
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const now = new Date();

    // 3. Floor Protected Decrement in Transaction
    const result = await prisma.$transaction(async (tx) => {
      const promo = await tx.promoCode.findUnique({
        where: { code: cleanCode }
      });

      if (!promo) {
        throw new Error("PROMO_NOT_FOUND");
      }

      // Ensure usedCount does not drop below 0
      if (promo.usedCount > 0) {
        return await tx.promoCode.update({
          where: { id: promo.id },
          data: {
            usedCount: { decrement: 1 }
          }
        });
      }

      return promo;
    });

    // 4. Audit Log (Logged to Cloud Run console for reconciliation)
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "direct";
    console.log(
      `[POS_VOID] code=${cleanCode} receipt=${receiptNo || "N/A"} reason=${reason || "N/A"} updatedUsedCount=${result.usedCount} ip=${clientIp} ts=${now.toISOString()}`
    );

    return posJsonResponse(
      {
        success: true,
        code: result.code,
        receiptNo: receiptNo || null,
        usedCount: result.usedCount,
        usageLimit: result.usageLimit,
        message: "Promo code redemption voided successfully."
      },
      200
    );
  } catch (error) {
    if (error.message === "PROMO_NOT_FOUND") {
      return posJsonResponse({ success: false, error: "Promo code not found." }, 404);
    }

    console.error("[POS_PROMO_VOID_ERROR]", error);
    return posJsonResponse(
      { success: false, error: "Internal Server Error" },
      500
    );
  }
}
