import prisma from "./prisma.js";

// Curated comprehensive bank of unique, verified 200 OK Unsplash photos & local assets
export const ALL_VERIFIED_IMAGES = [
  // Laundry / Laundromat / Wash
  "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80",

  // Ironing & Steaming
  "https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",

  // Suits & Formal Wear
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1490114538077-ac7f12197194?auto=format&fit=crop&w=800&q=80",

  // Wedding Dresses & Evening Wear
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",

  // Silk, Lace & Delicates
  "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80",

  // Wool & Cashmere
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",

  // Sheets, Bedding & Linens
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",

  // Stains & Specialized Care
  "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",

  // Eco Laundry & Green Solvents
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",

  // Carpets & Upholstery
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",

  // Wardrobe & Luxury Boutique Garments
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80",

  // Local assets (also unique)
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

// Curated dictionary categorized by laundry topic
export const CATEGORIZED_IMAGES = {
  wedding: [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
  ],
  suit: [
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1490114538077-ac7f12197194?auto=format&fit=crop&w=800&q=80"
  ],
  silk: [
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80"
  ],
  wool: [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
  ],
  sheets: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
  ],
  stain: [
    "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80"
  ],
  eco: [
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80"
  ],
  carpet: [
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80"
  ],
  iron: [
    "https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80"
  ],
  lace: [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
  ],
  laundry: [
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80"
  ]
};

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
  
  return CATEGORIZED_IMAGES.laundry;
}

/**
 * Retrieves all image URLs currently in use across all database articles
 * @param {string} excludeArticleId Optional article ID to ignore (useful when updating)
 * @returns {Promise<Set<string>>} Set of used image URLs
 */
export async function getAllUsedImages(excludeArticleId = null) {
  try {
    const articles = await prisma.article.findMany({
      where: excludeArticleId ? { id: { not: excludeArticleId } } : undefined,
      select: { content: true, content_th: true }
    });

    const usedImages = new Set();
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;

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
    return usedImages;
  } catch (error) {
    console.error("Error retrieving used images:", error);
    return new Set();
  }
}

/**
 * Retrieves a set of STRICTLY UNIQUE laundry images that have never been used in any article.
 *
 * @param {number} count Number of images to return
 * @param {string} keyword Keyword/topic of the article
 * @returns {Promise<string[]>} Array of strictly unique image URLs
 */
export async function getUniqueLaundryImages(count = 3, keyword = "") {
  try {
    const usedImages = await getAllUsedImages();
    const candidatePool = getImagesByKeyword(keyword);

    // 1. First priority: unused images from the topic's candidate pool
    const unusedTopicCandidates = candidatePool.filter(img => !usedImages.has(img));
    const shuffledTopic = unusedTopicCandidates.sort(() => 0.5 - Math.random());
    const result = [...shuffledTopic.slice(0, count)];

    // 2. Second priority: unused images from the global verified pool
    if (result.length < count) {
      const unusedGlobal = ALL_VERIFIED_IMAGES.filter(img => !usedImages.has(img) && !result.includes(img));
      const shuffledGlobal = unusedGlobal.sort(() => 0.5 - Math.random());
      while (result.length < count && shuffledGlobal.length > 0) {
        result.push(shuffledGlobal.pop());
      }
    }

    // 3. Third priority: unused legacy local assets
    if (result.length < count) {
      const unusedLegacy = LEGACY_IMAGES.filter(img => !usedImages.has(img) && !result.includes(img));
      const shuffledLegacy = unusedLegacy.sort(() => 0.5 - Math.random());
      while (result.length < count && shuffledLegacy.length > 0) {
        result.push(shuffledLegacy.pop());
      }
    }

    return result;
  } catch (error) {
    console.error("Error picking strictly unique images:", error);
    // Absolute fallback: return distinct items from candidate pool
    return [...new Set(getImagesByKeyword(keyword))].slice(0, count);
  }
}
