const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');

const connectionString = process.env.DATABASE_URL;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!connectionString || !geminiApiKey) {
  console.error("DATABASE_URL or GEMINI_API_KEY is not set.");
  process.exit(1);
}

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function main() {
  const items = await prisma.pricing.findMany();
  const toTranslate = items.filter(i => !i.name_th);
  
  console.log(`Found ${items.length} pricing items total. ${toTranslate.length} need translation.`);
  if (toTranslate.length === 0) {
    console.log("All pricing items are already translated!");
    return;
  }

  // Split into batches of 30 items
  const batchSize = 30;
  for (let i = 0; i < toTranslate.length; i += batchSize) {
    const chunk = toTranslate.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(toTranslate.length / batchSize)}...`);

    const inputData = chunk.map(item => ({ id: item.id, name: item.name }));
    const prompt = `You are a professional translator. Translate this list of laundry items into natural and accurate Thai.
Input list:
${JSON.stringify(inputData)}

Guidelines:
1. Keep sizes like "3.5FT", "5.0FT", "6.0FT" as they are (e.g. "ปลอกหมอนข้าง", "ผ้าปูที่นอน (5.0FT Queen)").
2. Provide natural Thai descriptions (e.g., "Pillow Case" -> "ปลอกหมอน", "Duvet Cover" -> "ปลอกผ้านวม", "Bed Sheets" -> "ผ้าปูที่นอน", "Bolster" -> "หมอนข้าง").
3. Make sure the translation is professional and matches standard hospitality and luxury laundry terminology in Thailand.

Your response must be a single RAW JSON array of objects, with no markdown code block formatting (no \`\`\`json wrappers), matching this schema:
[
  { "id": "<id>", "name_th": "<thai_translation>" }
]`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const results = JSON.parse(response.text);
      console.log(`Got ${results.length} translations back from Gemini.`);

      // Update in DB
      for (const res of results) {
        await prisma.pricing.update({
          where: { id: res.id },
          data: { name_th: res.name_th }
        });
      }
      console.log(`Updated ${results.length} records in DB.`);
    } catch (error) {
      console.error("Failed to translate batch:", error);
    }
  }

  console.log("Pricing translation finished!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
