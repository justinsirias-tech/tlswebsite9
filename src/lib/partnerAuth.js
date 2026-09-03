import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import prisma from "./prisma.js";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function createPartnerToken(partner) {
  return await new SignJWT({
    id: partner.id,
    email: partner.email,
    companyName: partner.companyName,
    type: "PARTNER"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyPartnerToken(token) {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload && payload.type === "PARTNER" && payload.id) {
      return payload;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Validates request cookie, verifies JWT and checks if partner exists & isActive.
 * Returns partner object if valid, null otherwise.
 */
export async function getPartnerSession(request) {
  try {
    const token = request.cookies.get("partnerToken")?.value;
    if (!token) return null;

    const payload = await verifyPartnerToken(token);
    if (!payload) return null;

    const partner = await prisma.partner.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
        note: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!partner || !partner.isActive) {
      return null;
    }

    return partner;
  } catch (error) {
    console.error("[getPartnerSession error]", error);
    return null;
  }
}
