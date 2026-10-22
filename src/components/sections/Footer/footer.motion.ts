/**
 * Footer — entrada curta (≤ 0,9s): logo sobe de uma máscara, ícones sociais
 * fazem pop e os links aparecem.
 */
import { EASE } from '../../../scripts/motion/eases';
import type { MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView } from '../../../scripts/motion/utils';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  if (c.reduceMotion) return;
  const logo = q1(root, 'ft-logo');
  const social = q(root, 'ft-social');
  const items = q(root, 'ft-item');
  const tl = onceInView(root, { defaults: { ease: EASE.soft } }, 'top 98%', order);
  if (logo) tl.fromTo(logo, { clipPath: 'inset(100% 0% 0% 0%)', y: 12 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.6, clearProps: 'all' });
  tl.from(social, { scale: 0, duration: 0.45, ease: EASE.pop, stagger: 0.06, clearProps: 'transform' }, '<0.15');
  tl.from(items, { autoAlpha: 0, y: 6, duration: 0.4, stagger: 0.06, clearProps: 'all' }, '<0.1');
}
