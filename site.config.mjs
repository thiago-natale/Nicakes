/**
 * Configuração única do site — lida pelo Astro (astro.config.mjs), pelo código
 * (src/data/config.ts) e pelos scripts de build/deploy (scripts/*.mjs).
 * Mude aqui; nenhum outro arquivo repete estes valores.
 */

/**
 * URL final do site (sem barra no fim). Usada nas URLs canônicas, no sitemap,
 * no robots.txt, no Open Graph, nos dados estruturados e no IndexNow.
 * Pode ser sobrescrita pela variável de ambiente SITE_URL (ex.: preview da Vercel).
 */
export const SITE_URL = (process.env.SITE_URL ?? 'https://www.nicakesconfeitaria.com.br').replace(/\/$/, '');

/**
 * Chave pública do IndexNow. O arquivo `public/<chave>.txt` precisa existir com
 * este mesmo conteúdo (é por ele que os buscadores confirmam a propriedade).
 */
export const INDEXNOW_KEY = 'a125c911fca46bf31b93075b379370ce';
