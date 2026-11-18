/**
 * Canais externos — redes sociais e plataformas de pedido.
 * Usado em: hero, cardápio, contato, rodapé, FAQ, schema (sameAs) e llms.txt.
 */
import { whatsappUrl } from './contact';

export const instagram = {
  handle: '@nicakesconfeitaria_',
  url: 'https://www.instagram.com/nicakesconfeitaria_/',
} as const;

export const ifoodUrl =
  'https://www.ifood.com.br/delivery/uberaba-mg/nicakes-confeitaria-estados-unidos/0c03bbe1-6c0f-4f40-958e-e37251988135';

/** Ícones do rodapé, na ordem de exibição. */
export const socialLinks = [
  { name: 'Instagram', icon: 'instagram', href: instagram.url },
  { name: 'WhatsApp', icon: 'whatsapp', href: whatsappUrl },
  { name: 'iFood', icon: 'bag', href: ifoodUrl },
] as const;
