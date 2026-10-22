/**
 * Bestsellers — "Os queridinhos da casa".
 * O painel sálvia abre do centro (clip-path), o cabeçalho entra no padrão (headingIn),
 * as fotos redondas entram girando como pratos, os preços sobem de uma máscara
 * e, no desktop, os pratos giram suavemente com o scroll.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, START, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, revealButtons, gentleFade } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { priceIn } from '../../../scripts/motion/counters';
import { headingIn } from '../../../scripts/motion/heading';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const panel = q1(root, 'bs-panel');
  if (!panel) return;
  if (c.reduceMotion) {
    gentleFade(panel, order);
    return;
  }
  const k = speed(c);
  const plates = q(root, 'bs-plate');
  const names = q(root, 'bs-name');
  const prices = q(root, 'bs-price');
  const cta = q(root, 'bs-cta');
  const splits: ReturnType<typeof split>[] = [];

  const tl = onceInView(root, { defaults: { ease: EASE.soft } }, START.heading, order);
  tl.fromTo(
    panel,
    { clipPath: 'inset(10% 47% 10% 47% round 1.5rem)' },
    { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1.1 * k, ease: EASE.drip, clearProps: 'clipPath' },
  );
  splits.push(...headingIn(tl, q1(root, 'heading'), c, '<0.35', k));
  tl.from(
    plates,
    { rotation: -120, scale: 0.6, autoAlpha: 0, duration: 1 * k, ease: EASE.pop, stagger: 0.12, clearProps: 'transform,opacity,visibility' },
    '<0.15',
  );
  names.forEach((name, i) => {
    const s = split(name, 'words');
    splits.push(s);
    tl.from(s.words, { yPercent: 110, duration: 0.7, stagger: 0.05 }, `<${i === 0 ? 0.35 : 0.12}`);
  });
  if (prices.length) tl.add(priceIn(prices, { stagger: 0.12 }), '<0.1');
  revealButtons(cta, tl, '<', k);
  finish(tl, splits);

  // Desktop: os pratos giram suavemente enquanto a seção cruza a tela
  if (c.isDesktop) {
    q(root, 'bs-plate-wrap').forEach((wrap, i) => {
      gsap.fromTo(
        wrap,
        { rotation: i % 2 ? 12 : -12 },
        {
          rotation: i % 2 ? -12 : 12,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1, refreshPriority: order },
        },
      );
    });
  }
}
