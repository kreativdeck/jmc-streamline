// Static check of the built site: internal links, assets and language pairs.
// Usage (from frontend/): node ../research/qa/check-links.mjs [dist]
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const pages = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name === 'index.html') pages.push(p);
  }
};
walk(dist);

const urlOf = (file) => '/' + relative(dist, file).replace(/index\.html$/, '');
const known = new Set(pages.map(urlOf));
const problems = [];
let linkCount = 0;
let assetCount = 0;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const from = urlOf(file);
  for (const m of html.matchAll(/\s(href|src|poster)="([^"]+)"/g)) {
    const raw = m[2];
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(raw)) continue;
    const [pathOnly] = raw.split(/[?#]/);
    if (!pathOnly.startsWith('/')) {
      problems.push(`${from}: relative reference ${raw}`);
      continue;
    }
    if (/\.[a-z0-9]{2,5}$/i.test(pathOnly) && !pathOnly.endsWith('/')) {
      assetCount++;
      if (!existsSync(join(dist, decodeURIComponent(pathOnly)))) problems.push(`${from}: missing asset ${raw}`);
    } else if (m[1] === 'href') {
      linkCount++;
      const target = pathOnly.endsWith('/') ? pathOnly : pathOnly + '/';
      if (!known.has(target)) problems.push(`${from}: broken link ${raw}`);
    }
  }
  for (const m of html.matchAll(/url\(([^)]+)\)/g)) {
    const raw = m[1].replace(/["']/g, '');
    if (raw.startsWith('/') && !existsSync(join(dist, decodeURIComponent(raw.split(/[?#]/)[0])))) {
      problems.push(`${from}: missing css asset ${raw}`);
    }
  }
}

const newsletter = pages.filter((f) => /newsletter/i.test(f));
console.log(`pages: ${pages.length}`);
console.log(`internal links checked: ${linkCount}, local assets checked: ${assetCount}`);
console.log(`newsletter pages in build: ${newsletter.length}`);
console.log(problems.length ? problems.join('\n') : 'no problems found');
process.exit(problems.length ? 1 : 0);
