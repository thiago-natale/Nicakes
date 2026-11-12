/**
 * CustomOrders — "Bolos e docinhos sob encomenda" (home).
 *
 * Desktop com altura suficiente (STACKED_QUERY — o mesmo media query do CSS):
 * tudo pela rolagem (ScrollTrigger), num palco fixo:
 *   1. o painel do bolo surge por baixo, acompanhando a página, e o palco é
 *      fixado (pin) quando ele ocupa a metade de cima da tela (base acima da
 *      linha dos 50%);
 *   2. com o palco fixo, o bolo se monta: foto pela gota → título, destaque e
 *      floreio → lead → botão → passos com o coração;
 *   3. o painel dos docinhos sobe de baixo até encostar sob o do bolo (topo
 *      abaixo da linha dos 50%) e se monta: foto pela forminha → título e
 *      granulado → lead → botão → passos com o brigadeiro;
 *   4. pausa curta com os dois montados — posição final do pin — e a página
 *      volta a rolar.
 *   `scrub` suave (1,4 s) e snap nos marcos: se a pessoa para no meio, o palco
 *   se ajusta para a etapa completa mais próxima no sentido da rolagem.
 *
 * Demais telas (celular, tablet, desktop baixo): sem pin. Cada painel chega do
 * seu lado e o conteúdo toca no tempo, uma etapa por vez.
 * Movimento reduzido: tudo aparece com um fade simples.
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
import { MASK_FULL } from '../../../scripts/motion/masks';

type Split = ReturnType<typeof split>;

/** Palco fixo com os dois painéis empilhados — igual ao @media de customOrders.css. */
export const STACKED_QUERY = '(min-width: 80rem) and (min-height: 48rem)';

/** Âncoras que devem levar ao fim do pin (os dois painéis montados). */
const ANCHORS = ['#encomendas', '#encomendas-bolo', '#encomendas-docinhos'];

/**
 * Gera o caminho (em px, relativo à lista) que passa por cima de cada ícone.
 * Mede pela posição de LAYOUT (offsetLeft/offsetTop), que ignora transforms:
 * medir com getBoundingClientRect pegava os ícones no meio da animação de
 * entrada (y: 10, scale: 0.7) e, no refresh seguinte, o caminho "pulava" ~16px.
 */
