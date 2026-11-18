/**
 * Contato — telefone/WhatsApp e links de CTA com mensagem pronta.
 * O número é guardado uma vez (E.164); as versões de exibição são calculadas.
 * Usado em: botões de WhatsApp, contato, FAQ, páginas legais, schema e llms.txt.
 */
import { formatPhone, formatPhoneIntl } from '@/lib/format';
import { brand } from './brand';

const PHONE_E164 = '+5534996520660';

export const phone = {
  /** "+5534996520660" */
  e164: PHONE_E164,
  /** "(34) 99652-0660" */
  display: formatPhone(PHONE_E164),
  /** "+55 34 99652-0660" (schema) */
  international: formatPhoneIntl(PHONE_E164),
  /** "tel:+5534996520660" */
  tel: `tel:${PHONE_E164}`,
} as const;

const WHATSAPP_NUMBER = PHONE_E164.replace(/\D/g, '');
const WHATSAPP_DEFAULT_MESSAGE = `Olá! Conheci a ${brand.name} pelo site e gostaria de saber mais sobre encomendas.`;

/** Link do WhatsApp com mensagem pré-preenchida. */
export function whatsappLink(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  const params = new URLSearchParams({ phone: WHATSAPP_NUMBER, text: message, type: 'phone_number', app_absent: '0' });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

/** Mensagem padrão para pedir um produto específico pelo WhatsApp. */
export function whatsappOrderLink(product: string): string {
  return whatsappLink(`Olá! Vi no site da ${brand.name} e gostaria de pedir: ${product}.`);
}

/** Link padrão do WhatsApp (mensagem genérica). */
export const whatsappUrl = whatsappLink();
