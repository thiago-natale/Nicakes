// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * URL final do site (sem barra no fim). Usada nas URLs canônicas, no sitemap,
 * no robots.txt, no Open Graph e nos dados estruturados.
 * Domínio oficial (Vercel + registro.br), com www. Pode ser sobrescrito pela
 * variável de ambiente SITE_URL (ex.: para testar um preview da Vercel).
 */
const SITE_URL = process.env.SITE_URL ?? 'https://www.nicakesconfeitaria.com.br';

// Static Site Generation (SSG)
export default defineConfig({
  output: 'static',
  site: SITE_URL,
  vite: {
    plugins: [tailwindcss()],
  },
});
