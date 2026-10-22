/**
 * Seção "A Nicake’s" (#sobre) — copy e dados.
 * Os números são calculados a partir de `data/menu.ts` e `data/site.ts`:
 * atualize o cardápio/horários e eles acompanham.
 */
import type { IconName } from '../../ui/Icon.astro';
import { menu, birthdayCake } from '../../../data/menu';
import { site } from '../../../data/site';

/** Manifesto em trechos; `accent` = rosa itálico; `swash` = recebe o floreio dourado. */
export const manifesto: { text: string; accent?: boolean; swash?: boolean }[] = [
  { text: 'A Nicake’s é feita para quem quer ' },
  { text: 'adoçar momentos com ', accent: true },
  { text: 'amor', accent: true, swash: true },
  { text: '. Cada receita começa no fouet e termina num gesto de ' },
  { text: 'carinho', accent: true },
  { text: '.' },
];

/**
 * História curta. ⚠ Sem ano de fundação/nome de quem fundou por enquanto
 * (dados pendentes) — quando houver, inclua aqui e adicione a assinatura.
 */
export const story =
  'Na Av. Quinze de Novembro, em Uberaba, seguimos uma regra simples: tudo feito à mão, um pedido de cada vez. Das receitas de casa ao acabamento de festa, cada doce sai da nossa cozinha pronto para virar lembrança.';

export const promises: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'whisk',
    title: 'Feito à mão, todos os dias',
    text: 'Massas, recheios e coberturas preparados na nossa cozinha, sem pressa e sem atalhos.',
  },
  {
    icon: 'rose',
    title: 'Detalhes que encantam',
    text: 'Do acabamento à embalagem, cada doce sai pronto para virar presente.',
  },
  {
    icon: 'gift',
    title: 'Do jeito que você imaginou',
    text: 'Na vitrine, no iFood ou sob encomenda: adaptamos sabores e decoração para o seu momento.',
  },
];

/* ---------- Números da casa (dados reais do projeto) ---------- */
const menuItems = menu.reduce((total, category) => total + category.groups.reduce((n, group) => n + group.items.length, 0), 0);

const DAY_INDEX: Record<string, number> = { Mo: 0, Tu: 1, We: 2, Th: 3, Fr: 4, Sa: 5, Su: 6 };
/** Dias abertos a partir do schema dos horários ("Tu-Sa 09:00-19:00", "Su …"). */
const openDays = new Set(
  site.hours.flatMap((h) => {
    if (!h.schema) return [];
    const [range] = h.schema.split(' ');
    const [from, to = from] = range.split('-');
    const a = DAY_INDEX[from];
    const b = DAY_INDEX[to];
    if (a === undefined || b === undefined) return [];
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }),
).size;

export const stats: { value: string; label: string; sr: string }[] = [
  { value: String(menuItems), label: 'delícias no cardápio', sr: `${menuItems} delícias no cardápio` },
  { value: String(birthdayCake.fillings.length), label: 'recheios para bolos', sr: `${birthdayCake.fillings.length} recheios para bolos de aniversário` },
  { value: String(openDays), label: 'dias por semana abertos', sr: `Aberto ${openDays} dias por semana` },
];

/** Fotos da colagem (provisórias — trocar por bastidores reais: mãos decorando, vitrine/fachada). */
export const collage = {
  main: {
    src: '/images/custom-birthday-cake.webp',
    alt: 'Bolo de aniversário de dois andares em tons de rosa, decorado com rosas',
    width: 1100,
    height: 614,
    position: '62% 50%',
  },
  detail: {
    src: '/images/bestseller-morango-cravejado.webp',
    alt: 'Morango cravejado envolto em chocolate branco',
    width: 420,
    height: 420,
    position: '50% 50%',
  },
};
