/**
 * Eyebrow (traço dourado + versal): o traço se desenha e o texto é revelado
 * logo em seguida, saindo de trás dele — clip-path da esquerda para a direita
 * com um leve deslize. Usado no hero, Sobre, FAQ e /cardapio.
 */
import { EASE } from './eases';

export function eyebrowIn(
  tl: gsap.core.Timeline,
  line: Element | null,
  text: Element | null,
  at: gsap.Position = 0,
  k = 1,
): void {
  if (line) tl.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'power2.inOut' }, at);
  if (text) {
    tl.fromTo(
      text,
      { clipPath: 'inset(-25% 100% -25% 0%)', x: -10 },
      { clipPath: 'inset(-25% 0% -25% 0%)', x: 0, duration: 0.75 * k, ease: EASE.soft, clearProps: 'clipPath,transform' },
      line ? '<0.25' : at,
    );
  }
}
