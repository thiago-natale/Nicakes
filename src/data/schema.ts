/**
 * Dados estruturados (schema.org, JSON-LD) — um único @graph por página,
 * com os nós ligados por @id. Só informações visíveis no site e verdadeiras
 * (nada de avaliações, coordenadas ou dados que não existem aqui).
 *
 * - Bakery (LocalBusiness) + WebSite: em todas as páginas (ligam o WebPage à marca).
 * - WebPage: por página; BreadcrumbList nas páginas internas (trilha visível).
 * - Extras por página: Menu (/cardapio), Product + Offer (/encomendas),
 *   FAQPage (seções de FAQ — faqPageNode(), com as perguntas de data/faq.ts).
 *
 * Arquivo DERIVADO: monta os nós a partir dos outros arquivos de data/, sem repetir valores deles.
 */
import { brand } from './brand';
import { phone, whatsappUrl } from './contact';
import { DAY_NAMES, hours, isOpen } from './hours';
import type { FaqItem } from './faq';
import { legal } from './legal';
import { address } from './location';
import { ifoodUrl, instagram } from './social';
import { menu, birthdayCake, partySweets, type MenuGroup, type MenuItem } from './menu';
import { orderGallery, photoSrc } from './orderGallery';
import { absoluteUrl, pages, type PageSeo } from './seo';
import { formatKg } from '@/lib/format';

type Node = Record<string, unknown>;

/** Horários (data/hours.ts) → OpeningHoursSpecification */
function openingHours(): Node[] {
  return hours.filter(isOpen).map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days.map((d) => DAY_NAMES[d]),
    opens: h.opens,
    closes: h.closes,
  }));
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
      name: brand.fullName,
      alternateName: brand.alternateNames,
      description: brand.description,
      slogan: brand.manifesto,
      url: home,
      logo: { '@type': 'ImageObject', '@id': id.logo, url: absoluteUrl('/icon-512.png', s), width: 512, height: 512 },
      image: absoluteUrl('/og-image.jpg', s),
      telephone: phone.international,
      taxID: legal.cnpj,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: phone.international,
        url: whatsappUrl,
        areaServed: 'BR',
        availableLanguage: 'pt-BR',
      },
      knowsAbout: brand.knowsAbout,
      ...(brand.foundingDate ? { foundingDate: brand.foundingDate } : {}),
      priceRange: 'R$',
      currenciesAccepted: 'BRL',
      servesCuisine: ['Confeitaria', 'Doces', 'Salgados', 'Café'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.street,
        addressLocality: address.city,
        addressRegion: address.state,
        postalCode: address.postalCode,
        addressCountry: 'BR',
      },
      hasMap: address.mapsUrl,
      areaServed: { '@type': 'City', name: `${address.city} – ${address.state}` },
      openingHoursSpecification: openingHours(),
      hasMenu: absoluteUrl(pages.cardapio.path, s),
      sameAs: [instagram.url, ifoodUrl],
    },
    {
      '@type': 'WebSite',
      '@id': id.website,
      url: home,
      name: brand.fullName,
      // Nome do site nos resultados do Google: o principal + as variações buscadas
      alternateName: brand.alternateNames,
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
    name: `Cardápio da ${brand.fullName}`,
    inLanguage: 'pt-BR',
    provider: { '@id': ids(s).business },
    hasMenuSection: menu.map((category): Node => ({
      '@type': 'MenuSection',
      name: category.title,
      hasMenuSection: category.groups.map((group) => ({
        '@type': 'MenuSection',
        name: group.title,
        hasMenuItem: group.items.flatMap((item) => menuItemNode(item, group)),
      })),
    })).concat([
      {
        '@type': 'MenuSection',
        name: 'Docinhos de festa (sob encomenda)',
        description: `Vendidos por cento; pedido mínimo de ${partySweets.rules.minTotal} unidades, somando os tipos.`,
        hasMenuItem: partySweets.categories.map((c) => ({
          '@type': 'MenuItem',
          name: c.name,
          description: `${c.weight}. Sabores: ${c.flavors.join(', ')}.`,
          offers: {
            '@type': 'Offer',
            price: c.pricePerHundred.toFixed(2),
            priceCurrency: 'BRL',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: c.pricePerHundred.toFixed(2),
              priceCurrency: 'BRL',
              referenceQuantity: { '@type': 'QuantitativeValue', value: partySweets.rules.unit, unitCode: 'C62' },
            },
          },
        })),
      },
    ] as Node[]),
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
      .join(', ')}), o tamanho (${sizes}), a massa e até ${birthdayCake.rules.maxFillings} recheios. Retirada na loja em ${address.city}.`,
    image: orderGallery.filter((p) => p.kind === 'cake').slice(0, 3).map((p) => absoluteUrl(photoSrc(p), s)),
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

/** Docinhos de festa (sob encomenda) — Product com uma oferta por tipo (preço do cento). */
export function partySweetsGraph(s: URL | undefined): Node {
  const url = absoluteUrl(pages.encomendas.path, s);
  const { minTotal, unit } = partySweets.rules;
  return {
    '@type': 'Product',
    '@id': `${url}#docinhos`,
    name: 'Docinhos de festa sob encomenda',
    description: `Brigadeiros gourmet, super gourmet, mini brownies e brigadeiros personalizados, vendidos por cento (pedido mínimo de ${minTotal} unidades, somando os tipos). Retirada na loja em ${address.city}.`,
    brand: { '@id': ids(s).business },
    image: orderGallery.filter((p) => p.kind === 'sweets').slice(0, 3).map((p) => absoluteUrl(photoSrc(p), s)),
    category: 'Docinhos de festa',
    offers: partySweets.categories.map((c) => ({
      '@type': 'Offer',
      name: `${c.name} (${c.flavors.join(', ')})`,
      url,
      priceCurrency: 'BRL',
      price: c.pricePerHundred.toFixed(2),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: c.pricePerHundred.toFixed(2),
        priceCurrency: 'BRL',
        referenceQuantity: { '@type': 'QuantitativeValue', value: unit, unitCode: 'C62' },
      },
      seller: { '@id': ids(s).business },
      availability: 'https://schema.org/PreOrder',
    })),
  };
}

/** Script JSON-LD final (um @graph). */
export const toJsonLd = (nodes: Node[]): string => JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });

/** FAQPage de uma seção de perguntas (bloco JSON-LD próprio, dentro da seção). */
export const faqPageNode = (items: FaqItem[], id: string) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': id,
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});
