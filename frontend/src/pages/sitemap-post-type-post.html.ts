import type { APIRoute } from 'astro';
import { renderSitemapHtml, sitemaps } from '../data/sitemaps';

export const GET: APIRoute = () => new Response(renderSitemapHtml(sitemaps[1]), {
  headers: { 'Content-Type': 'text/html; charset=utf-8' },
});
