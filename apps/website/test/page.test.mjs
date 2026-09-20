import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const websiteRoot = fileURLToPath(new URL('..', import.meta.url));
const publicDir = path.join(websiteRoot, 'public');
const htmlPath = path.join(publicDir, 'index.html');
const cssPath = path.join(publicDir, 'styles.css');

function read(file) {
  return readFileSync(file, 'utf8');
}

function collapsed(text) {
  return text.replace(/\s+/g, ' ');
}

function publicCopyWords(html) {
  const withoutIgnored = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  const text = withoutIgnored
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&#8217;|&#39;/g, "'")
    .replace(/&mdash;|&#8212;/g, '—')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text ? text.split(' ') : [];
}

test('delivers a static page with required public assets', () => {
  const required = [
    'index.html',
    'styles.css',
    'favicon.svg',
    'favicon.ico',
    'apple-touch-icon.png',
    'site.webmanifest',
    'web-icon-192.png',
    'web-icon-512.png',
    'web-maskable-512.png',
    'mireqo-logo.svg',
    'mireqo-mark.svg',
    'screenshots/discover.png',
    'screenshots/event-details.png',
    'screenshots/saved.png',
  ];
  for (const file of required) {
    const full = path.join(publicDir, file);
    assert.equal(existsSync(full), true, `missing ${file}`);
    assert.ok(statSync(full).size > 0, `empty ${file}`);
  }
});

test('uses product title, description, theme color, and brand icons', () => {
  const html = collapsed(read(htmlPath));
  assert.match(html, /<title>Mireqo — Discover local events<\/title>/);
  assert.match(
    html,
    /<meta name="description" content="Mireqo helps you discover things to do, explore the details, and save the events you want to come back to."/,
  );
  assert.match(html, /<meta name="theme-color" content="#93442C"/);
  assert.match(
    html,
    /<link rel="icon" href="favicon.svg" type="image\/svg\+xml" sizes="any"/,
  );
  assert.match(
    html,
    /<link rel="icon" href="favicon.ico" sizes="16x16 32x32 48x48"/,
  );
  assert.match(
    html,
    /<link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180"/,
  );
  assert.match(html, /<link rel="manifest" href="site.webmanifest"/);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<link rel="stylesheet" href="styles.css"/);
});

test('header uses the approved logo home link and in-page navigation', () => {
  const html = collapsed(read(htmlPath));
  assert.match(html, /<header[\s>]/);
  assert.match(html, /<nav[\s>]/);
  assert.match(
    html,
    /href="#top"[^>]*aria-label="Mireqo — home"|aria-label="Mireqo — home"[^>]*href="#top"/,
  );
  assert.match(html, /src="mireqo-logo.svg"/);
  assert.match(html, /<a href="#app">Features<\/a>/);
  assert.match(html, /<a href="#coverage">Coverage<\/a>/);
  assert.doesNotMatch(html, /hamburger/i);
});

test('hero states the product purpose without store or download actions', () => {
  const html = collapsed(read(htmlPath));
  assert.match(html, /<p class="eyebrow">Local event discovery<\/p>/);
  assert.match(html, /<h1>Good things are close by\.<\/h1>/);
  assert.match(
    html,
    /Mireqo helps you discover things to do, explore the details, and save the events you want to come back to\./,
  );
  assert.match(html, /<a href="#app"[^>]*>See how it works<\/a>/);
  assert.match(html, /In development for iOS and Android\./);
  assert.doesNotMatch(html, /Download/i);
  assert.doesNotMatch(html, /App Store|Google Play|waitlist/i);
});

test('feature previews include the three screenshots, copy, and demo disclosure', () => {
  const html = collapsed(read(htmlPath));
  assert.match(html, /id="app"/);
  assert.match(html, /<h2>Discover\. Explore\. Save\.<\/h2>/);
  assert.match(html, /<h3>Find something for your day\.<\/h3>/);
  assert.match(
    html,
    /Choose an area, browse categories, and explore events for today, tomorrow, or the weekend\./,
  );
  assert.match(html, /<h3>Get the details before you go\.<\/h3>/);
  assert.match(
    html,
    /Check dates, venue, price, and event information\. Share a find or open available location and event links\./,
  );
  assert.match(html, /<h3>Keep your next outing close\.<\/h3>/);
  assert.match(
    html,
    /Save events to a personal shortlist, browse Upcoming and Past, and read previously saved information offline\./,
  );
  assert.match(
    html,
    /Actual development screens\. Events shown are fictional examples\./,
  );
  assert.match(html, /Swipe to explore/);
  assert.match(
    html,
    /alt="Mireqo Discover in Tultitlán, showing date shortcuts and event categories."/,
  );
  assert.match(
    html,
    /alt="Mireqo event details showing a demo music event, its date, venue, price, and Save and Share controls."/,
  );
  assert.match(
    html,
    /alt="Mireqo Saved with Upcoming and Past tabs and a saved demo music event."/,
  );
  assert.match(
    html,
    /href="screenshots\/discover.png"[^>]*aria-label="[^"]*full-size[^"]*Discover|aria-label="[^"]*Discover[^"]*full-size/,
  );
  assert.match(
    html,
    /href="screenshots\/event-details.png"[^>]*aria-label="[^"]*full-size|aria-label="[^"]*event details[^"]*full-size/i,
  );
  assert.match(
    html,
    /href="screenshots\/saved.png"[^>]*aria-label="[^"]*full-size|aria-label="[^"]*Saved[^"]*full-size/,
  );
});

test('coverage names the exact initial geography and the footer uses the mark', () => {
  const html = collapsed(read(htmlPath));
  assert.match(html, /id="coverage"/);
  assert.match(html, /<h2>Starting close to home\.<\/h2>/);
  assert.match(
    html,
    /Initial coverage: Coacalco and Tultitlán in Estado de México, plus all of Mexico City\. Browse without an account or precise location permission\./,
  );
  assert.doesNotMatch(
    html,
    /throughout Estado de México|all of Estado de México|throughout Mexico(?! City)/,
  );
  assert.match(html, /src="mireqo-mark.svg"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /Mireqo — a little closer to what’s on\./);
});

test('keeps public copy under the word budget and stays informational without JavaScript or API calls', () => {
  const html = read(htmlPath);
  const words = publicCopyWords(html);
  assert.ok(
    words.length < 250,
    `public copy is ${words.length} words: ${words.join(' ')}`,
  );
  assert.doesNotMatch(html, /<script[\s>]/i);
  assert.doesNotMatch(html, /localhost:3000|\/v1\/|EXPO_PUBLIC_API_URL/);
  assert.doesNotMatch(html, /href="#"/);
  assert.match(html, /id="top"/);
});

test('styles are mobile-first with a contained screenshot strip and a wide-layout grid', () => {
  const css = read(cssPath);
  const html = collapsed(read(htmlPath));
  assert.match(html, /class="intro wrap"/);
  assert.match(css, /scroll-snap-type:\s*x\s+mandatory/);
  assert.match(css, /@media \(min-width:\s*768px\)/);
  assert.match(css, /@media \(min-width:\s*1200px\)/);
  assert.match(css, /max-width:\s*1120px/);
  assert.match(css, /\.preview-strip[\s\S]{0,200}justify-content:\s*start/);
  assert.match(css, /#F7F3EB/i);
  assert.match(css, /#93442C/i);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /position:\s*fixed[\s\S]{0,80}height:\s*\d+px/);
});
