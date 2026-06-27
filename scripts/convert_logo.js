const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../public/images/logo.png');
const outputPath = path.join(__dirname, '../public/images/logo.webp');

async function convertLogo() {
  console.log('Converting logo.png to logo.webp...');
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log('Successfully created logo.webp');
  } catch (err) {
    console.error('Failed to convert logo:', err);
  }
}

convertLogo();
