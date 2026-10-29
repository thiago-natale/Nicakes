/**
 * CustomOrders — "Bolos de aniversário sob encomenda" (momento-assinatura).
 *
 * Desktop, em duas etapas conduzidas pelo scroll:
 *   1. entrada (começa assim que a seção desponta, antes do pin): painel abre →
 *      a foto surge (opacidade 0 → 1) enquanto uma gota cresce até o retângulo
 *      (MorphSVG no clipPath) → cabeçalho padrão (headingIn);
 *   2. pin: o caminho entre os passos se desenha e um coração dourado o percorre
 *      (MotionPath), desenhando cada ícone ao chegar → o botão "Encomendar" pulsa.
 * Celular: a mesma sequência, sem pin, tocando uma vez ao entrar.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);
import { EASE } from '../../../scripts/motion/eases';
import { speed, START, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, gentleFade, sliderReady } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { drawIcon } from '../../../scripts/motion/draw';
import { headingIn } from '../../../scripts/motion/heading';

/** Gera o caminho (em px, relativo à lista) que passa por cima de cada ícone. */
function buildPerkPath(list: HTMLElement, icons: HTMLElement[]): string {
  const box = list.getBoundingClientRect();
  const points = icons.map((icon) => {
    const r = icon.getBoundingClientRect();
    return { x: r.left - box.left + r.width / 2, y: r.top - box.top - 7 };
  });
  if (points.length < 2) return '';
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    // arco contido no espaço reservado acima dos ícones (pt da lista), sem tocar no texto
    const lift = Math.min(26, Math.max(12, (b.x - a.x) * 0.22));
    d += ` C${(a.x + (b.x - a.x) * 0.25).toFixed(1)} ${(a.y - lift).toFixed(1)} ${(a.x + (b.x - a.x) * 0.75).toFixed(1)} ${(b.y - lift).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): (() => void) | void {
  const panel = q1(root, 'co-panel');
  if (!panel) return;
  if (c.reduceMotion) {
    gentleFade(panel, order);
    return;
  }
  const k = speed(c);
  const image = q1(root, 'co-image');
  const clip = q1<SVGPathElement>(root, 'co-clip');
  const cta = q1(root, 'co-cta');
  const list = q1(root, 'co-perks');
  const icons = q(root, 'co-perk-icon');
  const perkTexts = q(root, 'co-perk-text');
  const line = q1<SVGPathElement>(root, 'co-path-line');
  const reveal = q1<SVGPathElement>(root, 'co-path-reveal');
  const heart = q1(root, 'co-heart');
  const splits: ReturnType<typeof split>[] = [];

  // Caminho entre os passos — recalculado a cada refresh (resize, fontes)
  const updatePath = (): void => {
    if (!list || !line || !reveal) return;
    const d = buildPerkPath(list, icons);
    line.setAttribute('d', d);
    reveal.setAttribute('d', d);
  };
  updatePath();
  ScrollTrigger.addEventListener('refreshInit', updatePath);
  const cleanup = (): void => ScrollTrigger.removeEventListener('refreshInit', updatePath);

  const pinned = c.isDesktop;
  // Início do pin: seção centralizada na área visível abaixo do header fixo
  const pinStart = (): string =>
    `center ${(window.innerHeight + (document.querySelector<HTMLElement>('.header')?.offsetHeight ?? 84)) / 2}px`;

  // Desktop: a entrada (painel, foto e textos) começa antes do pin, acompanhando
  // o scroll desde que a seção desponta na tela; o pin conduz só os passos.
  // Celular: tudo numa timeline única, disparada cedo.
  const intro = pinned
    ? gsap.timeline({
        defaults: { ease: EASE.soft },
        scrollTrigger: { trigger: root, start: 'top 90%', end: pinStart, scrub: 1, invalidateOnRefresh: true, refreshPriority: order },
      })
    : onceInView(root, { defaults: { ease: EASE.soft } }, START.heading, order);
  const tl = pinned
    ? gsap.timeline({
        defaults: { ease: EASE.soft },
        scrollTrigger: {
          trigger: root,
          start: pinStart,
          end: '+=45%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: order,
        },
      })
    : intro;

  // Painel abre
  intro.fromTo(
    panel,
    { clipPath: 'inset(6% 6% 6% 6% round 1.5rem)' },
    { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1 * k },
  );

  // Foto: começa invisível (a moldura da máscara não aparece antes da hora),
  // surge enquanto a gota cresce até o retângulo, com zoom e leve deslocamento
  if (image && clip) {
    gsap.set(image, { clipPath: 'url(#co-clip)' });
    intro.fromTo(image, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, '<0.1');
    intro.fromTo(clip, { morphSVG: '#co-clip-seed' }, { morphSVG: 'M0 0 H1 V1 H0 Z', duration: 1.4 * k, ease: EASE.drip }, '<');
    intro.fromTo(image, { scale: 1.25, yPercent: -6 }, { scale: 1, yPercent: 0, duration: 1.6 * k }, '<');
  }

  // Cabeçalho padrão (eyebrow → título 3D → destaque → lead)
  splits.push(...headingIn(intro, q1(root, 'heading'), c, '<0.2', k));
  if (cta) intro.from(cta, { scale: 0.85, autoAlpha: 0, duration: 0.5, ease: EASE.pop }, '<0.2');

  // Passos: os círculos aparecem vazios; os traços só se desenham quando o coração chega
  icons.forEach((icon) => gsap.set(icon.querySelectorAll('path'), { drawSVG: '0%' }));
  intro.from(icons, { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: EASE.pop, stagger: 0.1, clearProps: 'transform,opacity,visibility' }, '<');
  intro.from(perkTexts, { autoAlpha: 0, y: 6, duration: 0.4, stagger: 0.1 }, '<0.1');
  // Fim da entrada: o slider de fotos começa a trocar (controles e barra aparecem)
  intro.call(() => sliderReady(root), undefined, '>');

  // O primeiro ícone se desenha; o coração pousa e percorre o caminho até o último
  const travel = 2.2 * k;
  tl.addLabel('path', pinned ? 0 : '>-0.1');
  if (icons[0]) tl.add(drawIcon(icons[0], { duration: 0.7 }), 'path');
  if (line && reveal && heart) {
    gsap.set(heart, { display: 'block' });
    tl.from(heart, { scale: 0, duration: 0.4, ease: EASE.pop }, 'path+=0.2');
    tl.fromTo(reveal, { drawSVG: '0%' }, { drawSVG: '100%', duration: travel, ease: 'none' }, 'path+=0.2');
    tl.to(
      heart,
      {
        motionPath: { path: line, align: line, alignOrigin: [0.5, 0.5] },
        duration: travel,
        ease: 'none',
      },
      'path+=0.2',
    );
  }
  // Os demais ícones se desenham quando o coração chega (frações iguais do trajeto)
  icons.slice(1).forEach((icon, i) => {
    const arrive = 0.2 + travel * ((i + 1) / Math.max(1, icons.length - 1)) - 0.15;
    tl.add(drawIcon(icon, { duration: 0.7 }), `path+=${arrive.toFixed(2)}`);
  });
  if (heart) tl.to(heart, { keyframes: { scale: [1, 1.5, 1, 1.25, 1] }, duration: 0.6, ease: 'none' }, '>');
  if (cta) tl.to(cta, { keyframes: { scale: [1, 1.06, 1] }, duration: 0.5, ease: 'sine.inOut' }, '<');

  if (!pinned) finish(tl, splits);

  // Links para #encomendas (desktop/pin): o navegador rolaria até o topo da seção,
  // onde a montagem ainda não terminou. Levamos até o FIM do pin, com a seção
  // completa e centralizada. `data-anchor-y` é atualizado a cada refresh.
  if (pinned && tl.scrollTrigger) {
    const st = tl.scrollTrigger;
    // Chegada por URL (/#encomendas, vindo de outra página): após o 1º refresh,
    // com o layout final, corrige a posição para o fim do pin.
    let fixHashArrival = window.location.hash === `#${root.id}`;
    const updateAnchor = (): void => {
      root.dataset.anchorY = String(Math.ceil(st.end) + 2);
    };
    const onRefresh = (): void => {
      updateAnchor();
      if (fixHashArrival) {
        fixHashArrival = false;
        window.scrollTo({ top: Number(root.dataset.anchorY), behavior: 'auto' });
      }
    };
    updateAnchor();
    ScrollTrigger.addEventListener('refresh', onRefresh);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onClick = (event: MouseEvent): void => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.hash !== `#${root.id}` || link.pathname !== window.location.pathname) return;
      const y = Number(root.dataset.anchorY);
      if (!Number.isFinite(y)) return;
      event.preventDefault();
      window.scrollTo({ top: y, behavior: reduce.matches ? 'auto' : 'smooth' });
      if (window.location.hash !== link.hash) history.pushState(null, '', link.hash);
    };
    document.addEventListener('click', onClick);

    const previous = cleanup;
    return () => {
      previous();
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      document.removeEventListener('click', onClick);
      delete root.dataset.anchorY;
    };
  }
  return cleanup;
}
