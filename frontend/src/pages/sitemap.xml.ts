import type { APIRoute } from 'astro';
import { allRoutes, homeTranslations } from '../data/routes';
import { siteOrigin } from '../config/site';

export const GET: APIRoute = () => {
  const pages = [
    ...Object.values(homeTranslations).map((path) => ({ path, translations: homeTranslations })),
    ...allRoutes().map((route) => ({
      path: `/${route.lang}/${route.slug}/`,
      translations: route.translations,
    })),
  ];
  const entries = pages.map(({ path, translations }) => `<url>
    <loc>${siteOrigin}${path}</loc>
    ${Object.entries(translations).map(([lang, target]) =>
      `<xhtml:link rel="alternate" hreflang="${lang}" href="${siteOrigin}${target}" />`,
    ).join('\n    ')}
  </url>`).join('\n  ');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${entries}
</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
