/**
 * Perguntas frequentes (trazidas do site anterior, nicakeconfeitaria.netlify.app #faq).
 * Endereço e horários vêm de `data/site.ts` — mude lá e o FAQ acompanha.
 */
import { site } from '../../../data/site';
import { AVAILABILITY_NOTE, birthdayCake, cakePriceFrom, formatKg, formatPrice, menu, menuItem, partySweets, sweetsPriceFrom } from '../../../data/menu';
import { pages, monthYear } from '../../../data/seo';

export interface FaqItem {
  question: string;
  answer: string;
  link?: { label: string; href: string };
}

const hours = site.hours.map((h) => `${h.long}: ${h.short.toLowerCase()}`).join(' · ');

export const faqItems: FaqItem[] = [
  {
    question: 'Vocês fazem encomendas?',
    answer:
      `Sim! Bolos de aniversário (com ${birthdayCake.rules.leadBusinessDays} dia de antecedência) e docinhos de festa (com ${partySweets.rules.leadBusinessDays} dias), para retirada na loja. Monte o pedido no site, com bolo, docinhos ou os dois: ele chega pronto no nosso WhatsApp e a gente confirma sabores, disponibilidade e data.`,
    link: { label: 'Montar minha encomenda', href: '/encomendas' },
  },
  {
    question: 'Como faço meu pedido?',
    answer: 'Você pode pedir pelo iFood, chamar a Nicake’s no WhatsApp ou visitar a nossa loja em Uberaba.',
  },
  {
    question: 'Posso encomendar um bolo de aniversário?',
    answer:
      `Pode, sim. O quilo sai a partir de ${formatPrice(cakePriceFrom())} e varia com a decoração: ${birthdayCake.decorations
        .map((d) => `${d.name.toLowerCase()}, ${formatPrice(d.pricePerKg)}`)
        .join('; ')}. Você escolhe a decoração, o tamanho, a massa, até ${birthdayCake.rules.maxFillings} recheios e os adicionais, e a gente cuida do resto.`,
    link: { label: 'Montar meu bolo', href: '/encomendas?pedido=bolo' },
  },
  {
    question: 'Vocês estão no iFood?',
    answer: 'Estamos! O botão “Pedir no iFood” leva direto para a página oficial da Nicake’s no aplicativo.',
    link: { label: 'Abrir no iFood', href: site.ifood },
  },
  {
    question: 'Onde fica a Nicake’s?',
    answer: `${site.address.street}, ${site.address.district}, ${site.address.city} – ${site.address.state}. CEP ${site.address.postalCode}.`,
    link: { label: 'Como chegar', href: site.address.mapsUrl },
  },
  {
    question: 'Qual é o horário de funcionamento?',
    answer: `${hours}.`,
  },
  {
    question: 'Os produtos estão disponíveis todos os dias?',
    answer:
      'Alguns sabores e produtos variam ao longo do dia. Consulte a disponibilidade pelo WhatsApp, pelo iFood ou direto na loja.',
  },
];

/* -------------------------------------------------------------------------- */
/* /encomendas — dúvidas sobre bolo e docinhos (dados de data/menu.ts)         */
/* -------------------------------------------------------------------------- */

const yields = birthdayCake.sizes.map((x) => `${formatKg(x.kg)}, ${x.serves}`).join('; ');
const decorations = birthdayCake.decorations.map((d) => `${d.name.toLowerCase()}, ${formatPrice(d.pricePerKg)}`).join('; ');
const extras = birthdayCake.extras.map((e) => `${e.name.toLowerCase()} (+${formatPrice(e.price)})`).join(', ');
const fruitFee = birthdayCake.fillings.find((f) => f.price);
const sweetPrices = partySweets.categories.map((c) => `${c.name.toLowerCase()}, ${formatPrice(c.pricePerHundred)}`).join('; ');
const { step: sweetStep, minTotal, unit } = partySweets.rules;

