const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const darkLogoSrc = 'C:\\Users\\jsiri\\.gemini\/\/antigravity\\brain\\ca9f6ede-8e64-48c5-83ab-9f6d0ede7ac0\\media__1782576470922.png';
const lightLogoSrc = 'C:\\Users\\jsiri\\.gemini\\antigravity\\brain\\ca9f6ede-8e64-48c5-83ab-9f6d0ede7ac0\\media__1782576483889.png';

const targetDarkPng1 = path.join(__dirname, '../public/assets/logo.png');
const targetDarkPng2 = path.join(__dirname, '../public/images/logo.png');
const targetDarkWebp = path.join(__dirname, '../public/images/logo.webp');

const targetLightPng1 = path.join(__dirname, '../public/assets/logo_light.png');
const targetLightPng2 = path.join(__dirname, '../public/images/logo_light.png');
const targetLightWebp = path.join(__dirname, '../public/images/logo_light.webp');

async function main() {
  if (!fs.existsSync(darkLogoSrc)) {
    console.error('Dark logo source not found:', darkLogoSrc);
    return;
  }
  if (!fs.existsSync(lightLogoSrc)) {
    console.error('Light logo source not found:', lightLogoSrc);
    return;
  }

  // Ensure directories exist
  fs.mkdirSync(path.dirname(targetDarkPng1), { recursive: true });
  fs.mkdirSync(path.dirname(targetDarkPng2), { recursive: true });

  // 1. Dark Logo (Navy) -> copy and convert
  fs.copyFileSync(darkLogoSrc, targetDarkPng1);
  fs.copyFileSync(darkLogoSrc, targetDarkPng2);
  await sharp(darkLogoSrc).webp({ quality: 90 }).toFile(targetDarkWebp);
  console.log('Successfully configured Dark Logo (assets/logo.png, images/logo.png, images/logo.webp)');

  // 2. Light Logo (White) -> copy and convert
  fs.copyFileSync(lightLogoSrc, targetLightPng1);
  fs.copyFileSync(lightLogoSrc, targetLightPng2);
  await sharp(lightLogoSrc).webp({ quality: 90 }).toFile(targetLightWebp);
  console.log('Successfully configured Light Logo (assets/logo_light.png, images/logo_light.png, images/logo_light.webp)');
}

main().catch(console.error);
