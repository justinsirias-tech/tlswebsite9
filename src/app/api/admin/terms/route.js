import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "../../../../lib/prisma";

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

export async function GET(request) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["terms_en", "terms_th", "terms_cn", "terms_last_updated"]
        }
      }
    });

    const resultMap = {};
    settings.forEach(s => {
      try {
        resultMap[s.key] = JSON.parse(s.value);
      } catch {
        resultMap[s.key] = s.value;
      }
    });

    return NextResponse.json({
      success: true,
      terms: {
        en: resultMap["terms_en"] || null,
        th: resultMap["terms_th"] || null,
        cn: resultMap["terms_cn"] || null,
        lastUpdated: resultMap["terms_last_updated"] || null
      }
    });
  } catch (error) {
    console.error("Admin terms GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { en, th, cn, lastUpdated } = data;

    const upsertSetting = async (key, val) => {
      if (val === undefined || val === null) return;
      const strValue = typeof val === "object" ? JSON.stringify(val) : String(val);
      await prisma.setting.upsert({
        where: { key },
        update: { value: strValue },
        create: { key, value: strValue }
      });
    };

    if (en) await upsertSetting("terms_en", en);
    if (th) await upsertSetting("terms_th", th);
    if (cn) await upsertSetting("terms_cn", cn);
    if (lastUpdated) await upsertSetting("terms_last_updated", lastUpdated);

    return NextResponse.json({ success: true, message: "Terms and conditions updated successfully" });
  } catch (error) {
    console.error("Admin terms POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
