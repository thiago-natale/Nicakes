/**
 * Recommended — "Para adoçar o seu dia".
 * Cabeçalho padrão centralizado (headingIn: eyebrow + divisor) e cards que se "desdobram"
 * em 3D a partir do topo, com a foto revelada da esquerda (clip-path), o "+"
 * girando e o preço subindo de uma máscara.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, START, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, gentleFade } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { headingIn } from '../../../scripts/motion/heading';
import { priceIn } from '../../../scripts/motion/counters';

/** Entrada de um card de produto (reutilizado por outras seções). */
export function productCardIn(tl: gsap.core.Timeline, card: Element, at: gsap.Position, k: number, splits: ReturnType<typeof split>[]): void {
  const media = q1(card, 'pc-media');
  const img = media?.querySelector('img');
  const name = q1(card, 'pc-name');
  const plus = q1(card, 'pc-plus');
  const price = q1(card, 'pc-price');

  tl.from(
    card,
    { rotationX: -14, transformOrigin: '50% 0%', transformPerspective: 900, y: 24, autoAlpha: 0, duration: 0.9 * k, ease: EASE.soft, clearProps: 'transform,opacity,visibility' },
    at,
  );
  if (media) tl.fromTo(media, { clipPath: 'inset(0% 100% 0% 0% round 0.75rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 0.75rem)', duration: 0.9 * k, ease: 'power3.inOut', clearProps: 'clipPath' }, '<0.15');
  if (img) tl.from(img, { scale: 1.25, duration: 1.2 * k, ease: EASE.soft, clearProps: 'transform' }, '<');
  if (name) {
    const s = split(name, 'words');
    splits.push(s);
    tl.from(s.words, { yPercent: 110, duration: 0.7, ease: EASE.soft, stagger: 0.05 }, '<0.2');
  }
  if (plus) tl.from(plus, { rotation: 90, scale: 0, duration: 0.6, ease: EASE.pop, clearProps: 'transform' }, '<0.25');
  if (price) tl.add(priceIn(price), '<');
}

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const heading = q1(root, 'heading');
  const cards = q(root, 'pc-card');
  if (c.reduceMotion) {
    gentleFade([heading, ...cards].filter((el): el is HTMLElement => !!el), order);
    return;
  }
  const k = speed(c);

  if (heading) {
    const tl = onceInView(heading, {}, START.heading, order);
    finish(tl, headingIn(tl, heading, c, 0, k));
  }

  // Desktop: os 3 cards entram juntos (stagger); celular: cada card no seu tempo
  if (c.isDesktop) {
    const list = cards[0]?.closest('ul');
    if (list) {
      const splits: ReturnType<typeof split>[] = [];
      const tl = onceInView(list, {}, START.list, order);
      cards.forEach((card, i) => productCardIn(tl, card, i * 0.14, k, splits));
      finish(tl, splits);
    }
  } else {
    cards.forEach((card) => {
      const splits: ReturnType<typeof split>[] = [];
      const tl = onceInView(card, {}, START.list, order);
      productCardIn(tl, card, 0, k, splits);
      finish(tl, splits);
    });
  }
}
