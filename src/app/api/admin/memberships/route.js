import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

// Helper to verify admin token
async function verifyAdmin(request) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload && (payload.role === "SUPERADMIN" || payload.role === "EDITOR");
  } catch (error) {
    return false;
  }
}

export async function PUT(request) {
  try {
    // Check authorization
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      email,
      phone,
      tier,
      term,
      dob,
      address,
      roomNo,
      notes,
      status,
      startDate,
      endDate,
      attachments
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    // Update the Membership Request
    const updatedRequest = await prisma.membershipRequest.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        tier,
        term,
        dob,
        address,
        roomNo,
        notes,
        status,
        startDate,
        endDate,
        attachments: attachments || []
      }
    });

    // If status is APPROVED, update/create corresponding Member profile
    if (status === "APPROVED") {
      const normalizedTier = tier.replace(/ package/i, "");
      const formattedTier = normalizedTier.charAt(0).toUpperCase() + normalizedTier.slice(1);

      const member = await prisma.member.findUnique({ where: { email } });
      if (member) {
        await prisma.member.update({
          where: { id: member.id },
          data: {
            name,
            phone,
            dob,
            address,
            roomNo,
            tier: formattedTier,
            startDate,
            endDate,
            attachments: attachments || []
          }
        });
      } else {
        await prisma.member.create({
          data: {
            name,
            email,
            phone,
            dob,
            address,
            roomNo,
            tier: formattedTier,
            provider: "local",
            balance: 0.0,
            startDate,
            endDate,
            attachments: attachments || []
          }
        });
      }
    }

    return NextResponse.json({ success: true, request: updatedRequest }, { status: 200 });
  } catch (error) {
    console.error("Error updating membership application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
