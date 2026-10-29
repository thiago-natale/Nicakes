/**
 * Sugestões da casa ("Para adoçar o seu dia").
 * Nome e preço vêm do cardápio (src/data/menu.ts) pelo `ref` (id do item, e a
 * coluna em `variant` quando o item tem mais de um preço); aqui fica só o
 * conteúdo de vitrine. "\n" na descrição indica a quebra de linha no desktop.
 */
import { menuItem, type MenuRef } from '../../../data/menu';

interface Recommendation {
  ref: MenuRef | string;
  description: string;
  image: string;
  alt: string;
}

const items: Recommendation[] = [
  {
    ref: 'donut-brigadeiro-ninho',
    description: 'Recheado com\nbrigadeiro de Ninho.',
    image: '/images/treat-donut-ninho.webp',
    alt: 'Donut recheado com creme de Ninho e polvilhado com leite em pó',
  },
  {
    ref: { id: 'brownie-nutella', variant: '2 camadas' },
    description: 'Duas camadas com\nrecheio de Nutella.',
    image: '/images/treat-brownie-nutella.webp',
    alt: 'Brownie de duas camadas recheado com Nutella',
  },
  {
    ref: 'cake-red-velvet',
    description: 'Massa macia e\ncreme aveludado.',
    image: '/images/treat-red-velvet.webp',
    alt: 'Fatia de bolo Red Velvet com camadas de creme branco',
  },
];

export const recommended = items.map(({ ref, ...rest }) => {
  const { fullName, price } = menuItem(ref, 'Recomendados (Recommended/recommended.ts)');
  return { ...rest, name: fullName, price };
});
