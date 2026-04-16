import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import opentype from 'opentype.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../assets/hero.svg');

const FONTS_DIR = resolve(__dirname, '../assets/fonts');
const CORMORANT_MEDIUM = resolve(FONTS_DIR, 'CormorantGaramond-Medium.ttf');
const CORMORANT_ITALIC = resolve(FONTS_DIR, 'CormorantGaramond-MediumItalic.ttf');
const NOTO_SERIF_SC = resolve(FONTS_DIR, 'NotoSerifSC-Regular.otf');

const GOLD = '#8B7355';
const WATER = '#1E4B8C';
const BODY_DARK = '#2C2416';

/**
 * Serialize opentype path commands to a compact SVG path "d" string.
 * Strips degenerate L/Q segments and rounds to integers.
 * @param {Array<{type: string, x?: number, y?: number, x1?: number, y1?: number, x2?: number, y2?: number}>} commands
 * @returns {string} SVG path data
 */
function compactPathData(commands) {
  const r = (n) => Math.round(n * 100) / 100;
  let d = '';
  let cx = 0, cy = 0;

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      const x = r(cmd.x), y = r(cmd.y);
      d += `M${x} ${y}`;
      cx = x; cy = y;
    } else if (cmd.type === 'L') {
      const x = r(cmd.x), y = r(cmd.y);
      if (x === cx && y === cy) continue;
      d += `L${x} ${y}`;
      cx = x; cy = y;
    } else if (cmd.type === 'Q') {
      const x1 = r(cmd.x1), y1 = r(cmd.y1);
      const x = r(cmd.x), y = r(cmd.y);
      if (x === cx && y === cy) continue;
      if ((x1 === cx && y1 === cy) || (x1 === x && y1 === y)) {
        d += `L${x} ${y}`;
      } else {
        d += `Q${x1} ${y1} ${x} ${y}`;
      }
      cx = x; cy = y;
    } else if (cmd.type === 'C') {
      const x1 = r(cmd.x1), y1 = r(cmd.y1);
      const x2 = r(cmd.x2), y2 = r(cmd.y2);
      const x = r(cmd.x), y = r(cmd.y);
      if (x === cx && y === cy) continue;
      d += `C${x1} ${y1} ${x2} ${y2} ${x} ${y}`;
      cx = x; cy = y;
    } else if (cmd.type === 'Z') {
      d += 'Z';
    }
  }
  return d;
}

/**
 * Load a font and convert text to an SVG <path> element.
 * @param {object} opts
 * @param {string} opts.fontPath - Absolute path to TTF/OTF
 * @param {string} opts.text - Text to convert
 * @param {number} opts.x - X position (viewBox units)
 * @param {number} opts.y - Y baseline position (viewBox units)
 * @param {number} opts.fontSize - Font size (viewBox units)
 * @param {string} opts.fill - Fill color (hex)
 * @param {number} [opts.letterSpacing] - Extra spacing in viewBox units
 * @returns {Promise<string>} SVG <path .../> element
 */
export async function textToSvgPath({ fontPath, text, x, y, fontSize, fill, letterSpacing = 0 }) {
  const font = await opentype.load(fontPath);
  const path = font.getPath(text, x, y, fontSize, { letterSpacing: letterSpacing / fontSize });
  const d = compactPathData(path.commands);
  if (!d || !d.startsWith('M')) {
    throw new Error(`textToSvgPath produced invalid path data for "${text}" — ${d?.slice(0, 30)}`);
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

/**
 * Generate the enkr1/enkr1 profile hero SVG.
 * Writes to assets/hero.svg.
 *
 * @returns {Promise<string>} The generated SVG content.
 */
export async function generateHeroSvg() {
  const parts = [];
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 580">');

  // Cream paper background
  parts.push('<rect fill="#FBF8F3" width="1280" height="580"/>');

  // Top hairline
  parts.push('<line x1="120" y1="80" x2="1160" y2="80" stroke="#8B7355" stroke-width="0.5" opacity="0.5"/>');

  // Masthead top-left — uses Noto Serif SC because it contains CJK chars (丙午)
  {
    const text = '— VOL. 04 · 2026 丙午 —';
    parts.push(await textToSvgPath({
      fontPath: NOTO_SERIF_SC,
      text,
      x: 120, y: 60, fontSize: 14, fill: GOLD, letterSpacing: 3.5,
    }));
  }

  // Masthead top-right — right-aligned at x=1160
  {
    const text = 'SINGAPORE · MALAYSIA';
    const font = await opentype.load(CORMORANT_ITALIC);
    const width = font.getAdvanceWidth(text, 14, { letterSpacing: 3.5 / 14 });
    parts.push(await textToSvgPath({
      fontPath: CORMORANT_ITALIC,
      text,
      x: 1160 - width, y: 60, fontSize: 14, fill: GOLD, letterSpacing: 3.5,
    }));
  }

  // Eyebrow — centered at x=640
  {
    const text = '— FULL-STACK SOFTWARE ENGINEER —';
    const font = await opentype.load(CORMORANT_ITALIC);
    const width = font.getAdvanceWidth(text, 18, { letterSpacing: 4.5 / 18 });
    parts.push(await textToSvgPath({
      fontPath: CORMORANT_ITALIC,
      text,
      x: 640 - width / 2, y: 160, fontSize: 18, fill: GOLD, letterSpacing: 4.5,
    }));
  }

  // Main name — "Jing Hui PANG" centered, 124px, water blue
  {
    const text = 'Jing Hui PANG';
    const font = await opentype.load(CORMORANT_MEDIUM);
    const width = font.getAdvanceWidth(text, 124, { letterSpacing: -2 / 124 });
    parts.push(await textToSvgPath({
      fontPath: CORMORANT_MEDIUM,
      text,
      x: 640 - width / 2, y: 290, fontSize: 124, fill: WATER, letterSpacing: -2,
    }));
  }

  // Chinese subname — "彭 竞 辉" centered, gold
  {
    const text = '彭 竞 辉';
    const font = await opentype.load(NOTO_SERIF_SC);
    const width = font.getAdvanceWidth(text, 30, { letterSpacing: 12 / 30 });
    parts.push(await textToSvgPath({
      fontPath: NOTO_SERIF_SC,
      text,
      x: 640 - width / 2, y: 340, fontSize: 30, fill: GOLD, letterSpacing: 12,
    }));
  }

  // Divider
  parts.push('<line x1="540" x2="630" y1="378" y2="378" stroke="#8B7355" stroke-width="1"/>');
  parts.push('<line x1="650" x2="740" y1="378" y2="378" stroke="#8B7355" stroke-width="1"/>');
  parts.push('<circle cx="640" cy="378" r="3.5" fill="#D97706"/>');

  // Tagline — italic, body dark, centered
  {
    const text = '"Building things from zero to one."';
    const font = await opentype.load(CORMORANT_ITALIC);
    const width = font.getAdvanceWidth(text, 22);
    parts.push(await textToSvgPath({
      fontPath: CORMORANT_ITALIC,
      text,
      x: 640 - width / 2, y: 418, fontSize: 22, fill: BODY_DARK,
    }));
  }

  // Waveform band
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

  // Bottom hairline
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
