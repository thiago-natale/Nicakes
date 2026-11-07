/**
 * IndexNow — avisa Bing, Yandex e outros buscadores (o Bing alimenta o ChatGPT
 * Search e o Copilot) de que as páginas do site mudaram. O Google não usa
 * IndexNow (ele lê o sitemap).
 *
 * Roda AUTOMATICAMENTE pelo GitHub Actions (.github/workflows/indexnow.yml)
 * quando a Vercel conclui um deploy de produção. Também dá para rodar à mão:
 *   npm run indexnow
 *
 * Lê o sitemap e a chave DO SITE PUBLICADO, então o deploy precisa estar no ar.
 * Antes de enviar, espera a chave responder (o domínio pode levar alguns
 * segundos para servir a versão nova).
 */
const SITE_URL = (process.env.SITE_URL ?? 'https://www.nicakesconfeitaria.com.br').replace(/\/$/, '');
const KEY = 'a125c911fca46bf31b93075b379370ce';
const KEY_URL = `${SITE_URL}/${KEY}.txt`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForKey(tries = 6) {
  for (let i = 1; i <= tries; i += 1) {
    try {
      const r = await fetch(KEY_URL, { cache: 'no-store' });
      if (r.ok && (await r.text()).trim() === KEY) return;
      console.log(`Chave ainda indisponível (${r.status}), tentativa ${i}/${tries}…`);
    } catch (e) {
      console.log(`Site indisponível (${e.message}), tentativa ${i}/${tries}…`);
    }
    await sleep(10_000);
  }
  throw new Error(`A chave do IndexNow não respondeu em ${KEY_URL}. O deploy está no ar?`);
}

await waitForKey();

const sitemap = await fetch(`${SITE_URL}/sitemap.xml`, { cache: 'no-store' }).then((r) => {
  if (!r.ok) throw new Error(`Sitemap indisponível (${r.status}) em ${SITE_URL}/sitemap.xml`);
  return r.text();
});
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error('Sitemap sem URLs.');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, keyLocation: KEY_URL, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} — ${urlList.length} URLs enviadas`);
urlList.forEach((u) => console.log(`  ${u}`));
// 200 = recebido · 202 = recebido, chave em validação
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
