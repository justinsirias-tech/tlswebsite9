import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";
import { verifyAuth } from "@/lib/auth";

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite"
];

const isAuthenticated = async () => {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  if (isAdmin && isAdmin.value === "true") return true;
  const user = await verifyAuth();
  return !!user;
};

function parseLocationJson(text, name, city, type) {
  if (!text || typeof text !== "string") return null;

  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.article) return parsed;
  } catch (e) {
    const starsMatch = text.match(/"stars"\s*:\s*(\d+)/);
    const roomsMatch = text.match(/"totalRooms"\s*:\s*(\d+)/);
    const priceMatch = text.match(/"averagePrice"\s*:\s*"([^"]+)"/);
    const transMatch = text.match(/"transport"\s*:\s*"([^"]+)"/);
    const amenMatch = text.match(/"nearbyAmenities"\s*:\s*"([^"]+)"/);
    const artMatch = text.match(/"article"\s*:\s*"([\s\S]*)"\s*\}?$/);

    if (artMatch) {
      return {
        stars: starsMatch ? parseInt(starsMatch[1], 10) : 5,
        totalRooms: roomsMatch ? parseInt(roomsMatch[1], 10) : 150,
        averagePrice: priceMatch ? priceMatch[1] : "฿4,500 / night",
        transport: transMatch ? transMatch[1] : "Prime Location",
        nearbyAmenities: amenMatch ? amenMatch[1] : "Shopping, Dining, Transit",
        article: artMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
      };
    }
  }

  return null;
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, city, type } = await request.json();

    if (!name || !city || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let jsonResult = null;

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert SEO content writer and data researcher for a luxury laundry service called "That Laundry Shop".
Research this location: Name: "${name}", City: "${city}", Type: "${type}".

Return a RAW JSON object with the following keys EXACTLY:
{
  "stars": 5,
  "totalRooms": 150,
  "averagePrice": "฿4,500 / night",
  "transport": "BTS / Transit details",
  "nearbyAmenities": "Shopping, dining, cafes",
  "article": "Comprehensive HTML SEO article highlighting That Laundry Shop pickup service"
}

Output ONLY valid JSON without markdown fences.`;

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            }
          });

          const parsed = parseLocationJson(response.text, name, city, type);
          if (parsed && parsed.article) {
            jsonResult = parsed;
            break;
          }
        } catch (err) {
          console.warn(`Model ${modelName} failed for ${name}:`, err?.message);
        }
      }
    }

    if (!jsonResult) {
      jsonResult = {
        stars: 5,
        totalRooms: 120,
        averagePrice: city.toLowerCase() === "pattaya" ? "฿3,500 / night" : "฿4,500 / night",
        transport: "Central District Access",
        nearbyAmenities: "Shopping Malls, Restaurants, Convenience Stores",
        article: `<h2>Luxury Living at ${name} in ${city}</h2>
<p>Located in the heart of ${city}, <strong>${name}</strong> offers residents and guests a premier experience with exceptional architecture and modern amenities.</p>
<p>To ensure a completely hassle-free stay, <strong>That Laundry Shop</strong> provides white-glove laundry pickup and delivery directly to ${name}. Whether you require crisp executive shirts, eco-friendly dry cleaning for delicate evening wear, or convenient wash and fold, our express service guarantees your garments are returned pristine within 24 hours.</p>`
      };
    }

    return NextResponse.json(jsonResult, { status: 200 });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: `Failed to generate article: ${error.message || error}` }, { status: 500 });
  }
}
