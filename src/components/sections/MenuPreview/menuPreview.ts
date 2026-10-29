/**
 * Prévia do cardápio na home: só os ids dos itens. Nome completo e preço vêm do
 * cardápio (src/data/menu.ts) — renomear, mudar o preço ou trocar o item de
 * grupo lá atualiza a prévia sozinho.
 */
import { menuItem, type MenuItem } from '../../../data/menu';

function pick(id: string): MenuItem {
  const { item, fullName, price } = menuItem(id, 'Prévia do cardápio (MenuPreview/menuPreview.ts)');
  return { ...item, name: fullName, price, prices: undefined, detail: undefined };
}

export const menuPreview = [
  {
    id: 'salgados',
    title: 'Salgados',
    items: ['pao-de-queijo', 'pao-de-queijo-frango', 'coxinha-frango', 'coxinha-costela', 'torta-frango-cremoso'].map(pick),
  },
  {
    id: 'doces',
    title: 'Doces',
    items: ['cake-matilda', 'donut-nutella', 'torta-limao', 'pudim-tradicional', 'cookie-nutella'].map(pick),
  },
  {
    id: 'bebidas',
    title: 'Cafés & bebidas',
    items: ['expresso-curto', 'cappuccino', 'mocaccino', 'frappuccino-tradicional', 'milkshake-morango'].map(pick),
  },
];
