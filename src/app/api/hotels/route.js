import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const locations = await prisma.location.findMany();
    return NextResponse.json(locations, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

export async function POST(request) {
  // Protect route
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  if (!isAdmin || isAdmin.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    let slug = data.slug;
    if (!slug && data.name) {
        slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    const formattedData = {
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
    };

    await prisma.location.create({ data: formattedData });
    
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
    console.error("Failed to save location:", error);
    return NextResponse.json({ error: "Failed to save data", details: error.message }, { status: 500 });
  }
}
