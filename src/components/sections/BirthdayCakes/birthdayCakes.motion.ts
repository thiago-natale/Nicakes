/**
 * BirthdayCakes (/cardapio) — mesma linguagem das encomendas da home, sem pin:
 * painel abre, a foto é revelada por uma gota que cresce (MorphSVG), o preço
 * sobe de uma máscara, os recheios entram em cascata e os adicionais seguem o cardápio.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, revealButtons, gentleFade, sliderReady } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { dividerIn } from '../../../scripts/motion/divider';
import { priceIn } from '../../../scripts/motion/counters';
import { menuCardIn } from '../../../scripts/motion/menu';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const divider = q1(root, 'divider');
  const panel = q1(root, 'bc-panel');
  if (c.reduceMotion) {
    gentleFade([divider, panel].filter((el): el is HTMLElement => !!el), order);
    return;
  }
  const k = speed(c);
  const splits: ReturnType<typeof split>[] = [];
  if (divider) {
    const tl = onceInView(divider, {}, 'top 88%', order);
    const s = dividerIn(tl, divider, 0, k);
    finish(tl, s ? [s] : []);
  }
  if (!panel) return;

  const image = q1(root, 'bc-image');
  const clip = q1<SVGPathElement>(root, 'bc-clip');
  const price = q1(root, 'bc-price');
  const chips = q(root, 'bc-chip');
  const extras = q1(root, 'bc-extras');
  const cta = q(root, 'bc-cta');

  const tl = onceInView(panel, { defaults: { ease: EASE.soft } }, 'top 80%', order);
  tl.fromTo(panel, { clipPath: 'inset(6% 6% 6% 6% round 1.5rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1 * k, clearProps: 'clipPath' });
  if (image && clip) {
    gsap.set(image, { clipPath: 'url(#bc-clip)' });
    tl.fromTo(clip, { morphSVG: '#bc-clip-seed' }, { morphSVG: 'M0 0 H1 V1 H0 Z', duration: 1.3 * k, ease: EASE.drip }, '<0.1');
    tl.fromTo(image, { scale: 1.2 }, { scale: 1, duration: 1.5 * k, clearProps: 'transform' }, '<');
    tl.call(() => sliderReady(root), undefined, '>');
  }
  if (price) tl.add(priceIn(price), '<0.2');
  tl.from(chips, { scale: 0.6, autoAlpha: 0, duration: 0.45, ease: EASE.pop, stagger: 0.04, clearProps: 'transform,opacity,visibility' }, '<0.3');
  if (extras) menuCardIn(tl, extras, '<0.2', k, splits, 'none');
  revealButtons(cta, tl, '>-0.3', k);
  finish(tl, splits);
}
