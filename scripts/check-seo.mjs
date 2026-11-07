/**
 * Checagem de SEO/GEO do build (roda depois do `astro build`, inclusive na Vercel).
 * Se algo essencial quebrar, o build falha e o deploy não vai para o ar.
 *
 * Confere em dist/:
 *  - cada página indexável: <title>, meta description, canônica absoluta no
 *    domínio oficial, um único <h1>, robots sem noindex e JSON-LD válido;
 *  - a 404 com noindex;
 *  - sitemap.xml (URLs do domínio, uma página para cada), robots.txt, llms.txt,
 *    llms-full.txt e o arquivo de chave do IndexNow.
 * Uso: node scripts/check-seo.mjs   (variáveis: SITE_URL, DIST)
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = process.env.DIST ?? 'dist';
const SITE = (process.env.SITE_URL ?? 'https://www.nicakesconfeitaria.com.br').replace(/\/$/, '');
const INDEXNOW_KEY = 'a125c911fca46bf31b93075b379370ce';

const errors = [];
const warns = [];
const read = (p) => fs.readFileSync(path.join(DIST, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(DIST, p));
const unescape = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** URL do sitemap → arquivo HTML no dist (directory format ou .html). */
function fileFor(url) {
  const p = new URL(url).pathname.replace(/\/$/, '');
  for (const f of [p === '' ? 'index.html' : `${p.slice(1)}/index.html`, `${p.slice(1)}.html`]) if (f && exists(f)) return f;
  return null;
}

function checkPage(file, url) {
  const html = read(file);
  const where = `${url} (${file})`;
  const title = unescape(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const desc = unescape(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;

  if (!title) errors.push(`${where}: sem <title>`);
  else if (title.length < 30 || title.length > 65) warns.push(`${where}: title com ${title.length} caracteres (ideal 50–60)`);
  if (!desc) errors.push(`${where}: sem meta description`);
  else if (desc.length < 70 || desc.length > 170) warns.push(`${where}: description com ${desc.length} caracteres (ideal 140–160)`);
  if (!canonical) errors.push(`${where}: sem canônica`);
  else if (canonical !== url) errors.push(`${where}: canônica ${canonical} diferente da URL do sitemap`);
  if (/noindex/.test(robots)) errors.push(`${where}: página do sitemap com noindex`);
  if (h1 !== 1) errors.push(`${where}: ${h1} <h1> (precisa ter exatamente 1)`);

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) errors.push(`${where}: sem JSON-LD`);
  for (const [, json] of blocks) {
    try {
      JSON.parse(json);
    } catch (e) {
      errors.push(`${where}: JSON-LD inválido (${e.message})`);
    }
  }
}

// sitemap.xml
if (!exists('sitemap.xml')) errors.push('sitemap.xml não foi gerado');
const urls = exists('sitemap.xml') ? [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) : [];
if (exists('sitemap.xml') && !urls.length) errors.push('sitemap.xml sem URLs');
for (const url of urls) {
  if (!url.startsWith(SITE)) {
    errors.push(`sitemap: ${url} fora do domínio ${SITE}`);
    continue;
  }
  const file = fileFor(url);
  if (!file) errors.push(`sitemap: ${url} não tem página gerada`);
  else checkPage(file, url);
}

// 404 fora dos buscadores
const notFound = ['404.html', '404/index.html'].find(exists);
if (!notFound) warns.push('404 não encontrada no build');
else if (!/<meta name="robots" content="noindex/.test(read(notFound))) errors.push('404 sem noindex');

// robots, llms e IndexNow
if (!exists('robots.txt')) errors.push('robots.txt não foi gerado');
else if (!read('robots.txt').includes(`Sitemap: ${SITE}/sitemap.xml`)) errors.push('robots.txt sem a linha Sitemap do domínio oficial');
for (const f of ['llms.txt', 'llms-full.txt']) {
  if (!exists(f)) errors.push(`${f} não foi gerado`);
  else if (!read(f).startsWith('# ')) errors.push(`${f} não começa com "# Nome da marca"`);
}
if (!exists(`${INDEXNOW_KEY}.txt`)) errors.push('arquivo de chave do IndexNow ausente em public/');

for (const w of warns) console.warn(`⚠️  ${w}`);
if (errors.length) {
  console.error(`\n✖ Checagem de SEO/GEO: ${errors.length} erro(s)\n${errors.map((e) => `  - ${e}`).join('\n')}\n`);
  process.exit(1);
}
console.log(`✓ Checagem de SEO/GEO: ${urls.length} páginas do sitemap OK, robots, llms e IndexNow presentes.`);
