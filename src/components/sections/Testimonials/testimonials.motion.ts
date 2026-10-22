/**
 * Testimonials — "Memórias que adoçam" (entrada no fluxo da landing).
 * Segue a linguagem das outras seções: cabeçalho padrão centralizado (headingIn:
 * eyebrow + divisor + lead), forma sálvia na borda direita, a forma blush "escorre" de
 * uma gota até o desenho do card (MorphSVG, ease drip — como o hero e as
 * encomendas) e um contorno dourado se desenha em volta dela, as aspas fazem pop, o depoimento sobe por palavras de máscaras,
 * avatar e autor assentam, os cards laterais chegam deslizando de cada lado e
 * os controles fecham a sequência (o coração do ponto ativo bate).
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, START, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, gentleFade } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { headingIn } from '../../../scripts/motion/heading';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const heading = q1(root, 'heading');
  const edge = q1(root, 'tm-edge');
  const blob = q1<SVGPathElement>(root, 'tm-blob');
  const cards = q(root, 'tm-card');
  const active = cards.find((card) => card.classList.contains('is-active'));
  const sides = cards.filter((card) => card !== active && getComputedStyle(card).display !== 'none');
  const controls = q1(root, 'tm-controls');

  if (c.reduceMotion) {
    gentleFade([heading, root.querySelector<HTMLElement>('.testimonials__stage'), controls].filter((el): el is HTMLElement => !!el), order);
    return;
  }
  const k = speed(c);
  const splits: ReturnType<typeof split>[] = [];

  // Cabeçalho padrão centralizado (eyebrow + divisor + lead); a forma da borda entra pela direita
  if (heading) {
    const tl = onceInView(heading, {}, START.heading, order);
    if (edge) tl.from(edge, { xPercent: 100, duration: 0.8, ease: EASE.drip, clearProps: 'transform' }, 0);
    finish(tl, headingIn(tl, heading, c, 0, k));
  }

  // Palco: forma, card ativo, laterais e controles
  const stage = root.querySelector('.testimonials__stage');
  if (!stage || !active) return;
  const tl = onceInView(stage, { defaults: { ease: EASE.soft } }, START.heading, order);

  if (blob) {
    const d = blob.getAttribute('d') ?? '';
    tl.fromTo(blob, { morphSVG: '#tm-blob-seed' }, { morphSVG: d, duration: 1.2 * k, ease: EASE.drip });
    tl.from(blob, { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }, '<');
  }
  // Contorno dourado desenhado em volta da forma
  const line = q1<SVGPathElement>(root, 'tm-blob-line');
  if (line) tl.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut' }, '<0.35');

  const marks = q(active, 'tm-mark');
  tl.from(marks, { scale: 0, rotation: (i: number) => (i ? 25 : -25), transformOrigin: '50% 50%', duration: 0.7, ease: EASE.pop, stagger: 0.15, clearProps: 'transform' }, '<0.1');

  const quote = q1(active, 'tm-quote');
  if (quote) {
    const s = split(quote, 'words');
    splits.push(s);
    tl.from(s.words, { yPercent: 110, duration: 0.8 * k, stagger: 0.018 }, '<0.05');
  }
  const avatar = q1(active, 'tm-avatar');
  const author = q1(active, 'tm-author');
  if (avatar) tl.from(avatar, { scale: 0, duration: 0.6, ease: EASE.pop, clearProps: 'transform' }, '>-0.35');
  if (author) tl.from(author, { x: -10, autoAlpha: 0, duration: 0.5, clearProps: 'transform,opacity,visibility' }, '<0.1');

  // Laterais chegam deslizando de cada lado, com leve giro (desktop)
  sides.forEach((card, i) => {
    const dir = card.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    tl.from(card, { x: 70 * dir, rotation: 4 * dir, autoAlpha: 0, duration: 0.9, clearProps: 'transform,opacity,visibility' }, i === 0 ? '<-0.4' : '<');
  });

  if (controls) {
    const buttons = Array.from(controls.querySelectorAll('button'));
    tl.from(buttons, { scale: 0.4, autoAlpha: 0, duration: 0.45, ease: EASE.pop, stagger: 0.05, clearProps: 'transform,opacity,visibility' }, '>-0.3');
    const heart = controls.querySelector('[aria-current="true"] .testimonials__dot-heart');
    if (heart) tl.to(heart, { keyframes: { scale: [1, 1.35, 1, 1.15, 1] }, transformOrigin: '50% 50%', duration: 0.6, ease: 'none', clearProps: 'transform' });
  }
  finish(tl, splits);
}
