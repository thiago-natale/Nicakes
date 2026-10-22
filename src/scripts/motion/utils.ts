/** Utilitários de animação. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ENTER_START } from './config';

/** Seletor escopado de `[data-motion="nome"]`. */
export const sel = (name: string): string => `[data-motion="${name}"]`;

export function q<T extends Element = HTMLElement>(scope: ParentNode, name: string): T[] {
  return Array.from(scope.querySelectorAll<T>(sel(name)));
}

export function q1<T extends Element = HTMLElement>(scope: ParentNode, name: string): T | null {
  return scope.querySelector<T>(sel(name));
}

/** Timeline pausada que toca uma única vez quando `trigger` entra na tela. */
export function onceInView(
  trigger: Element,
  vars: gsap.TimelineVars = {},
  start: string = ENTER_START,
  order?: number,
): gsap.core.Timeline {
  return gsap.timeline({
    ...vars,
    scrollTrigger: { trigger, start, once: true, refreshPriority: order },
  });
}

/**
 * Giro contínuo em CSS (@keyframes no compositor — zero trabalho na thread
 * principal por quadro). Mesma interface de play/pause/resume de um tween.
 * Estilos em global.css (.css-spin).
 */
export function cssSpin(el: Element, seconds: number): { play(): void; pause(): void; resume(): void } {
  el.classList.add('css-spin');
  (el as HTMLElement).style.setProperty('--spin-duration', `${seconds}s`);
  const run = (): void => el.classList.add('is-spinning');
  const stop = (): void => el.classList.remove('is-spinning');
  return { play: run, resume: run, pause: stop };
}

/** Pausa um loop infinito enquanto o elemento estiver fora da tela. */
export function pauseOffscreen(loop: { resume(): unknown; pause(): unknown }, trigger: Element): void {
  ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? loop.resume() : loop.pause()),
  });
}

/** Liga `will-change: transform` só durante o tween. */
export function withWillChange<T extends gsap.core.Animation>(anim: T, targets: Element[]): T {
  anim.eventCallback('onStart', () => gsap.set(targets, { willChange: 'transform' }));
  anim.eventCallback('onComplete', () => gsap.set(targets, { willChange: 'auto' }));
  return anim;
}

/** clip-path que abre do centro para as bordas (botões). */
export const CLIP_CLOSED_X = (r = '0.75rem'): string => `inset(0% 50% 0% 50% round ${r})`;
export const CLIP_OPEN = (r = '0.75rem'): string => `inset(0% 0% 0% 0% round ${r})`;

/** Abre botões `.btn` com clip-path a partir do centro e empurra a seta final. */
export function revealButtons(buttons: Element[], tl: gsap.core.Timeline, position: gsap.Position, factor = 1): void {
  if (!buttons.length) return;
  buttons.forEach((btn, i) => {
    const radius = getComputedStyle(btn).borderRadius || '0.75rem';
    tl.fromTo(
      btn,
      { clipPath: CLIP_CLOSED_X(radius) },
      { clipPath: CLIP_OPEN(radius), duration: 0.7 * factor, ease: 'power3.out', clearProps: 'clipPath' },
      i === 0 ? position : '<0.1',
    );
    const arrow = btn.querySelector('.btn__icon--end');
    if (arrow) tl.fromTo(arrow, { x: -6 }, { x: 0, duration: 0.5, ease: 'back.out(3)', clearProps: 'transform' }, '<0.3');
  });
}

/** Estado final imediato (prefers-reduced-motion): crossfade curto do bloco. */
export function gentleFade(targets: Element | Element[], order?: number): void {
  const list = Array.isArray(targets) ? targets : [targets];
  list.forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      duration: 0.3,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true, refreshPriority: order },
    });
  });
}
