/**
 * HeroBackdrop — formas do fundo (desktop) e ornamento do hero (celular).
 * Entrada (antes da máscara do vídeo — os morphs não rodam juntos):
 * a forma sálvia "escorre" do canto superior direito (MorphSVG),
 * a faixa clara cresce da esquerda e uma linha dourada desenha a crista.
 * Scroll (desktop): a forma sálvia "respira" (morph com scrub).
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, type MotionConditions } from '../../../scripts/motion/config';
import { whenReadyToPlay, preloaderSkipped } from '../../../scripts/motion/reveal';
import { q1 } from '../../../scripts/motion/utils';

export function initMotion(root: HTMLElement, c: MotionConditions): void {
  if (c.reduceMotion) return;
  const k = speed(c);

  // Desktop: HeroBackdrop | celular/tablet: ornamento dentro da mídia do hero
  const blob = c.isDesktop ? q1<SVGPathElement>(root, 'backdrop-blob') : document.querySelector<SVGPathElement>('[data-motion="ornament-blob"]');
  const band = c.isDesktop ? q1<SVGPathElement>(root, 'backdrop-band') : document.querySelector<SVGPathElement>('[data-motion="ornament-band"]');
  const crest = c.isDesktop ? q1<SVGPathElement>(root, 'backdrop-crest') : null;
  const blobSeed = c.isDesktop ? '#blob-seed' : '#ornament-blob-seed';
  const bandSeed = c.isDesktop ? '#band-seed' : '#ornament-band-seed';

  const tl = gsap.timeline({ paused: true, delay: preloaderSkipped() ? 0.2 : 0 });

  if (blob) {
    const d = blob.getAttribute('d') ?? '';
    tl.fromTo(blob, { morphSVG: blobSeed }, { morphSVG: d, duration: 1.1 * k, ease: EASE.drip }, 0);
  }
  if (band) {
    const d = band.getAttribute('d') ?? '';
    tl.fromTo(band, { morphSVG: bandSeed }, { morphSVG: d, duration: 0.9 * k, ease: EASE.soft }, 0.05);
  }
  if (crest) {
    tl.fromTo(crest, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut' }, 0.3);
  }

  whenReadyToPlay().then(() => tl.play());

  // Respiração da forma sálvia acompanhando o scroll do hero
  if (c.isDesktop && blob) {
    const hero = document.querySelector('[data-motion-section="hero"]');
    if (hero) {
      gsap.to(blob, {
        morphSVG: '#blob-breathe',
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
    }
  }
}
