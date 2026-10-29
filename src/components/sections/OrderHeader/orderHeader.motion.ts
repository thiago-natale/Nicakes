/**
 * Cabeçalho de /encomendas — a coreografia do Cardápio/404:
 * eyebrow → título por palavras com giro 3D → destaque letra a letra → floreio
 * dourado → lead → passos com pop. Em paralelo (desktop), a foto surge enquanto
 * a gota cresce até o retângulo (MorphSVG no clipPath), como nas Encomendas da home.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, type MotionConditions } from '../../../scripts/motion/config';
import { whenReadyToPlay } from '../../../scripts/motion/reveal';
import { q, q1, sliderReady } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { eyebrowEnter } from '../../../scripts/motion/heading';

export function initMotion(root: HTMLElement, c: MotionConditions): void {
  if (c.reduceMotion) {
    gsap.from(root, { autoAlpha: 0, duration: 0.3, ease: 'none' });
    return;
  }
  const k = speed(c);
  const splits: ReturnType<typeof split>[] = [];
  const tl = gsap.timeline({ paused: true, delay: 0.1, defaults: { ease: EASE.soft, duration: 0.9 * k } });

  eyebrowEnter(tl, root, 0, k);
  const line = q1(root, 'oh-line');
  if (line) {
    const s = split(line, 'words');
    splits.push(s);
    tl.from(s.words, { yPercent: 110, rotationX: c.isDesktop ? -55 : 0, transformOrigin: '50% 100%', transformPerspective: 600, stagger: 0.08 }, 0.2);
  }
  const accent = q1(root, 'oh-accent');
  if (accent) {
    const s = split(accent, 'chars');
    splits.push(s);
    tl.from(s.chars, { yPercent: 60, rotation: -10, autoAlpha: 0, duration: 0.55, ease: EASE.pop, stagger: 0.03 }, 0.45);
  }
  const swash = root.querySelector('[data-motion="oh-swash"] path');
  if (swash) tl.fromTo(swash, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut' }, '>-0.15');
  const lead = q1(root, 'oh-lead');
  if (lead) {
    const s = split(lead, 'words');
    splits.push(s);
    tl.from(s.words, { yPercent: 110, duration: 0.7 * k, stagger: 0.01 }, 0.7);
  }
  const steps = q(root, 'oh-step');
  if (steps.length) {
    tl.from(steps, { scale: 0.85, y: 8, autoAlpha: 0, duration: 0.55, ease: EASE.pop, stagger: 0.06, clearProps: 'transform,opacity,visibility' }, 0.95);
  }

  // Foto (só aparece no desktop): a gota cresce até o retângulo
  const image = q1(root, 'oh-image');
  const clip = q1<SVGPathElement>(root, 'oh-clip');
  if (c.isDesktop && image && clip) {
    gsap.set(image, { clipPath: 'url(#oh-clip)' });
    tl.fromTo(image, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 0.25);
    tl.fromTo(clip, { morphSVG: '#oh-clip-seed' }, { morphSVG: 'M0 0 H1 V1 H0 Z', duration: 1.4 * k, ease: EASE.drip }, '<');
    tl.fromTo(image, { scale: 1.2, yPercent: -5 }, { scale: 1, yPercent: 0, duration: 1.6 * k }, '<');
    // Depois da entrada, devolve o recorte normal (borda arredondada do CSS)
    tl.call(() => {
      gsap.set(image, { clearProps: 'clipPath,transform' });
      sliderReady(root);
    }, undefined, '>');
  }

  finish(tl, splits);
  whenReadyToPlay().then(() => tl.play());
}
