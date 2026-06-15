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
  const storyFilePath = path.join(__dirname, '../src/components/StoryContent.js');
  const targetFilePath = path.join(__dirname, '../src/components/StoryContentTh.js');

  console.log(`Reading English story from: ${storyFilePath}`);
  const englishCode = fs.readFileSync(storyFilePath, 'utf8');

  console.log("Translating story to Thai using Gemini...");
  const prompt = `You are an expert bilingual translator specialized in English and Thai localization.
I will give you the React component file (in JavaScript) containing the English "Our Story" page content for a luxury laundry service.

Translate all visible user-facing text, chapter titles, button labels, and paragraph contents into natural, elegant, upscale, and contextually accurate Thai.

Rules:
1. Do NOT touch any React syntax, imports, exports, states (like \`isExpanded\`, \`setIsExpanded\`), Tailwind CSS classes, or inline styles.
2. Translate only the literal string contents inside tags (e.g. <h2>Chapter 1: The Genesis of That Laundry Shop</h2> -> <h2>บทที่ 1: จุดเริ่มต้นของ That Laundry Shop</h2>).
3. Do NOT translate the brand name "That Laundry Shop". Keep it exactly as "That Laundry Shop" in English.
4. Keep the drop cap styling intact (the first letter of Chapter 1 has a <span> wrapper; translate the rest of the word correctly).
5. Rename the component function from \`StoryContent\` to \`StoryContentTh\` inside the code.
6. Return only the RAW JavaScript code matching the target component, with no markdown code blocks (no \`\`\`js or \`\`\`jsx wrappers), and no other comments or text outside the code.

Here is the source English code:
${englishCode}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // We do not specify application/json here since we want raw JS code text.
      }
    });

    let thaiCode = response.text.trim();
    
    // Strip markdown code block wrappers if the model still generated them
    if (thaiCode.startsWith("```")) {
      thaiCode = thaiCode.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
    }

    console.log(`Writing translated Thai story to: ${targetFilePath}`);
    fs.writeFileSync(targetFilePath, thaiCode, 'utf8');
    console.log("Story translation completed successfully!");
  } catch (error) {
    console.error("Failed to translate story:", error);
    process.exit(1);
  }
}

main();
