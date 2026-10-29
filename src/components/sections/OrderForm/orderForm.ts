/**
 * Encomenda de bolo — lógica pura (sem DOM): preço, datas, validação e a
 * mensagem do WhatsApp. Fonte dos dados: `birthdayCake` (src/data/menu.ts) e os
 * horários da loja (`site.hours`). Testável em Node.
 */
import { birthdayCake, defaultDecoration, formatKg, formatPrice, type CakeDecoration } from '../../../data/menu';
import { site } from '../../../data/site';

export interface OrderSelection {
  /** Nome da decoração (define o preço do quilo) */
  decoration: string;
  kg: number | null;
  dough: string;
  fillings: string[];
  /** Resposta do campo complementar de cada recheio (ex.: "Qual fruta?") */
  fillingAnswers: Record<string, string>;
  extras: string[];
  /** Resposta do campo complementar de cada adicional (ex.: tema do topo) */
  extraAnswers: Record<string, string>;
  /** AAAA-MM-DD */
  date: string;
  period: '' | 'manha' | 'tarde';
  name: string;
  notes: string;
}

export const emptySelection = (): OrderSelection => ({
  decoration: defaultDecoration().name,
  kg: null,
  dough: '',
  fillings: [],
  fillingAnswers: {},
  extras: [],
  extraAnswers: {},
  date: '',
  period: '',
  name: '',
  notes: '',
});

export const PERIODS = { manha: 'pela manhã', tarde: 'à tarde' } as const;
export const NOTES_MAX = 300;

/* ------------------------------------------------------------------ */
/* Preço                                                               */
/* ------------------------------------------------------------------ */

export interface PriceLine {
  label: string;
  value: number;
}

/** Decoração escolhida (ou a padrão, se não houver/for desconhecida). */
export const decorationOf = (sel: Pick<OrderSelection, 'decoration'>): CakeDecoration =>
  birthdayCake.decorations.find((d) => d.name === sel.decoration) ?? defaultDecoration();

/** Preço do quilo conforme a decoração. */
export const pricePerKgOf = (sel: Pick<OrderSelection, 'decoration'>): number => decorationOf(sel).pricePerKg;

/** O adicional pode ser escolhido com a decoração atual? */
export function extraAvailable(name: string, decoration: string): boolean {
  const e = birthdayCake.extras.find((x) => x.name === name);
  return !e?.notWith?.includes(decoration);
}

/** Linhas do valor estimado (bolo por kg + taxas de recheio + adicionais). */
export function priceLines(sel: OrderSelection): PriceLine[] {
  const lines: PriceLine[] = [];
  if (sel.kg) lines.push({ label: `Bolo de ${formatKg(sel.kg)} · ${decorationOf(sel).name}`, value: sel.kg * pricePerKgOf(sel) });
  for (const name of sel.fillings) {
    const f = birthdayCake.fillings.find((x) => x.name === name);
    if (f?.price) lines.push({ label: `Recheio: ${f.name}`, value: f.price });
  }
  for (const name of sel.extras) {
    const e = birthdayCake.extras.find((x) => x.name === name);
    if (e && extraAvailable(e.name, sel.decoration)) lines.push({ label: e.name, value: e.price });
  }
  return lines;
}

export const calcTotal = (sel: OrderSelection): number => priceLines(sel).reduce((sum, l) => sum + l.value, 0);

/* ------------------------------------------------------------------ */
/* Datas — retirada com antecedência mínima, só em dias de funcionamento */
/* ------------------------------------------------------------------ */

const DAY_CODES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Dias da semana (0 = domingo) em que a loja abre, lidos de `site.hours` ("Tu-Sa 09:00-19:00"). */
export function openWeekdays(): Set<number> {
  const open = new Set<number>();
  for (const h of site.hours) {
    if (!h.schema) continue;
    const days = h.schema.split(' ')[0];
    for (const part of days.split(',')) {
      const [a, b] = part.split('-');
      const start = DAY_CODES.indexOf(a);
      const end = DAY_CODES.indexOf(b ?? a);
      if (start < 0 || end < 0) continue;
      for (let d = start; ; d = (d + 1) % 7) {
        open.add(d);
        if (d === end) break;
      }
    }
  }
  return open;
}

const OPEN = openWeekdays();
export const isOpenDay = (d: Date): boolean => OPEN.has(d.getDay());

