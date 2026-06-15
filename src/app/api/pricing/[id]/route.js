import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { verifyAuth } from "../../../../lib/auth";

export async function PUT(request, { params }) {
  if (!(await verifyAuth("pricing"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();
    
    const updatedItem = await prisma.pricing.update({
      where: { id },
      data: {
        category: data.category,
        name: data.name,
        name_th: data.name_th,
        nonMember: parseFloat(data.nonMember),
        member: data.member ? parseFloat(data.member) : null,
        unit: data.unit
      }
    });

    return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
  } catch (error) {
    console.error("Failed to update pricing item:", error);
    return NextResponse.json({ error: "Failed to update pricing item" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await verifyAuth("pricing"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    await prisma.pricing.delete({
      where: { id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete pricing item:", error);
    return NextResponse.json({ error: "Failed to delete pricing item" }, { status: 500 });
  }
}
