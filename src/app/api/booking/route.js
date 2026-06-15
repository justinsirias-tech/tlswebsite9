import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";

async function translateToEnglish(text) {
  if (!text) return "";
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Skipping booking translation.");
      return text;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a helper for a premium laundry service in Thailand called "That Laundry Shop".
Your job is to translate booking details (which may contain Thai or Chinese service names, transport logistics, and customer notes) into clean, professional English so our staff can read it.

Here is the raw booking text:
"""
${text}
"""

Instructions:
1. Translate all non-English text (such as Thai or Chinese) into English.
2. Keep the original structure of the booking details (e.g. Services, Address, Delivery, Pickup Method, Time, Notes).
3. If the text is already entirely in English, return it exactly as it is without any changes.
4. Output ONLY the translated text. Do not include markdown code block backticks (like \`\`\`), "Here is the translation:", or any extra commentary.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const result = response.text?.trim();
    if (result) {
      return result;
    }
  } catch (error) {
    console.error("Booking translation failed:", error);
  }
  return text;
}


async function sendConfirmationEmail(booking) {
  try {
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3A7BD5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">That Laundry Shop</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0;">Booking Received!</h2>
          <p style="color: #555; line-height: 1.6;">
            Hi ${booking.customerName},<br><br>
            Thank you for choosing That Laundry Shop! We have successfully received your service request.
          </p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #3A7BD5; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Booking Details</h3>
            <p><strong>Pickup Date:</strong> ${new Date(booking.pickupDate).toLocaleString()}</p>
            <p><strong>Contact:</strong> ${booking.phone}</p>
            <p><strong>Service Details:</strong></p>
            <pre style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; white-space: pre-wrap; font-family: inherit;">${booking.service}</pre>
          </div>

          <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3A7BD5;">
            <h4 style="margin-top: 0; color: #1e40af;">📢 Verification Policy</h4>
            <ul style="margin-bottom: 0; color: #1e3a8a; padding-left: 20px; line-height: 1.5;">
              <li>Your order is not fully confirmed yet.</li>
              <li>Our concierge team will review your order and contact you shortly.</li>
            </ul>
          </div>
          
          <p style="color: #777; margin-top: 30px; font-size: 0.9em; border-top: 1px solid #eaeaea; padding-top: 20px;">
            If you have any urgent questions, please contact our hotline at +66 94 691 6668.
          </p>
        </div>
      </div>
    `;

    let info = await transporter.sendMail({
      from: '"That Laundry Shop" <no-reply@thatlaundryshop.com>',
      to: booking.email,
      subject: "Your Laundry Booking Request Received",
      html: emailHtml,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Email successfully sent! Preview it here:", previewUrl);
    return previewUrl;
  } catch (error) {
    console.error("Email sending failed:", error);
    return null;
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    if (!data.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Translate the service details to English if needed
    const translatedService = await translateToEnglish(data.service);

    const booking = await prisma.booking.create({
      data: {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        pickupDate: new Date(data.pickupDate),
        service: translatedService,
      }
    });

    // Send the confirmation email
    const emailPreviewUrl = await sendConfirmationEmail(booking);

    return NextResponse.json({ 
      success: true, 
      booking,
      emailPreviewUrl
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
