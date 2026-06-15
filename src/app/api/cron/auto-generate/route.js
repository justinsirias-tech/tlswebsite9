import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { GoogleGenAI } from "@google/genai";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'TLS2026') {
    return NextResponse.json({ error: "Unauthorized cron access" }, { status: 401 });
  }

  try {
    const nextKeyword = await prisma.keywordQueue.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" }
    });

    if (!nextKeyword) {
      return NextResponse.json({ message: "Queue is empty. No articles generated." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an expert SEO content writer for a luxury laundry service in Thailand called "That Laundry Shop".
    I want you to write a massive, highly-detailed, SEO-optimized article based on the following topic: "${nextKeyword.keyword}".
    
    CRITICAL INSTRUCTIONS:
    1. The article MUST be at least 2,000 words long. This is a strict requirement. Expand deeply on fabric science, environmental impact, convenience, luxury lifestyle, the climate in Thailand, and the importance of professional care.
    2. Format the output ENTIRELY in valid HTML (using <h2>, <h3>, <p>, <ul>, <li>, <strong>). Do not include <html>, <head>, or <body> tags. Just the raw HTML content.
    3. **Images**: You MUST embed exactly 3 images throughout the article. Use this exact format: <img src="https://loremflickr.com/800/400/laundry,garment,clothing?random=1" alt="Laundry and garment care" style="width:100%; border-radius:12px; margin: 2rem 0;" />. (Increment the random=1, 2, 3 for each image). This ensures the images are strictly laundry related.
    4. **Internal Sitelinks**: You MUST strategically embed at least 3 internal links inside paragraph text using <a> tags pointing to: "/services", "/pricing", and "/about". Example: <a href="/services">our premium dry cleaning services</a>.
    5. **External Backlinks**: You MUST include at least 2 external links to authoritative sources inside paragraph text (e.g., <a href="https://en.wikipedia.org/wiki/Dry_cleaning">the history of dry cleaning</a>).
    6. **Keywords**: You must naturally include these exact keywords multiple times: "that laundry shop", "premium dry cleaning", "luxury garment care".
    7. Provide a catchy, SEO-friendly "title" for the article.
    
    FAILURE TO INCLUDE THE <a> TAGS FOR SITELINKS AND BACKLINKS WILL INVALIDATE THE RESPONSE. YOU MUST INCLUDE THEM.
    
    Return a RAW JSON object with the following keys EXACTLY:
    {
      "title": "<The title of the article>",
      "content": "<The massive 2,000+ word HTML content>"
    }
    
    IMPORTANT: Output ONLY valid JSON. No markdown formatting outside the JSON, no backticks enclosing the JSON response.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const generatedData = JSON.parse(response.text);

    const article = await prisma.article.create({
      data: {
        title: generatedData.title,
        content: generatedData.content
      }
    });

    await prisma.keywordQueue.update({
      where: { id: nextKeyword.id },
      data: { status: "PROCESSED" }
    });

    return NextResponse.json({ success: true, articleTitle: article.title, keywordProcessed: nextKeyword.keyword });

  } catch (error) {
    console.error("Cron Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate article from queue", details: error.message }, { status: 500 });
  }
}
