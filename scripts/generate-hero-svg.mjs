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
  // Center divider
  parts.push('<line x1="540" x2="630" y1="378" y2="378" stroke="#8B7355" stroke-width="1"/>');
  parts.push('<line x1="650" x2="740" y1="378" y2="378" stroke="#8B7355" stroke-width="1"/>');
  parts.push('<circle cx="640" cy="378" r="3.5" fill="#D97706"/>');

  // Waveform band — 3 layers, SMIL animation
  parts.push('<g transform="translate(0, 440)">');

  parts.push('<path stroke="#8B7355" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.3">');
  parts.push('<animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0,70 Q160,30 320,70 T640,70 T960,70 T1280,70;M0,70 Q160,110 320,70 T640,70 T960,70 T1280,70;M0,70 Q160,30 320,70 T640,70 T960,70 T1280,70"/>');
  parts.push('</path>');

  parts.push('<path stroke="#1E4B8C" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5">');
  parts.push('<animate attributeName="d" dur="7.5s" repeatCount="indefinite" values="M0,90 Q200,60 400,90 T800,90 T1280,90;M0,90 Q200,120 400,90 T800,90 T1280,90;M0,90 Q200,60 400,90 T800,90 T1280,90"/>');
  parts.push('</path>');

  parts.push('<path stroke="#E8C8A0" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7">');
  parts.push('<animate attributeName="d" dur="5s" repeatCount="indefinite" values="M0,110 Q180,90 360,110 T720,110 T1080,110 T1280,110;M0,110 Q180,130 360,110 T720,110 T1080,110 T1280,110;M0,110 Q180,90 360,110 T720,110 T1080,110 T1280,110"/>');
  parts.push('</path>');

  parts.push('</g>');

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
