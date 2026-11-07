/** sitemap.xml — gerado a cada build com as páginas indexáveis (data/seo.ts). */
import type { APIRoute } from 'astro';
import { indexablePages, absoluteUrl } from '../data/seo';

export const GET: APIRoute = ({ site }) => {
  const urls = indexablePages
    .map(
      (p) => `  <url>
    <loc>${absoluteUrl(p.path, site)}</loc>
    <lastmod>${p.updated}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
