/**
 * Sitemap index and its child sitemaps, generated from the route inventory.
 * Each child lists both language versions with their hreflang alternates.
 */
import { allRoutes, homeTranslations } from './routes';
import { siteOrigin } from '../config/site';

interface SitemapPage {
  path: string;
  translations: { de: string; en: string };
}

export interface SitemapDefinition {
  /** file name below the site root */
  file: string;
  /** static HTML twin with the same content, served to browsers by the web server */
  htmlFile: string;
  pages: () => SitemapPage[];
}

const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>`;

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const routePages = (types: (type: string) => boolean): SitemapPage[] => allRoutes()
  .filter((route) => types(route.type))
  .map((route) => ({ path: `/${route.lang}/${route.slug}/`, translations: route.translations }));

export const sitemaps: SitemapDefinition[] = [
  {
    file: 'sitemap-post-type-page.xml',
    htmlFile: 'sitemap-post-type-page.html',
    pages: () => [
      ...Object.values(homeTranslations).map((path) => ({ path, translations: homeTranslations })),
      ...routePages((type) => type !== 'post' && type !== 'category'),
    ],
  },
  {
    file: 'sitemap-post-type-post.xml',
    htmlFile: 'sitemap-post-type-post.html',
    pages: () => routePages((type) => type === 'post'),
  },
  {
    file: 'sitemap-taxonomy-category.xml',
    htmlFile: 'sitemap-taxonomy-category.html',
    pages: () => routePages((type) => type === 'category'),
  },
];

export function renderSitemapIndex(): string {
  const entries = sitemaps.map(({ file }) => `  <sitemap>
    <loc>${escapeXml(`${siteOrigin}/${file}`)}</loc>
  </sitemap>`).join('\n');
  return `${xmlHeader}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`;
}

export function renderSitemap({ pages }: SitemapDefinition): string {
  const entries = pages().map(({ path, translations }) => `  <url>
    <loc>${escapeXml(siteOrigin + path)}</loc>
${Object.entries(translations).map(([lang, target]) =>
    `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(siteOrigin + target)}" />`,
  ).join('\n')}
  </url>`).join('\n');
  return `${xmlHeader}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

/**
 * Table styling shared by the XSL fallback (direct XML view) and the HTML views,
 * so both render identically. Plain CSS on purpose: this is a standalone
 * document outside the Tailwind site.
 */
export const sitemapCss = `* { box-sizing: border-box; }
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

const countText = (count: number, singular: string, plural: string) => `${count} ${count === 1 ? singular : plural}`;

const renderHtmlPage = (body: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>XML Sitemap</title>
<style>
${sitemapCss}
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

const htmlRow = (url: string) => {
  const { pathname } = new URL(url);
  return `<tr><td><a href="${escapeXml(pathname)}">${escapeXml(url)}</a></td></tr>`;
};

const htmlTable = (heading: string, urls: string[]) => `<table>
<thead>
<tr><th>${heading}</th></tr>
</thead>
<tbody>
${urls.map(htmlRow).join('\n')}
</tbody>
</table>`;

/** Browser view of the index: same table as the XSL, with clickable child sitemaps. */
export function renderSitemapIndexHtml(): string {
  return renderHtmlPage(`${htmlTable('Sitemap', sitemaps.map(({ file }) => `${siteOrigin}/${file}`))}
<p class="count">This XML Sitemap Index file contains ${countText(sitemaps.length, 'sitemap', 'sitemaps')}.</p>`);
}

/** Browser view of a child sitemap, with a link back to the index. */
export function renderSitemapHtml({ pages }: SitemapDefinition): string {
  const entries = pages();
  return renderHtmlPage(`<p class="back"><a href="/sitemap.xml">&#8592; Sitemap index</a></p>
${htmlTable('URL', entries.map(({ path }) => siteOrigin + path))}
<p class="count">This XML Sitemap file contains ${countText(entries.length, 'URL', 'URLs')}.</p>`);
}

const xslTemplates = `
  <xsl:template match="s:sitemapindex">
    <table>
      <thead>
        <tr><th>Sitemap</th></tr>
      </thead>
      <tbody>
        <xsl:for-each select="s:sitemap">
          <tr>
            <td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
    <p class="count">
      This XML Sitemap Index file contains <xsl:value-of select="count(s:sitemap)" />
      <xsl:choose>
        <xsl:when test="count(s:sitemap) = 1"> sitemap.</xsl:when>
        <xsl:otherwise> sitemaps.</xsl:otherwise>
      </xsl:choose>
    </p>
  </xsl:template>

  <xsl:template match="s:urlset">
    <p class="back"><a href="/sitemap.xml">&#8592; Sitemap index</a></p>
    <table>
      <thead>
        <tr><th>URL</th></tr>
      </thead>
      <tbody>
        <xsl:for-each select="s:url">
          <tr>
            <td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
    <p class="count">
      This XML Sitemap file contains <xsl:value-of select="count(s:url)" />
      <xsl:choose>
        <xsl:when test="count(s:url) = 1"> URL.</xsl:when>
        <xsl:otherwise> URLs.</xsl:otherwise>
      </xsl:choose>
    </p>
  </xsl:template>`;

/** XSL for direct XML views; only the stylesheet is shared, the table markup is XSLT. */
export function renderSitemapXsl(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>XML Sitemap</title>
        <style>
${sitemapCss}
        </style>
      </head>
      <body>
        <main>
          <h1>XML Sitemap</h1>
          <xsl:apply-templates select="s:sitemapindex | s:urlset" />
        </main>
      </body>
    </html>
  </xsl:template>
${xslTemplates}
</xsl:stylesheet>
`;
}

export const xmlHeaders = { 'Content-Type': 'application/xml; charset=utf-8' };
