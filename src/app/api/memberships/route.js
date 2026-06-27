import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import nodemailer from "nodemailer";

async function sendAdminNotification(request) {
  const { name, email, phone, tier, term, notes, dob, address, roomNo } = request;

  try {
    let transporter;
    const hasSmtpConfig = process.env.SMTP_HOST && 
                          process.env.SMTP_USER && 
                          process.env.SMTP_PASS && 
                          process.env.SMTP_PASS !== "YOUR_GOOGLE_APP_PASSWORD";

    if (hasSmtpConfig) {
      const port = parseInt(process.env.SMTP_PORT || "587", 10);
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.log("No SMTP environment credentials found. Falling back to test SMTP (ethereal.email)...");
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #edf2f7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 25px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
            New Membership Application
          </h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.8;">
            That Laundry Shop Premium Club
          </p>
        </div>
        <div style="padding: 25px; background: #ffffff;">
          <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 20px;">
            A customer has submitted a new membership subscription request. Please follow up with them as soon as possible.
          </p>
          <table width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569; width: 40%;">Preferred Tier:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: bold; text-transform: uppercase;">${tier}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Subscription Term:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${term}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Customer Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Phone Number:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Email Address:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Date of Birth:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${dob || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Building Address:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${address || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Room Number:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${roomNo || 'Not provided'}</td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #475569; vertical-align: top;">Notes:</td>
              <td style="padding: 10px; color: #1e293b; font-style: italic;">"${notes}"</td>
            </tr>
            ` : ''}
          </table>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 11px; color: #64748b;">
          © 2026 That Laundry Shop. Admin notification copy.
        </div>
      </div>
    `;

    const fromAddress = process.env.SMTP_FROM || '"That Laundry Shop" <no-reply@thatlaundryshop.com>';
    const adminMailOptions = {
      from: fromAddress,
      to: "sales@thatlaundryshop.com",
      cc: [
        "thatlaundryshopbooking@gmail.com",
        "thatlaundryshopcso@gmail.com"
      ],
      subject: `[Membership Subscription] ${name} - ${tier.toUpperCase()} Package`,
      html: emailHtml,
    };

    let info = await transporter.sendMail(adminMailOptions);
    console.log("Admin membership email notification sent! Message ID:", info.messageId);

    if (!hasSmtpConfig) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Test membership email successfully sent! Preview it here:", previewUrl);
    }
  } catch (error) {
    console.error("Membership email notification failed:", error);
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    if (!data.name || !data.email || !data.phone || !data.tier || !data.term) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const membershipRequest = await prisma.membershipRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        tier: data.tier,
        term: data.term,
        notes: data.notes || "",
        dob: data.dob || "",
        address: data.address || "",
        roomNo: data.roomNo || "",
      }
    });

    // Send email notification in background
    sendAdminNotification(membershipRequest).catch(err => {
      console.error("Failed to send background membership email:", err);
    });

    return NextResponse.json({
      success: true,
      request: membershipRequest
    });
  } catch (error) {
    console.error("Membership request creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit membership request" },
      { status: 500 }
    );
  }
}
