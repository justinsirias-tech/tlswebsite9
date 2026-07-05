import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

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
      dob,
      address,
      roomNo,
      startDate,
      endDate,
      balance,
      attachments,
      password
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const dataToUpdate = {
      name,
      email,
      phone,
      tier,
      dob,
      address,
      roomNo,
      startDate,
      endDate,
      balance: parseFloat(balance || 0.0),
      attachments: attachments || []
    };

    if (password) {
      const bcrypt = require("bcryptjs");
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
      dataToUpdate.forcePasswordReset = true;
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true, member: updatedMember }, { status: 200 });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
