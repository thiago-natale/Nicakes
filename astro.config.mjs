// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { SITE_URL } from './site.config.mjs';

// SITE_URL e demais valores únicos ficam em site.config.mjs
// Static Site Generation (SSG)
export default defineConfig({
  output: 'static',
  site: SITE_URL,
  vite: {
    // Cast: o Tailwind e o Astro trazem versões diferentes dos tipos do Vite (só tipagem, funciona igual)
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
