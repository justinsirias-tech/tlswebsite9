import prisma from "./prisma";

// Curated dictionary of high-quality, professional Unsplash photos categorized by laundry topic
export const CATEGORIZED_IMAGES = {
  wedding: [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
  ],
  suit: [
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80"
  ],
  silk: [
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615214072943-7f72411db285?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520638029027-6240677778dd?auto=format&fit=crop&w=800&q=80"
  ],
  wool: [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80"
  ],
  sheets: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"
  ],
  stain: [
    "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
  ],
  eco: [
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507560461415-997ced01da67?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80"
  ],
  carpet: [
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
  ],
  iron: [
    "https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1585250486008-dbcc2283e1fa?auto=format&fit=crop&w=800&q=80"
  ],
  lace: [
    "https://images.unsplash.com/photo-1520638029027-6240677778dd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615214072943-7f72411db285?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
  ],
  laundry: [
    "https://images.unsplash.com/photo-1545173168-9f1947eebd01?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80"
  ]
};

// Fallback legacy local assets list
export const LEGACY_IMAGES = [
  "/assets/wash_and_fold.webp",
  "/assets/dry_clean.webp",
  "/assets/service_ironing.webp",
  "/assets/about_artisans.webp",
  "/assets/staff_laundry.webp",
  "/assets/story_delivery.webp",
  "/assets/story_eco.webp",
  "/assets/story_hospitality.webp",
  "/assets/service_carpet.webp",
  "/assets/service_commercial.webp",
  "/assets/service_corporate.webp",
  "/assets/service_fb.webp",
  "/assets/service_hotel.webp",
  "/assets/hero_laundry.webp"
];

/**
 * Returns a list of image URLs matching the keyword topic
 * @param {string} keyword The topic keyword
 * @returns {string[]} Matching image URLs
 */
export function getImagesByKeyword(keyword = "") {
  const kw = keyword.toLowerCase();
  
  if (kw.includes("wedding") || kw.includes("gown") || kw.includes("bride")) {
    return CATEGORIZED_IMAGES.wedding;
  }
  if (kw.includes("suit") || kw.includes("tuxedo") || kw.includes("formal") || kw.includes("jacket")) {
    return CATEGORIZED_IMAGES.suit;
  }
  if (kw.includes("lace")) {
    return CATEGORIZED_IMAGES.lace;
  }
  if (kw.includes("silk") || kw.includes("satin")) {
    return CATEGORIZED_IMAGES.silk;
  }
  if (kw.includes("wool") || kw.includes("sweater") || kw.includes("shrink") || kw.includes("knit")) {
    return CATEGORIZED_IMAGES.wool;
  }
  if (kw.includes("sheet") || kw.includes("bedding") || kw.includes("comforter") || kw.includes("duvet") || kw.includes("pillow") || kw.includes("linen")) {
    return CATEGORIZED_IMAGES.sheets;
  }
  if (kw.includes("stain") || kw.includes("dirty") || kw.includes("spill") || kw.includes("wine") || kw.includes("coffee")) {
    return CATEGORIZED_IMAGES.stain;
  }
  if (kw.includes("eco") || kw.includes("environment") || kw.includes("green") || kw.includes("detergent") || kw.includes("sensitive")) {
    return CATEGORIZED_IMAGES.eco;
  }
  if (kw.includes("carpet") || kw.includes("rug") || kw.includes("sofa") || kw.includes("curtain") || kw.includes("upholstery")) {
    return CATEGORIZED_IMAGES.carpet;
  }
  if (kw.includes("iron") || kw.includes("steam") || kw.includes("press") || kw.includes("wrinkle")) {
    return CATEGORIZED_IMAGES.iron;
  }
  
  // Fall back to general laundry images
  return CATEGORIZED_IMAGES.laundry;
}

/**
 * Retrieves a set of unique laundry images that match the keyword topic
 *
 * @param {number} count Number of images to return
 * @param {string} keyword Keyword/topic of the article to base selection on
 * @returns {Promise<string[]>} Array of image URLs
 */
export async function getUniqueLaundryImages(count = 3, keyword = "") {
  try {
    const candidatePool = getImagesByKeyword(keyword);
    
    // Fetch existing articles to extract embedded image URLs
    const articles = await prisma.article.findMany({
      select: { content: true, content_th: true }
    });

    const usedImages = new Set();
    const imgRegex = /<img[^>]+src="([^">]+)"/g;

    for (const art of articles) {
      let match;
      if (art.content) {
        imgRegex.lastIndex = 0;
        while ((match = imgRegex.exec(art.content)) !== null) {
          usedImages.add(match[1]);
        }
      }
      if (art.content_th) {
        imgRegex.lastIndex = 0;
        while ((match = imgRegex.exec(art.content_th)) !== null) {
          usedImages.add(match[1]);
        }
      }
    }

    // Filter out used images
    let available = candidatePool.filter(img => !usedImages.has(img));

    // If there aren't enough unique images left, reuse the full list of candidates
    if (available.length < count) {
      available = [...candidatePool];
    }

    // Shuffle the list
    const shuffled = available.sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, count);

    // Ensure we always return exactly `count` items, fall back to general laundry/legacy images if result.length < count
    while (result.length < count) {
      const fallbackList = [...CATEGORIZED_IMAGES.laundry, ...LEGACY_IMAGES];
      const fallbackItem = fallbackList[Math.floor(Math.random() * fallbackList.length)];
      if (!result.includes(fallbackItem)) {
        result.push(fallbackItem);
      }
    }

    return result;
  } catch (error) {
    console.error("Error picking unique images:", error);
    // Fallback to random images from the matching candidate list
    return getImagesByKeyword(keyword).sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
