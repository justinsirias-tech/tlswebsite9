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

const URL_REPLACEMENTS = {
  // Broken laundry image -> replacement verified 200 laundry basket
  'https://images.unsplash.com/photo-1545173168-9f1947eebd01?auto=format&fit=crop&w=800&q=80':
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-15451731689f1947eebd01?auto=format&fit=crop&w=800&q=80':
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
  // Broken silk/lace images
  'https://images.unsplash.com/photo-1615214072943-7f72411db285?auto=format&fit=crop&w=800&q=80':
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520638029027-6240677778dd?auto=format&fit=crop&w=800&q=80':
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
  // Broken eco image
  'https://images.unsplash.com/photo-1507560461415-997ced01da67?auto=format&fit=crop&w=800&q=80':
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  // Broken iron image
  'https://images.unsplash.com/photo-1585250486008-dbcc2283e1fa?auto=format&fit=crop&w=800&q=80':
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
};

async function fixArticleImages() {
  const prismaUrl = pathToFileURL(path.join(process.cwd(), "src/lib/prisma.js")).href;
  const { default: prisma } = await import(prismaUrl);

  const articles = await prisma.article.findMany();
  console.log(`Checking ${articles.length} articles for broken image URLs...`);

  let updatedCount = 0;

  for (const article of articles) {
    let contentChanged = false;
    let newContent = article.content || '';
    let newContentTh = article.content_th || '';

    for (const [brokenUrl, workingUrl] of Object.entries(URL_REPLACEMENTS)) {
      if (newContent.includes(brokenUrl)) {
        newContent = newContent.replaceAll(brokenUrl, workingUrl);
        contentChanged = true;
      }
      if (newContentTh.includes(brokenUrl)) {
        newContentTh = newContentTh.replaceAll(brokenUrl, workingUrl);
        contentChanged = true;
      }
    }

    if (contentChanged) {
      console.log(`Updating article [${article.id}]: "${article.title}"`);
      await prisma.article.update({
        where: { id: article.id },
        data: {
          content: newContent,
          content_th: newContentTh || null
        }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} articles!`);
}

fixArticleImages().catch(console.error).finally(() => process.exit(0));
