const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadedLogoPath = 'C:\\Users\\jsiri\\.gemini\\antigravity\\brain\\ca9f6ede-8e64-48c5-83ab-9f6d0ede7ac0\\media__1782576213789.png';
const targetPngPath1 = path.join(__dirname, '../public/assets/logo.png');
const targetPngPath2 = path.join(__dirname, '../public/images/logo.png');
const targetWebpPath = path.join(__dirname, '../public/images/logo.webp');

async function main() {
  if (!fs.existsSync(uploadedLogoPath)) {
    console.error('Uploaded logo not found at:', uploadedLogoPath);
    return;
  }

  // Ensure directories exist
  fs.mkdirSync(path.dirname(targetPngPath1), { recursive: true });
  fs.mkdirSync(path.dirname(targetPngPath2), { recursive: true });

  // Copy to PNG destinations
  fs.copyFileSync(uploadedLogoPath, targetPngPath1);
  fs.copyFileSync(uploadedLogoPath, targetPngPath2);
  console.log('Successfully copied new PNG logo to assets/logo.png and images/logo.png');

  // Convert to WebP using sharp
  await sharp(uploadedLogoPath)
    .webp({ quality: 90 })
    .toFile(targetWebpPath);
  console.log('Successfully converted new logo to public/images/logo.webp');
}

main().catch(console.error);
