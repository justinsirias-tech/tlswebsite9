import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import nodemailer from "nodemailer";
import prisma from "../../../../lib/prisma";

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
    const rawData = await request.json();
    const email = (rawData.email || "").trim().toLowerCase();
    const locale = rawData.locale || "en";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if member is registered
    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) {
      // Return success anyway to avoid user enumeration, but don't send email
      return NextResponse.json({ 
        success: true, 
        message: locale === "th" 
          ? "หากอีเมลนี้ลงทะเบียนไว้ ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปแล้ว" 
          : locale === "cn"
            ? "如果该邮箱已注册，重置密码的链接已发送。"
            : "If the email is registered, a password reset link has been sent."
      }, { status: 200 });
    }

    // Create a short-lived password reset token (1 hour)
    const token = await new SignJWT({
      email: member.email,
      action: "RESET_PASSWORD"
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(JWT_SECRET);

    const baseUrl = request.nextUrl.origin;
    const resetUrl = `${baseUrl}/${locale}/member/reset-password?token=${token}`;

    // Email content based on locale
    let subject = "Reset Your Password - That Laundry Shop";
    let htmlBody = `
      <div style="font-family: sans-serif; padding: 2rem; color: #222945; max-width: 600px; margin: 0 auto; border: 1px solid rgba(34, 41, 69, 0.1); border-radius: 12px;">
        <h2 style="color: #222945; border-bottom: 2px solid #222945; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">Password Reset Request</h2>
        <p>Hello ${member.name || "Member"},</p>
        <p>We received a request to reset the password for your That Laundry Shop account.</p>
        <p>Please click the button below to choose a new password (valid for 1 hour):</p>
        <div style="margin: 2rem 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #222945; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(34, 41, 69, 0.15);">Reset Password</a>
        </div>
        <p style="font-size: 0.85rem; color: #64748b;">If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid rgba(34, 41, 69, 0.08); margin: 2rem 0;" />
        <p style="font-size: 0.8rem; text-align: center; color: #94a3b8;">&copy; ${new Date().getFullYear()} That Laundry Shop. All rights reserved.</p>
      </div>
    `;

    if (locale === "th") {
      subject = "รีเซ็ตรหัสผ่านของคุณ - That Laundry Shop";
      htmlBody = `
        <div style="font-family: sans-serif; padding: 2rem; color: #222945; max-width: 600px; margin: 0 auto; border: 1px solid rgba(34, 41, 69, 0.1); border-radius: 12px;">
          <h2 style="color: #222945; border-bottom: 2px solid #222945; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">คำขอรีเซ็ตรหัสผ่าน</h2>
          <p>สวัสดีคุณ ${member.name || "สมาชิก"},</p>
          <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีผู้ใช้ That Laundry Shop ของคุณ</p>
          <p>กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์นี้มีอายุการใช้งาน 1 ชั่วโมง):</p>
          <div style="margin: 2rem 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #222945; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(34, 41, 69, 0.15);">รีเซ็ตรหัสผ่าน</a>
          </div>
          <p style="font-size: 0.85rem; color: #64748b;">หากคุณไม่ได้ส่งคำขอนี้ คุณสามารถเพิกเฉยต่ออีเมลนี้ได้อย่างปลอดภัย</p>
          <hr style="border: none; border-top: 1px solid rgba(34, 41, 69, 0.08); margin: 2rem 0;" />
          <p style="font-size: 0.8rem; text-align: center; color: #94a3b8;">&copy; ${new Date().getFullYear()} That Laundry Shop. สงวนลิขสิทธิ์ทั้งหมด</p>
        </div>
      `;
    } else if (locale === "cn") {
      subject = "重置您的密码 - That Laundry Shop";
      htmlBody = `
        <div style="font-family: sans-serif; padding: 2rem; color: #222945; max-width: 600px; margin: 0 auto; border: 1px solid rgba(34, 41, 69, 0.1); border-radius: 12px;">
          <h2 style="color: #222945; border-bottom: 2px solid #222945; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">重置密码请求</h2>
          <p>您好 ${member.name || "会员"},</p>
          <p>我们收到了重置您 That Laundry Shop 账户密码的请求。</p>
          <p>请点击下方按钮选择新密码（有效期为 1 小时）：</p>
          <div style="margin: 2rem 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #222945; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(34, 41, 69, 0.15);">重置密码</a>
          </div>
          <p style="font-size: 0.85rem; color: #64748b;">如果您未提交此请求，可以安全地忽略此邮件。</p>
          <hr style="border: none; border-top: 1px solid rgba(34, 41, 69, 0.08); margin: 2rem 0;" />
          <p style="font-size: 0.8rem; text-align: center; color: #94a3b8;">&copy; ${new Date().getFullYear()} That Laundry Shop. 版权所有。</p>
        </div>
      `;
    }

    // Send email using nodemailer config from .env
    const mailOptions = {
      from: process.env.SMTP_FROM || '"That Laundry Shop" <thatlaundryshopbooking@gmail.com>',
      to: member.email,
      subject: subject,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: locale === "th" 
        ? "ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปที่อีเมลของคุณแล้ว" 
        : locale === "cn"
          ? "重置链接已发送到您的邮箱。"
          : "A reset link has been sent to your email address."
    }, { status: 200 });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
