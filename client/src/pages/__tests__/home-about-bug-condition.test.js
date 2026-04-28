/**
 * Property 1: Bug Condition - Gap & Static About Section Bugs
 *
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * After the fix is applied, these tests should PASS.
 *
 * Scoped PBT Approach:
 *   - Bug 1 (Gap): .about-section has margin-top: 200px  → assert it is NOT >= 100px
 *   - Bug 2 (Static): #about is a plain <div> with no Framer Motion props → assert it IS a motion element
 *
 * Requirements: 1.1, 1.2
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = resolve(__dirname, '../Home.css');
const JSX_PATH = resolve(__dirname, '../Home.jsx');

const cssSource = readFileSync(CSS_PATH, 'utf-8');
const jsxSource = readFileSync(JSX_PATH, 'utf-8');

// ── Helper: extract margin-top value from .about-section rule ──────────────
function getAboutSectionMarginTop(css) {
  // Match the .about-section block
  const blockMatch = css.match(/\.about-section\s*\{([^}]*)\}/s);
  if (!blockMatch) return null;
  const block = blockMatch[1];
  const marginMatch = block.match(/margin-top\s*:\s*([^;]+);/);
  if (!marginMatch) return null;
  const raw = marginMatch[1].trim();
  // Parse px value
  const px = parseFloat(raw);
  return isNaN(px) ? raw : px;
}

// ── Helper: check if #about JSX element uses motion ───────────────────────
function aboutSectionUsesMotion(jsx) {
  // Look for the about section opening tag
  // Bug condition: plain <div id="about" — not motion.div
  const plainDivMatch = jsx.match(/<div\s[^>]*id=["']about["'][^>]*>/);
  const motionDivMatch = jsx.match(/<motion\.(div|section)\s[^>]*id=["']about["'][^>]*>/);
  return { isPlainDiv: !!plainDivMatch && !motionDivMatch, isMotion: !!motionDivMatch };
}

// ── Test 1: Gap Bug Condition ──────────────────────────────────────────────
const marginTop = getAboutSectionMarginTop(cssSource);
console.log(`\n[Property 1: Bug Condition] Gap Test`);
console.log(`  .about-section margin-top found: ${marginTop}px`);

if (marginTop === null) {
  console.error('  FAIL: Could not find .about-section margin-top in Home.css');
  process.exitCode = 1;
} else if (typeof marginTop === 'number' && marginTop >= 100) {
  console.error(`  FAIL (expected on unfixed code): margin-top is ${marginTop}px — exceeds 100px threshold`);
  console.error(`  Counterexample: .about-section { margin-top: ${marginTop}px } — should be ≤ 40px`);
  process.exitCode = 1;
} else {
  console.log(`  PASS: margin-top is ${marginTop}px — within acceptable range (≤ 40px)`);
}

// ── Test 2: Static Section Bug Condition ──────────────────────────────────
const { isPlainDiv, isMotion } = aboutSectionUsesMotion(jsxSource);
console.log(`\n[Property 1: Bug Condition] Static About Section Test`);
console.log(`  #about is plain div: ${isPlainDiv}`);
console.log(`  #about uses motion: ${isMotion}`);

if (isPlainDiv) {
  console.error(`  FAIL (expected on unfixed code): #about is a plain <div> with no Framer Motion props`);
  console.error(`  Counterexample: <div id="about" className="about-section"> — should be <motion.div ...>`);
  process.exitCode = 1;
} else if (isMotion) {
  console.log(`  PASS: #about uses a motion element with Framer Motion props`);
} else {
  console.error(`  FAIL: Could not determine the element type for #about in Home.jsx`);
  process.exitCode = 1;
}

if (process.exitCode === 1) {
  console.log(`\n✗ Bug condition tests FAILED — bugs confirmed on unfixed code (this is expected)`);
} else {
  console.log(`\n✓ Bug condition tests PASSED — bugs are fixed`);
}
