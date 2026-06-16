import prisma from "./prisma";

// Curated list of high-quality, laundry and garment-care-related Unsplash images
export const LAUNDRY_IMAGES = [
  "https://images.unsplash.com/photo-1545173168-9f1947eebd01?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1580256081112-e49377338b7f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1610555356070-d0efb6505f4a?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1528224262916-22a21b44ec2f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1585421514738-ee1a3e2052b5?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1603796846097-bee99e4a60c9?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1563170351-be82c888d444?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop&q=60"
];

/**
 * Retrieves a set of unique laundry images that are not currently embedded in any database article content.
 * Falls back to shuffling the full list if the pool of unused images is depleted.
 *
 * @param {number} count Number of images to return
 * @returns {Promise<string[]>} Array of image URLs
 */
export async function getUniqueLaundryImages(count = 3) {
  try {
    // 1. Fetch existing articles to extract embedded image URLs
    const articles = await prisma.article.findMany({
      select: { content: true, content_th: true }
    });

    const usedImages = new Set();
    const imgRegex = /<img[^>]+src="([^">]+)"/g;

    for (const art of articles) {
      let match;
      if (art.content) {
        // Reset regex index
        imgRegex.lastIndex = 0;
        while ((match = imgRegex.exec(art.content)) !== null) {
          usedImages.add(match[1]);
        }
      }
      if (art.content_th) {
        // Reset regex index
        imgRegex.lastIndex = 0;
        while ((match = imgRegex.exec(art.content_th)) !== null) {
          usedImages.add(match[1]);
        }
      }
    }

    // 2. Filter out used images
    let available = LAUNDRY_IMAGES.filter(img => !usedImages.has(img));

    // If there aren't enough unique images left, reuse the full list
    if (available.length < count) {
      available = [...LAUNDRY_IMAGES];
    }

    // 3. Shuffle the list
    const shuffled = available.sort(() => 0.5 - Math.random());

    // 4. Return the requested number of images
    return shuffled.slice(0, count);
  } catch (error) {
    console.error("Error picking unique images:", error);
    // Fallback to random images from the main list
    return [...LAUNDRY_IMAGES].sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
