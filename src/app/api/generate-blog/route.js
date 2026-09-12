import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";
import { getUniqueLaundryImages } from "@/lib/imagePicker";
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

// Robust content extractor supporting Delimiters, JSON, and Markdown
function extractTitleAndContent(text, defaultTopic, images) {
  if (!text || typeof text !== "string") return null;

  // 1. Check for Delimiter format
  if (text.includes("---TITLE---") && text.includes("---CONTENT---")) {
    const parts = text.split("---CONTENT---");
    const title = parts[0].replace("---TITLE---", "").replace(/["#*]/g, "").trim();
    const content = parts[1].trim();
    if (title && content) return { title, content };
  }

  // 2. Try JSON parse
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.title && parsed.content) {
      return { title: parsed.title, content: parsed.content };
    }
  } catch (e) {
    // 3. Fallback regex extraction from JSON
    const titleMatch = text.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const contentMatch = text.match(/"content"\s*:\s*"([\s\S]*)"\s*\}?$/);
    if (titleMatch && contentMatch) {
      return {
        title: titleMatch[1].replace(/\\"/g, '"').trim(),
        content: contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim()
      };
    }
  }

  // 4. Line-based extraction if model returned raw markdown/HTML
  const lines = text.trim().split("\n");
  if (lines.length > 2) {
    const title = lines[0].replace(/^[#\s*"]+/, "").replace(/["*]+$/, "").trim();
    const content = lines.slice(1).join("\n").trim();
    if (title.length > 5 && content.length > 50) {
      return { title, content };
    }
  }

  return null;
}

// Resilient Bespoke Article Generator as instant fallback
function generateBespokeArticle(topic, images) {
  const formattedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  const title = `${formattedTopic}: The Ultimate Guide to Luxury Garment Care & Laundry in Thailand`;

  const content = `<h2>${formattedTopic}: Elevating Garment Care to an Art Form</h2>
<p>In modern cosmopolitan Thailand, where professional presentation, high fashion, and demanding daily schedules intersect with a warm tropical climate, garment care is far more than a simple chore—it is an indispensable lifestyle necessity. Discerning residents, expatriates, and travelers in Bangkok and Pattaya understand that maintaining fine fabrics, silks, and designer wardrobes requires specialized expertise, sophisticated technology, and unwavering attention to detail.</p>
<p>At <a href="/about">That Laundry Shop</a>, we have redefined laundry and dry cleaning into a white-glove luxury experience. Combining eco-friendly cleaning methods with door-to-door convenience, our mission is to ensure that your wardrobe remains impeccably fresh, crisp, and revitalized.</p>

<img src="${images[0]}" alt="Luxury laundry and garment care at That Laundry Shop" style="width:100%; border-radius:12px; margin: 2rem 0;" />

<h2>Why Professional Garment Care Matters in Thailand's Climate</h2>
<p>Thailand's tropical weather presents unique challenges for clothing. Elevated humidity and warm temperatures cause delicate textiles—such as organic cotton, linen, silk, and wool blends—to absorb perspiration and airborne particles more rapidly. When cleaned using improper household laundry machines or harsh supermarket detergents, fibers degrade prematurely, colors fade, and fabric integrity is compromised.</p>
<p>According to <a href="https://en.wikipedia.org/wiki/Dry_cleaning">garment care research</a>, professional dry cleaning dissolves oils and grease that water cannot penetrate, safeguarding natural textures. Our team at <strong>that laundry shop</strong> utilizes advanced temperature-regulated washing and customized treatment cycles designed specifically to combat tropical humidity while preserving the soft, luxurious drape of high-end garments.</p>

<h2>The That Laundry Shop Standard: White-Glove Convenience</h2>
<p>Navigating city traffic or finding time between business meetings to visit a laundromat should never take priority over what matters most. That is why our <a href="/services">premium laundry services</a> are engineered around seamless convenience:</p>
<ul>
    <li><strong>Complimentary Doorstep Pickup & Delivery:</strong> Our courteous drivers collect your laundry directly from your condominium concierge, hotel reception, or residence in Bangkok and Pattaya.</li>
    <li><strong>24-Hour Express Turnaround:</strong> Need your tailored suits, linen shirts, or evening gowns ready for tomorrow's dinner? Our express service guarantees rapid, meticulous delivery.</li>
    <li><strong>Eco-Friendly Solvents:</strong> We utilize non-toxic, hypoallergenic cleaning agents that are exceptionally gentle on sensitive skin and safe for our planet.</li>
    <li><strong>Artisanal Hand-Pressing:</strong> Every dress shirt, trouser, and dress is hand-finished by seasoned pressing specialists to achieve crisp, flawless creases.</li>
</ul>

<img src="${images[1]}" alt="Expert dry cleaning and steam pressing" style="width:100%; border-radius:12px; margin: 2rem 0;" />

<h2>Comprehensive Fabric Science and Specialized Treatment</h2>
<p>Not all garments are created equal. An Italian wool blazer requires drastically different chemistry and mechanical action compared to a delicate silk blouse or everyday athletic apparel. At <strong>that laundry shop</strong>, every piece undergoes a multi-point inspection:</p>
<ol>
    <li><strong>Detailed Fiber & Stain Assessment:</strong> We inspect collars, cuffs, and hemlines under specialized lighting to identify spot treatments before cleaning.</li>
    <li><strong>Custom Solvent Calibration:</strong> Premium dry cleaning solutions protect dyes and prevent shrinkage.</li>
    <li><strong>Hygienic Sanitization:</strong> Our ozone and steam processes eliminate 99.9% of bacteria and allergens without heat damage.</li>
</ol>
<p>Whether you need bulk wash & fold by the kilo for daily essentials or individual piece pricing for bespoke couture, our transparent <a href="/pricing">pricing menu</a> delivers unrivaled value.</p>

<img src="${images[2]}" alt="Premium laundry service delivery in Bangkok and Pattaya" style="width:100%; border-radius:12px; margin: 2rem 0;" />

<h2>Experience the Future of Luxury Garment Care</h2>
<p>Your wardrobe represents an investment in your personal style and professional confidence. Trusting it to <strong>that laundry shop</strong> means enjoying the peace of mind that comes with museum-quality care and five-star service.</p>
<p>Schedule your first pickup today through our simple online platform, and discover how easy effortless, pristine laundry care can be in Thailand.</p>`;

  return { title, content };
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const cleanTopic = topic.trim();
    const images = await getUniqueLaundryImages(3, cleanTopic);

    // Attempt Gemini AI generation with fallback models
    let generatedData = null;

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert SEO content writer for a luxury laundry service in Thailand called "That Laundry Shop".
Write a comprehensive, highly-detailed, SEO-optimized article based on the following topic: "${cleanTopic}".

CRITICAL INSTRUCTIONS:
1. The article MUST be at least 1,500 to 2,000 words long. Expand deeply on fabric science, environmental impact, convenience, luxury lifestyle, climate in Thailand, and professional garment care.
2. Format the output entirely in valid HTML (using <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>). Do not include <html>, <head>, or <body> tags.
3. IMAGES (MANDATORY): You MUST embed these EXACT 3 image tags across the article body:
   - Image 1: <img src="${images[0]}" alt="Luxury laundry and garment care" style="width:100%; border-radius:12px; margin: 2rem 0;" />
   - Image 2: <img src="${images[1]}" alt="Expert dry cleaning and steam pressing" style="width:100%; border-radius:12px; margin: 2rem 0;" />
   - Image 3: <img src="${images[2]}" alt="Premium laundry service in Thailand" style="width:100%; border-radius:12px; margin: 2rem 0;" />
4. INTERNAL LINKS: You MUST include at least 3 internal links inside paragraph text using <a> tags to: "/services", "/pricing", and "/about".
5. EXTERNAL LINKS: Include at least 2 authoritative external links (e.g. <a href="https://en.wikipedia.org/wiki/Dry_cleaning">history of dry cleaning</a>).
6. KEYWORDS: Naturally include: "that laundry shop", "premium dry cleaning", "luxury garment care".

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS WITH DELIMITERS:
---TITLE---
[Catchy SEO title for the article]
---CONTENT---
[The complete HTML article content]`;

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              temperature: 0.7,
            }
          });

          const responseText = response.text;
          const parsed = extractTitleAndContent(responseText, cleanTopic, images);
          if (parsed && parsed.title && parsed.content && parsed.content.length > 200) {
            generatedData = parsed;
            break;
          }
        } catch (modelErr) {
          console.warn(`Model ${modelName} failed for topic "${cleanTopic}":`, modelErr?.message || modelErr);
        }
      }
    }

    // If Gemini was unreachable, rate-limited, or errored, use luxury bespoke generator
    if (!generatedData) {
      console.log(`Using bespoke article generator fallback for "${cleanTopic}"`);
      generatedData = generateBespokeArticle(cleanTopic, images);
    }

    return NextResponse.json(generatedData, { status: 200 });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate article: " + (error?.message || "Unknown error") }, { status: 500 });
  }
}
