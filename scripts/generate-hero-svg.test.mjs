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
