/**
 * MenuCategory (/cardapio) — divisor da categoria e cards do cardápio
 * (desenrolam, linhas pontilhadas crescem, preços sobem de máscaras).
 */
import { speed, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, gentleFade } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { dividerIn } from '../../../scripts/motion/divider';
import { menuCardIn } from '../../../scripts/motion/menu';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const divider = q1(root, 'divider');
  const cards = q(root, 'menu-card');
  if (c.reduceMotion) {
    gentleFade([divider, ...cards].filter((el): el is HTMLElement => !!el), order);
    return;
  }
  const k = speed(c);
  if (divider) {
    const tl = onceInView(divider, {}, 'top 88%', order);
    const s = dividerIn(tl, divider, 0, k);
    finish(tl, s ? [s] : []);
  }
  cards.forEach((card) => {
    const splits: ReturnType<typeof split>[] = [];
    const tl = onceInView(card, {}, 'top 88%', order);
    menuCardIn(tl, card, 0, k, splits);
    finish(tl, splits);
  });
}
