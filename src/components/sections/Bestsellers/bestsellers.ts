/**
 * Os 3 produtos mais pedidos da casa.
 * Nome e preço vêm do cardápio (src/data/menu.ts) pelo `ref` (id do item);
 * aqui fica só o conteúdo de vitrine: descrição curta, foto e alt.
 */
import { menuItem, type MenuRef } from '../../../data/menu';

interface Bestseller {
  ref: MenuRef | string;
  description: string;
  image: string;
  alt: string;
}

const items: Bestseller[] = [
  {
    ref: 'morango-cravejado',
    description: 'Envolto em chocolate branco',
    image: '/images/bestseller-morango-cravejado.webp',
    alt: 'Morangos cobertos com chocolate branco, um deles cortado ao meio, em prato rosa',
  },
  {
    ref: 'coxinha-costela',
    description: 'Recheada com catupiry',
    image: '/images/bestseller-coxinha-costela.webp',
    alt: 'Coxinhas douradas, uma aberta mostrando recheio de costela desfiada e catupiry',
  },
  {
    ref: 'cake-matilda',
    description: 'Com calda de chocolate',
    image: '/images/bestseller-cake-matilda.webp',
    alt: 'Fatia do bolo Matilda com jarrinha de calda de chocolate, vista de cima',
  },
];

export const bestsellers = items.map(({ ref, ...rest }) => {
  const { fullName, price } = menuItem(ref, 'Mais pedidos (Bestsellers/bestsellers.ts)');
  return { ...rest, name: fullName, price };
});
