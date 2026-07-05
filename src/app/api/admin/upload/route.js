import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

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

export async function POST(request) {
  try {
    // Check authorization
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save path inside the public/uploads directory
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Clean filename and make it unique
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${timestamp}_${sanitizedName}`;
    const filePath = join(uploadDir, uniqueFilename);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({ success: true, url: fileUrl, filename: file.name }, { status: 200 });
  } catch (error) {
    console.error("File upload API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
