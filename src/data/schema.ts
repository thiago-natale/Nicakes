/**
 * Dados estruturados (schema.org, JSON-LD) — um único @graph por página,
 * com os nós ligados por @id. Só informações visíveis no site e verdadeiras
 * (nada de avaliações, coordenadas ou dados que não existem aqui).
 *
 * - Bakery (LocalBusiness) + WebSite: em todas as páginas (ligam o WebPage à marca).
 * - WebPage: por página; BreadcrumbList nas páginas internas (trilha visível).
 * - Extras por página: Menu (/cardapio), Product + Offer (/encomendas),
 *   FAQPage (seções de FAQ — ver Faq/faq.ts).
 */
import { site } from './site';
import { menu, birthdayCake, formatKg, type MenuGroup, type MenuItem } from './menu';
import { orderGallery, photoSrc } from './orderGallery';
import { absoluteUrl, pages, type PageSeo } from './seo';

type Node = Record<string, unknown>;

const DAYS: Record<string, string> = {
  Su: 'Sunday',
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
};
const ORDER = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** "Tu-Sa 09:00-19:00" → OpeningHoursSpecification */
function openingHours(): Node[] {
  return site.hours
    .filter((h) => h.schema)
    .map((h) => {
      const [days, time] = (h.schema as string).split(' ');
      const [opens, closes] = time.split('-');
      const [a, b] = days.split('-');
      const start = ORDER.indexOf(a);
      const end = ORDER.indexOf(b ?? a);
      const dayOfWeek: string[] = [];
      for (let d = start; ; d = (d + 1) % 7) {
        dayOfWeek.push(DAYS[ORDER[d]]);
        if (d === end) break;
      }
      return { '@type': 'OpeningHoursSpecification', dayOfWeek, opens, closes };
    });
}

export const ids = (s: URL | undefined) => {
  const root = absoluteUrl('/', s);
  return {
    business: `${root}#confeitaria`,
    website: `${root}#website`,
    logo: `${root}#logo`,
  };
};

/** Nós globais: a confeitaria (Bakery = LocalBusiness) e o site. */
export function baseGraph(s: URL | undefined): Node[] {
  const id = ids(s);
  const home = absoluteUrl('/', s);
  return [
    {
      '@type': 'Bakery',
      '@id': id.business,
      name: site.fullName,
      alternateName: site.name,
      description: site.description,
      slogan: site.manifesto,
      url: home,
      logo: { '@type': 'ImageObject', '@id': id.logo, url: absoluteUrl('/icon-512.png', s), width: 512, height: 512 },
      image: absoluteUrl('/og-image.jpg', s),
      telephone: site.phone.e164,
      taxID: site.legal.cnpj,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: site.phone.e164,
        url: site.whatsapp,
        areaServed: 'BR',
        availableLanguage: 'pt-BR',
      },
      knowsAbout: site.knowsAbout,
      ...(site.foundingDate ? { foundingDate: site.foundingDate } : {}),
      priceRange: 'R$',
      currenciesAccepted: 'BRL',
      servesCuisine: ['Confeitaria', 'Doces', 'Salgados', 'Café'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.state,
        postalCode: site.address.postalCode,
        addressCountry: 'BR',
      },
      hasMap: site.address.mapsUrl,
      areaServed: { '@type': 'City', name: `${site.address.city} – ${site.address.state}` },
      openingHoursSpecification: openingHours(),
      hasMenu: absoluteUrl(pages.cardapio.path, s),
      sameAs: [site.instagram.url, site.ifood],
    },
    {
      '@type': 'WebSite',
      '@id': id.website,
      url: home,
      name: site.fullName,
      inLanguage: 'pt-BR',
      publisher: { '@id': id.business },
    },
  ];
}

