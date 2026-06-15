import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

// Protect route helper
const isAuthenticated = async () => {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  return isAdmin && isAdmin.value === "true";
};

export async function PUT(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();
    
    // Ensure slug is generated correctly if name changes or it's new
    let slug = data.slug;
    if (!slug) {
       slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const updatedItem = await prisma.location.update({
      where: { id },
      data: {
        slug,
        name: data.name,
        name_th: data.name_th || "",
        city: data.city,
        city_th: data.city_th || "",
        type: data.type,
        stars: parseInt(data.stars) || 0,
        totalRooms: parseInt(data.totalRooms) || 0,
        averagePrice: data.averagePrice || "",
        transport: data.transport || "",
        transport_th: data.transport_th || "",
        image: data.image || "",
        mapLink: data.mapLink || "",
        address: data.address || "",
        address_th: data.address_th || "",
        website: data.website || "",
        article: data.article || "",
        article_th: data.article_th || "",
        nearbyAmenities: Array.isArray(data.nearbyAmenities) ? data.nearbyAmenities : [],
        nearbyAmenities_th: Array.isArray(data.nearbyAmenities_th) ? data.nearbyAmenities_th : []
      }
    });

    // Revalidate public listing and detail pages
    revalidatePath("/[locale]/hotels", "page");
    revalidatePath("/[locale]/condominiums", "page");
    revalidatePath("/[locale]/hotels/[slug]", "page");
    revalidatePath("/[locale]/condominiums/[slug]", "page");
    
    revalidatePath("/en/hotels");
    revalidatePath("/th/hotels");
    revalidatePath("/en/condominiums");
    revalidatePath("/th/condominiums");
    
    if (slug) {
      revalidatePath(`/en/hotels/${slug}`);
      revalidatePath(`/th/hotels/${slug}`);
      revalidatePath(`/en/condominiums/${slug}`);
      revalidatePath(`/th/condominiums/${slug}`);
    }

    return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
  } catch (error) {
    console.error("Failed to update location item:", error);
    return NextResponse.json({ error: "Failed to update location item" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const deletedItem = await prisma.location.delete({
      where: { id }
    });

    const slug = deletedItem?.slug;

    // Revalidate public listing and detail pages
    revalidatePath("/[locale]/hotels", "page");
    revalidatePath("/[locale]/condominiums", "page");
    revalidatePath("/[locale]/hotels/[slug]", "page");
    revalidatePath("/[locale]/condominiums/[slug]", "page");
    
    revalidatePath("/en/hotels");
    revalidatePath("/th/hotels");
    revalidatePath("/en/condominiums");
    revalidatePath("/th/condominiums");
    
    if (slug) {
      revalidatePath(`/en/hotels/${slug}`);
      revalidatePath(`/th/hotels/${slug}`);
      revalidatePath(`/en/condominiums/${slug}`);
      revalidatePath(`/th/condominiums/${slug}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete location item:", error);
    return NextResponse.json({ error: "Failed to delete location item" }, { status: 500 });
  }
}
