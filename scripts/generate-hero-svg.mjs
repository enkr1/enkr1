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
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 580"></svg>';
  writeFileSync(OUTPUT_PATH, svg, 'utf8');
  return svg;
}

// Allow direct execution via `node scripts/generate-hero-svg.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  await generateHeroSvg();
  console.log(`Wrote ${OUTPUT_PATH}`);
}