/** "2026-11-08" (data local, sem fuso) */
export function toISODate(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function fromISODate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Primeira data de retirada: `leadBusinessDays` dias de funcionamento depois de hoje. */
export function earliestPickup(today: Date = new Date()): Date {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let count = 0;
  while (count < birthdayCake.rules.leadBusinessDays) {
    d.setDate(d.getDate() + 1);
    if (isOpenDay(d)) count += 1;
  }
  return d;
}

const weekdayFmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
/** "sábado, 08/11/2026" */
export const formatPickupDate = (d: Date): string => `${weekdayFmt.format(d)}, ${dateFmt.format(d)}`;

/* ------------------------------------------------------------------ */
/* Validação                                                           */
/* ------------------------------------------------------------------ */

export type OrderErrors = Partial<Record<string, string>>;

/** Erros por campo (chave = `name` do campo no formulário). */
export function validate(sel: OrderSelection, today: Date = new Date()): OrderErrors {
  const e: OrderErrors = {};
  if (!birthdayCake.decorations.some((d) => d.name === sel.decoration)) e.decoration = 'Escolha a decoração.';
  if (!sel.kg) e.size = 'Escolha o tamanho do bolo.';
  if (!sel.dough) e.dough = 'Escolha a massa.';
  if (!sel.fillings.length) e.filling = 'Escolha pelo menos 1 recheio.';
  else if (sel.fillings.length > birthdayCake.rules.maxFillings) e.filling = `Escolha no máximo ${birthdayCake.rules.maxFillings} recheios.`;
  sel.fillings.forEach((name) => {
    const f = birthdayCake.fillings.find((x) => x.name === name);
    if (f?.ask && !sel.fillingAnswers[name]?.trim()) e[answerField('filling', name)] = `Conte pra gente: ${f.ask.toLowerCase()}`;
  });
  sel.extras.forEach((name) => {
    const x = birthdayCake.extras.find((i) => i.name === name);
    if (!extraAvailable(name, sel.decoration)) return;
    if (x?.ask && !sel.extraAnswers[name]?.trim()) e[answerField('extra', name)] = `Preencha: ${x.ask.toLowerCase()}`;
  });
  const date = fromISODate(sel.date);
  const min = earliestPickup(today);
  if (!date) e.date = 'Escolha a data de retirada.';
  else if (date < min) e.date = `A data mais próxima para retirada é ${formatPickupDate(min)}.`;
  else if (!isOpenDay(date)) e.date = 'Nesse dia a loja está fechada. Escolha outra data.';
  if (!sel.period) e.period = 'Escolha o período de retirada.';
  if (!sel.name.trim()) e.name = 'Informe o seu nome.';
  if (sel.notes.length > NOTES_MAX) e.notes = `Use até ${NOTES_MAX} caracteres.`;
  return e;
}

/** Nome do campo complementar de um recheio/adicional ("filling-answer-6"). */
export function answerField(kind: 'filling' | 'extra', name: string): string {
  const list = kind === 'filling' ? birthdayCake.fillings : birthdayCake.extras;
  return `${kind}-answer-${list.findIndex((x) => x.name === name)}`;
}

/* ------------------------------------------------------------------ */
/* Mensagem do WhatsApp                                                */
/* ------------------------------------------------------------------ */

export function buildMessage(sel: OrderSelection): string {
  const total = calcTotal(sel);
  const size = birthdayCake.sizes.find((s) => s.kg === sel.kg);
  const fillings = sel.fillings.map((name) => {
    const f = birthdayCake.fillings.find((x) => x.name === name);
    const answer = sel.fillingAnswers[name]?.trim();
    let text = answer ? `${name} (${answer})` : name;
    if (f?.price) text += ` +${formatPrice(f.price)}`;
    return text;
  });
  const extras = sel.extras.filter((name) => extraAvailable(name, sel.decoration)).map((name) => {
    const answer = sel.extraAnswers[name]?.trim();
    return answer ? `${name} (${answer})` : name;
  });
  const date = fromISODate(sel.date);
  const needsConfirm = sel.fillings.some((n) => birthdayCake.fillings.find((x) => x.name === n)?.confirm);

  const lines = [
    `Olá, ${site.name}! Montei meu bolo de aniversário pelo site:`,
    '',
    `• Decoração: ${decorationOf(sel).name} (${formatPrice(pricePerKgOf(sel))}/kg)`,
    `• Tamanho: ${sel.kg ? formatKg(sel.kg) : '—'}${size ? ` (${size.serves})` : ''}`,
    `• Massa: ${sel.dough || '—'}`,
    `• Recheio${fillings.length > 1 ? 's' : ''}: ${fillings.join(' e ') || '—'}`,
    `• Adicionais: ${extras.length ? extras.join(' · ') : 'nenhum'}`,
    `• Retirada na loja: ${date ? formatPickupDate(date) : '—'}${sel.period ? `, ${PERIODS[sel.period]}` : ''}`,
    `• Nome: ${sel.name.trim()}`,
  ];
  if (sel.notes.trim()) lines.push(`• Observações: ${sel.notes.trim()}`);
  lines.push('', `Valor estimado: ${formatPrice(total)}`);
  if (needsConfirm) lines.push('Podem confirmar a disponibilidade do sabor à escolha?');
  lines.push('Aguardo a confirmação do pedido e do valor final. Obrigado(a)!');
  return lines.join('\n');
}
