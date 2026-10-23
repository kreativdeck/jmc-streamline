import type { APIRoute } from 'astro';
import { renderSitemap, sitemaps, xmlHeaders } from '../data/sitemaps';

export const GET: APIRoute = () => new Response(renderSitemap(sitemaps[0]), { headers: xmlHeaders });
