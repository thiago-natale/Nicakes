import type { IconName } from '../../ui/Icon.astro';
import { birthdayCake, cakePriceFrom, formatPrice } from '../../../data/menu';

export const orderPerks: { icon: IconName; lines: [string, string] }[] = [
  { icon: 'cake', lines: [`${birthdayCake.doughs.length} opções`, 'de massa'] },
  { icon: 'rose', lines: [`${birthdayCake.fillings.length} sabores`, 'de recheio'] },
  { icon: 'gift', lines: ['Topo e cores', 'personalizados'] },
];


/** Lead factual (resposta direta): preço, opções e prazo, tudo de data/menu.ts. */
export const ordersLead = `Bolos de aniversário sob encomenda a partir de ${formatPrice(cakePriceFrom())} o quilo, com ${
  birthdayCake.decorations.length
} decorações, ${birthdayCake.doughs.length} massas e até ${birthdayCake.rules.maxFillings} recheios. Encomende com ${
  birthdayCake.rules.leadBusinessDays
} dia de antecedência e retire na loja em Uberaba.`;
