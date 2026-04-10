import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { generateHeroSvg, textToSvgPath } from './generate-hero-svg.mjs';

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

test('SVG has divider — two gold bars and one fire-colored dot', async () => {
  const svg = await generateHeroSvg();
  assert.match(svg, /<line[^>]+x1="540"[^>]+x2="630"[^>]+y1="378"[^>]+y2="378"[^>]+stroke="#8B7355"/);
  assert.match(svg, /<line[^>]+x1="650"[^>]+x2="740"[^>]+y1="378"[^>]+y2="378"[^>]+stroke="#8B7355"/);
  assert.match(svg, /<circle[^>]+cx="640"[^>]+cy="378"[^>]+r="3\.5"[^>]+fill="#D97706"/);
});

test('SVG has 3 waveform paths with SMIL animation', async () => {
  const svg = await generateHeroSvg();
  assert.match(svg, /<g transform="translate\(0,\s*440\)">/);
  const animateCount = (svg.match(/<animate /g) || []).length;
  assert.equal(animateCount, 3, 'should have exactly 3 <animate> elements');
  assert.match(svg, /stroke="#8B7355"[^>]+stroke-width="3"/);
  assert.match(svg, /stroke="#1E4B8C"[^>]+stroke-width="2"/);
  assert.match(svg, /stroke="#E8C8A0"[^>]+stroke-width="1.5"/);
  assert.match(svg, /dur="10s"/);
  assert.match(svg, /dur="7.5s"/);
  assert.match(svg, /dur="5s"/);
});

test('textToSvgPath converts text to an SVG <path> element with valid "d" data', async () => {
  const fontPath = resolve(__dirname, '../assets/fonts/CormorantGaramond-Medium.ttf');
  const pathElement = await textToSvgPath({
    fontPath,
    text: 'Test',
    x: 0,
    y: 0,
    fontSize: 48,
    fill: '#1E4B8C',
  });
  assert.match(pathElement, /^<path /);
  assert.match(pathElement, /d="M/);
  assert.match(pathElement, /fill="#1E4B8C"/);
  assert.match(pathElement, /\/>$/);
});

test('SVG contains no <text> elements — all display text is converted to paths', async () => {
  const svg = await generateHeroSvg();
  assert.doesNotMatch(svg, /<text[\s>]/, 'SVG should not contain any <text> elements');
});

test('SVG contains exactly 6 text-to-path elements (2 masthead + eyebrow + name + Chinese + tagline)', async () => {
  const svg = await generateHeroSvg();
  const displayTextPaths = svg.match(/<path d="[^"]+" fill="[^"]+"\/>/g) || [];
  assert.equal(displayTextPaths.length, 6, `expected 6 display text paths, got ${displayTextPaths.length}`);
});

test('SVG file size is under 50KB (safety net)', async () => {
  await generateHeroSvg();
  const { size } = statSync(outputPath);
  assert.ok(size < 50 * 1024, `hero.svg is ${size} bytes, expected < 50KB`);
});
