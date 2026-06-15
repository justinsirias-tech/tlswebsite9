import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { verifyAuth } from "../../../lib/auth";

export async function GET() {
  try {
    const pricing = await prisma.pricing.findMany();
    return NextResponse.json(pricing, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await verifyAuth("pricing"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    if (Array.isArray(data)) {
        await prisma.pricing.deleteMany();
        for (const p of data) {
           await prisma.pricing.create({ data: p });
        }
    } else {
        await prisma.pricing.create({ data });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
