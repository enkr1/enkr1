import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { generateHeroSvg } from './generate-hero-svg.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../assets/hero.svg');

test('generateHeroSvg() writes a file to assets/hero.svg', async () => {
  await generateHeroSvg();
  assert.ok(existsSync(outputPath), 'hero.svg should exist after generate');
});

test('SVG has correct viewBox', async () => {
  const svg = await generateHeroSvg();
  assert.match(svg, /viewBox="0 0 1280 580"/);
});

test('SVG has cream background rect #FBF8F3', async () => {
  const svg = await generateHeroSvg();
  assert.match(svg, /<rect[^>]+fill="#FBF8F3"[^>]+\/>/);
});

test('SVG has two gold hairline rules (top y=80, bottom y=555)', async () => {
  const svg = await generateHeroSvg();
  assert.match(svg, /<line[^>]+y1="80"[^>]+y2="80"[^>]+stroke="#8B7355"/);
  assert.match(svg, /<line[^>]+y1="555"[^>]+y2="555"[^>]+stroke="#8B7355"/);
});
