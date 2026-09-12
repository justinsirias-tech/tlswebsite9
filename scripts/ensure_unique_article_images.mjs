import { pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';

// Load .env.local and .env
for (const envFile of ['.env.local', '.env']) {
  const fullPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[2] || '';
        val = val.replace(/^['"]|['"]$/g, '').trim();
        if (!process.env[match[1]]) {
          process.env[match[1]] = val;
        }
      }
    }
  }
}

async function runMigration() {
  const prismaUrl = pathToFileURL(path.join(process.cwd(), "src/lib/prisma.js")).href;
  const imagePickerUrl = pathToFileURL(path.join(process.cwd(), "src/lib/imagePicker.js")).href;
  
  const { default: prisma } = await import(prismaUrl);
  const { ALL_VERIFIED_IMAGES, getImagesByKeyword } = await import(imagePickerUrl);

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "asc" }
  });

  console.log(`Found ${articles.length} articles to assign strictly unique images to.`);

  const assignedImages = new Set();
  const availableGlobalPool = [...ALL_VERIFIED_IMAGES];

  // Helper to get an unused image
  const pickUnusedImage = (keyword = "") => {
    // 1. Try topic candidates
    if (keyword) {
      const topicCandidates = getImagesByKeyword(keyword);
      for (const img of topicCandidates) {
        if (!assignedImages.has(img)) {
          assignedImages.add(img);
          return img;
        }
      }
    }
    // 2. Try global pool
    for (let i = 0; i < availableGlobalPool.length; i++) {
      const img = availableGlobalPool[i];
      if (!assignedImages.has(img)) {
        assignedImages.add(img);
        return img;
      }
    }
    throw new Error("Exhausted all unique images in the pool!");
  };

  for (const article of articles) {
    const titleLower = (article.title || '').toLowerCase();
    
    // Find all <img ...> tags in article.content
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const matches = [...(article.content || '').matchAll(imgTagRegex)];

    console.log(`Article "${article.title}" has ${matches.length} images.`);
    let newContent = article.content || '';

    // Replace each image tag with a unique image
    for (const match of matches) {
      const fullImgTag = match[0];
      const oldSrc = match[1];
      const uniqueNewSrc = pickUnusedImage(titleLower);

      // Replace this specific occurrence of the old image tag
      const updatedTag = fullImgTag.replace(oldSrc, uniqueNewSrc);
      newContent = newContent.replace(fullImgTag, updatedTag);
    }

    // Also check content_th if present
    let newContentTh = article.content_th;
    if (newContentTh) {
      const matchesTh = [...newContentTh.matchAll(imgTagRegex)];
      for (const match of matchesTh) {
        const fullImgTag = match[0];
        const oldSrc = match[1];
        // If content already had an image, use the corresponding one or pick unique
        const uniqueNewSrc = pickUnusedImage(titleLower);
        const updatedTag = fullImgTag.replace(oldSrc, uniqueNewSrc);
        newContentTh = newContentTh.replace(fullImgTag, updatedTag);
      }
    }

    await prisma.article.update({
      where: { id: article.id },
      data: {
        content: newContent,
        content_th: newContentTh || null
      }
    });
  }

  console.log(`\nVerification: Assigned ${assignedImages.size} completely unique images across ${articles.length} articles.`);
  
  // Double-check no duplicates across the whole DB
  const verifyArticles = await prisma.article.findMany({ select: { id: true, title: true, content: true } });
  const allImages = [];
  const articleThumbnails = new Map();

  for (const art of verifyArticles) {
    const imagesInArticle = [...(art.content || '').matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    articleThumbnails.set(art.id, { title: art.title, thumbnail: imagesInArticle[0] });
    allImages.push(...imagesInArticle);
  }

  console.log(`Total images in DB: ${allImages.length}`);
  const uniqueCount = new Set(allImages).size;
  console.log(`Unique images in DB: ${uniqueCount}`);

  if (allImages.length === uniqueCount) {
    console.log("SUCCESS: ZERO REPEATED IMAGES! Every single image is 100% unique!");
  } else {
    console.error(`WARNING: Found ${allImages.length - uniqueCount} duplicate image references!`);
  }

  console.log("\nArticle Thumbnails:");
  for (const [id, info] of articleThumbnails.entries()) {
    console.log(`- [${info.title.substring(0, 45)}...]: ${info.thumbnail}`);
  }
}

runMigration().catch(console.error).finally(() => process.exit(0));
