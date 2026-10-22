/**
 * Hero — entrada v2 (plano: claude/plano-hero-entrada-v2.md) e parallax no scroll.
 *
 * Princípio: em cada janela de tempo, um único tipo de trabalho caro; nada
 * pesado nos quadros finais.
 *   Pré-roll  splits, medições e 1º quadro do vídeo prontos antes de começar
 *   A palco      0–1,0s  fundo escorre (heroBackdrop.motion) + header + eyebrow
 *   B revelação  0,5–1,6s gota do recorte sobre o vídeo PARADO + título sobe (3D)
 *   C assinatura 1,0–2,2s "carinho." letra a letra, floreio, parágrafo, CTAs, destaques
 *   D acabamento 1,9–2,7s sombra estática (opacidade), selo, vídeo começa a tocar
 *   E ocioso     depois   refresh do ScrollTrigger (refresh.ts), revert do parágrafo
 *                         (idle), loop do selo — fora da timeline
 * "carinho." e os destaques ficam divididos (texto estático, aria preservada):
 * sem revert no fim = sem pico de trabalho e sem micro-salto de largura.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE } from '../../../scripts/motion/eases';
import { speed, type MotionConditions } from '../../../scripts/motion/config';
import { whenReadyToPlay, preloaderSkipped, markHeroIntroDone } from '../../../scripts/motion/reveal';
import { whenIdle } from '../../../scripts/motion/refresh';
import { q, q1, revealButtons, cssSpin } from '../../../scripts/motion/utils';
import { split } from '../../../scripts/motion/split';
import { drawIcon } from '../../../scripts/motion/draw';
import { eyebrowIn } from '../../../scripts/motion/eyebrow';

/** Espera o poster/1º quadro (ou a decodificação da imagem) — no máximo 1,5s. */
function mediaReady(el: Element | null): Promise<void> {
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 1500));
  if (el instanceof HTMLVideoElement) {
    if (el.readyState >= 2) return Promise.resolve();
    // Com poster e preload="none": espera só a imagem do poster
    if (el.poster) {
      const img = new Image();
      img.src = el.poster;
      return Promise.race([img.decode().catch(() => undefined), timeout]);
    }
    return Promise.race([new Promise<void>((resolve) => el.addEventListener('loadeddata', () => resolve(), { once: true })), timeout]);
  }
  if (el instanceof HTMLImageElement) return Promise.race([el.decode().catch(() => undefined), timeout]);
  return Promise.resolve();
}

