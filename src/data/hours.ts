/**
 * Funcionamento — horários da loja.
 * Cada faixa guarda os dias (códigos schema.org) e o horário uma única vez;
 * os textos de exibição e o schema são calculados pelos helpers abaixo.
 * Usado em: seção Loja, Sobre (números), FAQ, encomendas (dias de retirada),
 * schema (openingHoursSpecification) e llms.txt.
 */
import { formatHour } from '@/lib/format';

/** Dias da semana no formato do schema.org (Su = domingo). */
export const DAY_CODES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
export type DayCode = (typeof DAY_CODES)[number];

export const DAY_NAMES: Record<DayCode, string> = {
  Su: 'Sunday',
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
};

export interface HoursEntry {
  days: DayCode[];
  /** Nome da faixa de dias exibido no site ("Terça a sábado") */
  label: string;
  /** "09:00" — ausente quando fechado */
  opens?: string;
  closes?: string;
}

export const hours: HoursEntry[] = [
  { days: ['Tu', 'We', 'Th', 'Fr', 'Sa'], label: 'Terça a sábado', opens: '09:00', closes: '19:00' },
  { days: ['Su'], label: 'Domingo', opens: '09:00', closes: '16:00' },
  { days: ['Mo'], label: 'Segunda-feira' },
];

/** A faixa está aberta? */
export const isOpen = (h: HoursEntry): h is HoursEntry & { opens: string; closes: string } => Boolean(h.opens && h.closes);

/** "9h às 19h" · "Fechado" */
export const hoursTime = (h: HoursEntry): string => (isOpen(h) ? `${formatHour(h.opens)} às ${formatHour(h.closes)}` : 'Fechado');

/** "09h — 19h" · "Fechado" (cartão da Loja) */
export const hoursShort = (h: HoursEntry): string => (isOpen(h) ? `${formatHour(h.opens, true)} — ${formatHour(h.closes, true)}` : 'Fechado');

/** Dias da semana em que a loja abre (0 = domingo … 6 = sábado). */
export const openWeekdays: ReadonlySet<number> = new Set(hours.filter(isOpen).flatMap((h) => h.days.map((d) => DAY_CODES.indexOf(d))));
