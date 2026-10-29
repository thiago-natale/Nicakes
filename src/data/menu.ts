/**
 * Cardápio da Nicake's — fonte única para a página /cardapio
 * e para a prévia exibida na landing page.
 * Preços em reais (number). Atualize aqui quando o cardápio mudar.
 */
export interface MenuItem {
  name: string;
  /** Preço único */
  price?: number;
  /** Preços por variação (ex.: 1 camada / 2 camadas) — mesma ordem de `columns` */
  prices?: number[];
  detail?: string;
}

export interface MenuGroup {
  title: string;
  note?: string;
  columns?: string[];
  items: MenuItem[];
}

export interface MenuCategory {
  id: string;
  title: string;
  groups: MenuGroup[];
}

export const AVAILABILITY_NOTE = 'Sabores sujeitos à disponibilidade na vitrine.';

export const menu: MenuCategory[] = [
  {
    id: 'salgados',
    title: 'Salgados',
    groups: [
      {
        title: 'Salgados',
        items: [
          { name: 'Pão de queijo', price: 5 },
          { name: 'Pão de queijo recheado', price: 8 },
          { name: 'Misto quente', price: 10 },
          { name: 'Coxinha de frango com catupiry', price: 13 },
          { name: 'Coxinha de costela com catupiry', price: 15 },
          { name: 'Torta italiana', price: 15 },
          { name: 'Torta de frango cremoso', price: 15 },
        ],
      },
    ],
  },
  {
    id: 'doces',
    title: 'Doces',
    groups: [
      {
        title: 'Especiais da casa',
        items: [
          // TODO: valor provisório — confirmar o preço do Morango Cravejado.
          { name: 'Morango Cravejado', price: 15, detail: 'Morango fresco envolto em chocolate branco' },
        ],
      },
      {
        title: 'Cake em fatia',
        note: AVAILABILITY_NOTE,
        items: [
          { name: 'Matilda', price: 20, detail: 'Acompanha calda de chocolate' },
          { name: 'Red Velvet', price: 16 },
        ],
      },
      {
        title: 'Pudim',
        items: [{ name: 'Pudim tradicional', price: 8, detail: 'Feito com leite condensado' }],
      },
      {
        title: 'Donuts',
        items: [
          { name: 'Brigadeiro de chocolate', price: 15 },
          { name: 'Brigadeiro de Ninho', price: 15 },
          { name: 'Ovomaltine', price: 17 },
          { name: 'Doce de leite', price: 15 },
          { name: 'Duo', price: 15 },
          { name: 'Nutella', price: 17 },
        ],
      },
      {
        title: 'Tortas doces',
        note: AVAILABILITY_NOTE,
        items: [
          { name: 'Limão', price: 15 },
          { name: 'Holandesa', price: 15 },
          { name: 'Maracujá', price: 15 },
          { name: 'Napolitano', price: 15 },
        ],
      },
      {
        title: 'Brownies',
        columns: ['1 camada', '2 camadas'],
        items: [
          { name: 'Doce de leite', prices: [9, 16] },
          { name: 'Leite Ninho', prices: [9, 16] },
          { name: 'Brigadeiro de chocolate', prices: [9, 16] },
          { name: 'Brigadeiro de Ninho', prices: [9, 16] },
          { name: 'Duo', prices: [9, 16] },
          { name: 'Ovomaltine', prices: [10, 18] },
          { name: 'Nutella', prices: [10, 18] },
          { name: 'Brownie com bola de sorvete', prices: [12, 25] },
        ],
      },
      {
        title: 'Cookies',
        items: [
          { name: 'Cookie recheado com Nutella', price: 14 },
          { name: 'Red Velvet com chocolate branco', price: 10 },
        ],
      },
    ],
  },
  {
    id: 'bebidas',
    title: 'Bebidas',
    groups: [
      {
        title: 'Cafés quentes',
        items: [
          { name: 'Expresso curto', price: 7 },
          { name: 'Expresso longo', price: 8 },
          { name: 'Café com leite vaporizado', price: 10 },
          { name: 'Mocaccino', price: 12 },
          { name: 'Cappuccino', price: 12 },
          { name: 'Cappuccino italiano', price: 12 },
          { name: 'Adicional de chantilly', price: 3 },
        ],
      },
      {
        title: 'Cafés gelados',
        items: [
          { name: 'Frappuccino tradicional', price: 16 },
          { name: 'Frappuccino com doce de leite', price: 16 },
          { name: 'Frappuccino com Ovomaltine', price: 17 },
          { name: 'Frappuccino com Nutella', price: 17 },
        ],
      },
      {
        title: 'Milk-shakes',
        items: [
          { name: 'Chocolate', price: 16 },
          { name: 'Cappuccino', price: 16 },
          { name: 'Morango', price: 17 },
          { name: 'Ovomaltine', price: 17 },
        ],
      },
      {
        title: 'Bebidas geladas',
        items: [
          { name: 'Água sem gás', price: 3 },
          { name: 'Água com gás', price: 3 },
          { name: 'Coca-Cola 350 ml', price: 5 },
          { name: 'Coca-Cola Zero 350 ml', price: 5 },
          { name: 'Mineiro', price: 5 },
          { name: 'Suco natural de maracujá', price: 10 },
          { name: 'Suco natural de abacaxi', price: 10 },
          { name: 'Suco natural de morango', price: 10 },
          { name: 'Suco de fruta com leite', price: 12 },
        ],
      },
    ],
  },
];

