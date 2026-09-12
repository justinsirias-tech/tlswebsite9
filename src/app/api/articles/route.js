import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../lib/prisma";
import { verifyAuth } from "../../../lib/auth";

async function isAuthorized() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  if (isAdmin && isAdmin.value === "true") return true;
  const user = await verifyAuth();
  return !!user;
}

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, imageUrl } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let finalContent = content;
    if (imageUrl) {
      const cleanImg = imageUrl.trim();
      const { getAllUsedImages } = await import("../../../lib/imagePicker.js");
      const usedImages = await getAllUsedImages();
      if (usedImages.has(cleanImg)) {
        return NextResponse.json({
          error: "This image is already in use by another article. Images must never be repeated."
        }, { status: 400 });
      }

      const imgTag = `<img src="${cleanImg}" alt="${title}" style="width:100%; border-radius:12px; margin: 2rem 0;" />\n`;
      // Prepend image if not already embedded
      if (!finalContent.includes(cleanImg)) {
        finalContent = `${imgTag}${finalContent}`;
      }
    }

    const article = await prisma.article.create({
      data: { title, content: finalContent },
    });
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
