/**
 * Cardápio da Nicake's — fonte única para a página /cardapio
 * e para a prévia exibida na landing page.
 * Preços em reais (number). Atualize aqui quando o cardápio mudar.
 */
export interface MenuItem {
  /**
   * Identificador fixo — só nos itens exibidos fora do /cardapio (Mais pedidos,
   * Recomendados, prévia da home). As seções guardam este id, nunca nome/preço:
   * renomear ou mudar o preço aqui atualiza o site inteiro.
   */
  id?: string;
  name: string;
  /** Preço único */
  price?: number;
  /** Preços por variação (ex.: 1 camada / 2 camadas) — mesma ordem de `columns` */
  prices?: number[];
  detail?: string;
}

export interface MenuGroup {
  title: string;
  /**
   * Prefixo do nome completo usado fora do cardápio, onde o item aparece sem o
   * título do grupo (ex.: "Donut de" + "Nutella" = "Donut de Nutella").
   */
  itemPrefix?: string;
  note?: string;
  columns?: string[];
  items: MenuItem[];
}

export interface MenuCategory {
  id: string;
  title: string;
  groups: MenuGroup[];
}

export const AVAILABILITY_NOTE =
  "Sabores sujeitos à disponibilidade na vitrine.";

export const menu: MenuCategory[] = [
  {
    id: "salgados",
    title: "Salgados",
    groups: [
      {
        title: "Salgados",
        items: [
          { id: "pao-de-queijo", name: "Pão de queijo", price: 5 },
          { name: "Pão de queijo recheado presunto e muçarela", price: 8 },
          {
            id: "pao-de-queijo-frango",
            name: "Pão de queijo recheado frango com catupiry",
            price: 10,
          },
          { name: "Pão de queijo recheado costela com catupiry", price: 12 },
          { name: "Misto quente", price: 10 },
          { id: "coxinha-frango", name: "Coxinha de frango com catupiry", price: 13 },
          { id: "coxinha-costela", name: "Coxinha de costela com catupiry", price: 15 },
          { id: "torta-frango-cremoso", name: "Torta de frango cremoso", price: 15 },
        ],
      },
    ],
  },
  {
    id: "doces",
    title: "Doces",
    groups: [
      {
        title: "Especiais da casa",
        items: [
          {
            id: "morango-cravejado",
            name: "Morango Cravejado",
            price: 18,
            detail: "Morango fresco envolto em chocolate branco",
          },
        ],
      },
      {
        title: "Cake em fatia",
        itemPrefix: "Cake",
        note: AVAILABILITY_NOTE,
        items: [
          {
            id: "cake-matilda",
            name: "Matilda",
            price: 20,
            detail: "Acompanha calda de chocolate",
          },
          {
            id: "cake-red-velvet",
            name: "Red Velvet",
            price: 20,
            detail: "Acompanha compota de morango caseira",
          },
        ],
      },
      {
        title: "Pudim",
        items: [
          {
            id: "pudim-tradicional",
            name: "Pudim tradicional",
            price: 8,
            detail: "Feito com leite condensado",
          },
        ],
      },
      {
        title: "Donuts",
        itemPrefix: "Donut de",
        items: [
          { name: "Brigadeiro de chocolate", price: 15 },
          { id: "donut-brigadeiro-ninho", name: "Brigadeiro de Ninho", price: 15 },
          { name: "Ovomaltine", price: 17 },
          { name: "Doce de leite", price: 15 },
          { name: "Duo", price: 15 },
          { id: "donut-nutella", name: "Nutella", price: 17 },
        ],
      },
      {
        title: "Tortas doces",
        itemPrefix: "Torta de",
        note: AVAILABILITY_NOTE,
        items: [
          { id: "torta-limao", name: "Limão", price: 15 },
          { name: "Holandesa", price: 15 },
          { name: "Maracujá", price: 15 },
          { name: "Napolitano", price: 15 },
        ],
      },
      {
        title: "Brownies",
        itemPrefix: "Brownie de",
        columns: ["1 camada", "2 camadas"],
        items: [
          { name: "Doce de leite", prices: [9, 16] },
          { name: "Leite Ninho", prices: [9, 16] },
          { name: "Brigadeiro de chocolate", prices: [9, 16] },
          { name: "Brigadeiro de Ninho", prices: [9, 16] },
          { name: "Duo", prices: [9, 16] },
          { name: "Ovomaltine", prices: [10, 18] },
          { id: "brownie-nutella", name: "Nutella", prices: [10, 18] },
          { name: "Brownie com bola de sorvete", prices: [12, 25] },
        ],
      },
      {
        title: "Cookies",
        itemPrefix: "Cookie",
        items: [
          { id: "cookie-nutella", name: "Cookie recheado com Nutella", price: 14 },
          { name: "Red Velvet com chocolate branco", price: 10 },
        ],
      },
    ],
  },
  {
    id: "bebidas",
    title: "Bebidas",
    groups: [
      {
        title: "Cafés quentes",
        items: [
          { id: "expresso-curto", name: "Expresso curto", price: 7 },
          { name: "Expresso longo", price: 8 },
          { name: "Café com leite vaporizado", price: 10 },
          { id: "mocaccino", name: "Mocaccino", price: 12 },
          { id: "cappuccino", name: "Cappuccino", price: 12 },
          { name: "Cappuccino italiano", price: 12 },
          { name: "Adicional de chantilly", price: 3 },
        ],
      },
      {
        title: "Cafés gelados",
        items: [
          { id: "frappuccino-tradicional", name: "Frappuccino tradicional", price: 16 },
          { name: "Frappuccino com doce de leite", price: 16 },
          { name: "Frappuccino com Ovomaltine", price: 17 },
          { name: "Frappuccino com Nutella", price: 17 },
        ],
      },
      {
        title: "Milk-shakes",
        itemPrefix: "Milk-shake de",
        items: [
          { name: "Chocolate", price: 16 },
          { name: "Cappuccino", price: 16 },
          { id: "milkshake-morango", name: "Morango", price: 17 },
          { name: "Ovomaltine", price: 17 },
        ],
      },
      {
        title: "Bebidas geladas",
        items: [
          { name: "Água sem gás", price: 3 },
          { name: "Água com gás", price: 3 },
          { name: "Coca-Cola 350 ml", price: 5 },
          { name: "Coca-Cola Zero 350 ml", price: 5 },
          { name: "Mineiro", price: 5 },
          { name: "Suco natural de maracujá", price: 10 },
          { name: "Suco natural de abacaxi", price: 10 },
          { name: "Suco natural de morango", price: 10 },
          { name: "Suco de fruta com leite", price: 12 },
        ],
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Referências ao cardápio (seções fora do /cardapio)                          */
/* -------------------------------------------------------------------------- */

/** Referência a um item; `variant` escolhe a coluna de preço (ex.: "2 camadas"). */
export interface MenuRef {
  id: string;
  variant?: string;
}

export interface ResolvedMenuItem {
  item: MenuItem;
  group: MenuGroup;
  category: MenuCategory;
  /** Nome completo, com o prefixo do grupo (ex.: "Cake Red Velvet") */
  fullName: string;
  /** Preço do item ou da variação escolhida */
  price: number;
}

/** "Donut de" + "Nutella" → "Donut de Nutella"; não repete o prefixo se o nome já começa com ele. */
export function fullNameOf(item: MenuItem, group: MenuGroup): string {
  const prefix = group.itemPrefix?.trim();
  if (!prefix) return item.name;
  const head = prefix.split(" ")[0].toLowerCase();
  return item.name.toLowerCase().startsWith(head) ? item.name : `${prefix} ${item.name}`;
}

/** Índice id → item, montado uma vez; ids repetidos param o build. */
const menuIndex = new Map<string, { item: MenuItem; group: MenuGroup; category: MenuCategory }>();
for (const category of menu) {
  for (const group of category.groups) {
    for (const item of group.items) {
      if (!item.id) continue;
      if (menuIndex.has(item.id)) {
        throw new Error(`Cardápio (src/data/menu.ts): o id "${item.id}" está repetido.`);
      }
      menuIndex.set(item.id, { item, group, category });
    }
  }
}

/**
 * Busca um item do cardápio pelo id. Se não existir (ou faltar o preço), o
 * build para com uma mensagem dizendo onde o item é usado.
 */
export function menuItem(ref: MenuRef | string, usedIn = "uma seção do site"): ResolvedMenuItem {
  const { id, variant } = typeof ref === "string" ? { id: ref, variant: undefined } : ref;
  const hit = menuIndex.get(id);
  if (!hit) {
    throw new Error(
      `Item "${id}" não encontrado no cardápio (src/data/menu.ts) — usado em ${usedIn}. ` +
        `Confira se o item ainda existe e mantém o campo id: "${id}".`,
    );
  }
  const { item, group, category } = hit;
  let price = item.price;
  if (variant !== undefined) {
    const col = group.columns?.indexOf(variant) ?? -1;
    price = col >= 0 ? item.prices?.[col] : undefined;
  } else if (price === undefined && item.prices?.length) {
    price = item.prices[0];
  }
  if (price === undefined) {
    throw new Error(`Item "${id}"${variant ? ` (${variant})` : ""} sem preço no cardápio (src/data/menu.ts) — usado em ${usedIn}.`);
  }
  return { item, group, category, fullName: fullNameOf(item, group), price };
}

/** Atalho: só o preço do item/variação. */
export const priceOf = (ref: MenuRef | string, usedIn?: string): number => menuItem(ref, usedIn).price;

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

/** Decoração (cobertura) do bolo — define o preço do quilo. */
export interface CakeDecoration {
  name: string;
  /** Preço por quilo (R$) com esta decoração */
  pricePerKg: number;
  description?: string;
  /** Vem marcada no formulário de /encomendas */
  default?: boolean;
  /** Cor da amostra no formulário */
  swatch?: string;
}

/** Adicional do bolo, com valor fixo. */
export interface CakeExtra {
  name: string;
  price: number;
  /** Pergunta do campo complementar no formulário de /encomendas */
  ask?: string;
  /** Decorações com as quais o adicional não está disponível */
  notWith?: string[];
}

/** Tamanho (peso) do bolo e quanto rende. */
export interface CakeSize {
  kg: number;
  serves: string;
}

/**
 * Bolos de aniversário (sob encomenda) — fonte única para o /cardapio#bolos e
 * para o formulário de /encomendas. O preço do quilo vem da decoração;
 * adicionais com valor fixo.
 */
export const birthdayCake = {
  decorations: [
    {
      name: "Chantilly",
      pricePerKg: 80,
      default: true,
      description: "Leve e aerada, a clássica da casa",
      swatch: "#fbf3e6",
    },
    {
      name: "Butter cream",
      pricePerKg: 100,
      description: "Cremosa e lisinha, ótima para cores e detalhes",
      swatch: "#f3dfb8",
    },
    {
      name: "Ganache de chocolate",
      pricePerKg: 100,
      description: "Chocolate intenso, acabamento brilhante",
      swatch: "#4a2a20",
    },
  ] as CakeDecoration[],
  doughs: ["Massa branca", "Massa de chocolate"],
  fillings: [
    { name: "Brigadeiro de chocolate" },
    { name: "Brigadeiro de Ninho" },
    { name: "Ninho trufado" },
    { name: "Mousse de Ninho" },
    { name: "Mousse de chocolate" },
    { name: "Ninho trufado com Nutella" },
    {
      name: "Sabor à escolha com geleia",
      ask: "Qual sabor de geleia?",
      confirm: true,
    },
    {
      name: "Sabor à escolha com frutas",
      price: 10,
      ask: "Qual fruta?",
      confirm: true,
    },
    { name: "Creme belga" },
    { name: "Prestígio" },
    { name: "Maracujá" },
    { name: "Red Velvet" },
  ] as CakeFilling[],
  extras: [
    { name: "Topo de bolo", price: 20, ask: "Tema ou nome no topo" },
    {
      name: "Mais de 2 cores no bolo",
      price: 5,
      ask: "Quais cores?",
      notWith: ["Ganache de chocolate"],
    },
    { name: "Caixa para levar o bolo", price: 10 },
  ] as CakeExtra[],
  /** Rendimento informado pela loja: até 2 kg por fatias; acima disso, ~10 pessoas por kg */
  sizes: [
    { kg: 1, serves: "8 fatias" },
    { kg: 1.5, serves: "12 a 15 fatias" },
    { kg: 2, serves: "até 20 fatias" },
    { kg: 2.5, serves: "cerca de 25 pessoas" },
    { kg: 3, serves: "cerca de 30 pessoas" },
    { kg: 4, serves: "cerca de 40 pessoas" },
    { kg: 5, serves: "cerca de 50 pessoas" },
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

/** Decoração padrão (marcada no formulário) */
export const defaultDecoration = (): CakeDecoration =>
  birthdayCake.decorations.find((d) => d.default) ??
  birthdayCake.decorations[0];

/** Menor preço do quilo — para os textos "a partir de" */
export const cakePriceFrom = (): number =>
  Math.min(...birthdayCake.decorations.map((d) => d.pricePerKg));

/** "1,5 kg" */
export const formatKg = (kg: number): string =>
  `${kg.toLocaleString("pt-BR")} kg`;

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata um preço em reais: 15 → "R$ 15,00" */
export function formatPrice(value: number): string {
  // Intl usa espaço não separável; mantém o visual "R$ 15,00".
  return brl.format(value);
}
