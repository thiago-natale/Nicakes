/**
 * Encomenda (bolo e/ou docinhos) — lógica pura (sem DOM): preço, resumo, datas,
 * validação e a mensagem do WhatsApp. Fontes: `birthdayCake` e `partySweets`
 * (src/data/menu.ts) e os horários da loja (`site.hours`). Testável em Node.
 */
import { birthdayCake, defaultDecoration, formatKg, formatPrice, partySweets, type CakeDecoration } from '../../../data/menu';
import { site } from '../../../data/site';

export type ProductId = 'cake' | 'sweets';

export interface OrderSelection {
  /** Produtos no pedido (dá para pedir os dois) */
  products: Record<ProductId, boolean>;

  /* ----- Bolo ----- */
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

  /* ----- Docinhos ----- */
  /** Quantidade por sabor, por tipo: { gourmet: { Oreo: 50 } } */
  sweets: Record<string, Record<string, number>>;
  /** Brigadeiros personalizados (valor a combinar) */
  custom: { on: boolean; qty: number; brief: string };
  /** Adicionais dos docinhos (valor a combinar) */
  sweetExtras: string[];

  /* ----- Retirada e contato ----- */
  /** AAAA-MM-DD */
  date: string;
  period: '' | 'manha' | 'tarde';
  name: string;
  notes: string;
  /** Opcional: como conheceu a Nicake’s (medição de canais, inclusive IAs) */
  source: string;
}

export const emptySelection = (): OrderSelection => ({
  products: { cake: false, sweets: false },
  decoration: defaultDecoration().name,
  kg: null,
  dough: '',
  fillings: [],
  fillingAnswers: {},
  extras: [],
  extraAnswers: {},
  sweets: {},
  custom: { on: false, qty: 0, brief: '' },
  sweetExtras: [],
  date: '',
  period: '',
  name: '',
  notes: '',
  source: '',
});

/** Rascunho do formulário (sessionStorage). Entradas com `['_v','2']` já têm os produtos. */
export const DRAFT_KEY = 'nicakes:order-draft';
export const DRAFT_VERSION = '2';

export const PERIODS = { manha: 'pela manhã', tarde: 'à tarde' } as const;
export const NOTES_MAX = 300;

/** Opções de "Como nos conheceu?" (opcional) — vão na mensagem do WhatsApp. */
export const SOURCES = ['Instagram', 'Google', 'ChatGPT / outra IA', 'iFood', 'Indicação de alguém', 'Passando pela loja', 'Outro'] as const;

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

