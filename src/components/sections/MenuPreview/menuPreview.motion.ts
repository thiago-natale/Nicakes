/**
 * MenuPreview — "Um pouco do nosso cardápio".
 * Cabeçalho padrão centralizado (headingIn) + cards em sequência; em cada card, nomes deslizam, a linha
 * pontilhada dourada cresce e os preços sobem de uma máscara até assentar.
 */
import { speed, START, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, revealButtons, gentleFade } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { headingIn } from '../../../scripts/motion/heading';
import { menuCardIn } from '../../../scripts/motion/menu';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const heading = q1(root, 'heading');
  const cards = q(root, 'menu-card');
  const cta = q1(root, 'menu-cta');
  if (c.reduceMotion) {
    gentleFade([heading, ...cards, cta].filter((el): el is HTMLElement => !!el), order);
    return;
  }
  const k = speed(c);

  if (heading) {
    const tl = onceInView(heading, {}, START.heading, order);
    finish(tl, headingIn(tl, heading, c, 0, k));
  }

  cards.forEach((card, i) => {
    const splits: ReturnType<typeof split>[] = [];
    // No desktop os cards estão lado a lado: escalonamos pelo índice
    const tl = onceInView(card, { delay: c.isDesktop ? i * 0.15 : 0 }, START.list, order);
    menuCardIn(tl, card, 0, k, splits);
    finish(tl, splits);
  });

  if (cta) {
    const tl = onceInView(cta, {}, START.list, order);
    revealButtons(Array.from(cta.querySelectorAll('.btn')), tl, 0, k);
    tl.from(cta.querySelector('p'), { autoAlpha: 0, y: 8, duration: 0.5 }, '<0.2');
  }
}