export function initMotion(root: HTMLElement, c: MotionConditions): (() => void) | void {
  const content = root.querySelector<HTMLElement>('.hero__content');
  const media = q1(root, 'hero-media');

  if (c.reduceMotion) {
    gsap.from([content, media].filter(Boolean), { autoAlpha: 0, duration: 0.3, ease: 'none' });
    return;
  }

  const k = speed(c);
  const clip = q1<SVGPathElement>(root, 'hero-clip');
  const video = q1(root, 'hero-video');
  const photo = root.querySelector('.hero__photo');
  const shadow = q1(root, 'hero-shadow');
  const eyebrowLine = root.querySelector('[data-motion="eyebrow-line"] line');
  const eyebrowText = q1(root, 'eyebrow-text');
  const rises = q(root, 'title-rise');
  const accent = q1(root, 'title-accent');
  const swash = root.querySelector('[data-motion="title-swash"] path');
  const copy = q1(root, 'hero-copy');
  const buttons = q(root, 'hero-cta').flatMap((el) => Array.from(el.querySelectorAll('.btn')));
  const circles = q(root, 'highlight-circle');
  const icons = q(root, 'highlight-icon');
  const texts = q(root, 'highlight-text');
  const sealScroll = q1(root, 'seal-scroll');
  const seal = q1(root, 'seal');
  const ring = q1(root, 'seal-ring');
  const toggle = q1(root, 'video-toggle');

  /* ---------------- Pré-roll (nada se move ainda) ---------------- */
  // Loop do anel do selo e o gatilho que o pausa fora da tela: criados AGORA,
  // só liberados no fim da entrada (evita criar ScrollTrigger no último quadro).
  let introDone = false;
  let onScreen = true;
  const ringLoop = ring ? cssSpin(ring, 28) : null;
  if (ringLoop && seal) {
    ScrollTrigger.create({
      trigger: seal,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        onScreen = self.isActive;
        if (introDone) (onScreen ? ringLoop.resume() : ringLoop.pause());
      },
    });
  }
  // Desktop: o vídeo fica levemente ampliado (fixo) para o parallax interno do scroll
  if (video && c.isDesktop) gsap.set(video, { scale: 1.1 });

  // Splits feitos agora (fontes já carregadas). Só o parágrafo é revertido — e
  // depois, em momento ocioso; "carinho." e os destaques ficam divididos.
  const accentSplit = accent ? split(accent, 'chars') : null;
  const copySplit = copy ? split(copy, 'lines') : null;
  const textSplits = texts.map((t) => split(t, 'words'));

  const playVideo = (): void => {
    // Fora do callback do GSAP (microtask): quem escuta não entra neste context
    queueMicrotask(() => document.dispatchEvent(new CustomEvent('nicakes:hero-media-revealed')));
  };

  const tl = gsap.timeline({
    paused: true,
    delay: preloaderSkipped() ? 0.15 : 0,
    defaults: { ease: EASE.soft, duration: 0.9 * k },
    onComplete: () => {
      introDone = true;
      markHeroIntroDone(); // libera o refresh agendado (ocioso, ≥ 400ms depois)
      if (ringLoop && onScreen) ringLoop.play();
      // Parágrafo volta ao HTML original (quebras responsivas) só se a largura mudar.
      // Reverter logo após a entrada repintava o parágrafo inteiro como um novo
      // elemento — e virava o LCP da página segundos depois.
      if (copySplit) {
        const width = window.innerWidth;
        const onResize = (): void => {
          if (window.innerWidth === width) return;
          window.removeEventListener('resize', onResize);
          whenIdle(() => copySplit.revert(), 1000);
        };
        window.addEventListener('resize', onResize);
      }
    },
  });

  /* ---------------- A · palco (eyebrow; o fundo é o heroBackdrop) ---------------- */
  tl.addLabel('stage', 0.3);
  eyebrowIn(tl, eyebrowLine, eyebrowText, 'stage', k);

  /* ---------------- B · revelação ---------------- */
  tl.addLabel('reveal', 0.5);
  // A gota só aparece quando começa a crescer; o vídeo fica parado no 1º quadro
  if (photo) tl.fromTo(photo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power1.out', clearProps: 'opacity,visibility' }, 'reveal');
  if (clip) {
    const d = clip.getAttribute('d') ?? '';
    tl.fromTo(clip, { morphSVG: '#hero-clip-seed' }, { morphSVG: d, duration: 1.1 * k, ease: EASE.drip }, 'reveal');
  }
  tl.fromTo(
    rises,
    { yPercent: 115, rotationX: c.isDesktop ? -60 : 0, transformOrigin: '50% 100%', transformPerspective: 600 },
    { yPercent: 0, rotationX: 0, duration: 0.95 * k, stagger: 0.12, clearProps: 'transform' }, // limpa no fim de cada linha (~1,7s), não no último quadro
    'reveal+=0.1',
  );

  /* ---------------- C · assinatura ---------------- */
  tl.addLabel('sign', 1.0 * k);
  if (accentSplit) tl.from(accentSplit.chars, { yPercent: 60, rotation: -10, autoAlpha: 0, duration: 0.55, ease: EASE.pop, stagger: 0.035 }, 'sign');
  if (swash) tl.fromTo(swash, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut' }, 'sign+=0.25');
  if (copySplit) tl.from(copySplit.lines, { yPercent: 100, duration: 0.75 * k, stagger: 0.08 }, 'sign+=0.1');
  revealButtons(buttons, tl, 'sign+=0.3', k);
  tl.addLabel('highlights', 'sign+=0.45');
  tl.from(circles, { scale: 0, duration: 0.55, ease: EASE.pop, stagger: 0.12 }, 'highlights');
  icons.forEach((icon, i) => tl.add(drawIcon(icon, { duration: 0.75 }), `highlights+=${0.08 + i * 0.12}`));
  textSplits.forEach((s, i) => tl.from(s.words, { yPercent: 110, duration: 0.55, stagger: 0.04 }, `highlights+=${0.12 + i * 0.12}`));

  /* ---------------- D · acabamento ---------------- */
  tl.addLabel('finish', 1.9 * k);
  if (shadow) tl.fromTo(shadow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 'finish');
  tl.call(playVideo, [], 'finish+=0.1');
  if (seal) tl.from(seal, { scale: 0.4, rotation: -140, autoAlpha: 0, duration: 0.8, ease: EASE.pop }, 'finish');
  if (toggle) tl.from(toggle, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: EASE.pop }, 'finish+=0.2');

  Promise.all([whenReadyToPlay(), mediaReady(video)]).then(() => tl.play());

  /* ---------------- Scroll (desktop) ---------------- */
  if (c.isDesktop) {
    const lines = q(root, 'title-line');
    const st = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.8 },
      defaults: { ease: 'none' },
    });
    // Parallax interno: o vídeo desce dentro do recorte (a moldura fica alinhada ao fundo)
    if (video) st.fromTo(video, { yPercent: 0 }, { yPercent: 5, immediateRender: false }, 0);
    lines.forEach((line, i) => st.to(line, { y: -40 - i * 20 }, 0));
    if (sealScroll) st.to(sealScroll, { rotation: 180 }, 0);
  }
}
