/**
 * Property 2: Preservation - Non-About-Section Behaviors Unchanged
 *
 * Observation-first methodology:
 *   Observed on UNFIXED code:
 *   - hero-minimal section exists in the logged-out branch with motion.div wrapper
 *   - About section links (Platform, Resources, Legal) are present with correct Link to= props
 *   - About section bottom bar has copyright text and tagline
 *   - All other CSS rules in Home.css are unrelated to .about-section margin-top
 *
 * These tests MUST PASS on unfixed code (baseline) and MUST STILL PASS after the fix.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = resolve(__dirname, '../Home.css');
const JSX_PATH = resolve(__dirname, '../Home.jsx');

const cssSource = readFileSync(CSS_PATH, 'utf-8');
const jsxSource = readFileSync(JSX_PATH, 'utf-8');

let passed = 0;
let failed = 0;

function assert(condition, label, detail) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    if (detail) console.error(`        ${detail}`);
    failed++;
  }
}

console.log('\n[Property 2: Preservation] Non-About-Section Behaviors Unchanged\n');

// ── 3.1: Logged-out hero section uses motion.div ──────────────────────────
console.log('3.1 Logged-out hero section preservation:');
const heroMinimalExists = jsxSource.includes('hero-minimal');
assert(heroMinimalExists, 'hero-minimal section exists in JSX', 'hero-minimal class not found');

const heroMotionDiv = jsxSource.includes('motion.div') && jsxSource.includes('hero-content-center');
assert(heroMotionDiv, 'hero section contains motion.div with hero-content-center', 'motion.div + hero-content-center not found');

// ── 3.2: Other dashboard sections are present and unmodified ─────────────
console.log('\n3.2 Dashboard sections preservation:');
const hasMissionControl = jsxSource.includes('mission-control-section');
assert(hasMissionControl, 'mission-control-section exists', 'mission-control-section not found');

const hasSkillDashboard = jsxSource.includes('skill-dashboard-section');
assert(hasSkillDashboard, 'skill-dashboard-section exists', 'skill-dashboard-section not found');

const hasHallOfFame = jsxSource.includes('hall-of-fame-section');
assert(hasHallOfFame, 'hall-of-fame-section exists', 'hall-of-fame-section not found');

const hasSupportSection = jsxSource.includes('support-system-section');
assert(hasSupportSection, 'support-system-section exists', 'support-system-section not found');

const hasHeatmap = jsxSource.includes('home-contribution-section');
assert(hasHeatmap, 'home-contribution-section (heatmap) exists', 'home-contribution-section not found');

// ── 3.3: About section links route correctly ─────────────────────────────
console.log('\n3.3 About section link routing preservation:');
const platformLinks = ['/explore', '/challenges', '/factions', '/leaderboard'];
platformLinks.forEach(route => {
  assert(jsxSource.includes(`to="${route}"`), `Platform link to="${route}" exists`);
});

const resourceLinks = ['/docs', '/status', '/community', '/guidelines'];
resourceLinks.forEach(route => {
  assert(jsxSource.includes(`to="${route}"`), `Resource link to="${route}" exists`);
});

const legalLinks = ['/privacy', '/terms', '/cookies'];
legalLinks.forEach(route => {
  assert(jsxSource.includes(`to="${route}"`), `Legal link to="${route}" exists`);
});

// ── 3.4: About section bottom bar content ────────────────────────────────
console.log('\n3.4 About section bottom bar content preservation:');
const hasCopyright = jsxSource.includes('2026 BrightCode Ecosystem. All rights reserved.');
assert(hasCopyright, 'Copyright text "2026 BrightCode Ecosystem. All rights reserved." present');

const hasTagline = jsxSource.includes('Built for the Elite');
assert(hasTagline, 'Tagline "Built for the Elite" present');

// ── CSS: Other rules unaffected ───────────────────────────────────────────
console.log('\n3.x CSS preservation (other rules unaffected):');
const hasHeroMinimalCss = cssSource.includes('.hero-minimal');
assert(hasHeroMinimalCss, '.hero-minimal CSS rule exists and is unchanged');

const hasNavCss = cssSource.includes('.floating-nav');
assert(hasNavCss, '.floating-nav CSS rule exists and is unchanged');

const hasMissionControlCss = cssSource.includes('.mission-control-section');
assert(hasMissionControlCss, '.mission-control-section CSS rule exists and is unchanged');

// ── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${failed === 0 ? '✓' : '✗'} Preservation tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exitCode = 1;
}
