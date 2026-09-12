import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "../../../../lib/prisma.js";
import { verifyAuth } from "../../../../lib/auth.js";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const VERIFIED_PHOTOS = [
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

function generateBespokeProfile(loc) {
  const isHotel = loc.type === "hotel";
  const typeLabelEn = isHotel ? "luxury hotel" : (loc.type === "condo" ? "prestigious condominium" : "premier serviced apartment");
  const typeLabelTh = isHotel ? "โรงแรมหรูระดับพรีเมียม" : (loc.type === "condo" ? "คอนโดมิเนียมระดับลักชัวรี" : "เซอร์วิสอพาร์ตเมนต์ระดับพรีเมียม");
  const cityName = loc.city || "Bangkok";
  const cityNameTh = cityName === "Pattaya" ? "พัทยา" : "กรุงเทพฯ";

  const englishArticle = `<h3>Welcome to ${loc.name}</h3>
<p>Positioned as an iconic ${typeLabelEn} in ${cityName}, Thailand, <strong>${loc.name}</strong> offers residents and distinguished guests an exceptional standard of contemporary elegance, prime transport accessibility, and refined lifestyle amenities.</p>
<h3>Elevated Living & Prime Accessibility</h3>
<p>Surrounded by ${cityName}'s leading lifestyle destinations, commercial centers, and culinary hubs, ${loc.name} combines serene tranquility with the pulse of the metropolis. Residents and visitors enjoy seamless access via ${loc.transport || "convenient public transit and highway networks"}, placing the city's finest attractions within effortless reach.</p>
<h3>Signature White-Glove Care by That Laundry Shop</h3>
<p>To complement the prestigious living experience at ${loc.name}, <strong>That Laundry Shop</strong> provides comprehensive doorstep laundry, hand-ironing, and eco-friendly dry cleaning services:</p>
<ul>
  <li><strong>Door-to-Door Concierge Pickup & Delivery:</strong> Schedule effortless collection directly at the lobby or concierge desk of ${loc.name}.</li>
  <li><strong>Delicate & Designer Garment Care:</strong> Specialized non-toxic dry cleaning solvents suited for luxury silks, business suits, evening attire, and delicate designer labels.</li>
  <li><strong>Express Turnaround:</strong> Same-day and next-day express service with meticulous hand-pressing and sustainable protective packaging.</li>
</ul>
<p>Experience hassle-free, immaculate wardrobe care designed specifically for discerning guests and residents of ${loc.name}.</p>`;

  const thaiArticle = `<h3>ยินดีต้อนรับสู่ ${loc.name_th || loc.name}</h3>
<p><strong>${loc.name_th || loc.name}</strong> ${typeLabelTh}ชั้นนำแห่ง${cityNameTh} พร้อมมอบประสบการณ์การอยู่อาศัยและการพักผ่อนที่เหนือระดับ เพียบพร้อมด้วยสิ่งอำนวยความสะดวกครบครัน และทำเลที่เชื่อมต่อการเดินทางได้อย่างสะดวกรวดเร็ว</p>
<h3>การเดินทางและทำเลใจกลางเมือง</h3>
<p>ตั้งอยู่บนทำเลศักยภาพใกล้ ${loc.transport_th || loc.transport || "ระบบขนส่งสาธารณะและถนนสายหลัก"} ทำให้การเดินทางสู่แหล่งช้อปปิ้ง ร้านอาหารชั้นนำ และย่านธุรกิจใจกลาง${cityNameTh}เป็นไปอย่างสะดวกสบาย</p>
<h3>บริการซักอบรีดระดับพรีเมียมจาก That Laundry Shop</h3>
<p>เพื่อเติมเต็มความสะดวกสบายสำหรับผู้พักอาศัยและแขกคนสำคัญของ ${loc.name_th || loc.name} ทาง <strong>That Laundry Shop</strong> พร้อมให้บริการดูแลเสื้อผ้าและซักแห้งระดับมืออาชีพ:</p>
<ul>
  <li><strong>บริการรับ-ส่งผ้าถึงล็อบบี้:</strong> นัดหมายรับ-ส่งผ้าได้สะดวกรวดเร็วถึงล็อบบี้หรือเคาน์เตอร์คอนเซียร์จของโครงการ</li>
  <li><strong>ซักแห้งถนอมเนื้อผ้าขั้นสูง:</strong> น้ำยาซักแห้งที่เป็นมิตรต่อสิ่งแวดล้อม ปลอดภัยต่อชุดสูท ชุดราตรี และผ้าไหมเนื้อละเอียด</li>
  <li><strong>รีดประณีตและบริการด่วน:</strong> รีดมือด้วยความพิถีพิถัน พร้อมบริการด่วนตรงเวลา แพ็กเกจสะอาดเรียบร้อย</li>
</ul>`;

  const fallbackAddress = loc.address || `${loc.name}, ${cityName}, Thailand`;
  const fallbackAddressTh = loc.address_th || `${loc.name_th || loc.name}, ${cityNameTh}, ประเทศไทย`;

  return {
    article: englishArticle,
    article_th: thaiArticle,
    address: fallbackAddress,
    address_th: fallbackAddressTh
  };
}

export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" }
    });

    const incomplete = locations.filter(loc => 
      !loc.address || !loc.address.trim() ||
      !loc.address_th || !loc.address_th.trim() ||
      !loc.article || !loc.article.trim() ||
      !loc.article_th || !loc.article_th.trim() ||
      !loc.image || !loc.image.trim()
    );

    return NextResponse.json({
      total: locations.length,
      incompleteCount: incomplete.length,
      completeCount: locations.length - incomplete.length,
      incompleteList: incomplete.map(l => ({
        id: l.id,
        name: l.name,
        city: l.city,
        type: l.type,
        missingAddress: !l.address || !l.address.trim(),
        missingAddressTh: !l.address_th || !l.address_th.trim(),
        missingArticle: !l.article || !l.article.trim(),
        missingArticleTh: !l.article_th || !l.article_th.trim(),
        missingImage: !l.image || !l.image.trim()
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const limit = parseInt(body.limit, 10) || 100;

    const locations = await prisma.location.findMany({
      orderBy: { createdAt: "asc" }
    });

    const incomplete = locations.filter(loc => 
      !loc.address || !loc.address.trim() ||
      !loc.address_th || !loc.address_th.trim() ||
      !loc.article || !loc.article.trim() ||
      !loc.article_th || !loc.article_th.trim() ||
      !loc.image || !loc.image.trim()
    ).slice(0, limit);

    console.log(`[Directory Repair] Found ${incomplete.length} listings to update.`);

    if (incomplete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All directory listings are already fully complete!",
        updatedCount: 0
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const updatedRecords = [];
    const photoPool = [...VERIFIED_PHOTOS].sort(() => 0.5 - Math.random());

    const chunkSize = 5;
    for (let c = 0; c < incomplete.length; c += chunkSize) {
      const chunk = incomplete.slice(c, c + chunkSize);
      console.log(`[Directory Repair] Processing chunk ${Math.floor(c / chunkSize) + 1}/${Math.ceil(incomplete.length / chunkSize)} (${chunk.length} items)...`);

      const prompt = `You are an elite hospitality and real estate researcher for "That Laundry Shop", Thailand.
For each of the following ${chunk.length} properties, provide accurate real-world address information and rich SEO articles:

${chunk.map((item, idx) => `${idx + 1}. Name: "${item.name}", City: "${item.city}", Type: "${item.type}"`).join("\n")}

REQUIREMENTS FOR EACH:
1. "address": The exact or realistic full street address in ${chunk[0].city || "Thailand"} in English (with district, subdistrict, postal code).
2. "address_th": Full Thai address corresponding to the English address.
3. "article": Rich HTML article (<h3>, <p>, <ul>, <li>) introducing the property, lifestyle, and highlighting That Laundry Shop's white-glove laundry pickup, express turnaround, and eco-friendly dry cleaning.
4. "article_th": Rich Thai HTML article introducing the property and That Laundry Shop's services.

Return a RAW JSON array of ${chunk.length} objects corresponding in order:
[
  {
    "name": "<string>",
    "address": "<string: full English address>",
    "address_th": "<string: full Thai address>",
    "article": "<string: rich HTML English SEO article>",
    "article_th": "<string: rich HTML Thai SEO article>"
  }
]
Output ONLY valid JSON.`;

      let aiResults = null;
      const repairModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.5-flash-lite"];
      for (const modelName of repairModels) {
        if (aiResults) break;
        for (let att = 1; att <= 2; att++) {
          try {
            const res = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: { responseMimeType: "application/json" }
            });
            const raw = (res.text || "").trim().replace(/^```json\s*/, "").replace(/```$/, "");
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              aiResults = parsed;
              break;
            }
          } catch (genErr) {
            console.warn(`[Directory Repair] AI chunk error with ${modelName} (att ${att}):`, genErr.message);
            await new Promise((r) => setTimeout(r, 1500));
          }
        }
      }

      for (let i = 0; i < chunk.length; i++) {
        const loc = chunk[i];
        const aiData = aiResults && aiResults[i] ? aiResults[i] : null;
        const fallback = generateBespokeProfile(loc);

        const newAddress = (aiData?.address && aiData.address.trim()) || loc.address || fallback.address;
        const newAddressTh = (aiData?.address_th && aiData.address_th.trim()) || loc.address_th || fallback.address_th;
        const newArticle = (aiData?.article && aiData.article.trim()) || loc.article || fallback.article;
        const newArticleTh = (aiData?.article_th && aiData.article_th.trim()) || loc.article_th || fallback.article_th;
        const newImage = loc.image && loc.image.trim() ? loc.image : photoPool[c % photoPool.length];

        try {
          const updated = await prisma.location.update({
            where: { id: loc.id },
            data: {
              address: newAddress,
              address_th: newAddressTh,
              article: newArticle,
              article_th: newArticleTh,
              image: newImage
            },
            select: { id: true, name: true, city: true, type: true }
          });
          updatedRecords.push(updated);
        } catch (dbErr) {
          console.error(`[Directory Repair] Failed to update "${loc.name}":`, dbErr.message);
        }
      }
    }

    try {
      revalidatePath("/[locale]/hotels", "page");
      revalidatePath("/[locale]/condominiums", "page");
      revalidatePath("/en/hotels");
      revalidatePath("/th/hotels");
      revalidatePath("/cn/hotels");
      revalidatePath("/en/condominiums");
      revalidatePath("/th/condominiums");
      revalidatePath("/cn/condominiums");
    } catch (revalErr) {
      console.warn("Revalidation warning:", revalErr.message);
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedRecords.length,
      updatedListings: updatedRecords
    });
  } catch (error) {
    console.error("Repair error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
