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


function parseServiceDetails(serviceStr) {
  const details = {
    services: "",
    address: "",
    delivery: "",
    pickupMethod: "",
    time: "",
    notes: "",
    roomNo: "",
    deliveryRoomNo: ""
  };
  
  if (!serviceStr) return details;

  const lines = serviceStr.split("\n");
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("Services:")) {
      details.services = trimmed.replace("Services:", "").trim();
    } else if (trimmed.startsWith("Address:")) {
      const addrValue = trimmed.replace("Address:", "").trim();
      const roomMatch = addrValue.match(/Room\s+([^,]+)/i);
      if (roomMatch) {
        details.roomNo = roomMatch[1].trim();
        details.address = addrValue.replace(/,?\s*Room\s+[^,]+,?/i, "").trim();
      } else {
        details.address = addrValue;
      }
    } else if (trimmed.startsWith("Delivery:")) {
      const delValue = trimmed.replace("Delivery:", "").trim();
      const roomMatch = delValue.match(/Room\s+([^,]+)/i);
      if (roomMatch) {
        details.deliveryRoomNo = roomMatch[1].trim();
        details.delivery = delValue.replace(/,?\s*Room\s+[^,]+,/i, "").trim();
      } else {
        details.delivery = delValue;
      }
    } else if (trimmed.startsWith("Pickup Method:")) {
      details.pickupMethod = trimmed.replace("Pickup Method:", "").trim();
    } else if (trimmed.startsWith("Time:")) {
      details.time = trimmed.replace("Time:", "").trim();
    } else if (trimmed.startsWith("Notes:")) {
      details.notes = trimmed.replace("Notes:", "").trim();
    }
  });

  if (!details.services && serviceStr) {
    if (serviceStr.includes("Services:")) {
      details.services = "None selected";
    } else {
      details.services = serviceStr;
    }
  }

  return details;
}

function parseServiceList(servicesStr) {
  if (!servicesStr) return [];
  if (servicesStr.includes(";")) {
    return servicesStr.split(";").map(s => s.trim()).filter(Boolean);
  }
  
  const optionMappings = [
    {
      canonical: "Wash & Fold (Weight)",
      patterns: ["wash & fold", "wash and fold", "wash & fold (weight)", "wash/fold"]
    },
    {
      canonical: "Wash, Iron & Fold (Weight)",
      patterns: ["wash, iron & fold", "wash, iron and fold", "wash/iron/fold", "wash, iron & fold (weight)", "wash/iron/fold (weight)"]
    },
    {
      canonical: "Wash, Iron & Hang (Weight)",
      patterns: ["wash, iron & hang", "wash, iron and hang", "wash/iron/hang", "wash, iron & hang (weight)", "wash/iron/hang (weight)"]
    },
    {
      canonical: "Dry cleaning",
      patterns: ["dry cleaning", "dry clean", "dry-cleaning"]
    },
    {
      canonical: "Linens & Beddings",
      patterns: ["linens & beddings", "linens and beddings", "linens/beddings", "linens", "beddings", "bedding"]
    },
    {
      canonical: "Mixed Service",
      patterns: ["mixed service", "mixed"]
    },
    {
      canonical: "Ironing & Pressing only",
      patterns: ["ironing & pressing only", "ironing & pressing", "ironing and pressing", "ironing only", "pressing only"]
    },
    {
      canonical: "Others",
      patterns: ["others", "other"]
    }
  ];

  const found = new Set();
  const lowerStr = servicesStr.toLowerCase();
  
  // Normalize whitespace around slashes and ampersands
  const cleanStr = lowerStr.replace(/\s*\/\s*/g, "/").replace(/\s*&\s*/g, "&");

  optionMappings.forEach(mapping => {
    for (const pattern of mapping.patterns) {
      const cleanPattern = pattern.toLowerCase().replace(/\s*\/\s*/g, "/").replace(/\s*&\s*/g, "&");
      if (cleanStr.includes(cleanPattern)) {
        found.add(mapping.canonical);
        break;
      }
    }
  });

  if (found.size > 0) {
    return Array.from(found);
  }

  return servicesStr.split(",").map(s => s.trim()).filter(Boolean);
}

