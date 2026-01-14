/**
 * Convert text to SVG paths using a font file
 *
 * Usage:
 *   1. Download font file (e.g., Recoleta-Bold.otf)
 *   2. Place it in this directory
 *   3. Run: node text-to-svg.js
 *
 * Dependencies: npm install opentype.js
 */

const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  text: 'Cofoundy',
  fontFile: '/Users/styreep/cofoundy/cotizations/resources/fonts/recoleta/Recoleta Bold.otf',
  fontSize: 72,
  outputFile: 'cofoundy-wordmark.svg',
};

async function textToSvg() {
  const fontPath = CONFIG.fontFile.startsWith('/') ? CONFIG.fontFile : path.join(__dirname, CONFIG.fontFile);

  // Check if font file exists
  if (!fs.existsSync(fontPath)) {
    console.error(`\n❌ Font file not found: ${CONFIG.fontFile}`);
    console.log('\nTo use this script:');
    console.log('1. Download Recoleta font from https://www.type.network/fonts/recoleta');
    console.log('   (They offer a free trial)');
    console.log(`2. Place the .otf or .ttf file in: ${__dirname}`);
    console.log(`3. Update CONFIG.fontFile if the filename is different`);
    console.log('4. Run this script again\n');
    process.exit(1);
  }

  try {
    // Load the font
    const font = await opentype.load(fontPath);

    // Create path from text
    const textPath = font.getPath(CONFIG.text, 0, CONFIG.fontSize, CONFIG.fontSize);

    // Get bounding box
    const bbox = textPath.getBoundingBox();
    const width = Math.ceil(bbox.x2 - bbox.x1);
    const height = Math.ceil(bbox.y2 - bbox.y1);

    // Generate SVG
    const svg = `<svg width="${width}" height="${height}" viewBox="${bbox.x1} ${bbox.y1} ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="${textPath.toPathData()}" fill="currentColor"/>
</svg>`;

    // Also generate a version with the brand color
    const svgBrand = `<svg width="${width}" height="${height}" viewBox="${bbox.x1} ${bbox.y1} ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="${textPath.toPathData()}" fill="#46A0D0"/>
</svg>`;

    // Save files
    const outputPath = path.join(__dirname, CONFIG.outputFile);
    const outputPathBrand = path.join(__dirname, CONFIG.outputFile.replace('.svg', '-brand.svg'));

    fs.writeFileSync(outputPath, svg);
    fs.writeFileSync(outputPathBrand, svgBrand);

    console.log('\n✅ SVG wordmarks generated!');
    console.log(`   ${outputPath} (currentColor)`);
    console.log(`   ${outputPathBrand} (brand blue)`);
    console.log(`\n   Size: ${width}x${height}px`);
    console.log(`   Font: ${font.names.fullName.en}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

textToSvg();
