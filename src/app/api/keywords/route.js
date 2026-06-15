import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../lib/prisma";

const isAuthenticated = async () => {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  return isAdmin && isAdmin.value === "true";
};

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const queue = await prisma.keywordQueue.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(queue);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { keywords } = await request.json();
    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const cleanKeywords = keywords.map(kw => ({ keyword: kw.trim() })).filter(kw => kw.keyword !== "");
    
    await prisma.keywordQueue.createMany({
      data: cleanKeywords,
      skipDuplicates: true
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
