/**
 * Depoimentos de clientes (seção "Memórias que adoçam") — comentários reais
 * do Instagram da Nicake’s, com revisão só de ortografia e pontuação (sem
 * mudar o sentido) e sem os emojis. A foto é a do perfil de quem escreveu
 * (public/images/depoimentos/<photo>.webp, 96 × 96). Sem `photo`, o avatar
 * mostra as iniciais.
 */
export interface Testimonial {
  quote: string;
  /** Como a pessoa aparece no Instagram (@perfil) */
  name: string;
  /** Contexto curto: o que a pessoa pediu ou viveu (ex.: "Bolo de aniversário") */
  context: string;
  /** Arquivo da foto de perfil, sem extensão */
  photo?: string;
  /** Onde o depoimento foi publicado */
  source?: string;
  /** Exemplo ilustrativo (não é fala real) — mostra a legenda no card */
  placeholder?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Ganhei de surpresa, no meu aniversário, um bolo daí e estava simplesmente maravilhoso. Todo mundo perguntando quem fez!',
    name: '@fabiolameendes',
    context: 'Bolo de aniversário',
    photo: 'fabiolameendes',
    source: 'Instagram',
  },
  {
    quote: 'Sem dúvida, são os melhores! Já provei vários sabores e posso dizer com toda a certeza: eles nos fazem voltar para comprar mais. E isso sem contar as deliciosas coxinhas. Parabéns por esse dom e pelas mãos de fada!',
    name: '@crismells',
    context: 'Doces e coxinhas',
    photo: 'crismells',
    source: 'Instagram',
  },
  {
    quote: 'Jamais vou esquecer a carinha da Laura ao ver seu bolo de coração! Sem contar o sabor leve e os ingredientes extremamente frescos: um bolo que remete à memória afetiva.',
    name: '@renatabotelhoor',
    context: 'Bolo de aniversário',
    photo: 'renatabotelhoor',
    source: 'Instagram',
  },
  {
    quote: 'Eu amo essa confeitaria! Se pudesse, iria toda semana, kkk. A coxinha é uma delícia, o suco natural foi o melhor que já bebemos, tudo tão gostoso, e o lugar é tão aconchegante e lindo. Eu amo mesmo!',
    name: '@geeh_rbeatriz._',
    context: 'Coxinha, suco e a loja',
    photo: 'geeh-rbeatriz',
    source: 'Instagram',
  },
  {
    quote: 'Nunca tomei um café tão bom como o que tomei na cafeteria.',
    name: '@projetoar_oficial',
    context: 'Café na loja',
    photo: 'projetoar-oficial',
    source: 'Instagram',
  },
];

/** Iniciais para o avatar (ex.: "Ana Souza" → "AS"). */
export const initials = (name: string): string =>
  name
    .replace(/[’']s\b/g, '')
    .replace(/^@/, '')
    .replace(/[_.]+/g, ' ')
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
