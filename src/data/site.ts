/**
 * Dados globais da Nicake's Confeitaria.
 * Altere aqui contato, horários, links e textos institucionais.
 */
const WHATSAPP_NUMBER = '5534996520660';
const WHATSAPP_DEFAULT_MESSAGE =
  'Olá! Conheci a Nicake’s pelo site e gostaria de saber mais sobre encomendas.';

/** Link do WhatsApp com mensagem pré-preenchida. */
export function whatsappLink(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  const params = new URLSearchParams({ phone: WHATSAPP_NUMBER, text: message, type: 'phone_number', app_absent: '0' });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

/** Mensagem padrão para pedir um produto específico pelo WhatsApp. */
export function whatsappOrderLink(product: string): string {
  return whatsappLink(`Olá! Vi no site da Nicake’s e gostaria de pedir: ${product}.`);
}

export const site = {
  name: 'Nicake’s',
  fullName: 'Nicake’s Confeitaria',
  tagline: 'Confeitaria',
  description:
    'Nicake’s Confeitaria em Uberaba-MG: bolos, brigadeiros, donuts, brownies, salgados e café feitos com carinho. Atendimento presencial, encomendas pelo WhatsApp e delivery pelo iFood.',
  manifesto: 'Carinho que se transforma em doçura.',
  address: {
    street: 'Av. Quinze de Novembro, 715',
    district: 'Res. Estados Unidos',
    city: 'Uberaba',
    state: 'MG',
    postalCode: '38015-305',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Av.+Quinze+de+Novembro,+715+-+Res.+Estados+Unidos,+Uberaba+-+MG,+38015-305',
  },
  hours: [
    { label: 'Ter a sáb', long: 'Terça a sábado', time: '9h às 19h', short: '09h — 19h', schema: 'Tu-Sa 09:00-19:00' },
    { label: 'Domingo', long: 'Domingo', time: '9h às 16h', short: '09h — 16h', schema: 'Su 09:00-16:00' },
    { label: 'Segunda', long: 'Segunda-feira', time: 'Fechado', short: 'Fechado', schema: null },
  ],
  phone: {
    display: '(34) 99652-0660',
    tel: 'tel:+5534996520660',
    e164: '+55 34 99652-0660',
  },
  whatsapp: whatsappLink(),
  ifood:
    'https://www.ifood.com.br/delivery/uberaba-mg/nicakes-confeitaria-estados-unidos/0c03bbe1-6c0f-4f40-958e-e37251988135',
  instagram: {
    handle: '@nicakesconfeitaria_',
    url: 'https://www.instagram.com/nicakesconfeitaria_/',
  },
  year: new Date().getFullYear(),
} as const;

export const social = [
  { name: 'Instagram', icon: 'instagram', href: site.instagram.url },
  { name: 'WhatsApp', icon: 'whatsapp', href: site.whatsapp },
  { name: 'iFood', icon: 'bag', href: site.ifood },
] as const;

