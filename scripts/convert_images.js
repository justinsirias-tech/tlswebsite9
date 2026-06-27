const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '../public/assets');

async function convertImages() {
  console.log('Starting image conversion in:', assetsDir);
  const files = fs.readdirSync(assetsDir);

  for (const file of files) {
    if (path.extname(file).toLowerCase() === '.png') {
      const inputPath = path.join(assetsDir, file);
      const outputName = path.basename(file, '.png') + '.webp';
      const outputPath = path.join(assetsDir, outputName);

      console.log(`Converting ${file} to WebP...`);
      try {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        
        console.log(`Successfully created ${outputName}`);
      } catch (err) {
        console.error(`Failed to convert ${file}:`, err);
      }
    }
  }
  console.log('Conversion complete!');
}

convertImages().catch(console.error);
