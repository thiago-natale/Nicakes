/** Configuração compartilhada das animações (breakpoints, eventos, durações). */

export const EVENTS = {
  /** Disparado pelo preloader no início da abertura dos painéis (ou na hora, se pulado). */
  preloaderReveal: 'nicakes:preloader-reveal',
  preloaderComplete: 'nicakes:preloader-complete',
  /** Hero: recorte da mídia concluído — o vídeo pode começar a tocar. */
  heroMediaRevealed: 'nicakes:hero-media-revealed',
  /** /encomendas: pedido enviado ao WhatsApp (Analytics: generate_lead). */
  orderSubmit: 'nicakes:order-submit',
} as const;

/**
 * Breakpoints — os mesmos de global.css (@theme --breakpoint-*):
 * md 48rem (tablet: header com menu completo, hero em 2 colunas) ·
 * lg 56.25rem (layout desktop) · xl 80rem · ultra 137.5rem.
 */
export const MEDIA = {
  /** md — tablet (header com menu completo, hero em 2 colunas) */
  isTablet: '(min-width: 48rem)',
  isDesktop: '(min-width: 56.25rem)',
  isMobile: '(max-width: 56.2499rem)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
} as const;

export interface MotionConditions {
  isDesktop: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
}

/** Fator de duração: no celular as entradas ficam ~20% mais curtas. */
export const speed = (c: MotionConditions): number => (c.isMobile ? 0.8 : 1);

/** Início padrão das entradas por scroll. */
export const ENTER_START = 'top 80%';

/**
 * Pontos de disparo padronizados (todas as seções da home usam estes).
 * heading: cabeçalhos e painéis · list: cards, listas e grades.
 */
export const START = {
  heading: 'top 80%',
  list: 'top 85%',
} as const;

/** Durações base (multiplicadas por `speed()` no celular). */
export const DUR = {
  fast: 0.45,
  base: 0.7,
  slow: 1.1,
} as const;
