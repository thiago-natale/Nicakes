/**
 * Entrada dos valores monetários: o preço sobe de uma máscara e assenta,
 * sempre exibindo o valor final (sem contagem nem embaralhamento).
 * Usado no cardápio, nos mais pedidos, nos cards de produto e nos bolos.
 */
import gsap from 'gsap';
import { EASE } from './eases';

export function priceIn(targets: Element | Element[], vars: gsap.TweenVars = {}): gsap.core.Tween {
  return gsap.fromTo(
    targets,
    { yPercent: 70, autoAlpha: 0, clipPath: 'inset(0% 0% 100% 0%)' },
    {
      yPercent: 0,
      autoAlpha: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.6,
      ease: EASE.soft,
      stagger: 0.05,
      clearProps: 'transform,clipPath,opacity,visibility',
      ...vars,
    },
  );
}
