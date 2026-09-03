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
        { valid: false, error: "Unauthorized: Invalid or missing POS API Key." },
        401
      );
    }

    // 2. Parse & Validate Request Body
    const body = await request.json().catch(() => ({}));
    const { code, orderTotal } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return posJsonResponse(
        { valid: false, error: "Promo code is required." },
        400
      );
    }

    const total = orderTotal !== undefined && orderTotal !== null ? parseFloat(orderTotal) : null;
    if (total !== null && (isNaN(total) || total < 0)) {
      return posJsonResponse(
        { valid: false, error: "orderTotal must be a non-negative number." },
        400
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // 3. Find Promo Code
    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode }
    });

    if (!promo) {
      return posJsonResponse(
        { valid: false, error: "Promo code not found." },
        404
      );
    }

    // 4. Check Active Status
    if (!promo.isActive) {
      return posJsonResponse(
        { valid: false, error: "This promo code is currently disabled." },
        400
      );
    }

    const now = new Date();

    // 5. Check Start Date (Auto-activate)
    if (promo.startDate && new Date(promo.startDate) > now) {
      const startStr = new Date(promo.startDate).toLocaleDateString("en-US", { dateStyle: "medium" });
      return posJsonResponse(
        { 
          valid: false, 
          error: `This promo code will become active on ${startStr}.`,
          startDate: promo.startDate
        },
        400
      );
    }

    // 6. Check End Date (Auto-deactivate)
    if (promo.endDate && new Date(promo.endDate) < now) {
      const endStr = new Date(promo.endDate).toLocaleDateString("en-US", { dateStyle: "medium" });
      return posJsonResponse(
        { 
          valid: false, 
          error: `This promo code expired on ${endStr}.`,
          endDate: promo.endDate
        },
        400
      );
    }

    // 7. Check Usage Limit
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return posJsonResponse(
        { 
          valid: false, 
          error: "This promo code has reached its maximum redemption limit." 
        },
        400
      );
    }

    // 8. Check Minimum Order Value
    const minOrder = promo.minOrderValue || 0;
    if (total !== null && minOrder > 0 && total < minOrder) {
      return posJsonResponse(
        { 
          valid: false, 
          error: `Order total (${total} THB) is below the minimum required order value of ${minOrder} THB.`,
          minOrderValue: minOrder,
          orderTotal: total
        },
        400
      );
    }

    // 9. Calculate Discount Amount
    let discountAmount = 0;
    const currentOrderTotal = total !== null ? total : 0;

    if (promo.discountType === "PERCENTAGE") {
      discountAmount = (currentOrderTotal * promo.discountValue) / 100;
      if (promo.maxDiscount !== null && promo.maxDiscount !== undefined && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      // FIXED discount
      discountAmount = Math.min(promo.discountValue, currentOrderTotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const netPayable = Math.max(0, Math.round((currentOrderTotal - discountAmount) * 100) / 100);

    return posJsonResponse(
      {
        valid: true,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        maxDiscount: promo.maxDiscount,
        minOrderValue: minOrder,
        orderTotal: currentOrderTotal,
        discountAmount,
        netPayable,
        description: promo.description,
        message: "Promo code is valid and applied."
      },
      200
    );
  } catch (error) {
    console.error("[POS_PROMO_CHECK_ERROR]", error);
    return posJsonResponse(
      { valid: false, error: "Internal Server Error" },
      500
    );
  }
}
