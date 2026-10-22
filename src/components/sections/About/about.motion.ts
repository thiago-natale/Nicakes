/**
 * "A Nicake’s" — orquestração (plano: claude/plano-secao-sobre.md).
 *
 * 1. Eyebrow: traço desenhado + texto revelado saindo de trás dele (como hero e FAQ).
 * 2. Manifesto "escrito pela leitura" (scrub): palavras ganham tinta com o
 *    scroll; no fim, o floreio dourado se desenha sob "amor".
 * 3. Colagem: forma sálvia escorre, fotos reveladas por gotas que crescem
 *    (MorphSVG no clipPath, sem sombra durante o morph), selo entra girando;
 *    no desktop, parallax em velocidades diferentes e o selo gira com o scroll.
 * 4. História por linhas (máscara).
 * 5. Promessas: o 01 acende ao entrar; o segmento dourado 01→02 cresce e, ao
 *    chegar, acende o 02 (numeral preenche, ícone se desenha, título e texto
 *    sobem); idem 02→03. Scrub no desktop; sequência única no celular.
 * 6. Números: linha dourada cresce, valores sobem de máscaras, link aparece.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE } from '../../../scripts/motion/eases';
import { speed, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, gentleFade, pauseOffscreen, revealButtons, cssSpin } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { drawIcon } from '../../../scripts/motion/draw';
import { eyebrowIn } from '../../../scripts/motion/eyebrow';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): (() => void) | void {
  const manifesto = q1(root, 'about-manifesto');
  const collage = q1(root, 'about-collage');
  const story = q1(root, 'about-story');
  const promisesList = q1(root, 'about-promises');
  const stats = q1(root, 'about-stats');

  if (c.reduceMotion) {
    gentleFade([manifesto, collage, story, promisesList, stats].filter((el): el is HTMLElement => !!el), order);
    return;
  }
  const k = speed(c);
  const cleanups: Array<() => void> = [];

  const eyebrowLineSvg = q1(root, 'eyebrow-line');

  // 1 · Eyebrow
  const head = onceInView(root, { defaults: { ease: EASE.soft } }, c.isDesktop ? 'top 62%' : 'top 82%', order);
  const eyebrowLine = eyebrowLineSvg?.querySelector('line');
  const eyebrow = q1(root, 'eyebrow-text');
  eyebrowIn(head, eyebrowLine ?? null, eyebrow, 0, k);

  // 2 · Manifesto com tinta no scroll + floreio
  if (manifesto) {
    const s = split(manifesto, 'words');
    const words = s.words;
    const swash = root.querySelector('[data-motion="about-swash"] path');
    const ink = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: manifesto, start: 'top 85%', end: c.isDesktop ? 'bottom 48%' : 'bottom 60%', scrub: 0.5, refreshPriority: order },
    });
    // Tinta parte de um tom que já tem contraste de texto grande (≥ 3:1 sobre o
    // fundo): 0,55 no cacau; 0,8 nas palavras em rosa (o rosa é mais claro).
    const accent = (w: Element): boolean => !!w.closest('.text-rose-deep, em');
    ink.fromTo(words, { opacity: (_i: number, w: Element) => (accent(w) ? 0.8 : 0.55) }, { opacity: 1, duration: 1, stagger: 0.12 });
    if (swash) ink.fromTo(swash, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6 }, '>-0.4');
  }

  // 3 · Colagem
  if (collage) {
    const tl = onceInView(collage, { defaults: { ease: EASE.soft } }, 'top 78%', order);
    const blob = q1<SVGPathElement>(collage, 'about-blob');
    if (blob) {
      const d = blob.getAttribute('d') ?? '';
      tl.fromTo(blob, { morphSVG: '#about-blob-seed' }, { morphSVG: d, duration: 1.2 * k, ease: EASE.drip });
    }
    q(collage, 'about-photo').forEach((photo, i) => {
      const clip = document.querySelector<SVGPathElement>(`${photo.dataset.clip} path`);
      const img = photo.querySelector('img');
      photo.classList.add('is-revealing');
      const at = 0.25 + i * 0.35;
      tl.fromTo(photo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' }, at);
      if (clip) {
        const d = clip.getAttribute('d') ?? '';
        tl.fromTo(
          clip,
          { morphSVG: `${photo.dataset.clip}-seed` },
          { morphSVG: d, duration: 1.1 * k, ease: EASE.drip, onComplete: () => photo.classList.remove('is-revealing') },
          at,
        );
      }
      if (img) tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.4 * k, clearProps: 'transform' }, at);
      cleanups.push(() => photo.classList.remove('is-revealing'));
    });
    const seal = q1(collage, 'about-seal');
    if (seal) tl.from(seal, { scale: 0.3, rotation: -150, autoAlpha: 0, duration: 1, ease: EASE.pop, clearProps: 'opacity,visibility' }, '>-0.6');

    // Anel do selo gira devagar (pausa fora da tela)
    const ring = collage.querySelector('[data-motion="seal-ring"]');
    if (ring) pauseOffscreen(cssSpin(ring, 30), collage);

    // Desktop: parallax em velocidades diferentes e o selo gira com o scroll
    if (c.isDesktop) {
      const [main, detail] = q(collage, 'about-photo');
      const px = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: collage, start: 'top bottom', end: 'bottom top', scrub: 0.8, refreshPriority: order } });
      if (main) px.fromTo(main, { yPercent: 4 }, { yPercent: -4 }, 0);
      if (detail) px.fromTo(detail, { yPercent: 14 }, { yPercent: -10 }, 0);
      if (seal) px.fromTo(seal, { rotation: -20 }, { rotation: 40 }, 0);
    }
  }

  // 4 · História
  const splits: ReturnType<typeof split>[] = [];
  const body = onceInView(story ?? root, { defaults: { ease: EASE.soft } }, 'top 80%', order);
  if (story) {
    const s = split(story, 'lines');
    splits.push(s);
    body.from(s.lines, { yPercent: 100, duration: 0.8 * k, stagger: 0.08 });
  }
  finish(body, splits.splice(0));

  // 5 · Promessas: segmentos dourados entre os números acendem cada uma
  const items = q(root, 'about-promise');
  if (promisesList && items.length) {
    items.forEach((item) => item.classList.add('is-dim'));
    cleanups.push(() => items.forEach((item) => item.classList.remove('is-dim')));

    // Entrada de cada promessa (toca uma vez)
    const lights = items.map((item) => {
      const icon = q1(item, 'about-promise-icon');
      const title = q1(item, 'about-promise-title');
      const text = q1(item, 'about-promise-text');
      const local: ReturnType<typeof split>[] = [];
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: EASE.soft },
        onStart: () => item.classList.remove('is-dim'),
      });
      if (icon) tl.add(drawIcon(icon, { duration: 0.8 }), 0);
      if (title) {
        const s = split(title, 'words');
        local.push(s);
        tl.from(s.words, { yPercent: 110, duration: 0.7, stagger: 0.05 }, 0.1);
      }
      if (text) {
        const s = split(text, 'words');
        local.push(s);
        tl.from(s.words, { yPercent: 110, duration: 0.6, stagger: 0.012 }, 0.25);
      }
      finish(tl, local);
      return (): void => {
        if (!tl.progress()) tl.play();
      };
    });

    const lines = q(promisesList, 'about-link-line');
    const dots = q(promisesList, 'about-link-dot');
    gsap.set(lines, { scaleY: 0 });
    gsap.set(dots, { scale: 0 });

    if (c.isDesktop) {
      // O 01 acende ao entrar; os segmentos crescem com o scroll e acendem o próximo
      ScrollTrigger.create({ trigger: items[0], start: 'top 72%', once: true, refreshPriority: order, onEnter: lights[0] });
      const rail = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: promisesList, start: 'top 66%', end: 'bottom 62%', scrub: 0.6, refreshPriority: order },
      });
      lines.forEach((line, i) => {
        rail.to(line, { scaleY: 1, duration: 1 });
        if (dots[i]) rail.to(dots[i], { scale: 1, duration: 0.15, ease: 'back.out(3)' });
        rail.call(lights[i + 1] ?? (() => {}));
      });
      // Folga no fim: um callback exatamente no último instante de um scrub pode não disparar
      rail.to({}, { duration: 0.2 });
    } else {
      // Celular: sequência única ao entrar (mesma coreografia, sem scrub)
      const seq = onceInView(promisesList, { defaults: { ease: EASE.soft } }, 'top 80%', order);
      seq.call(lights[0], [], 0);
      lines.forEach((line, i) => {
        seq.to(line, { scaleY: 1, duration: 0.55 * k, ease: 'power2.inOut' }, i === 0 ? 0.35 : '>0.25');
        if (dots[i]) seq.to(dots[i], { scale: 1, duration: 0.3, ease: EASE.pop }, '>-0.05');
        if (lights[i + 1]) seq.call(lights[i + 1], [], '<');
      });
    }
  }

  // 6 · Números da casa + link
  if (stats) {
    const tl = onceInView(stats, { defaults: { ease: EASE.soft } }, 'top 85%', order);
    const rule = q1(stats, 'about-rule');
    if (rule) tl.from(rule, { scaleX: 0, duration: 1, ease: 'power2.inOut', clearProps: 'transform' });
    const values = q(stats, 'about-stat-value');
    tl.from(values, { yPercent: 105, duration: 0.8, stagger: 0.12 }, '<0.25');
    const labels = q(stats, 'about-stat-label');
    const local: ReturnType<typeof split>[] = [];
    labels.forEach((label, i) => {
      const s = split(label, 'words');
      local.push(s);
      tl.from(s.words, { yPercent: 110, duration: 0.6, stagger: 0.04 }, `<${i === 0 ? 0.2 : 0.12}`);
    });
    // Botão abre do centro (mesmo padrão dos demais CTAs)
    revealButtons(q(stats, 'about-link').flatMap((el) => Array.from(el.querySelectorAll('.btn'))), tl, '>-0.3', k);
    finish(tl, local);
  }

  return () => cleanups.forEach((fn) => fn());
}
