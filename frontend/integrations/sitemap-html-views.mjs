/**
 * Readable browser view for the sitemaps written by @astrojs/sitemap.
 *
 * After the build, every `sitemap-index.xml` / `sitemap-<n>.xml` in the output
 * gets a static `.html` twin with the same URLs in a plain table under the
 * heading "XML Sitemap". The twins are derived from the generated XML files
 * (nothing is generated in parallel) and need no XSLT, so browsers show no
 * XSLT warning. The web server hands the twin to browsers (Accept: text/html);
 * crawlers keep receiving the unchanged XML.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sitemapFile = /^sitemap-(index|\d+)\.xml$/;
const indexFile = 'sitemap-index.xml';

const xmlEntities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const unescapeXml = (value) => value.replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => xmlEntities[name]);
const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** `<loc>` values in document order, taken from the XML the integration wrote */
const readLocs = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => unescapeXml(match[1].trim()));

/** Plain CSS on purpose: this is a standalone document outside the Tailwind site. */
const css = `* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 3.5rem 1.25rem 4rem;
  background: #fff;
  color: #444;
  font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
main { max-width: 800px; margin: 0 auto; }
h1 { margin: 0 0 2rem; text-align: center; font-size: 2.25rem; line-height: 1.2; font-weight: 700; color: #444; }
.back { margin: 0 0 1rem; font-size: 0.9375rem; }
table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e5e5e5; border-radius: 6px; overflow: hidden; }
th { padding: 0.875rem 1.25rem; background: #fafafa; border-bottom: 2px solid #e5e5e5; text-align: left; font-size: 0.9375rem; font-weight: 400; letter-spacing: 0.02em; text-transform: uppercase; }
td { padding: 0.875rem 1.25rem; overflow-wrap: anywhere; word-break: break-word; }
tbody tr:nth-child(odd) td { background: #f5f5f5; }
tbody tr:nth-child(even) td { background: #fff; }
a { color: inherit; }
td a { text-decoration: none; }
td a:hover, td a:focus-visible { text-decoration: underline; }
p.count { margin: 1.5rem 0 0; }
@media (max-width: 600px) {
  body { padding: 2rem 0.75rem 3rem; }
  h1 { font-size: 1.75rem; margin-bottom: 1.5rem; }
  th, td { padding: 0.75rem 0.875rem; font-size: 0.9375rem; }
}`;

const countText = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

const page = (body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>XML Sitemap</title>
<style>
${css}
</style>
</head>
<body>
<main>
<h1>XML Sitemap</h1>
${body}
</main>
</body>
</html>
`;

const row = (url) => `<tr><td><a href="${escapeHtml(new URL(url).pathname)}">${escapeHtml(url)}</a></td></tr>`;

const table = (heading, urls) => `<table>
<thead>
<tr><th>${heading}</th></tr>
</thead>
<tbody>
${urls.map(row).join('\n')}
</tbody>
</table>`;

/** Browser view of the index: clickable child sitemaps. */
const renderIndex = (urls) => page(`${table('Sitemap', urls)}
<p class="count">This XML Sitemap Index file contains ${countText(urls.length, 'sitemap', 'sitemaps')}.</p>`);

/** Browser view of a child sitemap, with a link back to the index. */
const renderChild = (urls) => page(`<p class="back"><a href="/${indexFile}">&#8592; Sitemap index</a></p>
${table('URL', urls)}
<p class="count">This XML Sitemap file contains ${countText(urls.length, 'URL', 'URLs')}.</p>`);

export default function sitemapHtmlViews() {
  return {
    name: 'sitemap-html-views',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const files = (await readdir(outDir)).filter((name) => sitemapFile.test(name));
        if (!files.includes(indexFile)) {
          logger.warn(`\`${indexFile}\` not found, no HTML views created.`);
          return;
        }
        for (const file of files) {
          const urls = readLocs(await readFile(new URL(file, dir), 'utf8'));
          const html = file === indexFile ? renderIndex(urls) : renderChild(urls);
          await writeFile(new URL(file.replace(/\.xml$/, '.html'), dir), html);
        }
        logger.info(`${files.length} HTML sitemap views created`);
      },
    },
  };
}
