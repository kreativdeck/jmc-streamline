// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { siteOrigin } from './src/config/site';
import { allRoutes, homeTranslations } from './src/data/routes';
import sitemapHtmlViews from './integrations/sitemap-html-views.mjs';

/**
 * The two language versions of a page use different slugs, so the sitemap
 * integration's prefix-based i18n matching cannot pair them. The route
 * inventory knows the pairs: it defines the canonical pages (everything else,
 * e.g. the root redirect, stays out of the sitemap) and their hreflang links.
 */
/** @type {Map<string, { de: string; en: string }>} */
const translationsByUrl = new Map();
for (const path of Object.values(homeTranslations)) translationsByUrl.set(siteOrigin + path, homeTranslations);
for (const route of allRoutes()) translationsByUrl.set(`${siteOrigin}/${route.lang}/${route.slug}/`, route.translations);

export default defineConfig({
  site: siteOrigin,
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => translationsByUrl.has(page),
      serialize(item) {
        const translations = translationsByUrl.get(item.url);
        if (!translations) return undefined;
        item.links = Object.entries(translations).map(([lang, path]) => ({ lang, url: siteOrigin + path }));
        return item;
      },
    }),
    // must come after the sitemap integration: it reads the files written there
    sitemapHtmlViews(),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: { '/api/contact': 'http://127.0.0.1:4322' },
    },
    preview: {
      proxy: { '/api/contact': 'http://127.0.0.1:4322' },
    },
  },
});
