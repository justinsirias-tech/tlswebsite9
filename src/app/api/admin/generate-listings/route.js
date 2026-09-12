import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "../../../../lib/prisma.js";
import { verifyAuth } from "../../../../lib/auth.js";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

// Curated verified 200 OK architecture, luxury hotel, and condominium photos
const VERIFIED_HOTEL_PHOTOS = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
];

async function isAuthorized() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  if (isAdmin && isAdmin.value === "true") return true;
  const user = await verifyAuth();
  return !!user;
}

export async function POST(request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const targetCity = body.city || "both"; // 'both', 'Bangkok', 'Pattaya'
    const targetType = body.type || "all";  // 'all', 'hotel', 'condo', 'apartment'
    const totalCount = parseInt(body.count, 10) || 30;

    // 1. Fetch existing property names and slugs to guarantee ZERO duplicates
    const existing = await prisma.location.findMany({
      select: { name: true, slug: true }
    });
    const existingNames = new Set(existing.map(e => e.name.trim().toLowerCase()));
    const existingSlugs = new Set(existing.map(e => e.slug.trim().toLowerCase()));

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Determine batch plan: split into 2 batches for maximum reliability and speed
    const batch1Count = Math.ceil(totalCount / 2);
    const batch2Count = totalCount - batch1Count;

    const batches = [];
    if (targetCity === "both") {
      batches.push({ count: batch1Count, city: "Bangkok" });
      batches.push({ count: batch2Count, city: "Pattaya" });
    } else {
      batches.push({ count: batch1Count, city: targetCity });
      batches.push({ count: batch2Count, city: targetCity });
    }

    const generatedItems = [];
    const usedNamesInSession = new Set([...existingNames]);

    for (let bIndex = 0; bIndex < batches.length; bIndex++) {
      const batch = batches[bIndex];
      const typeInstruction = targetType === "all" 
        ? "a balanced mix of luxury hotels, condominiums, and serviced apartments" 
        : `only ${targetType}s`;

      const prompt = `You are an elite hospitality and real estate researcher for "That Laundry Shop", Thailand's premier luxury laundry and dry cleaning brand.
Generate exactly ${batch.count} REAL-WORLD, POPULAR, PRESTIGIOUS ${typeInstruction} located in ${batch.city}, Thailand.

CRITICAL CONSTRAINTS:
1. Every property MUST be a real, authentic hotel, condo, or serviced apartment in ${batch.city}.
2. DO NOT include any of the following already existing property names:
${Array.from(usedNamesInSession).slice(-80).join(", ")}
3. Property names must be distinctive and must NOT duplicate any existing Bangkok or Pattaya properties listed above. If well-known international chains are already taken, choose renowned boutique luxury hotels, high-end branded residences, upscale serviced residences, or luxury condominiums in ${batch.city}.
4. The "article" field must be a rich HTML introduction (using <h3>, <p>, <ul>, <li>) explaining the property's lifestyle and highlighting That Laundry Shop's white-glove laundry pickup, express turnaround, hand-pressing, and eco-friendly dry cleaning.
5. Return a RAW JSON array of objects with the exact schema below:
[
  {
    "name": "<string: official English name of property>",
    "name_th": "<string: official Thai name>",
    "city": "${batch.city}",
    "city_th": "${batch.city === 'Bangkok' ? 'กรุงเทพฯ' : 'พัทยา'}",
    "type": "<string: 'hotel' | 'condo' | 'apartment'>",
    "stars": <integer between 4 and 5>,
    "totalRooms": <integer estimated total units, e.g. 150 to 500>,
    "averagePrice": "<string, e.g. '฿4,500 / night' for hotel or '฿35,000 / month' for condo>",
    "transport": "<string: closest BTS/MRT station, highway, or beach road with distance in meters>",
    "transport_th": "<string: transit in Thai>",
    "address": "<string: realistic full street address in ${batch.city}>",
    "address_th": "<string: Thai address>",
    "nearbyAmenities": ["<string: landmark 1>", "<string: mall or beach>", "<string: convenience>"],
    "nearbyAmenities_th": ["<landmark in Thai>", "<mall in Thai>", "<convenience in Thai>"],
    "website": "<string: official website or booking link>",
    "article": "<string: rich HTML SEO article introducing the property and That Laundry Shop's luxury door-to-door garment care>",
    "article_th": "<string: Thai translation of the article summary>"
  }
]
Output ONLY valid JSON. No markdown backticks outside JSON.`;

      let batchSuccess = false;
      const candidateModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
      
      console.log(`[Batch ${bIndex + 1}/${batches.length}] Requesting ${batch.count} ${batch.city} properties from Gemini...`);

      for (const modelName of candidateModels) {
        if (batchSuccess) break;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`[Batch ${bIndex + 1}] Trying ${modelName} (attempt ${attempt})...`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
              }
            });

            const rawText = response.text || "";
            let cleaned = rawText.trim();
            if (cleaned.startsWith("```json")) {
              cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "").trim();
            } else if (cleaned.startsWith("```")) {
              cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "").trim();
            }

            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed) && parsed.length > 0) {
              let addedThisBatch = 0;
              for (const item of parsed) {
                const nameLower = (item.name || "").trim().toLowerCase();
                if (nameLower && !usedNamesInSession.has(nameLower)) {
                  usedNamesInSession.add(nameLower);
                  generatedItems.push(item);
                  addedThisBatch++;
                }
              }
              console.log(`[Batch ${bIndex + 1}] Successfully parsed ${parsed.length} items (${addedThisBatch} new unique).`);
              batchSuccess = true;
              break;
            } else {
              console.warn(`[Batch ${bIndex + 1}] Model returned non-array JSON:`, rawText.substring(0, 100));
            }
          } catch (genError) {
            console.error(`[Batch ${bIndex + 1}] Model ${modelName} attempt ${attempt} error:`, genError.message);
            await new Promise((res) => setTimeout(res, 2000));
          }
        }
      }

      if (!batchSuccess) {
        console.warn(`[Batch ${bIndex + 1}] Warning: Batch could not be generated.`);
      }
    }

    if (generatedItems.length === 0) {
      return NextResponse.json({ error: "Failed to generate listings from AI. Please try again." }, { status: 500 });
    }

    // 2. Format and Save to Database
    const createdListings = [];
    const photoPool = [...VERIFIED_HOTEL_PHOTOS].sort(() => 0.5 - Math.random());

    for (let i = 0; i < generatedItems.length; i++) {
      const item = generatedItems[i];
      
      // Generate clean, collision-free slug
      let baseSlug = (item.name || `property-${Date.now()}-${i}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      
      let finalSlug = baseSlug;
      let counter = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter++}`;
      }
      existingSlugs.add(finalSlug);

      // Assign photo from photo pool
      const photoUrl = photoPool[i % photoPool.length];

      // Format clean map link
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.city}`)}`;

      const formattedLocation = {
        slug: finalSlug,
        name: item.name,
        name_th: item.name_th || item.name,
        city: item.city || "Bangkok",
        city_th: item.city_th || (item.city === "Pattaya" ? "พัทยา" : "กรุงเทพฯ"),
        type: ["hotel", "condo", "apartment"].includes(item.type) ? item.type : "hotel",
        stars: parseInt(item.stars, 10) || 5,
        totalRooms: parseInt(item.totalRooms, 10) || 150,
        averagePrice: item.averagePrice || (item.type === "hotel" ? "฿3,500 / night" : "฿30,000 / month"),
        transport: item.transport || "Convenient road and public transit access",
        transport_th: item.transport_th || "การเดินทางสะดวกสบายใกล้ระบบขนส่ง",
        image: photoUrl,
        mapLink: item.mapLink || mapLink,
        address: item.address || `${item.name}, ${item.city}, Thailand`,
        address_th: item.address_th || `${item.name_th || item.name}, ${item.city_th || item.city}, ประเทศไทย`,
        website: item.website || `https://www.google.com/search?q=${encodeURIComponent(item.name)}`,
        article: item.article || `<h3>Welcome to ${item.name}</h3><p>Experience unmatched luxury living and hospitality at ${item.name} in ${item.city}. That Laundry Shop is proud to partner with guests and residents to provide premier doorstep garment care.</p>`,
        article_th: item.article_th || `<h3>ยินดีต้อนรับสู่ ${item.name_th || item.name}</h3><p>สัมผัสประสบการณ์การอยู่อาศัยและการพักผ่อนระดับพรีเมียม พร้อมบริการซักอบรีดและซักแห้งชั้นเลิศจาก That Laundry Shop</p>`,
        nearbyAmenities: Array.isArray(item.nearbyAmenities) && item.nearbyAmenities.length > 0
          ? item.nearbyAmenities
          : ["Shopping Malls", "7-Eleven", "Restaurants", "BTS / Transport"],
        nearbyAmenities_th: Array.isArray(item.nearbyAmenities_th) && item.nearbyAmenities_th.length > 0
          ? item.nearbyAmenities_th
          : ["ห้างสรรพสินค้า", "เซเว่น อีเลฟเว่น", "ร้านอาหาร", "ระบบขนส่งสาธารณะ"]
      };

      try {
        const created = await prisma.location.create({ data: formattedLocation });
        createdListings.push(created);
      } catch (insertError) {
        console.error(`Failed to insert location "${item.name}":`, insertError.message);
      }
    }

    // 3. Revalidate public directory paths
    try {
      revalidatePath("/[locale]/hotels", "page");
      revalidatePath("/[locale]/condominiums", "page");
      revalidatePath("/en/hotels");
      revalidatePath("/th/hotels");
      revalidatePath("/cn/hotels");
      revalidatePath("/en/condominiums");
      revalidatePath("/th/condominiums");
      revalidatePath("/cn/condominiums");
    } catch (e) {
      console.warn("Revalidation warning:", e.message);
    }

    return NextResponse.json({
      success: true,
      count: createdListings.length,
      listings: createdListings.map(l => ({
        id: l.id,
        name: l.name,
        city: l.city,
        type: l.type,
        slug: l.slug,
        stars: l.stars
      }))
    });
  } catch (error) {
    console.error("Listing generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate listings" }, { status: 500 });
  }
}
