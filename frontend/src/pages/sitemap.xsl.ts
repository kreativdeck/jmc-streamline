import type { APIRoute } from 'astro';
import { renderSitemapXsl } from '../data/sitemaps';

export const GET: APIRoute = () => new Response(renderSitemapXsl(), {
  headers: { 'Content-Type': 'application/xslt+xml; charset=utf-8' },
});