/** Linhas do valor do bolo (bolo por kg + taxas de recheio + adicionais). */
export function cakePriceLines(sel: OrderSelection): PriceLine[] {
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

/* ----- Docinhos ----- */

/** Sabores escolhidos de um tipo, na ordem do cardápio: [[sabor, quantidade]] */
export function sweetFlavors(sel: OrderSelection, catId: string): Array<[string, number]> {
  const cat = partySweets.categories.find((c) => c.id === catId);
  const chosen = sel.sweets[catId] ?? {};
  return (cat?.flavors ?? []).filter((f) => (chosen[f] ?? 0) > 0).map((f) => [f, chosen[f]]);
}

/** Total de unidades de um tipo. */
export const sweetQty = (sel: OrderSelection, catId: string): number =>
  sweetFlavors(sel, catId).reduce((sum, [, n]) => sum + n, 0);

/** Valor de um tipo: quantidade ÷ 100 × preço do cento. */
export function sweetPrice(catId: string, qty: number): number {
  const cat = partySweets.categories.find((c) => c.id === catId);
  return cat ? Math.round(((qty / partySweets.rules.unit) * cat.pricePerHundred) * 100) / 100 : 0;
}

/** O adicional dos docinhos está disponível com os tipos escolhidos? */
export const sweetExtraAvailable = (sel: OrderSelection, name: string): boolean =>
  !!partySweets.extras.find((e) => e.name === name)?.appliesTo.some((id) => sweetQty(sel, id) > 0);

/** Total de unidades de docinhos (inclusive personalizados). */
export const sweetsCount = (sel: OrderSelection): number =>
  partySweets.categories.reduce((sum, c) => sum + sweetQty(sel, c.id), 0) + (sel.custom.on ? sel.custom.qty : 0);

/* ----- Resumo agrupado (fonte do resumo, da barra do celular e da mensagem) ----- */

export interface SummaryLine {
  /** Chave estável (para animar só as linhas novas) */
  key: string;
  label: string;
  /** Detalhe em linha menor (sabores, massa…) */
  detail?: string;
  /** number = valor · null = "a combinar" · undefined = sem valor (informativo) */
  value?: number | null;
}

export interface SummaryGroup {
  id: ProductId;
  title: string;
  lines: SummaryLine[];
  subtotal: number;
  /** Há itens com valor a combinar */
  pending: boolean;
}

export interface OrderSummary {
  groups: SummaryGroup[];
  total: number;
  pending: boolean;
}

/** "50 Oreo · 25 Limão" */
const flavorList = (list: Array<[string, number]>): string => list.map(([f, n]) => `${n} ${f}`).join(' · ');

export function cakeGroup(sel: OrderSelection): SummaryGroup {
  const lines: SummaryLine[] = cakePriceLines(sel).map((l) => ({ key: `cake:${l.label}`, label: l.label, value: l.value }));
  if (!sel.kg) lines.unshift({ key: 'cake:base', label: `Bolo · ${decorationOf(sel).name}`, detail: `${formatPrice(pricePerKgOf(sel))}/kg · tamanho a escolher` });
  const info = [sel.dough, sel.fillings.map((n) => (sel.fillingAnswers[n]?.trim() ? `${n} (${sel.fillingAnswers[n].trim()})` : n)).join(' e ')].filter(Boolean);
  if (info.length) lines.splice(1, 0, { key: 'cake:info', label: info.join(' · ') });
  const subtotal = lines.reduce((sum, l) => sum + (typeof l.value === 'number' ? l.value : 0), 0);
  return { id: 'cake', title: 'Bolo de aniversário', lines, subtotal, pending: false };
}

export function sweetsGroup(sel: OrderSelection): SummaryGroup {
  const lines: SummaryLine[] = [];
  for (const c of partySweets.categories) {
    const list = sweetFlavors(sel, c.id);
    const qty = sweetQty(sel, c.id);
    if (!qty) continue;
    lines.push({ key: `sweets:${c.id}`, label: `${c.name} · ${qty} un.`, detail: flavorList(list), value: sweetPrice(c.id, qty) });
  }
  if (sel.custom.on) {
    lines.push({
      key: 'sweets:custom',
      label: `${partySweets.custom.name}${sel.custom.qty ? ` · ${sel.custom.qty} un.` : ''}`,
      detail: sel.custom.brief.trim() || undefined,
      value: null,
    });
  }
  for (const name of sel.sweetExtras) {
    if (sweetExtraAvailable(sel, name)) lines.push({ key: `sweets:extra:${name}`, label: name, value: null });
  }
  const subtotal = lines.reduce((sum, l) => sum + (typeof l.value === 'number' ? l.value : 0), 0);
  return { id: 'sweets', title: 'Docinhos', lines, subtotal, pending: lines.some((l) => l.value === null) };
}

export function orderSummary(sel: OrderSelection): OrderSummary {
  const groups: SummaryGroup[] = [];
  if (sel.products.cake) groups.push(cakeGroup(sel));
  if (sel.products.sweets) groups.push(sweetsGroup(sel));
  return {
    groups,
    total: groups.reduce((sum, g) => sum + g.subtotal, 0),
    pending: groups.some((g) => g.pending),
  };
}

export const calcTotal = (sel: OrderSelection): number => orderSummary(sel).total;

/** "Bolo + 150 docinhos" (barra do celular) */
export function orderShortLabel(sel: OrderSelection): string {
  const parts: string[] = [];
  if (sel.products.cake) parts.push(sel.kg ? `Bolo de ${formatKg(sel.kg)}` : 'Bolo');
  if (sel.products.sweets) {
    const n = sweetsCount(sel);
    parts.push(n ? `${n} docinhos` : 'Docinhos');
  }
  return parts.join(' + ');
}

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

/** Antecedência do pedido: a maior entre os produtos escolhidos (dias de funcionamento). */
export function leadDaysOf(sel?: Pick<OrderSelection, 'products'>): number {
  const days: number[] = [];
  if (sel?.products.cake) days.push(birthdayCake.rules.leadBusinessDays);
  if (sel?.products.sweets) days.push(partySweets.rules.leadBusinessDays);
  return days.length ? Math.max(...days) : birthdayCake.rules.leadBusinessDays;
}

/** Primeira data de retirada: `lead` dias de funcionamento depois de hoje. */
export function earliestPickup(today: Date = new Date(), lead: number = birthdayCake.rules.leadBusinessDays): Date {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let count = 0;
  while (count < lead) {
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

/** Erros por campo (chave = `name` do campo no formulário, ou do grupo). */
export function validate(sel: OrderSelection, today: Date = new Date()): OrderErrors {
  const e: OrderErrors = {};
  if (!sel.products.cake && !sel.products.sweets) e.product = 'Escolha o que você quer encomendar: bolo, docinhos ou os dois.';
  if (sel.products.cake) Object.assign(e, validateCake(sel));
  if (sel.products.sweets) Object.assign(e, validateSweets(sel));
  const date = fromISODate(sel.date);
  const min = earliestPickup(today, leadDaysOf(sel));
  if (!date) e.date = 'Escolha a data de retirada.';
  else if (date < min) e.date = `A data mais próxima para retirada é ${formatPickupDate(min)}.`;
  else if (!isOpenDay(date)) e.date = 'Nesse dia a loja está fechada. Escolha outra data.';
  if (!sel.period) e.period = 'Escolha o período de retirada.';
  if (!sel.name.trim()) e.name = 'Informe o seu nome.';
  if (sel.notes.length > NOTES_MAX) e.notes = `Use até ${NOTES_MAX} caracteres.`;
  return e;
}

function validateCake(sel: OrderSelection): OrderErrors {
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
  return e;
}

/** Quantidade válida de um sabor/tipo: múltiplo de `step`. */
const onStep = (n: number): boolean => n % partySweets.rules.step === 0;

function validateSweets(sel: OrderSelection): OrderErrors {
  const e: OrderErrors = {};
  const { step, minTotal } = partySweets.rules;
  const anyCategory = partySweets.categories.some((c) => sweetQty(sel, c.id) > 0);
  const total = sweetsCount(sel);
  if (!anyCategory && !sel.custom.on) e.sweets = 'Escolha pelo menos um sabor de docinho.';
  else if (total < minTotal) e.sweets = `O pedido mínimo é de ${minTotal} docinhos, somando todos os tipos (faltam ${minTotal - total}).`;
  for (const c of partySweets.categories) {
    if (sweetFlavors(sel, c.id).some(([, n]) => !onStep(n))) e[sweetCatKey(c.id)] = `${c.name}: use quantidades de ${step} em ${step} por sabor.`;
  }
  if (sel.custom.on) {
    if (!sel.custom.qty) e[CUSTOM_QTY] = `Informe quantos ${partySweets.custom.name.toLowerCase()} você quer.`;
    else if (!onStep(sel.custom.qty)) e[CUSTOM_QTY] = `Use quantidades de ${step} em ${step}.`;
    if (!sel.custom.brief.trim()) e[CUSTOM_BRIEF] = `Conte pra gente: ${partySweets.custom.ask.toLowerCase()}.`;
  }
  return e;
}

/* Nomes dos campos dos docinhos */
export const sweetField = (catId: string, flavorIndex: number): string => `sweet-${catId}-${flavorIndex}`;
export const sweetCatKey = (catId: string): string => `sweet-cat-${catId}`;
export const CUSTOM_ON = 'sweet-custom';
export const CUSTOM_QTY = 'sweet-custom-qty';
export const CUSTOM_BRIEF = 'sweet-custom-brief';
export const SWEET_EXTRA = 'sweet-extra';
export const CUSTOM_BRIEF_MAX = 200;

/** Arredonda para o múltiplo de `step` mais próximo para cima, entre 0 e o máximo. */
export function snapQty(n: number): number {
  const { step, maxPerFlavor } = partySweets.rules;
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(maxPerFlavor, Math.ceil(n / step) * step);
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
  const summary = orderSummary(sel);
  const date = fromISODate(sel.date);
  const both = summary.groups.length > 1;
  const lines = [`Olá, ${site.name}! Montei meu pedido pelo site:`];

  if (sel.products.cake) {
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
      const price = birthdayCake.extras.find((x) => x.name === name)?.price;
      return `${answer ? `${name} (${answer})` : name}${price ? ` +${formatPrice(price)}` : ''}`;
    });
    lines.push(
      '',
      'BOLO DE ANIVERSÁRIO',
      `• Decoração: ${decorationOf(sel).name} (${formatPrice(pricePerKgOf(sel))}/kg)`,
      `• Tamanho: ${sel.kg ? formatKg(sel.kg) : '—'}${size ? ` (${size.serves})` : ''}${sel.kg ? `: ${formatPrice(sel.kg * pricePerKgOf(sel))}` : ''}`,
      `• Massa: ${sel.dough || '—'}`,
      `• Recheio${fillings.length > 1 ? 's' : ''}: ${fillings.join(' e ') || '—'}`,
      `• Adicionais: ${extras.length ? extras.join(' · ') : 'nenhum'}`,
    );
    const g = summary.groups.find((x) => x.id === 'cake');
    if (both && g) lines.push(`Subtotal do bolo: ${formatPrice(g.subtotal)}`);
  }

  if (sel.products.sweets) {
    lines.push('', 'DOCINHOS');
    for (const c of partySweets.categories) {
      const qty = sweetQty(sel, c.id);
      if (!qty) continue;
      const list = sweetFlavors(sel, c.id).map(([f, n]) => `${f} ${n}`).join(', ');
      lines.push(`• ${c.name} — ${qty} un. (${list}): ${formatPrice(sweetPrice(c.id, qty))}`);
    }
    if (sel.custom.on) {
      lines.push(`• ${partySweets.custom.name} — ${sel.custom.qty} un. (${sel.custom.brief.trim()}): valor a combinar`);
    }
    for (const name of sel.sweetExtras) {
      if (sweetExtraAvailable(sel, name)) lines.push(`• ${name}: valor a combinar`);
    }
    const g = summary.groups.find((x) => x.id === 'sweets');
    if (both && g) lines.push(`Subtotal dos docinhos: ${formatPrice(g.subtotal)}${g.pending ? ' + itens a combinar' : ''}`);
  }

  lines.push(
    '',
    `• Retirada na loja: ${date ? formatPickupDate(date) : '—'}${sel.period ? `, ${PERIODS[sel.period]}` : ''}`,
    `• Nome: ${sel.name.trim()}`,
  );
  if (sel.notes.trim()) lines.push(`• Observações: ${sel.notes.trim()}`);
  if (sel.source && (SOURCES as readonly string[]).includes(sel.source)) lines.push(`• Como conheci a Nicake’s: ${sel.source}`);
  lines.push('', `Valor estimado: ${formatPrice(summary.total)}${summary.pending ? ' + itens a combinar' : ''}`);
  const needsConfirm = sel.products.cake && sel.fillings.some((n) => birthdayCake.fillings.find((x) => x.name === n)?.confirm);
  if (needsConfirm) lines.push('Podem confirmar a disponibilidade do sabor à escolha?');
  lines.push('Aguardo a confirmação do pedido e do valor final. Obrigado(a)!');
  return lines.join('\n');
}
