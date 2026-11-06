/**
 * Perguntas frequentes (trazidas do site anterior, nicakeconfeitaria.netlify.app #faq).
 * Endereço e horários vêm de `data/site.ts` — mude lá e o FAQ acompanha.
 */
import { site } from '../../../data/site';
import { birthdayCake, cakePriceFrom, formatKg, formatPrice } from '../../../data/menu';

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
      'Sim! Encomendas com pelo menos 1 dia de antecedência, para retirada na loja. Monte o pedido no site: ele chega pronto no nosso WhatsApp e a gente confirma sabores, disponibilidade e data.',
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
    link: { label: 'Montar meu bolo', href: '/encomendas' },
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
/* /encomendas — dúvidas sobre o bolo de aniversário (dados de data/menu.ts)   */
/* -------------------------------------------------------------------------- */

const yields = birthdayCake.sizes.map((x) => `${formatKg(x.kg)}, ${x.serves}`).join('; ');
const decorations = birthdayCake.decorations.map((d) => `${d.name.toLowerCase()}, ${formatPrice(d.pricePerKg)}`).join('; ');
const extras = birthdayCake.extras.map((e) => `${e.name.toLowerCase()} (+${formatPrice(e.price)})`).join(', ');
const fruitFee = birthdayCake.fillings.find((f) => f.price);

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
    question: 'Com quanto tempo de antecedência preciso encomendar?',
    answer: `Com pelo menos ${birthdayCake.rules.leadBusinessDays} dia de funcionamento de antecedência. O formulário já mostra a data mais próxima disponível; às segundas-feiras a loja fica fechada.`,
  },
  {
    question: 'Vocês entregam o bolo?',
    answer: `Por enquanto, os bolos de aniversário são retirados na loja: ${site.address.street}, ${site.address.district}, ${site.address.city}. Você escolhe a data e o período (manhã ou tarde) no pedido.`,
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
