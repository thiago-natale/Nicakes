/**
 * Formatadores genéricos (pt-BR). Não guardam dados: recebem um valor bruto e
 * devolvem a versão de exibição. Usados por src/data/* e pelos componentes.
 */

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Preço em reais: 15 → "R$ 15,00" (o Intl usa espaço não separável). */
export function formatPrice(value: number): string {
  return brl.format(value);
}

/** Peso: 1.5 → "1,5 kg" */
export const formatKg = (kg: number): string => `${kg.toLocaleString('pt-BR')} kg`;

/** Data ISO → mês e ano: "2026-11-06" → "novembro de 2026" (textos "Atualizado em …"). */
export const monthYear = (date: string): string =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));

/** Dígitos de um telefone em E.164: "+5534996520660" → { country: "55", area: "34", number: "996520660" } */
function phoneParts(e164: string): { country: string; area: string; number: string } {
  const digits = e164.replace(/\D/g, '');
  return { country: digits.slice(0, 2), area: digits.slice(2, 4), number: digits.slice(4) };
}

/** "996520660" → "99652-0660"; "33334444" → "3333-4444" */
const splitNumber = (n: string): string => `${n.slice(0, -4)}-${n.slice(-4)}`;

/** Telefone nacional: "+5534996520660" → "(34) 99652-0660" */
export function formatPhone(e164: string): string {
  const { area, number } = phoneParts(e164);
  return `(${area}) ${splitNumber(number)}`;
}

/** Telefone internacional legível: "+5534996520660" → "+55 34 99652-0660" */
export function formatPhoneIntl(e164: string): string {
  const { country, area, number } = phoneParts(e164);
  return `+${country} ${area} ${splitNumber(number)}`;
}

/** Hora "09:00" → "9h" (ou "09h" com `pad`); "09:30" → "9h30". */
export function formatHour(time: string, pad = false): string {
  const [h, m] = time.split(':');
  const hour = pad ? h.padStart(2, '0') : String(Number(h));
  return m && m !== '00' ? `${hour}h${m}` : `${hour}h`;
}
