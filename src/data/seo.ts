/**
 * SEO por página — título (50–60 caracteres), descrição (140–160), rótulo da
 * trilha de navegação e prioridade no sitemap. Fonte única: o layout, o
 * sitemap.xml e os dados estruturados leem daqui.
 * Mapa de palavras-chave: claude/seo-palavras-chave.md (projeto).
 */
export interface PageSeo {
  path: string;
  title: string;
  description: string;
  /** Nome na trilha de navegação (breadcrumb) e no WebPage */
  name: string;
  /** Última atualização do conteúdo (AAAA-MM-DD) — WebPage.dateModified e sitemap */
  updated: string;
  /** Prioridade no sitemap (0–1) */
  priority: number;
  changefreq: 'weekly' | 'monthly' | 'yearly';
}

export const pages = {
  home: {
    updated: '2026-11-06',
    path: '/',
    name: 'Início',
    title: 'Confeitaria em Uberaba: bolos, doces e café | Nicake’s',
    // Mesma frase canônica de data/site.ts (description)
    description:
      'A Nicake’s Confeitaria é uma confeitaria artesanal em Uberaba-MG que faz bolos de aniversário sob encomenda, doces, salgados e café para o dia a dia e festas.',
    priority: 1,
    changefreq: 'weekly',
  },
  cardapio: {
    // Atualize quando mudar preços em data/menu.ts (aparece como "Preços atualizados em…")
    updated: '2026-11-06',
    path: '/cardapio',
    name: 'Cardápio',
    title: 'Cardápio com preços: doces, salgados e café | Nicake’s',
    description:
      'Veja o cardápio completo da Nicake’s em Uberaba, com preços: cakes, donuts, brownies, tortas, salgados, cafés e milk-shakes. Peça pelo WhatsApp ou iFood.',
    priority: 0.9,
    changefreq: 'weekly',
  },
  encomendas: {
    updated: '2026-11-06',
    path: '/encomendas',
    name: 'Encomendas',
    title: 'Bolo de aniversário sob encomenda em Uberaba | Nicake’s',
    description:
      'Monte seu bolo de aniversário na Nicake’s: decoração, tamanho, massa e recheios, com valor estimado na hora. Envie o pedido pelo WhatsApp e retire em Uberaba.',
    priority: 0.9,
    changefreq: 'monthly',
  },
  privacidade: {
    updated: '2026-11-06',
    path: '/privacidade',
    name: 'Política de privacidade',
    title: 'Política de privacidade | Nicake’s Confeitaria Uberaba',
    description:
      'Saiba como o site da Nicake’s Confeitaria trata seus dados: o pedido montado fica no seu navegador e só é enviado quando você abre o WhatsApp. Sem cadastro.',
    priority: 0.2,
    changefreq: 'yearly',
  },
  termos: {
    updated: '2026-11-06',
    path: '/termos',
    name: 'Termos de uso',
    title: 'Termos de uso do site | Nicake’s Confeitaria Uberaba',
    description:
      'Termos de uso do site da Nicake’s Confeitaria, em Uberaba: preços e disponibilidade, encomendas confirmadas pelo WhatsApp, fotos ilustrativas e contato.',
    priority: 0.2,
    changefreq: 'yearly',
  },
} satisfies Record<string, PageSeo>;

export type PageKey = keyof typeof pages;

/** "2026-11-06" → "novembro de 2026" (textos "Atualizado em …"). */
export const monthYear = (date: string): string =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));

/** Páginas indexáveis (sitemap). A 404 fica de fora (noindex). */
export const indexablePages: PageSeo[] = Object.values(pages);

/** URL absoluta, sem barra no fim (exceto a raiz) — mesmo formato dos links internos. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const clean = path === '/' ? '/' : path.replace(/\/+$/, '');
  return `${base}${clean}`;
}
