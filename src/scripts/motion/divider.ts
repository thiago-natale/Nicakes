/**
 * Divisor de seção (SectionDivider): linhas douradas desenhadas do centro
 * para fora, corações com batida dupla e título subindo por palavras.
 */
import gsap from 'gsap';
import { EASE } from './eases';
import { q, q1 } from './utils';
import { split } from './split';

/** Adiciona a entrada do divisor à timeline e devolve o split (para reverter no fim). */
export function dividerIn(tl: gsap.core.Timeline, divider: Element, at: gsap.Position = 0, k = 1) {
  const [left, right] = q(divider, 'divider-line').map((svg) => svg.querySelector('line'));
  const hearts = q(divider, 'divider-heart');
  const title = q1(divider, 'divider-title');

  tl.addLabel('divider', at);
  if (left) tl.fromTo(left, { drawSVG: '100% 100%' }, { drawSVG: '0% 100%', duration: 0.8 * k, ease: 'power2.inOut' }, 'divider');
  if (right) tl.fromTo(right, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.8 * k, ease: 'power2.inOut' }, 'divider');
  if (hearts.length) {
    tl.from(hearts, { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: EASE.pop, clearProps: 'transform' }, 'divider+=0.15');
    tl.to(hearts, { keyframes: { scale: [1, 1.35, 1, 1.2, 1] }, transformOrigin: '50% 50%', duration: 0.7, ease: 'none', clearProps: 'transform' }, '>');
  }
  if (!title) return null;
  const s = split(title, 'words');
  tl.from(s.words, { yPercent: 110, duration: 0.8 * k, ease: EASE.soft, stagger: 0.05 }, 'divider+=0.1');
  return s;
}