function buildPerkPath(list: HTMLElement, icons: HTMLElement[]): string {
  const points = icons.map((icon) => {
    let x = icon.offsetWidth / 2;
    let y = -7;
    for (let el: HTMLElement | null = icon; el && el !== list; el = el.offsetParent as HTMLElement | null) {
      x += el.offsetLeft;
      y += el.offsetTop;
    }
    return { x, y };
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


/** Tempo (0–1) em que um ease sine.inOut atinge o progresso `p` — para o ícone se desenhar quando o viajante chega. */
const sineInOutTime = (p: number): number => Math.acos(1 - 2 * p) / Math.PI;

interface PanelParts {
  panel: HTMLElement;
  fromRight: boolean;
  media: HTMLElement | null;
  cleanup: () => void;
}

/** Elementos do painel + caminho entre os passos (recalculado a cada refresh). */
function partsOf(panel: HTMLElement): PanelParts {
  const list = q1(panel, 'co-perks');
  const icons = q(panel, 'co-perk-icon');
  const line = q1<SVGPathElement>(panel, 'co-path-line');
  const reveal = q1<SVGPathElement>(panel, 'co-path-reveal');
  const updatePath = (): void => {
    if (!list || !line || !reveal) return;
    const d = buildPerkPath(list, icons);
    line.setAttribute('d', d);
    reveal.setAttribute('d', d);
  };
  updatePath();
  ScrollTrigger.addEventListener('refreshInit', updatePath);
  return {
    panel,
    fromRight: panel.dataset.side === 'right',
    media: q1(panel, 'co-media'),
    cleanup: () => ScrollTrigger.removeEventListener('refreshInit', updatePath),
  };
}

/**
 * Montagem do conteúdo de um painel, adicionada a `tl` a partir de `at`:
 * foto pela máscara → título/destaque → ornamento → botão → passos e viajante →
 * pulso → slider liberado. Usada no tempo (celular) e pela rolagem (palco fixo);
 * no palco, as durações viram proporções do trecho de rolagem.
 */
/**
 * Vários "onUpdate" na mesma timeline (um por painel). Também roda depois de
 * cada ScrollTrigger.refresh: o refresh volta a timeline ao início e a devolve
 * à posição sem disparar onUpdate — o recorte da foto ficaria ligado à toa.
 */
const onUpdates = {
  map: new WeakMap<gsap.core.Timeline, Array<() => void>>(),
  stops: [] as Array<() => void>,
  add(tl: gsap.core.Timeline, fn: () => void): void {
    let list = this.map.get(tl);
    if (!list) {
      const fns: Array<() => void> = [];
      this.map.set(tl, (list = fns));
      const run = (): void => fns.forEach((f) => f());
      tl.eventCallback('onUpdate', run);
      ScrollTrigger.addEventListener('refresh', run);
      this.stops.push(() => ScrollTrigger.removeEventListener('refresh', run));
    }
    list.push(fn);
  },
  clear(): void {
    this.stops.splice(0).forEach((stop) => stop());
  },
};

function addContent(tl: gsap.core.Timeline, p: PanelParts, c: MotionConditions, k: number, at: gsap.Position): Split[] {
  const { panel, fromRight, media } = p;
  const image = q1(panel, 'co-image');
  const clip = q1<SVGPathElement>(panel, 'co-clip');
  const seed = panel.dataset.seed ? `#${panel.dataset.seed}` : null;
  const cta = q1(panel, 'co-cta');
  const icons = q(panel, 'co-perk-icon');
  const perkTexts = q(panel, 'co-perk-text');
  const line = q1<SVGPathElement>(panel, 'co-path-line');
  const reveal = q1<SVGPathElement>(panel, 'co-path-reveal');
  const traveler = q1(panel, 'co-traveler');
  const ornament = q1(panel, 'co-ornament');
  const id = panel.dataset.clip ?? panel.id;
  const L = (name: string): string => `${id}-${name}`;

  icons.forEach((icon) => gsap.set(icon.querySelectorAll('path'), { drawSVG: '0%' }));

  // 1. Foto pela máscara do painel
  tl.addLabel(L('photo'), at);
  if (image && clip && seed) {
    // O recorte SVG só fica aplicado enquanto a forma cresce: com ele, cada
    // quadro do slider (troca de foto, zoom lento) obrigaria a repintar a imagem
    // inteira pela máscara. No fim, sai; ao rolar de volta, volta.
    const mask = `url(#${panel.dataset.clip})`;
    gsap.set(image, { clipPath: mask });
    tl.fromTo(image, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, L('photo'));
    const morphDur = 1.9 * k;
    tl.fromTo(clip, { morphSVG: seed }, { morphSVG: MASK_FULL, duration: morphDur, ease: EASE.drip }, L('photo'));
    // Liga/desliga o recorte pelo tempo da timeline (vale para a frente e para trás)
    const maskEnd = tl.labels[L('photo')] + morphDur;
    let masked = true;
    const syncMask = (): void => {
      const need = tl.time() < maskEnd;
      if (need === masked) return;
      masked = need;
      image.style.clipPath = need ? mask : 'none';
    };
    onUpdates.add(tl, syncMask);
    tl.fromTo(image, { scale: 1.18, yPercent: -4 }, { scale: 1, yPercent: 0, duration: 2.6 * k, ease: 'power2.out' }, L('photo'));
  } else if (media) {
    tl.from(media, { autoAlpha: 0, duration: 0.8 }, L('photo'));
  }

  // 2. Título (palavras), destaque (letras) e lead
  tl.addLabel(L('text'), `${L('photo')}+=0.7`);
  // Sem o giro 3D das palavras (isDesktop: false): com o pin, ~60 palavras em 3D
  // viravam camadas próprias a cada quadro — o deslize vertical basta aqui.
  const splits = headingIn(tl, q1(panel, 'heading'), { ...c, isDesktop: false }, L('text'), k * 1.15);

  // 3. Ornamento
  tl.addLabel(L('ornament'), `${L('text')}+=1.25`);
  if (ornament?.dataset.ornament === 'swash') {
    const path = ornament.querySelector('path');
    if (path) tl.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut' }, L('ornament'));
  } else if (ornament) {
    tl.from(
      ornament.querySelectorAll('[data-sprinkle]'),
      {
        y: -14,
        rotation: (i: number) => (i % 2 ? 50 : -50),
        transformOrigin: '50% 50%',
        autoAlpha: 0,
        duration: 0.7,
        ease: 'back.out(2.2)',
        stagger: { each: 0.07, from: 'random' },
      },
      L('ornament'),
    );
  }

  // 4. Botão (só aparece; sem crescer)
  if (cta) tl.from(cta, { y: 12, autoAlpha: 0, duration: 0.7, ease: EASE.soft }, `${L('ornament')}+=0.45`);

  // 5. Passos e viajante (cada ícone se desenha quando ele chega)
  tl.addLabel(L('perks'), `${L('ornament')}+=0.8`);
  tl.from(icons, { y: 10, scale: 0.7, autoAlpha: 0, duration: 0.6, ease: EASE.pop, stagger: 0.14 }, L('perks'));
  tl.from(perkTexts, { y: 8, autoAlpha: 0, duration: 0.55, stagger: 0.14 }, `${L('perks')}+=0.15`);
  const travel = 2.6 * k;
  tl.addLabel(L('path'), `${L('perks')}+=0.75`);
  if (icons[0]) tl.add(drawIcon(icons[0], { duration: 0.8 }), L('path'));
  if (line && reveal && traveler) {
    gsap.set(traveler, { display: 'block' });
    const move = `${L('path')}+=0.35`;
    tl.from(traveler, { scale: 0, duration: 0.45, ease: EASE.pop }, move);
    tl.fromTo(reveal, { drawSVG: '0%' }, { drawSVG: '100%', duration: travel, ease: 'sine.inOut' }, move);
    tl.to(traveler, { motionPath: { path: line, align: line, alignOrigin: [0.5, 0.5] }, duration: travel, ease: 'sine.inOut' }, move);
    if (fromRight) tl.fromTo(traveler, { rotation: -30 }, { rotation: 30, duration: travel, ease: 'sine.inOut' }, move);
  }
  icons.slice(1).forEach((icon, i) => {
    const arrive = 0.35 + travel * sineInOutTime((i + 1) / Math.max(1, icons.length - 1)) - 0.2;
    tl.add(drawIcon(icon, { duration: 0.8 }), `${L('path')}+=${arrive.toFixed(2)}`);
  });

  // 6. Fecho: o viajante pulsa e o slider é liberado
  if (traveler) tl.to(traveler, { keyframes: { scale: [1, 1.45, 1, 1.2, 1] }, duration: 0.8, ease: 'none' }, '>-0.1');
  tl.call(() => sliderReady(panel), undefined, '>');
  return splits;
}

/* -------------------------------------------------------------------------- */
/* Palco fixo (desktop alto): tudo pela rolagem                                */
/* -------------------------------------------------------------------------- */

function stackedMotion(root: HTMLElement, stage: HTMLElement, parts: PanelParts[], c: MotionConditions, order: number): () => void {
  const [cake, sweets] = parts;
  const headerH = (): number => document.querySelector<HTMLElement>('.header')?.offsetHeight ?? 84;
  const k = 1;

  // 1. O bolo surge por baixo junto com a página (entra levemente do lado esquerdo)
  gsap.fromTo(
    cake.panel,
    { y: 90, x: -36, autoAlpha: 0 },
    {
      y: 0,
      x: 0,
      autoAlpha: 1,
      ease: 'power1.out',
      scrollTrigger: { trigger: stage, start: 'top bottom', end: () => `top ${headerH()}px`, scrub: 1.2, invalidateOnRefresh: true, refreshPriority: order },
    },
  );

  // 2–4. Palco fixo: bolo se monta → docinhos sobem → docinhos se montam → pausa
  const tl = gsap.timeline({
    defaults: { ease: EASE.soft },
    scrollTrigger: {
      trigger: stage,
      start: () => `top ${headerH()}px`,
      end: () => `+=${Math.round(window.innerHeight * 2.1)}`,
      pin: true,
      scrub: 1.4,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: order,
      snap: {
        snapTo: 'labelsDirectional',
        duration: { min: 0.25, max: 0.8 },
        delay: 0.15,
        ease: 'power1.inOut',
      },
    },
  });
  tl.addLabel('inicio', 0);
  addContent(tl, cake, c, k, 'inicio');
  tl.addLabel('bolo-pronto', '>+0.3');

  // Docinhos: estavam abaixo da tela; sobem até encostar sob o bolo (entra do lado direito)
  tl.fromTo(
    sweets.panel,
    {
      y: () => window.innerHeight / 2 + 60,
      x: 36,
      autoAlpha: 0,
    },
    { y: 0, x: 0, autoAlpha: 1, duration: 2.4, ease: 'power2.out', immediateRender: true },
    'bolo-pronto',
  );
  tl.addLabel('docinhos-chegaram', '>');
  addContent(tl, sweets, c, k, 'docinhos-chegaram-=0.4');
  tl.addLabel('docinhos-prontos', '>+0.3');
  tl.to({}, { duration: 1.2 }); // pausa com os dois montados (posição final do pin)
  tl.addLabel('fim', '>');

  // Âncoras: levam ao fim do pin, com os dois painéis montados
  const st = tl.scrollTrigger as ScrollTrigger;
  let fixHashArrival = ANCHORS.includes(window.location.hash);
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
  const onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (!link || !ANCHORS.includes(link.hash) || link.pathname !== window.location.pathname) return;
    const y = Number(root.dataset.anchorY);
    if (!Number.isFinite(y)) return;
    event.preventDefault();
    window.scrollTo({ top: y, behavior: 'smooth' });
    if (window.location.hash !== link.hash) history.pushState(null, '', link.hash);
  };
  document.addEventListener('click', onClick);

  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    document.removeEventListener('click', onClick);
    delete root.dataset.anchorY;
  };
}

/* -------------------------------------------------------------------------- */
/* Demais telas: chegada de cada painel + conteúdo no tempo                    */
/* -------------------------------------------------------------------------- */

function flowMotion(part: PanelParts, c: MotionConditions, order: number, k: number): void {
  const { panel, fromRight } = part;
  const dir = fromRight ? 1 : -1;
  const arriveFrom = {
    x: () => dir * (c.isDesktop ? Math.min(window.innerWidth * 0.08, 140) : 28),
    rotationY: c.isDesktop ? dir * -7 : 0,
    scale: 0.97,
    transformPerspective: 1600,
    transformOrigin: fromRight ? '100% 50%' : '0% 50%',
    autoAlpha: 0,
  };
  const arriveTo = { x: 0, rotationY: 0, scale: 1, autoAlpha: 1 };
  if (c.isDesktop) {
    gsap.fromTo(panel, arriveFrom, {
      ...arriveTo,
      ease: 'power1.out',
      scrollTrigger: { trigger: panel, start: 'top bottom', end: 'top 62%', scrub: 1.2, invalidateOnRefresh: true, refreshPriority: order },
    });
  }
  const tl = onceInView(panel, { defaults: { ease: EASE.soft } }, c.isDesktop ? 'top 70%' : 'top 78%', order);
  if (!c.isDesktop) tl.fromTo(panel, arriveFrom, { ...arriveTo, duration: 1.1 * k, ease: 'power3.out' });
  finish(tl, addContent(tl, part, c, k, c.isDesktop ? 0 : '-=0.5'));
}

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): (() => void) | void {
  const heading = root.querySelector<HTMLElement>(':scope > [data-motion="heading"]');
  const stage = q1(root, 'co-stage');
  const panels = q(root, 'co-panel');
  const both = q1(root, 'co-both');
  if (c.reduceMotion || !stage) {
    gentleFade([heading, ...panels, both].filter((el): el is HTMLElement => !!el), order);
    return;
  }
  const k = speed(c);

  if (heading) {
    const tl = onceInView(heading, { defaults: { ease: EASE.soft } }, START.heading, order);
    finish(tl, headingIn(tl, heading, c, 0, k));
  }
  if (both) gsap.from(both, { autoAlpha: 0, y: 10, duration: 0.6, ease: EASE.soft, scrollTrigger: { trigger: both, start: 'top 95%', once: true, refreshPriority: order } });

  // O modo (palco fixo ou fluxo) acompanha o tamanho da janela
  const mm = gsap.matchMedia();
  mm.add({ stacked: STACKED_QUERY }, (ctx) => {
    const parts = panels.map(partsOf);
    const stop = ctx.conditions?.stacked ? stackedMotion(root, stage, parts, c, order) : (parts.forEach((p) => flowMotion(p, c, order, k)), () => {});
    return () => {
      stop();
      parts.forEach((p) => p.cleanup());
      onUpdates.clear();
    };
  });
  return () => mm.revert();
}
