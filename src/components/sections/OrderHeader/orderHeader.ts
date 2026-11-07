/** Textos do cabeçalho da página /encomendas. */
import { birthdayCake, cakePriceFrom, formatPrice } from '../../../data/menu';

export const orderHeaderCopy = {
  eyebrow: 'Encomendas',
  title: 'Monte o seu',
  accent: 'bolo de aniversário.',
  // Resposta direta: preço, prazo, retirada e como funciona (valores de data/menu.ts)
  lead: `Na Nicake’s, o bolo de aniversário sob encomenda sai a partir de ${formatPrice(cakePriceFrom())} o quilo. Escolha a decoração, o tamanho, a massa e os recheios: o valor aparece na hora e o pedido segue pronto para o WhatsApp. Encomende com ${birthdayCake.rules.leadBusinessDays} dia de antecedência e retire na loja em Uberaba.`,
  stepsLabel: 'Etapas do pedido',
  steps: [
    { id: 'etapa-decoracao', label: 'Decoração' },
    { id: 'etapa-tamanho', label: 'Tamanho' },
    { id: 'etapa-massa', label: 'Massa' },
    { id: 'etapa-recheios', label: 'Recheios' },
    { id: 'etapa-adicionais', label: 'Adicionais' },
    { id: 'etapa-retirada', label: 'Retirada' },
  ],
};
