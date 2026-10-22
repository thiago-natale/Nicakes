/**
 * Página 404 — entrada no padrão do site.
 * Texto: eyebrow (traço + texto) → título por palavras com giro 3D → "foi
 * devorada." letra a letra → floreio dourado → lead → botões abrem do centro →
 * atalhos em cascata.
 * Ilustração (em paralelo): a forma sálvia escorre, o "404" sobe, o prato e o
 * garfo se desenham e os farelos caem e quicam. Depois o garfo balança devagar
 * (pausado fora da tela).
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, type MotionConditions } from '../../../scripts/motion/config';
import { whenReadyToPlay } from '../../../scripts/motion/reveal';
import { q, q1, revealButtons, pauseOffscreen } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { eyebrowEnter } from '../../../scripts/motion/heading';

export function initMotion(root: HTMLElement, c: MotionConditions): void {
  if (c.reduceMotion) {
    gsap.from(root, { autoAlpha: 0, duration: 0.3, ease: 'none' });
    return;
  }
  const k = speed(c);
  const splits: ReturnType<typeof split>[] = [];
  const tl = gsap.timeline({ paused: true, delay: 0.15, defaults: { ease: EASE.soft, duration: 0.9 * k } });

  /* ---------- Texto ---------- */
  eyebrowEnter(tl, root, 0, k);
  const line = q1(root, 'nf-line');
  if (line) {
    const s = split(line, 'words');
    splits.push(s);
    tl.from(s.words, { yPercent: 110, rotationX: c.isDesktop ? -55 : 0, transformOrigin: '50% 100%', transformPerspective: 600, stagger: 0.08 }, 0.25);
  }
  const accent = q1(root, 'nf-accent');
  if (accent) {
    const s = split(accent, 'chars');
    splits.push(s);
    tl.from(s.chars, { yPercent: 60, rotation: -10, autoAlpha: 0, duration: 0.55, ease: EASE.pop, stagger: 0.035 }, 0.55);
  }
  const swash = root.querySelector('[data-motion="nf-swash"] path');
  if (swash) tl.fromTo(swash, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut' }, '>-0.1');
  const lead = q1(root, 'nf-lead');
  if (lead) {
    const s = split(lead, 'words');
    splits.push(s);
    tl.from(s.words, { yPercent: 110, duration: 0.7 * k, stagger: 0.012 }, 0.8);
  }
  revealButtons(q(root, 'nf-cta').flatMap((el) => Array.from(el.querySelectorAll('.btn'))), tl, 1.0, k);
  tl.from(q(root, 'nf-shortcut'), { y: 8, autoAlpha: 0, duration: 0.5, stagger: 0.06, clearProps: 'transform,opacity,visibility' }, 1.15);

  /* ---------- Ilustração ---------- */
  const blob = q1(root, 'nf-blob');
  if (blob) tl.from(blob, { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%', duration: 1.2 * k, ease: EASE.drip }, 0.1);
  const big = q1(root, 'nf-404');
  if (big) tl.from(big, { yPercent: 30, autoAlpha: 0, duration: 0.9 * k }, 0.3);
  const strokes = q(root, 'nf-draw');
  if (strokes.length) tl.fromTo(strokes, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut', stagger: 0.07 }, 0.45);
  const crumbs = q(root, 'nf-crumb');
  if (crumbs.length) {
    tl.from(crumbs, { y: -46, autoAlpha: 0, duration: 0.9, ease: EASE.squash, stagger: 0.08 }, 1.0);
  }
  finish(tl, splits);

  // Garfo balança devagar depois da entrada (pausa fora da tela)
  const fork = q1(root, 'nf-fork');
  if (fork) {
    const loop = gsap.to(fork, { rotation: 4, svgOrigin: '362 300', duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true });
    tl.call(() => pauseOffscreen(loop, fork));
  }

  whenReadyToPlay().then(() => tl.play());
}
