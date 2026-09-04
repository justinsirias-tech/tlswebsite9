import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import nodemailer from "nodemailer";
import prisma from "../../../../lib/prisma";

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const { email } = await request.json().catch(() => ({}));
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const partner = await prisma.partner.findUnique({
      where: { email: cleanEmail }
    });

    // To prevent account enumeration, return success even if email is not found
    if (!partner || !partner.isActive) {
      return NextResponse.json({
        success: true,
        message: "If this email exists in our system, a password reset link has been sent to your email."
      }, { status: 200 });
    }

    const resetToken = await new SignJWT({
      partnerId: partner.id,
      email: partner.email,
      type: "PARTNER_RESET"
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(JWT_SECRET);

    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.partner.update({
      where: { id: partner.id },
      data: {
        resetToken,
        resetTokenExpiry: expiry
      }
    });

    const baseUrl = request.nextUrl.origin;
    const resetUrl = `${baseUrl}/partner/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"That Laundry Shop Partner" <thatlaundryshopbooking@gmail.com>',
      to: partner.email,
      subject: "Reset your Partner Portal Password - That Laundry Shop",
      html: `
        <div style="font-family: sans-serif; padding: 2rem; color: #222945; max-width: 600px; margin: 0 auto; border: 1px solid rgba(34, 41, 69, 0.1); border-radius: 12px; background: #ffffff;">
          <h2 style="color: #222945; border-bottom: 2px solid #222945; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">Partner Portal Password Reset Request</h2>
          <p>Dear ${partner.contactName} (${partner.companyName}),</p>
          <p>We received a request to reset your password for the That Laundry Shop Partner Portal.</p>
          <p>Please click the button below to set a new password (this link expires in 1 hour):</p>
          <div style="margin: 2rem 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #222945; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(34, 41, 69, 0.15);">
              Reset Password
            </a>
          </div>
          <p style="font-size: 0.85rem; color: #64748b;">If you did not request this, you can safely ignore this email. Your account remains secure.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
          <p style="font-size: 0.8rem; text-align: center; color: #94a3b8;">&copy; ${new Date().getFullYear()} That Laundry Shop. All rights reserved.</p>
        </div>
      `
    };

    // Send email, catch gracefully if SMTP credentials are missing in local dev
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
      } else {
        console.log("[DEV EMAIL LOG] Reset URL for", partner.email, ":", resetUrl);
      }
    } catch (mailErr) {
      console.warn("[SMTP sendMail warning]", mailErr.message);
      console.log("[DEV EMAIL FALLBACK] Reset URL:", resetUrl);
    }

    return NextResponse.json({
      success: true,
      message: "A password reset link has been sent to your email. Please check your inbox.",
      // Include resetUrl in dev mode if needed
      devResetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined
    }, { status: 200 });
  } catch (error) {
    console.error("[PARTNER_FORGOT_PASSWORD_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
