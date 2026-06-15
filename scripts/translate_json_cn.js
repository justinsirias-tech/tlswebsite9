const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function main() {
  const sourceFilePath = path.join(__dirname, '../messages/en.json');
  const targetFilePath = path.join(__dirname, '../messages/cn.json');

  console.log(`Reading English messages from: ${sourceFilePath}`);
  const enJsonContent = fs.readFileSync(sourceFilePath, 'utf8');

  console.log("Translating messages to Simplified Chinese using Gemini...");
  const prompt = `You are a professional bilingual translator specialized in localized websites.
Translate the following JSON object's values from English to Simplified Chinese (zh-CN).

Rules:
1. Do NOT translate any of the JSON keys. Keep all keys exactly as they are.
2. Translate all string values into natural, elegant, upscale, and contextually accurate Simplified Chinese.
3. Do NOT translate the brand name "That Laundry Shop". Keep it exactly as "That Laundry Shop" in English.
4. Keep all variable placeholders and tokens completely intact, such as {phone}, {bonus}, {name}, {query}, <phone>, </phone>, ★, etc.
5. Return only a valid JSON object matching the input structure.

Input JSON:
${enJsonContent}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const zhContent = response.text.trim();
    
    // Verify it is valid JSON
    JSON.parse(zhContent);

    console.log(`Writing translated Mandarin messages to: ${targetFilePath}`);
    fs.writeFileSync(targetFilePath, zhContent, 'utf8');
    console.log("Translation completed successfully!");
  } catch (error) {
    console.error("Failed to translate messages:", error);
    process.exit(1);
  }
}

main();
