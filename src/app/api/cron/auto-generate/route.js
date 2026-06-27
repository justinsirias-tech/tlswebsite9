import { NextResponse, after } from "next/server";
import prisma from "../../../../lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getUniqueLaundryImages } from "../../../../lib/imagePicker";

export const maxDuration = 60; // Allow up to 60 seconds execution time on Vercel (Hobby limit)

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
      return NextResponse.json({ success: true, message: "Queue is empty. No articles generated." });
    }

    // Mark as PROCESSING immediately to prevent concurrent requests from picking it up
    await prisma.keywordQueue.update({
      where: { id: nextKeyword.id },
      data: { status: "PROCESSING" }
    });

    // Schedule generation to run asynchronously after response is returned
    after(async () => {
      try {
        const images = await getUniqueLaundryImages(3);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an expert SEO content writer for a luxury laundry service in Thailand called "That Laundry Shop".
        I want you to write a massive, highly-detailed, SEO-optimized article based on the following topic: "${nextKeyword.keyword}".
        
        CRITICAL INSTRUCTIONS:
        1. The article MUST be at least 2,000 words long. This is a strict requirement. Expand deeply on fabric science, environmental impact, convenience, luxury lifestyle, the climate in Thailand, and the importance of professional care.
        2. Format the output ENTIRELY in valid HTML (using <h2>, <h3>, <p>, <ul>, <li>, <strong>). Do not include <html>, <head>, or <body> tags. Just the raw HTML content.
        3. **Images**: You MUST embed exactly 3 images throughout the article. Use these EXACT 3 image URLs in order:
           - Image 1: <img src="${images[0]}" alt="Laundry and garment care" style="width:100%; border-radius:12px; margin: 2rem 0;" />
           - Image 2: <img src="${images[1]}" alt="Luxury clothing care" style="width:100%; border-radius:12px; margin: 2rem 0;" />
           - Image 3: <img src="${images[2]}" alt="Premium laundry service" style="width:100%; border-radius:12px; margin: 2rem 0;" />
           Ensure all 3 are embedded inside the article where contextually appropriate. Do not repeat any image URL.
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
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const generatedData = JSON.parse(response.text);

        await prisma.article.create({
          data: {
            title: generatedData.title,
            content: generatedData.content
          }
        });

        await prisma.keywordQueue.update({
          where: { id: nextKeyword.id },
          data: { status: "PROCESSED" }
        });

        console.log(`Successfully generated article for keyword: "${nextKeyword.keyword}"`);
      } catch (backgroundError) {
        console.error(`Background generation failed for keyword: "${nextKeyword.keyword}":`, backgroundError);
        // Revert keyword status to FAILED
        await prisma.keywordQueue.update({
          where: { id: nextKeyword.id },
          data: { status: "FAILED" }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Generation started for keyword: "${nextKeyword.keyword}". Content will be available in about 30 seconds.`
    });

  } catch (error) {
    console.error("Cron GET Request Error:", error);
    return NextResponse.json({ error: "Failed to initiate cron generation", details: error.message }, { status: 500 });
  }
}

