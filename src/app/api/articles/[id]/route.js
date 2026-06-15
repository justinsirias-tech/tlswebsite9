import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../../lib/prisma";

export async function DELETE(request, { params }) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  if (!isAdmin || isAdmin.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
