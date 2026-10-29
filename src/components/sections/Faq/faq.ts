/**
 * Perguntas frequentes (trazidas do site anterior, nicakeconfeitaria.netlify.app #faq).
 * Endereço e horários vêm de `data/site.ts` — mude lá e o FAQ acompanha.
 */
import { site } from '../../../data/site';
import { birthdayCake, formatPrice } from '../../../data/menu';

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
      `Pode, sim. O bolo custa ${formatPrice(birthdayCake.pricePerKg)} o quilo: você escolhe o tamanho, a massa, até ${birthdayCake.rules.maxFillings} recheios e os adicionais, e a gente cuida do resto.`,
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

/** Dados estruturados (schema.org FAQPage) para os buscadores. */
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};
