/**
 * MenuHeader (/cardapio) — eyebrow (traço desenhado + texto revelado), título sobe por
 * palavras com giro 3D, "cardápio" letra a letra, parágrafo por linhas, botões
 * abrem do centro e os atalhos de categoria entram em cascata com pop.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, type MotionConditions } from '../../../scripts/motion/config';
import { whenReadyToPlay } from '../../../scripts/motion/reveal';
import { q, q1, revealButtons } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { eyebrowIn } from '../../../scripts/motion/eyebrow';

export function initMotion(root: HTMLElement, c: MotionConditions): void {
  if (c.reduceMotion) {
    gsap.from(root, { autoAlpha: 0, duration: 0.3, ease: 'none' });
    return;
  }
  const k = speed(c);
  const line = root.querySelector('[data-motion="eyebrow-line"] line');
  const eyebrow = q1(root, 'eyebrow-text');
  const title = q1(root, 'mh-title');
  const copy = q1(root, 'mh-copy');
  const buttons = q(root, 'mh-cta').flatMap((el) => Array.from(el.querySelectorAll('.btn')));
  const chips = q(root, 'mh-chip');
  const splits: ReturnType<typeof split>[] = [];

  const tl = gsap.timeline({ paused: true, delay: 0.2, defaults: { ease: EASE.soft, duration: 0.9 * k } });
  eyebrowIn(tl, line, eyebrow, 0, k);
  if (title) {
    const s = split(title, 'chars');
    splits.push(s);
    tl.from(
      s.words,
      { yPercent: 100, rotationX: c.isDesktop ? -70 : 0, transformOrigin: '50% 100%', transformPerspective: 600, autoAlpha: 0, duration: 1 * k, stagger: 0.12 },
      0.2,
    );
    const accent = title.querySelector('em');
    if (accent) tl.from(accent.querySelectorAll('.motion-char'), { yPercent: 50, rotation: -8, autoAlpha: 0, duration: 0.5, ease: EASE.pop, stagger: 0.03 }, 0.5);
  }
  if (copy) {
    const s = split(copy, 'lines');
    splits.push(s);
    tl.from(s.lines, { yPercent: 100, duration: 0.8 * k, stagger: 0.08 }, 0.55);
  }
  revealButtons(buttons, tl, 0.7, k);
  tl.from(chips, { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: EASE.pop, stagger: 0.05, clearProps: 'transform,opacity,visibility' }, 0.85);
  finish(tl, splits);
  whenReadyToPlay().then(() => tl.play());
}
