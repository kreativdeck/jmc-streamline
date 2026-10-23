// Compares the DE/EN language switcher of every built page with the hreflang
// alternates found in the saved original HTML (research/html).
// Usage (from frontend/): node ../research/qa/check-pairs.mjs [dist]
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const htmlDir = new URL('../html/', import.meta.url).pathname;
const pages = [];
const walk = (dir, rel = '') => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, `${rel}/${name}`);
    else if (name === 'index.html') pages.push(rel === '' ? '/' : `${rel}/`);
  }
};
walk(dist);

let ok = 0;
const problems = [];
for (const url of pages.filter((u) => u !== '/')) {
  const html = readFileSync(join(dist, url, 'index.html'), 'utf8');
  const sw = {};
  for (const m of html.matchAll(/<a[^>]*\bhreflang="(de|en)-[A-Z]{2}"[^>]*\bhref="([^"]+)"|<a[^>]*\bhref="([^"]+)"[^>]*\bhreflang="(de|en)-[A-Z]{2}"/g)) {
    const lang = m[1] ?? m[4];
    sw[lang] = m[2] ?? m[3];
  }
  const parts = url.split('/').filter(Boolean);
  const file = parts.length === 1 ? `${parts[0]}.html` : `${parts[0]}__${parts.slice(1).join('__')}.html`;
  const orig = join(htmlDir, file);
  if (!existsSync(orig)) {
    problems.push(`${url}: no saved original (${file})`);
    continue;
  }
  const o = readFileSync(orig, 'utf8');
  const alt = {};
  for (const m of o.matchAll(/<link rel="alternate" href="([^"]+)" hreflang="(de|en)"/g)) {
    alt[m[2]] = new URL(m[1]).pathname.replace(/\/?$/, '/');
  }
  for (const lang of ['de', 'en']) {
    if (alt[lang] && sw[lang] !== alt[lang]) problems.push(`${url}: switcher ${lang}=${sw[lang]} but original alternate ${alt[lang]}`);
    else if (!sw[lang]) problems.push(`${url}: no ${lang} switcher link`);
  }
  if (!problems.some((p) => p.startsWith(url))) ok++;
}
console.log(`language pairs verified: ${ok}/${pages.length - 1}`);
console.log(problems.length ? problems.join('\n') : 'no problems found');
process.exit(problems.length ? 1 : 0);
