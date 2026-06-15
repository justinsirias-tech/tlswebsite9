const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');

// Use environment variables (via node --env-file=.env scripts/translate_db.js)
const connectionString = process.env.DATABASE_URL;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!connectionString) {
  console.error("Error: DATABASE_URL is not set in environment.");
  process.exit(1);
}

if (!geminiApiKey) {
  console.error("Error: GEMINI_API_KEY is not set in environment.");
  process.exit(1);
}

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function translateLocation(loc) {
  try {
    console.log(`[START] Translating: "${loc.name}" (Type: ${loc.type}, ID: ${loc.id})`);
    
    // Prepare input JSON for Gemini
    const input = {
      name: loc.name,
      city: loc.city,
      transport: loc.transport,
      address: loc.address || "",
      nearbyAmenities: loc.nearbyAmenities || [],
      article: loc.article || ""
    };
    
    const prompt = `You are an expert bilingual translator specialized in English and Thai localization for luxury hospitality and premium real estate in Thailand.
I will give you a JSON object containing English fields for a luxury location serviced by "That Laundry Shop".
Translate all fields into natural, upscale, and contextually accurate Thai.

Input JSON:
${JSON.stringify(input)}

Translation Guidelines:
1. "name_th": Translate the building name phonetically or conventionally to Thai (e.g., "Marriott Marquis Queen's Park" -> "แบงค็อก แมริออท มาร์คีส์ ควีนส์ปาร์ค", "Ashton Asoke" -> "แอชตัน อโศก", "Beatniq Sukhumvit 32" -> "บีทนิค สุขุมวิท 32").
2. "city_th": Translate the city (e.g., "Bangkok" -> "กรุงเทพฯ" or "กรุงเทพมหานคร", "Pattaya" -> "พัทยา").
3. "transport_th": Translate transit details naturally (e.g., "Direct access to MRT Sukhumvit" -> "เชื่อมต่อโดยตรงกับ MRT สุขุมวิท", "250m to BTS Thong Lo" -> "250 เมตร ถึง BTS ทองหล่อ").
4. "address_th": Translate the address details properly into Thai postal format (e.g., "Khwaeng Khlong Toei Nuea, Khet Watthana" -> "แขวงคลองเตยเหนือ เขตวัฒนา"). If input address is empty/null, return empty string "".
5. "nearbyAmenities_th": Translate each item in the array to its Thai equivalent (e.g., "Terminal 21 Shopping Mall" -> "ห้างสรรพสินค้าเทอร์มินอล 21"). If input is empty, return [].
6. "article_th": Translate the SEO article into highly professional Thai. Keep the exact HTML structure (retaining all tags like <h2>, <h3>, <p>, <ul>, <li>, <strong>, etc.) and translate keywords naturally:
   - Keep brand name "That Laundry Shop" as "That Laundry Shop" in English, or write it as "That Laundry Shop" directly.
   - "laundry service" -> "บริการซักรีด"
   - "dry cleaning" -> "ซักแห้ง"
   - "ironing" or "pressing" -> "รีดผ้า" or "รีดด้วยมือ"
   If input article is empty/null, return empty string "".

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

    const responseText = response.text;
    const result = JSON.parse(responseText);

    // Clean up empty strings back to nulls for database consistency
    const updateData = {
      name_th: result.name_th || null,
      city_th: result.city_th || null,
      transport_th: result.transport_th || null,
      address_th: (loc.address && result.address_th) ? result.address_th : null,
      article_th: (loc.article && result.article_th) ? result.article_th : null,
      nearbyAmenities_th: result.nearbyAmenities_th || []
    };

    await prisma.location.update({
      where: { id: loc.id },
      data: updateData
    });

    console.log(`[SUCCESS] Translated: "${loc.name}" -> "${updateData.name_th}"`);
  } catch (err) {
    console.error(`[ERROR] Failed to translate location "${loc.name}" (${loc.id}):`, err.message);
  }
}

async function main() {
  console.log("Fetching locations from database...");
  const allLocations = await prisma.location.findMany();
  console.log(`Total locations found: ${allLocations.length}`);

  // We need translation if:
  // - name_th is missing
  // - OR if it has an article but article_th is missing
  const toTranslate = allLocations.filter(
    (loc) => !loc.name_th || (loc.article && loc.article.trim().length > 0 && !loc.article_th)
  );

  console.log(`Locations needing translation: ${toTranslate.length}`);

  if (toTranslate.length === 0) {
    console.log("All locations are already fully translated!");
    return;
  }

  // Batch process to prevent API rate limits and DB connection pool starvation
  const batchSize = 3;
  const totalBatches = Math.ceil(toTranslate.length / batchSize);

  for (let i = 0; i < toTranslate.length; i += batchSize) {
    const batch = toTranslate.slice(i, i + batchSize);
    console.log(`\n--- Processing batch ${Math.floor(i / batchSize) + 1} of ${totalBatches} ---`);
    
    await Promise.all(batch.map(translateLocation));
    
    // Cooldown interval between batches
    if (i + batchSize < toTranslate.length) {
      console.log("Cooling down for 1.5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  console.log("\nDatabase translation processing completed!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
