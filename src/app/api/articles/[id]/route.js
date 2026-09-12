import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../../lib/prisma";
import { verifyAuth } from "../../../../lib/auth";

async function isAuthorized() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  if (isAdmin && isAdmin.value === "true") return true;
  const user = await verifyAuth();
  return !!user;
}

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    let { title, content, imageUrl } = data;
    let newContent = content !== undefined ? content : existing.content;

    if (imageUrl) {
      const cleanImg = imageUrl.trim();
      const { getAllUsedImages } = await import("../../../../lib/imagePicker.js");
      const usedImages = await getAllUsedImages(id);
      if (usedImages.has(cleanImg)) {
        return NextResponse.json({
          error: "This image is already used by another article. Images must never be repeated."
        }, { status: 400 });
      }

      const imgTagRegex = /<img[^>]+src=["'][^"']+["'][^>]*>/i;
      const newImgTag = `<img src="${cleanImg}" alt="${title || existing.title || 'Article Image'}" style="width:100%; border-radius:12px; margin: 2rem 0;" />`;
      if (imgTagRegex.test(newContent)) {
        newContent = newContent.replace(imgTagRegex, newImgTag);
      } else {
        newContent = `${newImgTag}\n${newContent}`;
      }
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        content: newContent,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update article:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
