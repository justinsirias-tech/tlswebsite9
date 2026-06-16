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

  try {
    const { name, city, type } = await request.json();

    if (!name || !city || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an expert SEO content writer and data researcher for a luxury laundry service called "That Laundry Shop".
    I am giving you a location: Name: "${name}", City: "${city}", Type: "${type}".
    
    Research this location and return a RAW JSON object with the following keys EXACTLY:
    {
      "stars": <integer between 1 and 5>,
      "totalRooms": <estimated integer of total rooms/units>,
      "averagePrice": "<string, e.g. '฿3,500 / night' or '฿25,000 / month'>",
      "transport": "<string, nearest BTS/MRT or transport detail>",
      "nearbyAmenities": "<string, comma separated, e.g. 'Terminal 21, 7-Eleven'>",
      "article": "<string, containing a massive, comprehensive SEO article of AT LEAST 2,000 words in HTML format (using <h2>, <h3>, <p>, <ul>, <li>, <strong>)>"
    }
    
    CRITICAL INSTRUCTION FOR THE ARTICLE:
    The article MUST be AT LEAST 2,000 words long. This is extremely important for SEO. You must deeply expand on the following concepts to reach the word count:
    1. A detailed, glowing review of the location (${name}), its architecture, luxury amenities, and what makes it special in ${city}.
    2. A comprehensive guide to the surrounding neighborhood, tourist attractions, business hubs, and lifestyle in ${city}.
    3. The absolute necessity of premium garment care for guests staying at ${name}, whether for business meetings, high-end dinners, or humid weather.
    4. Why "that laundry shop" is the ONLY choice for luxury laundry and dry cleaning. Detail our door-to-door pickup and delivery directly to the room/lobby.
    5. A deep dive into our advanced, eco-friendly dry cleaning solvents, expert stain removal techniques, and meticulous hand-pressing.
    
    KEYWORD REQUIREMENTS (MANDATORY):
    You MUST naturally include the following exact match keywords multiple times throughout the 2,000 words for SEO purposes:
    - "that laundry shop"
    - "laundry service"
    - "dry cleaning"
    
    Use the following text as a structural sample and tone reference, but EXPAND IT MASSIVELY to reach the 2,000-word requirement:
    "Welcome to ${name}
    An oasis of luxury in the vibrant heart of ${city}, ${name} offers guests an unforgettable experience. From world-class dining to stunning architecture and exceptional service, every detail of your stay is designed to be spectacular. While you spend your days exploring nearby attractions, allow us to take care of the essentials.
    That Laundry Shop is proud to partner with discerning guests staying at ${name} to provide unparalleled garment care. Whether you need a simple laundry service or specialized dry cleaning, we ensure you always look your absolute best without lifting a finger.
    Ultimate Convenience: Direct Pickup & Delivery
    Your time in ${city} is incredibly valuable... That is why we offer a seamless, white-glove pickup and delivery laundry service directly to your hotel room. Simply schedule a pickup, and our professional concierge will arrive at the lobby of ${name} to collect your garments. Within hours, your clothes will be returned to you—fresh, perfectly pressed, and meticulously packaged.
    The Final Touch: Why Luxury Guests Choose Us
    When staying at a premium establishment like ${name}, you expect nothing less than perfection. That Laundry Shop meets those exacting standards through our commitment to premium fabric care.
    Advanced Dry Cleaning Solvents: We use gentle, eco-friendly cleaning agents that protect delicate fabrics, keeping your designer garments looking brand new.
    Expert Stain Removal: Our technicians are highly trained in identifying and safely removing stubborn stains without damaging fibers.
    Meticulous Pressing: Every item is hand-finished and pressed to perfection by our experienced team.
    English-Speaking Concierge: We provide seamless, clear communication from the moment you book our laundry service until your clothes are delivered back to ${name}.
    Experience the luxury of professionally cleaned clothes without ever leaving the comfort of ${name}. Book your dry cleaning and laundry service pickup today and let us add the perfect finishing touch to your stay in ${city}."
    
    IMPORTANT: Output ONLY valid JSON. No markdown formatting outside the JSON, no backticks enclosing the JSON response, no comments. Ensure the "article" value is a single valid JSON string containing the HTML.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    const jsonResult = JSON.parse(responseText);

    return NextResponse.json(jsonResult, { status: 200 });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate article" }, { status: 500 });
  }
}
