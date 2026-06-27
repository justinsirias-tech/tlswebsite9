const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const filesToUpdate = [
  'src/app/[locale]/about/page.js',
  'src/app/[locale]/page.js',
  'src/app/[locale]/services/page.js',
  'src/app/admin/dashboard/services/page.js',
  'src/components/SEOArticles.js',
  'src/components/StoryContent.js',
  'src/components/StoryContentCn.js',
  'src/components/StoryContentTh.js',
  'src/lib/imagePicker.js'
];

const imagesToReplace = [
  'about_artisans',
  'dry_clean',
  'hero_bg_v2',
  'hero_laundry',
  'service_carpet',
  'service_commercial',
  'service_corporate',
  'service_fb',
  'service_hotel',
  'service_ironing',
  'staff_laundry',
  'story_delivery',
  'story_eco',
  'story_hospitality',
  'wash_and_fold'
];

function updateReferences() {
  for (const relativePath of filesToUpdate) {
    const filePath = path.join(projectRoot, relativePath);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const img of imagesToReplace) {
      const regex = new RegExp(`/assets/${img}\\.png`, 'g');
      content = content.replace(regex, `/assets/${img}.webp`);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated references in: ${relativePath}`);
    } else {
      console.log(`No references changed in: ${relativePath}`);
    }
  }
}

updateReferences();
