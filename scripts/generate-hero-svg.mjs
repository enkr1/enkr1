import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../assets/hero.svg');

/**
 * Generate the enkr1/enkr1 profile hero SVG.
 * Writes to assets/hero.svg.
 *
 * @returns {Promise<string>} The generated SVG content.
 */
export async function generateHeroSvg() {
  const parts = [];
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 580">');
  parts.push('<rect fill="#FBF8F3" width="1280" height="580"/>');
  parts.push('<line x1="120" y1="80" x2="1160" y2="80" stroke="#8B7355" stroke-width="0.5" opacity="0.5"/>');
  parts.push('<line x1="120" y1="555" x2="1160" y2="555" stroke="#8B7355" stroke-width="0.5" opacity="0.5"/>');
  parts.push('</svg>');
  const svg = parts.join('\n');
  writeFileSync(OUTPUT_PATH, svg, 'utf8');
  return svg;
}

// Allow direct execution via `node scripts/generate-hero-svg.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  await generateHeroSvg();
  console.log(`Wrote ${OUTPUT_PATH}`);
}
