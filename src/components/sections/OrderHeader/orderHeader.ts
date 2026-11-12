/** Textos do cabeçalho da página /encomendas. */
import type { IconName } from '../../ui/Icon.astro';
import { birthdayCake, cakePriceFrom, formatPrice, partySweets, sweetsPriceFrom } from '../../../data/menu';

export const orderHeaderCopy = {
  eyebrow: 'Encomendas',
  title: 'Bolo e docinhos',
  accent: 'sob encomenda.',
  // Resposta direta: preço, prazo, retirada e como funciona (valores de data/menu.ts)
  lead: `Monte o bolo de aniversário (a partir de ${formatPrice(cakePriceFrom())} o quilo), escolha os docinhos (a partir de ${formatPrice(sweetsPriceFrom())} o cento) ou peça os dois juntos. O valor de cada item aparece na hora e o pedido segue pronto para o WhatsApp. Antecedência de ${birthdayCake.rules.leadBusinessDays} dia para o bolo e ${partySweets.rules.leadBusinessDays} dias para os docinhos, com retirada na loja em Uberaba.`,
  stepsLabel: 'Partes do pedido',
  steps: [
    { id: 'etapa-produtos', label: 'O que encomendar', icon: 'gift' },
    { id: 'bloco-bolo', label: 'Bolo', icon: 'cake' },
    { id: 'bloco-docinhos', label: 'Docinhos', icon: 'sweet' },
    { id: 'etapa-retirada', label: 'Retirada', icon: 'storefront' },
  ] as Array<{ id: string; label: string; icon: IconName }>,
};
