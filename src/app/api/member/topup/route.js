import { NextResponse } from "next/server";
import { getMemberFromSession } from "../../../../lib/memberAuth";
import prisma from "../../../../lib/prisma-webapp";

export async function POST(request) {
  try {
    const session = await getMemberFromSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawData = await request.json();
    const amount = parseFloat(rawData.amount);
    const cardNumber = (rawData.cardNumber || "").trim();
    const cardExpiry = (rawData.cardExpiry || "").trim();
    const cardCvv = (rawData.cardCvv || "").trim();

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid top-up amount" }, { status: 400 });
    }

    if (!cardNumber || !cardExpiry || !cardCvv) {
      return NextResponse.json({ error: "Card details are required for payment verification" }, { status: 400 });
    }

    // Process topup transaction inside database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find and update member balance
      const member = await tx.member.update({
        where: { id: session.id },
        data: {
          balance: { increment: amount }
        }
      });

      // Log transaction
      const transaction = await tx.transaction.create({
        data: {
          memberId: session.id,
          amount: amount,
          type: "TOPUP",
          description: `Credit Top Up (Card ending in ${cardNumber.slice(-4)})`,
          status: "COMPLETED"
        }
      });

      return { balance: member.balance, transaction };
    });

    return NextResponse.json({ success: true, balance: result.balance }, { status: 200 });
  } catch (error) {
    console.error("Top-up transaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