export const orderFaqItems: FaqItem[] = [
  {
    question: 'Quanto custa um bolo de aniversário na Nicake’s?',
    answer: `O preço é por quilo e depende da decoração: ${decorations}. Os adicionais são opcionais: ${extras}.${
      fruitFee ? ` O recheio “${fruitFee.name.toLowerCase()}” tem taxa de ${formatPrice(fruitFee.price ?? 0)}.` : ''
    } O formulário mostra o valor estimado na hora.`,
  },
  {
    question: 'Qual tamanho de bolo eu preciso?',
    answer: `Rendimento informado pela loja: ${yields}. A quantidade de fatias depende de como o bolo é cortado.`,
  },
  {
    question: 'Quanto custam os docinhos de festa?',
    answer: `Os docinhos são vendidos por cento, e o valor é calculado pela quantidade: ${sweetPrices}. Os brigadeiros personalizados e a cereja em cima dos mini brownies têm valor a combinar, conforme a decoração.`,
  },
  {
    question: 'Qual a quantidade mínima de docinhos?',
    answer: `O pedido mínimo é de ${minTotal} docinhos, somando todos os tipos (dá para misturar brigadeiros gourmet, super gourmet, mini brownies e personalizados). Os sabores vão de ${sweetStep} em ${sweetStep} unidades, ou seja, até ${unit / sweetStep} sabores a cada ${unit}.`,
  },
  {
    question: 'Posso encomendar bolo e docinhos no mesmo pedido?',
    answer: 'Pode, sim. No formulário, marque “Bolo de aniversário” e “Docinhos”: o resumo mostra o valor de cada item separado e o total, e tudo vai numa mensagem só pelo WhatsApp.',
  },
  {
    question: 'Com quanto tempo de antecedência preciso encomendar?',
    answer: `O bolo precisa de pelo menos ${birthdayCake.rules.leadBusinessDays} dia de funcionamento de antecedência, e os docinhos, de ${partySweets.rules.leadBusinessDays} dias. Num pedido com os dois, vale o prazo maior. O formulário já mostra a data mais próxima disponível; às segundas-feiras a loja fica fechada.`,
  },
  {
    question: 'Vocês entregam o bolo e os docinhos?',
    answer: `Por enquanto, as encomendas são retiradas na loja: ${site.address.street}, ${site.address.district}, ${site.address.city}. Você escolhe a data e o período (manhã ou tarde) no pedido.`,
    link: { label: 'Como chegar', href: site.address.mapsUrl },
  },
  {
    question: 'Posso escolher mais de um recheio?',
    answer: `Pode escolher até ${birthdayCake.rules.maxFillings} recheios por bolo, entre ${birthdayCake.fillings.length} sabores. Nos sabores à escolha (geleia ou frutas), a disponibilidade é confirmada pelo WhatsApp.`,
  },
  {
    question: 'Como o pedido é confirmado?',
    answer:
      'Ao enviar o formulário, o WhatsApp abre com o pedido já escrito. A Nicake’s confere tudo, confirma a disponibilidade, a data e o valor final, e o pedido fica combinado.',
    link: { label: 'Falar no WhatsApp', href: site.whatsapp },
  },
];


/* -------------------------------------------------------------------------- */
/* /cardapio — dúvidas sobre o cardápio (preços e itens de data/menu.ts)       */
/* -------------------------------------------------------------------------- */

const allPrices = menu.flatMap((c) => c.groups.flatMap((g) => g.items.flatMap((i) => i.prices ?? (i.price !== undefined ? [i.price] : []))));
const itemCount = menu.reduce((n, c) => n + c.groups.reduce((m, g) => m + g.items.length, 0), 0);
const groupsOf = (id: string): string =>
  (menu.find((c) => c.id === id)?.groups ?? []).map((g) => g.title.toLowerCase()).join(', ');
const example = (id: string): string => {
  const r = menuItem(id, 'FAQ do cardápio (Faq/faq.ts)');
  return `${r.fullName.toLowerCase()} (${formatPrice(r.price)})`;
};
const updatedLabel = monthYear(pages.cardapio.updated);

export const menuFaqItems: FaqItem[] = [
  {
    question: 'O que tem no cardápio da Nicake’s?',
    answer: `O cardápio da Nicake’s Confeitaria tem ${itemCount} itens em ${menu.length} categorias: ${menu
      .map((c) => c.title.toLowerCase())
      .join(', ')}. Nos doces há ${groupsOf('doces')}; nas bebidas, ${groupsOf('bebidas')}.`,
  },
  {
    question: 'Quanto custam os produtos da Nicake’s?',
    answer: `Os preços do cardápio vão de ${formatPrice(Math.min(...allPrices))} a ${formatPrice(Math.max(...allPrices))}. Alguns exemplos: ${example(
      'pao-de-queijo',
    )}, ${example('coxinha-costela')}, ${example('cake-matilda')} e ${example('cappuccino')}.`,
  },
  {
    question: 'Como faço um pedido do cardápio?',
    answer: `Você pode pedir na loja, em ${site.address.street}, ${site.address.city}; pelo WhatsApp ${site.phone.display}; ou com entrega pelo iFood. Bolos de aniversário e docinhos de festa são encomendados pela página de encomendas.`,
    link: { label: 'Encomendar bolo ou docinhos', href: '/encomendas' },
  },
  {
    question: 'Vocês fazem docinhos para festa?',
    answer: `Fazemos, sob encomenda: ${partySweets.categories
      .map((c) => `${c.name.toLowerCase()} (${formatPrice(c.pricePerHundred)} o cento)`)
      .join(', ')} e brigadeiros personalizados com o tema da festa. O pedido mínimo é de ${partySweets.rules.minTotal} docinhos, somando os tipos, com ${
      partySweets.rules.leadBusinessDays
    } dias de antecedência.`,
    link: { label: 'Escolher meus docinhos', href: '/encomendas?pedido=docinhos' },
  },
  {
    question: 'A Nicake’s faz entrega em Uberaba?',
    answer:
      'Sim, os itens do cardápio podem ser pedidos com entrega pelo iFood. As encomendas de bolo de aniversário e docinhos, por enquanto, são retiradas na loja.',
    link: { label: 'Abrir no iFood', href: site.ifood },
  },
  {
    question: 'Todos os sabores estão sempre disponíveis?',
    answer: `Não necessariamente. ${AVAILABILITY_NOTE} Para cakes em fatia e tortas doces, vale confirmar pelo WhatsApp antes de ir à loja.`,
  },
  {
    question: 'Qual é o horário de funcionamento da loja?',
    answer: `${hours}.`,
  },
  {
    question: 'Os preços do cardápio estão atualizados?',
    answer: `Os preços desta página foram atualizados em ${updatedLabel}. Eles podem mudar sem aviso; o valor final é confirmado no atendimento.`,
  },
];

/** Dados estruturados (schema.org FAQPage) para os buscadores — só as perguntas visíveis. */
export const faqSchema = (items: FaqItem[], id: string) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': id,
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});
