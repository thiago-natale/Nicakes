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
  /** Prioridade no sitemap (0–1) */
  priority: number;
  changefreq: 'weekly' | 'monthly' | 'yearly';
}

export const pages = {
  home: {
    path: '/',
    name: 'Início',
    title: 'Confeitaria em Uberaba: bolos, doces e café | Nicake’s',
    description:
      'Confeitaria artesanal em Uberaba: bolos, brigadeiros, donuts, salgados e café. Encomende seu bolo de aniversário, peça pelo WhatsApp ou iFood e visite a loja.',
    priority: 1,
    changefreq: 'weekly',
  },
  cardapio: {
    path: '/cardapio',
    name: 'Cardápio',
    title: 'Cardápio com preços: doces, salgados e café | Nicake’s',
    description:
      'Veja o cardápio completo da Nicake’s em Uberaba, com preços: cakes, donuts, brownies, tortas, salgados, cafés e milk-shakes. Peça pelo WhatsApp ou iFood.',
    priority: 0.9,
    changefreq: 'weekly',
  },
  encomendas: {
    path: '/encomendas',
    name: 'Encomendas',
    title: 'Bolo de aniversário sob encomenda em Uberaba | Nicake’s',
    description:
      'Monte seu bolo de aniversário na Nicake’s: decoração, tamanho, massa e recheios, com valor estimado na hora. Envie o pedido pelo WhatsApp e retire em Uberaba.',
    priority: 0.9,
    changefreq: 'monthly',
  },
  privacidade: {
    path: '/privacidade',
    name: 'Política de privacidade',
    title: 'Política de privacidade | Nicake’s Confeitaria Uberaba',
    description:
      'Saiba como o site da Nicake’s Confeitaria trata seus dados: o pedido montado fica no seu navegador e só é enviado quando você abre o WhatsApp. Sem cadastro.',
    priority: 0.2,
    changefreq: 'yearly',
  },
  termos: {
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

/** Páginas indexáveis (sitemap). A 404 fica de fora (noindex). */
export const indexablePages: PageSeo[] = Object.values(pages);

/** URL absoluta, sem barra no fim (exceto a raiz) — mesmo formato dos links internos. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const clean = path === '/' ? '/' : path.replace(/\/+$/, '');
  return `${base}${clean}`;
}
