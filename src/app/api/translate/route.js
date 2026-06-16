import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";

// Protect route helper
const isAuthenticated = async () => {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin");
  return isAdmin && isAdmin.value === "true";
};

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY") {
    return NextResponse.json({ 
      error: "Failed to translate content", 
      details: "GEMINI_API_KEY environment variable is not configured in Vercel settings or has a placeholder value." 
    }, { status: 500 });
  }

  try {
    const { name, city, transport, address, nearbyAmenities, article } = await request.json();
    
    // Normalize nearbyAmenities to an array of strings for clean model input
    let amenitiesArray = [];
    if (Array.isArray(nearbyAmenities)) {
      amenitiesArray = nearbyAmenities;
    } else if (typeof nearbyAmenities === 'string') {
      amenitiesArray = nearbyAmenities.split(',').map(i => i.trim()).filter(Boolean);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are an expert bilingual translator specialized in English and Thai localization for luxury hospitality and premium real estate in Thailand.
I will give you a JSON object containing English fields for a luxury location serviced by "That Laundry Shop".
Translate all fields into natural, upscale, and contextually accurate Thai.

Input JSON:
${JSON.stringify({ name, city, transport, address, nearbyAmenities: amenitiesArray, article })}

Translation Guidelines:
1. "name_th": Translate the building name phonetically or conventionally to Thai (e.g., "Ashton Asoke" -> "แอชตัน อโศก", "Beatniq Sukhumvit 32" -> "บีทนิค สุขุมวิท 32").
2. "city_th": Translate the city (e.g., "Bangkok" -> "กรุงเทพฯ" or "กรุงเทพมหานคร", "Pattaya" -> "พัทยา").
3. "transport_th": Translate transit details naturally (e.g., "Direct access to MRT Sukhumvit" -> "เชื่อมต่อโดยตรงกับ MRT สุขุมวิท", "250m to BTS Thong Lo" -> "250 เมตร ถึง BTS ทองหล่อ").
4. "address_th": Translate the address details properly into Thai postal format (e.g., "Khwaeng Khlong Toei Nuea, Khet Watthana" -> "แขวงคลองเตยเหนือ เขตวัฒนา").
5. "nearbyAmenities_th": Translate each item in the array to its Thai equivalent (e.g., "Terminal 21 Shopping Mall" -> "ห้างสรรพสินค้าเทอร์มินอล 21").
6. "article_th": Translate the SEO article into highly professional Thai. Keep the exact HTML structure (retaining all tags like <h2>, <h3>, <p>, <ul>, <li>, <strong>, etc.) and translate keywords naturally:
   - Keep brand name "That Laundry Shop" as "That Laundry Shop" in English, or write it as "That Laundry Shop" directly.
   - "laundry service" -> "บริการซักรีด"
   - "dry cleaning" -> "ซักแห้ง"
   - "ironing" or "pressing" -> "รีดผ้า" or "รีดด้วยมือ"

Your response must be a single RAW JSON object matching this schema exactly, with no markdown code blocks (no \`\`\`json wrappers), no comments, and no text outside the JSON:
{
  "name_th": "<string>",
  "city_th": "<string>",
  "transport_th": "<string>",
  "address_th": "<string>",
  "nearbyAmenities_th": [<array of strings>],
  "article_th": "<string containing HTML>"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let responseText = response.text || "";
    
    // Fallback: Clean up markdown code blocks if the model outputs them despite instructions
    if (responseText.includes("```")) {
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    let jsonResult;
    try {
      jsonResult = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON output:", responseText);
      throw new Error("Invalid JSON returned by AI model: " + e.message);
    }

    // Ensure nearbyAmenities_th is guaranteed to be an array of strings in the response
    if (jsonResult.nearbyAmenities_th) {
      if (typeof jsonResult.nearbyAmenities_th === 'string') {
        jsonResult.nearbyAmenities_th = jsonResult.nearbyAmenities_th
          .split(',')
          .map(i => i.trim())
          .filter(Boolean);
      } else if (!Array.isArray(jsonResult.nearbyAmenities_th)) {
        jsonResult.nearbyAmenities_th = [];
      }
    } else {
      jsonResult.nearbyAmenities_th = [];
    }

    return NextResponse.json(jsonResult, { status: 200 });
  } catch (error) {
    console.error("AI Translation Error:", error);
    return NextResponse.json({ error: "Failed to translate content", details: error.message }, { status: 500 });
  }
}