async function sendConfirmationEmail(booking) {
  try {
    let transporter;
    
    // Check if custom SMTP environment variables are defined and customized
    const hasSmtpConfig = process.env.SMTP_HOST && 
                          process.env.SMTP_USER && 
                          process.env.SMTP_PASS && 
                          process.env.SMTP_PASS !== "YOUR_GOOGLE_APP_PASSWORD";

    if (hasSmtpConfig) {
      const port = parseInt(process.env.SMTP_PORT || "587", 10);
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465, // true for port 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log(`Using custom SMTP server: ${process.env.SMTP_HOST}:${port}`);
    } else {
      // Fallback: Generate test SMTP service account from ethereal.email
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

    const details = parseServiceDetails(booking.service);
    const serviceList = parseServiceList(details.services);

    const serviceBadgesHtml = serviceList.length > 0
      ? serviceList.map(service => `
          <span style="display: inline-block; background-color: #f8fafc; border: 1px solid #cbd5e1; color: #1e293b; padding: 5px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-right: 6px; margin-bottom: 8px;">
            ✓ ${service}
          </span>
        `).join('')
      : '<span style="color: #64748b; font-size: 14px;">No specified services.</span>';

    const pickupDateObj = new Date(booking.pickupDate);
    const formattedDateString = pickupDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden; border: 1px solid #eaeaea;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #222945 0%, #3a4b7c 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">
              That Laundry Shop
            </h1>
            <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;">
              Premium Laundry & Dry Cleaning
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 35px 25px;">
            <h2 style="color: #222945; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px;">
              Booking Request Received!
            </h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
              Hi <strong>${booking.customerName}</strong>,<br><br>
              Thank you for choosing That Laundry Shop! We have successfully received your request. Our team will review the details and contact you shortly to confirm the scheduled pickup.
            </p>
            
            <!-- Date / Method Grid -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td width="50%" valign="top" style="padding-right: 8px;">
                  <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #edf2f7; min-height: 75px;">
                    <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      Scheduled Pickup
                    </div>
                    <div style="font-size: 13px; color: #1e293b; font-weight: 600;">
                      ${formattedDateString}
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 3px;">
                      Time: <strong>${details.time || 'Not specified'}</strong>
                    </div>
                  </div>
                </td>
                <td width="50%" valign="top" style="padding-left: 8px;">
                  <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #edf2f7; min-height: 75px;">
                    <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      Pickup Method
                    </div>
                    <div style="font-size: 13px; color: #1e293b; font-weight: 600; line-height: 1.3;">
                      ${details.pickupMethod || 'Not specified'}
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 3px;">
                      Contact: <strong>${booking.phone.split(" |")[0]}</strong>
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Services Requested -->
            <div style="margin-bottom: 25px;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                Services Requested
              </div>
              <div style="margin-top: 5px;">
                ${serviceBadgesHtml}
              </div>
            </div>

            <!-- Addresses Grid -->
            <div style="margin-bottom: 25px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 15px; padding-bottom: 15px;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      Pickup Address
                    </div>
                    <div style="font-size: 13px; color: #1e293b; line-height: 1.4;">
                      ${details.address || 'No address provided'}
                    </div>
                    ${details.roomNo ? `
                    <div style="display: inline-block; background: #fffbeb; border: 1px solid #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-top: 6px; text-transform: uppercase;">
                      Room ${details.roomNo}
                    </div>` : ''}
                  </td>
                  <td width="50%" valign="top" style="padding-left: 15px; padding-bottom: 15px; border-left: 1px solid #f1f5f9;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      Delivery Address
                    </div>
                    <div style="font-size: 13px; color: #1e293b; line-height: 1.4;">
                      ${details.delivery || 'Same as pickup'}
                    </div>
                    ${details.deliveryRoomNo ? `
                    <div style="display: inline-block; background: #fffbeb; border: 1px solid #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-top: 6px; text-transform: uppercase;">
                      Room ${details.deliveryRoomNo}
                    </div>` : ''}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Notes -->
            ${details.notes ? `
            <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px 15px; border-radius: 8px; margin-bottom: 25px;">
              <div style="font-size: 10px; color: #b45309; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                Special Instructions
              </div>
              <div style="font-size: 13px; color: #78350f; font-style: italic; line-height: 1.4;">
                "${details.notes}"
              </div>
            </div>` : ''}

            <!-- Verification Policy Card -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px;">
              <div style="font-weight: 700; color: #1e40af; font-size: 14px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                💡 Order Verification Policy
              </div>
              <ul style="margin: 0; padding-left: 18px; color: #1e3a8a; font-size: 13px; line-height: 1.5;">
                <li>Your order is currently pending review.</li>
                <li>Our concierge team will contact you shortly to confirm the request and details.</li>
              </ul>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 8px 0;">
              Need urgent help? Hotline: <a href="tel:+66946916668" style="color: #222945; font-weight: 700; text-decoration: none;">+66 94 691 6668</a>
            </p>
            <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
              © 2026 That Laundry Shop. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `;

    const fromAddress = process.env.SMTP_FROM || '"That Laundry Shop" <no-reply@thatlaundryshop.com>';
    
    // 1. Send confirmation email to the customer
    const customerMailOptions = {
      from: fromAddress,
      to: booking.email,
      subject: "Your Laundry Booking Request Received - That Laundry Shop",
      html: emailHtml,
    };
    
    let info = await transporter.sendMail(customerMailOptions);
    console.log("Customer email sent! Message ID:", info.messageId);

    // 2. Send notification email to the admin team (sales@thatlaundryshop.com) and CC other booking/CSO addresses
    try {
      const adminMailOptions = {
        from: fromAddress,
        to: "sales@thatlaundryshop.com",
        cc: [
          "thatlaundryshopbooking@gmail.com",
          "thatlaundryshopcso@gmail.com"
        ],
        subject: `[New Booking] ${booking.customerName} - That Laundry Shop`,
        html: emailHtml,
      };
      
      let adminInfo = await transporter.sendMail(adminMailOptions);
      console.log("Admin notification email sent! Message ID:", adminInfo.messageId);
    } catch (adminEmailError) {
      console.error("Failed to send admin notification email:", adminEmailError);
    }

    if (hasSmtpConfig) {
      return null;
    } else {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Test Email successfully sent! Preview it here:", previewUrl);
      return previewUrl;
    }
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

    // Send the confirmation email in the background so it doesn't block the response
    sendConfirmationEmail(booking).catch(err => {
      console.error("Failed to send background email:", err);
    });

    return NextResponse.json({ 
      success: true, 
      booking
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
