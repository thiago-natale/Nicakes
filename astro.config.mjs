// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static Site Generation (SSG)
export default defineConfig({
  output: 'static',
  // TODO: defina o domínio quando houver (ex.: 'https://nicakes.com.br') para gerar
  // URLs canônicas e a imagem de compartilhamento com endereço absoluto.
  // site: 'https://nicakes.com.br',
  vite: {
    plugins: [tailwindcss()],
  },
});
