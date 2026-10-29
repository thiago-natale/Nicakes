import { menu, type MenuItem } from '../../../data/menu';

/** Busca um item do cardápio para manter nome e preço sempre sincronizados. */
function pick(categoryId: string, groupTitle: string, itemName: string, label?: string): MenuItem {
  const group = menu.find((c) => c.id === categoryId)?.groups.find((g) => g.title === groupTitle);
  const item = group?.items.find((i) => i.name === itemName);
  if (!item) throw new Error(`Item não encontrado no cardápio: ${categoryId} › ${groupTitle} › ${itemName}`);
  return { ...item, name: label ?? item.name, detail: undefined };
}

export const menuPreview = [
  {
    id: 'salgados',
    title: 'Salgados',
    items: [
      pick('salgados', 'Salgados', 'Pão de queijo'),
      pick('salgados', 'Salgados', 'Pão de queijo recheado frango com catupiry', 'Pão de queijo recheado de frango'),
      pick('salgados', 'Salgados', 'Coxinha de frango com catupiry', 'Coxinha de frango'),
      pick('salgados', 'Salgados', 'Coxinha de costela com catupiry', 'Coxinha de costela'),
      pick('salgados', 'Salgados', 'Torta de frango cremoso'),
    ],
  },
  {
    id: 'doces',
    title: 'Doces',
    items: [
      pick('doces', 'Cake em fatia', 'Matilda', 'Cake Matilda'),
      pick('doces', 'Donuts', 'Nutella', 'Donut de Nutella'),
      pick('doces', 'Tortas doces', 'Limão', 'Torta de limão'),
      pick('doces', 'Pudim', 'Pudim tradicional'),
      pick('doces', 'Cookies', 'Cookie recheado com Nutella', 'Cookie de Nutella'),
    ],
  },
  {
    id: 'bebidas',
    title: 'Cafés & bebidas',
    items: [
      pick('bebidas', 'Cafés quentes', 'Expresso curto'),
      pick('bebidas', 'Cafés quentes', 'Cappuccino'),
      pick('bebidas', 'Cafés quentes', 'Mocaccino'),
      pick('bebidas', 'Cafés gelados', 'Frappuccino tradicional'),
      pick('bebidas', 'Milk-shakes', 'Morango', 'Milk-shake de morango'),
    ],
  },
];
