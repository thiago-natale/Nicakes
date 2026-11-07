/**
 * Conteúdo dos arquivos /llms.txt e /llms-full.txt (padrão proposto em llmstxt.org)
 * — resumo da marca em Markdown para assistentes de IA. Tudo é montado a partir
 * dos mesmos dados do site (site.ts, menu.ts, seo.ts, FAQs), então nunca diverge
 * do que está nas páginas.
 */
import { site } from './site';
import { menu, birthdayCake, formatKg, formatPrice, cakePriceFrom, type MenuItem, type MenuGroup } from './menu';
import { absoluteUrl, pages, monthYear } from './seo';
import { faqItems, orderFaqItems, menuFaqItems, type FaqItem } from '../components/sections/Faq/faq';

const hours = site.hours.map((h) => `${h.long}: ${h.time}`).join('; ');
const allPrices = menu.flatMap((c) => c.groups.flatMap((g) => g.items.flatMap((i) => i.prices ?? (i.price !== undefined ? [i.price] : []))));
const itemCount = menu.reduce((n, c) => n + c.groups.reduce((m, g) => m + g.items.length, 0), 0);

/** Grupos do cardápio, ou os itens quando a categoria tem um grupo só. */
function categorySummary(id: string): string {
  const c = menu.find((x) => x.id === id);
  if (!c) return '';
  const list = c.groups.length > 1 ? c.groups.map((g) => g.title.toLowerCase()) : c.groups[0].items.map((i) => i.name.toLowerCase());
  return list.join(', ');
}

function intro(s: URL | undefined): string {
  const url = (p: string) => absoluteUrl(p, s);
  return `# ${site.fullName}

> ${site.description}

A ${site.fullName} fica em ${site.address.street}, ${site.address.district}, ${site.address.city} – ${site.address.state} (CEP ${site.address.postalCode}). Horário: ${hours}. CNPJ ${site.legal.cnpj}.

O cardápio da ${site.fullName} tem ${itemCount} itens entre salgados, doces e bebidas, com preços de ${formatPrice(Math.min(...allPrices))} a ${formatPrice(
    Math.max(...allPrices),
  )}. Os pedidos podem ser feitos na loja, pelo WhatsApp ${site.phone.display} ou com entrega pelo iFood.

Os bolos de aniversário sob encomenda custam a partir de ${formatPrice(cakePriceFrom())} o quilo (o preço depende da decoração), com até ${
    birthdayCake.rules.maxFillings
  } recheios por bolo, encomenda com ${birthdayCake.rules.leadBusinessDays} dia de antecedência e retirada na loja. O pedido é montado em ${url(
    pages.encomendas.path,
  )} e enviado pelo WhatsApp, onde a loja confirma o valor final.`;
}

export function llmsTxt(s: URL | undefined): string {
  const url = (p: string) => absoluteUrl(p, s);
  return `${intro(s)}

## Páginas principais
- [Início](${url('/')}): apresentação da confeitaria, mais pedidos, prévia do cardápio, encomendas, loja e contato
- [Cardápio com preços](${url(pages.cardapio.path)}): salgados, doces, bebidas e bolos de aniversário, com preços atualizados em ${monthYear(pages.cardapio.updated)}
- [Encomendas: monte seu bolo de aniversário](${url(pages.encomendas.path)}): formulário com decoração, tamanho, massa, recheios e valor estimado na hora

## Produtos
- [Bolo de aniversário sob encomenda](${url(pages.encomendas.path)}): a partir de ${formatPrice(cakePriceFrom())} o quilo; decoração ${birthdayCake.decorations.map((d) => d.name.toLowerCase()).join(', ')}
${menu
  .map((c) => `- [${c.title}](${url(pages.cardapio.path)}#${c.id}): ${categorySummary(c.id)}`)
  .join('\n')}

## Perguntas frequentes
- [Dúvidas gerais](${url('/')}#faq): pedidos, iFood, endereço e horário
- [Dúvidas sobre o cardápio](${url(pages.cardapio.path)}#faq): preços, formas de pedido, entrega e disponibilidade
- [Dúvidas sobre encomendas](${url(pages.encomendas.path)}#faq): preço por quilo, tamanhos, antecedência, retirada e confirmação

## Contato
- [WhatsApp ${site.phone.display}](${site.whatsapp})
- [Instagram ${site.instagram.handle}](${site.instagram.url})
- [iFood](${site.ifood})
- [Como chegar (Google Maps)](${site.address.mapsUrl})

## Opcional
- [Conteúdo completo para IAs](${url('/llms-full.txt')})
- [Política de privacidade](${url(pages.privacidade.path)})
- [Termos de uso](${url(pages.termos.path)})
`;
}

/* -------------------------------------------------------------------------- */

function priceText(item: MenuItem, group: MenuGroup): string {
  if (item.prices && group.columns) return item.prices.map((p, i) => `${group.columns?.[i]}: ${formatPrice(p)}`).join(' · ');
  return item.price !== undefined ? formatPrice(item.price) : '';
}

const faqMd = (title: string, items: FaqItem[]): string =>
  `### ${title}\n\n${items.map((f) => `**${f.question}**\n${f.answer}`).join('\n\n')}`;

export function llmsFullTxt(s: URL | undefined): string {
  const menuMd = menu
    .map(
      (c) =>
        `### ${c.title}\n\n${c.groups
          .map(
            (g) =>
              `#### ${g.title}${g.note ? ` (${g.note.replace(/\.$/, '')})` : ''}\n\n${g.items
                .map((i) => `- ${i.name}: ${priceText(i, g)}${i.detail ? ` — ${i.detail}` : ''}`)
                .join('\n')}`,
          )
          .join('\n\n')}`,
    )
    .join('\n\n');

  const cake = birthdayCake;
  const cakeMd = `## Bolos de aniversário sob encomenda

Página: ${absoluteUrl(pages.encomendas.path, s)}

- Preço por quilo, conforme a decoração: ${cake.decorations.map((d) => `${d.name} ${formatPrice(d.pricePerKg)}/kg`).join('; ')}.
- Tamanhos e rendimento: ${cake.sizes.map((x) => `${formatKg(x.kg)} (${x.serves})`).join('; ')}.
- Massas: ${cake.doughs.join(', ')}.
- Recheios (até ${cake.rules.maxFillings} por bolo): ${cake.fillings.map((f) => (f.price ? `${f.name} (+${formatPrice(f.price)})` : f.name)).join(', ')}.
- Adicionais: ${cake.extras.map((e) => `${e.name} (+${formatPrice(e.price)})`).join(', ')}.
- Antecedência: ${cake.rules.leadBusinessDays} dia de funcionamento. Retirada na loja (sem entrega por enquanto).
- Como pedir: montar o bolo no site; o WhatsApp abre com o pedido escrito e a loja confirma disponibilidade, data e valor final.`;

  return `${intro(s)}

## Cardápio (preços atualizados em ${monthYear(pages.cardapio.updated)})

${menuMd}

${cakeMd}

## Perguntas frequentes

${faqMd('Gerais', faqItems)}

${faqMd('Cardápio', menuFaqItems)}

${faqMd('Encomendas', orderFaqItems)}
`;
}
