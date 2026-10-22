/**
 * Depoimentos de clientes (seção "Memórias que adoçam").
 *
 * IMPORTANTE: os itens com `placeholder: true` são EXEMPLOS ILUSTRATIVOS — não
 * são falas reais de clientes. Substitua por depoimentos reais (com autorização
 * de quem escreveu) e remova `placeholder`. Enquanto houver placeholder, a
 * legenda "Depoimento ilustrativo" aparece no card.
 */
export interface Testimonial {
  quote: string;
  name: string;
  /** Contexto curto: o que a pessoa pediu ou viveu (ex.: "Bolo de aniversário") */
  context: string;
  placeholder?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'O bolo chegou lindo, do jeitinho que imaginei — e o sabor fez todo mundo pedir mais um pedaço. Virou o centro da festa.',
    name: 'Cliente Nicake’s',
    context: 'Bolo de aniversário',
    placeholder: true,
  },
  {
    quote: 'Passo para um café no fim da tarde e sempre saio com uma caixinha de doces. É o tipo de carinho que a gente quer repetir.',
    name: 'Cliente Nicake’s',
    context: 'Café na loja',
    placeholder: true,
  },
  {
    quote: 'Encomendei brigadeiros para presentear e a entrega pelo iFood chegou impecável. Presente que se saboreia e se guarda na memória.',
    name: 'Cliente Nicake’s',
    context: 'Presente pelo iFood',
    placeholder: true,
  },
];

/** Iniciais para o avatar (ex.: "Ana Souza" → "AS"). */
export const initials = (name: string): string =>
  name
    .replace(/[’']s\b/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

/**
 * Formas do fundo do card ativo — uma por depoimento. Ao trocar de depoimento
 * a forma "escorre" para a próxima (MorphSVG), na linguagem orgânica do hero.
 * viewBox 0 0 400 300.
 */
export const blobShapes = [
  'M206 14 C282 8 368 42 386 118 C404 196 350 270 262 288 C176 306 70 286 30 214 C-8 146 30 60 104 30 C134 18 170 16 206 14 Z',
  'M214 10 C300 18 380 70 384 150 C388 230 320 290 228 294 C138 298 34 262 18 184 C2 108 66 40 140 20 C164 13 190 9 214 10 Z',
  'M190 16 C262 4 352 30 380 102 C410 180 372 262 286 286 C200 310 92 296 40 232 C-10 170 12 82 84 42 C116 24 152 22 190 16 Z',
] as const;
