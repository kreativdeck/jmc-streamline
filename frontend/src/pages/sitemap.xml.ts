import type { APIRoute } from 'astro';
import { renderSitemapIndex, xmlHeaders } from '../data/sitemaps';

export const GET: APIRoute = () => new Response(renderSitemapIndex(), { headers: xmlHeaders });
