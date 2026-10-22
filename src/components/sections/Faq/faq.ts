/**
 * Perguntas frequentes (trazidas do site anterior, nicakeconfeitaria.netlify.app #faq).
 * Endereço e horários vêm de `data/site.ts` — mude lá e o FAQ acompanha.
 */
import { site, whatsappLink } from '../../../data/site';

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
      'Sim! A Nicake’s recebe encomendas. Para consultar sabores, disponibilidade e prazo, é só falar com a gente pelo WhatsApp.',
    link: { label: 'Falar no WhatsApp', href: whatsappLink('Olá! Gostaria de saber mais sobre encomendas na Nicake’s.') },
  },
  {
    question: 'Como faço meu pedido?',
    answer: 'Você pode pedir pelo iFood, chamar a Nicake’s no WhatsApp ou visitar a nossa loja em Uberaba.',
  },
  {
    question: 'Posso encomendar um bolo de aniversário?',
    answer:
      'Pode, sim. Você escolhe a massa, o recheio e os detalhes da decoração. Conte a sua ideia pelo WhatsApp e a gente cuida do resto.',
    link: { label: 'Ver opções de bolos', href: '/cardapio#bolos' },
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