/** WebPage da página atual (+ BreadcrumbList nas internas). */
export function pageGraph(page: PageSeo, s: URL | undefined, extra: { mainEntity?: string } = {}): Node[] {
  const id = ids(s);
  const url = absoluteUrl(page.path, s);
  const nodes: Node[] = [];
  const webPage: Node = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: 'pt-BR',
    dateModified: page.updated,
    isPartOf: { '@id': id.website },
    about: { '@id': id.business },
    primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl('/og-image.jpg', s) },
  };
  if (extra.mainEntity) webPage.mainEntity = { '@id': extra.mainEntity };
  if (page.path !== '/') {
    webPage.breadcrumb = { '@id': `${url}#breadcrumb` };
    nodes.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: pages.home.name, item: absoluteUrl('/', s) },
        { '@type': 'ListItem', position: 2, name: page.name, item: url },
      ],
    });
  }
  nodes.unshift(webPage);
  return nodes;
}

/* -------------------------------------------------------------------------- */
/* /cardapio — Menu com seções e itens (preços visíveis na página)            */
/* -------------------------------------------------------------------------- */

function menuItemNode(item: MenuItem, group: MenuGroup): Node[] {
  const offer = (price: number, variant?: string): Node => ({
    '@type': 'Offer',
    price: price.toFixed(2),
    priceCurrency: 'BRL',
    ...(variant ? { name: variant } : {}),
  });
  const offers = item.prices && group.columns ? item.prices.map((p, i) => offer(p, group.columns?.[i])) : item.price !== undefined ? [offer(item.price)] : [];
  return [
    {
      '@type': 'MenuItem',
      name: item.name,
      ...(item.detail ? { description: item.detail } : {}),
      ...(offers.length ? { offers: offers.length === 1 ? offers[0] : offers } : {}),
    },
  ];
}

export function menuGraph(s: URL | undefined): Node {
  const url = absoluteUrl(pages.cardapio.path, s);
  return {
    '@type': 'Menu',
    '@id': `${url}#menu`,
    name: `Cardápio da ${site.fullName}`,
    inLanguage: 'pt-BR',
    provider: { '@id': ids(s).business },
    hasMenuSection: menu.map((category) => ({
      '@type': 'MenuSection',
      name: category.title,
      hasMenuSection: category.groups.map((group) => ({
        '@type': 'MenuSection',
        name: group.title,
        hasMenuItem: group.items.flatMap((item) => menuItemNode(item, group)),
      })),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* /encomendas — bolo de aniversário (preço por kg, conforme a decoração)     */
/* -------------------------------------------------------------------------- */

export function birthdayCakeGraph(s: URL | undefined): Node {
  const url = absoluteUrl(pages.encomendas.path, s);
  const sizes = birthdayCake.sizes.map((x) => `${formatKg(x.kg)} (${x.serves})`).join(', ');
  return {
    '@type': 'Product',
    '@id': `${url}#bolo-de-aniversario`,
    name: 'Bolo de aniversário sob encomenda',
    description: `Bolo de aniversário personalizado: escolha a decoração (${birthdayCake.decorations
      .map((d) => d.name.toLowerCase())
      .join(', ')}), o tamanho (${sizes}), a massa e até ${birthdayCake.rules.maxFillings} recheios. Retirada na loja em ${site.address.city}.`,
    image: orderGallery.slice(0, 3).map((p) => absoluteUrl(photoSrc(p), s)),
    brand: { '@id': ids(s).business },
    category: 'Bolos de aniversário',
    offers: birthdayCake.decorations.map((d) => ({
      '@type': 'Offer',
      name: `Decoração ${d.name.toLowerCase()}`,
      url,
      priceCurrency: 'BRL',
      price: d.pricePerKg.toFixed(2),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: d.pricePerKg.toFixed(2),
        priceCurrency: 'BRL',
        referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'KGM' },
      },
      seller: { '@id': ids(s).business },
      availability: 'https://schema.org/PreOrder',
    })),
  };
}

/** Script JSON-LD final (um @graph). */
export const toJsonLd = (nodes: Node[]): string => JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
