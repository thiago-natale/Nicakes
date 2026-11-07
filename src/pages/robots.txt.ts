/**
 * robots.txt — libera todo o site para buscadores e robôs de IA (busca, citação
 * e treinamento) e aponta o sitemap e o llms.txt. Não há áreas a bloquear
 * (sem admin, carrinho ou busca interna). URLs vêm de `site` (astro.config.mjs).
 */
import type { APIRoute } from 'astro';

const BOTS = [
  'Googlebot',
  'Bingbot',
  'Google-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'Applebot',
  'Applebot-Extended',
  'CCBot',
  'Meta-ExternalAgent',
];

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap.xml', site).toString();
  const llms = new URL('/llms.txt', site).toString();
  const lines = [
    '# Nicake’s Confeitaria — buscadores e assistentes de IA são bem-vindos.',
    `# Resumo para IAs: ${llms}`,
    '',
    ...BOTS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${sitemap}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
