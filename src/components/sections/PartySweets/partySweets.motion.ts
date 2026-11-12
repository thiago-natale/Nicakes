/**
 * PartySweets (/cardapio) — a mesma linguagem de "Bolos de aniversário",
 * espelhada: o painel chega pela direita (o de bolos, pela esquerda) e abre, a
 * foto é revelada por uma forminha plissada que cresce (MorphSVG), o preço sobe
 * de uma máscara, os tipos e os sabores entram em cascata e os itens "a
 * combinar" vêm por último.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, revealButtons, gentleFade, sliderReady } from '../../../scripts/motion/utils';
import { finish } from '../../../scripts/motion/split';
import { dividerIn } from '../../../scripts/motion/divider';
import { priceIn } from '../../../scripts/motion/counters';
import { MASK_FULL } from '../../../scripts/motion/masks';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const divider = q1(root, 'divider');
  const panel = q1(root, 'ps-panel');
  if (c.reduceMotion) {
    gentleFade([divider, panel].filter((el): el is HTMLElement => !!el), order);
    return;
  }
  const k = speed(c);
  if (divider) {
    const tl = onceInView(divider, {}, 'top 88%', order);
    const s = dividerIn(tl, divider, 0, k);
    finish(tl, s ? [s] : []);
  }
  if (!panel) return;
  const image = q1(root, 'ps-image');
  const clip = q1<SVGPathElement>(root, 'ps-clip');
  const price = q1(root, 'ps-price');
  const types = q(root, 'ps-type');
  const chips = q(root, 'ps-chip');
  const custom = q1(root, 'ps-custom');
  const buttons = q(root, 'ps-cta');
  const both = q1(root, 'ps-both');

  const tl = onceInView(panel, { defaults: { ease: EASE.soft } }, 'top 80%', order);
  tl.fromTo(
    panel,
    { x: c.isDesktop ? 48 : 16, clipPath: 'inset(6% 6% 6% 6% round 1.5rem)' },
    { x: 0, clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1 * k, clearProps: 'clipPath,transform' },
  );
  if (image && clip) {
    gsap.set(image, { clipPath: 'url(#ps-clip)' });
    tl.fromTo(clip, { morphSVG: '#ps-clip-seed' }, { morphSVG: MASK_FULL, duration: 1.3 * k, ease: EASE.drip }, '<0.1');
    tl.fromTo(image, { scale: 1.2 }, { scale: 1, duration: 1.5 * k, clearProps: 'transform' }, '<');
    tl.call(() => sliderReady(root), undefined, '>');
  }
  if (price) tl.add(priceIn(price), '<0.2');
  tl.from(types, { y: 14, autoAlpha: 0, duration: 0.5 * k, stagger: 0.12, clearProps: 'transform,opacity,visibility' }, '<0.2');
  tl.from(chips, { scale: 0.6, autoAlpha: 0, duration: 0.4, ease: EASE.pop, stagger: 0.025, clearProps: 'transform,opacity,visibility' }, '<0.15');
  if (custom) tl.from(custom.children, { y: 10, autoAlpha: 0, duration: 0.45, stagger: 0.1, clearProps: 'transform,opacity,visibility' }, '>-0.2');
  revealButtons(buttons, tl, '>-0.3', k);
  if (both) tl.from(both, { autoAlpha: 0, x: -8, duration: 0.4, clearProps: 'transform,opacity,visibility' }, '>-0.1');
  finish(tl, []);
}
