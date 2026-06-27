import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

const verifySuperAdmin = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "SUPERADMIN") return null;
    return payload;
  } catch (err) {
    return null;
  }
};

const verifyAdmin = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
};

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.adminUser.findMany({
    select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true }
  });
  return NextResponse.json(users);
}

export async function POST(request) {
  if (!(await verifySuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const existingUser = await prisma.adminUser.findUnique({ where: { email: data.email } });
    if (existingUser) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.adminUser.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role || "EDITOR",
        permissions: data.permissions || []
      },
      select: { id: true, name: true, email: true, role: true, permissions: true }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
