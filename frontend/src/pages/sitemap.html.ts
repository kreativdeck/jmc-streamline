import type { APIRoute } from 'astro';
import { renderSitemapIndexHtml } from '../data/sitemaps';

export const GET: APIRoute = () => new Response(renderSitemapIndexHtml(), {
  headers: { 'Content-Type': 'text/html; charset=utf-8' },
});
