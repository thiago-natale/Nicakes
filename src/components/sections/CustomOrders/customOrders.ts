/**
 * Encomendas (home) — dados dos dois painéis: bolo de aniversário e docinhos
 * de festa. Preços, opções e prazos vêm de data/menu.ts; aqui ficam só a copy,
 * os passos (perks) e a identidade de cada painel (lado, máscara, ornamento e o
 * elemento que percorre o caminho dos passos).
 */
import type { IconName } from '../../ui/Icon.astro';
import type { GalleryKind } from '../../../data/orderGallery';
import type { MaskName } from '../../../scripts/motion/masks';
import { birthdayCake, cakePriceFrom, formatPrice, partySweets, sweetsPriceFrom } from '../../../data/menu';

export interface OrderPanelData {
  /** Sufixo dos ids/âncoras (#encomendas-bolo) */
  id: 'bolo' | 'docinhos';
  /** Lado de onde o painel entra; `right` também espelha o layout (foto | texto) */
  side: 'left' | 'right';
  title: string;
  accent: string;
  lead: string;
  cta: { label: string; href: string };
  perksLabel: string;
  perks: { icon: IconName; lines: [string, string] }[];
  kinds: GalleryKind[];
  mask: MaskName;
  ornament: 'swash' | 'sprinkles';
  /** Ícone preenchido que percorre o caminho entre os passos */
  traveler: IconName;
  /** Traço do caminho pontilhado (stroke-dasharray) */
  dash: string;
}

const flavorCount = partySweets.categories.reduce((n, c) => n + c.flavors.length, 0);
/** "R$ 170" (sem centavos, para caber no passo) */
const shortPrice = (value: number): string => formatPrice(value).replace(/,00$/, '');

export const ordersSectionLead = 'Monte o bolo, escolha os docinhos ou peça os dois num pedido só, com retirada na loja em Uberaba.';

export const orderPanels: OrderPanelData[] = [
  {
    id: 'bolo',
    side: 'left',
    title: 'Bolo de aniversário',
    accent: 'do seu jeito.',
    lead: `A partir de ${formatPrice(cakePriceFrom())} o quilo, com ${birthdayCake.decorations.length} decorações, ${birthdayCake.doughs.length} massas e até ${birthdayCake.rules.maxFillings} recheios. Encomende com ${birthdayCake.rules.leadBusinessDays} dia de antecedência.`,
    cta: { label: 'Montar meu bolo', href: '/encomendas?pedido=bolo' },
    perksLabel: 'Como é o bolo',
    perks: [
      { icon: 'cake', lines: [`${birthdayCake.doughs.length} opções`, 'de massa'] },
      { icon: 'rose', lines: [`${birthdayCake.fillings.length} sabores`, 'de recheio'] },
      { icon: 'gift', lines: ['Topo e cores', 'personalizados'] },
    ],
    kinds: ['cake'],
    mask: 'drop',
    ornament: 'swash',
    traveler: 'heart-solid',
    dash: '2 5',
  },
  {
    id: 'docinhos',
    side: 'right',
    title: 'Docinhos para festa',
    accent: 'que encantam.',
    lead: `Brigadeiros gourmet, super gourmet e mini brownies a partir de ${formatPrice(sweetsPriceFrom())} o cento, além dos personalizados com o tema da festa. Pedido mínimo de ${partySweets.rules.minTotal} docinhos e ${partySweets.rules.leadBusinessDays} dias de antecedência.`,
    cta: { label: 'Escolher meus docinhos', href: '/encomendas?pedido=docinhos' },
    perksLabel: 'Como são os docinhos',
    perks: [
      { icon: 'sweet-box', lines: ['A partir de', `${shortPrice(sweetsPriceFrom())} o cento`] },
      { icon: 'sweet', lines: [`${flavorCount} sabores`, 'gourmet e super'] },
      { icon: 'sparkle', lines: ['Personalizados', 'com o tema'] },
    ],
    kinds: ['sweets'],
    mask: 'cup',
    ornament: 'sprinkles',
    traveler: 'brigadeiro-solid',
    dash: '4 6',
  },
];

/** Link para montar os dois num pedido só */
export const bothLink = { label: 'Vai querer os dois? Monte tudo num pedido só', href: '/encomendas?pedido=bolo,docinhos' };
