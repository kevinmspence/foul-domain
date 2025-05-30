const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './public/song-backgrounds';     // your source directory
const outputDir = './webp-backgrounds'; // optimized output

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function convertPngToWebp(inputPath, outputPath) {
  sharp(inputPath)
    .webp({ quality: 80 }) // adjust quality as needed
    .toFile(outputPath)
    .then(() => console.log(`✅ Converted: ${outputPath}`))
    .catch(err => console.error(`❌ Error converting ${inputPath}:`, err));
}

function walkAndConvert(currentDir) {
  fs.readdirSync(currentDir).forEach(file => {
    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkAndConvert(fullPath);
    } else if (file.toLowerCase().endsWith('.png')) {
      const relativePath = path.relative(inputDir, fullPath);
      const webpPath = path.join(outputDir, relativePath).replace(/\.png$/i, '.webp');
      ensureDirSync(path.dirname(webpPath));
      convertPngToWebp(fullPath, webpPath);
    }
  });
}

ensureDirSync(outputDir);
walkAndConvert(inputDir);
