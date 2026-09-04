import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { Storage } from "@google-cloud/storage";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "tls-secret-key-2026");

async function verifyAdmin(request) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload && (payload.role === "SUPERADMIN" || payload.role === "ADMIN" || payload.role === "EDITOR" || payload.role === "staff");
  } catch (error) {
    return false;
  }
}

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    console.log("Upload API request received. GCS_BUCKET environment variable is:", process.env.GCS_BUCKET);
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

    // Clean filename and make it unique
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${timestamp}_${sanitizedName}`;

    const bucketName = process.env.GCS_BUCKET;

    if (bucketName) {
      console.log(`Uploading file to GCS Bucket: ${bucketName}...`);
      
      // Initialize GCS client. On Cloud Run, it automatically uses the container's service account credentials.
      const storage = new Storage();
      const bucket = storage.bucket(bucketName);
      const gcsFile = bucket.file(`uploads/${uniqueFilename}`);

      await gcsFile.save(buffer, {
        metadata: {
          contentType: file.type || "image/jpeg",
        },
      });

      // Construct GCS public URL (Assumes bucket permissions allow allUsers Storage Object Viewer)
      const fileUrl = `https://storage.googleapis.com/${bucketName}/uploads/${uniqueFilename}`;

      console.log(`GCS Upload success: ${fileUrl}`);
      return NextResponse.json({ success: true, url: fileUrl, filename: file.name }, { status: 200 });
    } else {
      console.log("GCS_BUCKET env variable not configured. Falling back to local filesystem upload...");
      
      // Save path inside the public/uploads directory
      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filePath = join(uploadDir, uniqueFilename);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/${uniqueFilename}`;

      return NextResponse.json({ success: true, url: fileUrl, filename: file.name }, { status: 200 });
    }
  } catch (error) {
    console.error("File upload API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
