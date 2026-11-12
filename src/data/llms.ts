/**
 * Conteúdo dos arquivos /llms.txt e /llms-full.txt (padrão proposto em llmstxt.org)
 * — resumo da marca em Markdown para assistentes de IA. Tudo é montado a partir
 * dos mesmos dados do site (site.ts, menu.ts, seo.ts, FAQs), então nunca diverge
 * do que está nas páginas.
 */
import { site } from './site';
import { menu, birthdayCake, formatKg, formatPrice, cakePriceFrom, partySweets, sweetsPriceFrom, type MenuItem, type MenuGroup } from './menu';
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
  } recheios por bolo, encomenda com ${birthdayCake.rules.leadBusinessDays} dia de antecedência e retirada na loja. Os docinhos de festa (brigadeiros gourmet, super gourmet, mini brownies e personalizados) custam a partir de ${formatPrice(
    sweetsPriceFrom(),
  )} o cento, com pedido mínimo de ${partySweets.rules.minTotal} unidades (somando os tipos) e ${partySweets.rules.leadBusinessDays} dias de antecedência. Bolo e docinhos podem ir no mesmo pedido, montado em ${url(
    pages.encomendas.path,
  )} e enviado pelo WhatsApp, onde a loja confirma o valor final.`;
}

export function llmsTxt(s: URL | undefined): string {
  const url = (p: string) => absoluteUrl(p, s);
  return `${intro(s)}

## Páginas principais
- [Início](${url('/')}): apresentação da confeitaria, mais pedidos, prévia do cardápio, encomendas, loja e contato
- [Cardápio com preços](${url(pages.cardapio.path)}): salgados, doces, bebidas, bolos de aniversário e docinhos de festa (#docinhos), com preços atualizados em ${monthYear(pages.cardapio.updated)}
- [Encomendas: bolo de aniversário e docinhos](${url(pages.encomendas.path)}): formulário para montar o bolo e escolher os docinhos, com o valor de cada item na hora

## Produtos
- [Bolo de aniversário sob encomenda](${url(pages.encomendas.path)}): a partir de ${formatPrice(cakePriceFrom())} o quilo; decoração ${birthdayCake.decorations.map((d) => d.name.toLowerCase()).join(', ')}
- [Docinhos de festa sob encomenda](${url(pages.encomendas.path)}): ${partySweets.categories.map((c) => `${c.name.toLowerCase()} ${formatPrice(c.pricePerHundred)} o cento`).join('; ')}
${menu
  .map((c) => `- [${c.title}](${url(pages.cardapio.path)}#${c.id}): ${categorySummary(c.id)}`)
  .join('\n')}

## Perguntas frequentes
- [Dúvidas gerais](${url('/')}#faq): pedidos, iFood, endereço e horário
- [Dúvidas sobre o cardápio](${url(pages.cardapio.path)}#faq): preços, formas de pedido, entrega e disponibilidade
- [Dúvidas sobre encomendas](${url(pages.encomendas.path)}#faq): preço do bolo e dos docinhos, quantidades, antecedência, retirada e confirmação

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

  const sw = partySweets;
  const sweetsMd = `## Docinhos de festa sob encomenda

Página: ${absoluteUrl(pages.encomendas.path, s)}

${sw.categories.map((c) => `- ${c.name} (${c.weight}): ${formatPrice(c.pricePerHundred)} o cento. Sabores: ${c.flavors.join(', ')}.`).join('\n')}
- ${sw.custom.name}: valor a combinar, conforme a decoração. ${sw.extras.map((e) => `${e.name} (${e.hint?.toLowerCase()}): valor a combinar.`).join(' ')}
- Quantidades: preço por cento, calculado pela quantidade; sabores de ${sw.rules.step} em ${sw.rules.step} unidades (até ${sw.rules.unit / sw.rules.step} sabores por cento); pedido mínimo de ${sw.rules.minTotal} unidades, somando os tipos.
- Antecedência: ${sw.rules.leadBusinessDays} dias de funcionamento. Retirada na loja.
- Bolo e docinhos podem ir no mesmo pedido; o resumo mostra o valor de cada item.`;

  return `${intro(s)}

## Cardápio (preços atualizados em ${monthYear(pages.cardapio.updated)})

${menuMd}

${cakeMd}

${sweetsMd}

## Perguntas frequentes

${faqMd('Gerais', faqItems)}

${faqMd('Cardápio', menuFaqItems)}

${faqMd('Encomendas', orderFaqItems)}
`;
}