/** Recheio do bolo de aniversário. */
export interface CakeFilling {
  name: string;
  /** Taxa adicional (R$), cobrada uma vez por bolo */
  price?: number;
  /** Pergunta do campo complementar (ex.: qual fruta?) — obrigatório quando escolhido */
  ask?: string;
  /** Disponibilidade confirmada pelo WhatsApp */
  confirm?: boolean;
}

/** Tamanho (peso) do bolo e quanto rende. */
export interface CakeSize {
  kg: number;
  serves: string;
}

/**
 * Bolos de aniversário (sob encomenda) — fonte única para o /cardapio#bolos e
 * para o formulário de /encomendas. Preço por kg; adicionais com valor fixo.
 */
export const birthdayCake = {
  /** Preço por quilo (R$) */
  pricePerKg: 80,
  doughs: ['Massa branca', 'Massa de chocolate'],
  fillings: [
    { name: 'Brigadeiro de chocolate' },
    { name: 'Brigadeiro de Ninho' },
    { name: 'Ninho trufado' },
    { name: 'Mousse de Ninho' },
    { name: 'Mousse de chocolate' },
    { name: 'Ninho trufado com Nutella' },
    { name: 'Sabor à escolha com geleia', ask: 'Qual sabor de geleia?', confirm: true },
    { name: 'Sabor à escolha com frutas', price: 10, ask: 'Qual fruta?', confirm: true },
    { name: 'Creme belga' },
    { name: 'Prestígio' },
    { name: 'Maracujá' },
    { name: 'Red Velvet' },
  ] as CakeFilling[],
  /** `ask`: pergunta do campo complementar no formulário de /encomendas */
  extras: [
    { name: 'Topo de bolo', price: 20, ask: 'Tema ou nome no topo' },
    { name: 'Mais de 2 cores no bolo', price: 5, ask: 'Quais cores?' },
    { name: 'Caixa para levar o bolo', price: 10 },
  ] as Array<{ name: string; price: number; ask?: string }>,
  /** Rendimento informado pela loja: até 2 kg por fatias; acima disso, ~10 pessoas por kg */
  sizes: [
    { kg: 1, serves: '8 fatias' },
    { kg: 1.5, serves: '12 a 15 fatias' },
    { kg: 2, serves: 'até 20 fatias' },
    { kg: 2.5, serves: 'cerca de 25 pessoas' },
    { kg: 3, serves: 'cerca de 30 pessoas' },
    { kg: 4, serves: 'cerca de 40 pessoas' },
    { kg: 5, serves: 'cerca de 50 pessoas' },
  ] as CakeSize[],
  rules: {
    /** Recheios por bolo (mínimo 1) */
    maxFillings: 2,
    /** Antecedência mínima, em dias de funcionamento da loja */
    leadBusinessDays: 1,
    /** Por enquanto só retirada na loja */
    pickupOnly: true,
  },
};

/** "1,5 kg" */
export const formatKg = (kg: number): string => `${kg.toLocaleString('pt-BR')} kg`;

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formata um preço em reais: 15 → "R$ 15,00" */
export function formatPrice(value: number): string {
  // Intl usa espaço não separável; mantém o visual "R$ 15,00".
  return brl.format(value);
}
