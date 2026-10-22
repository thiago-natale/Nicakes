/**
 * FAQ — "Antes do primeiro “quero pedir”." (entrada no fluxo da landing).
 * Mesma linguagem das outras seções: a forma sálvia "escorre" da borda esquerda
 * (MorphSVG, ease drip — espelhando a das encomendas), o eyebrow se desenha e
 * o texto sai de trás do traço, como no hero, o título sobe das máscaras com giro 3D e o “quero pedir”
 * entra letra a letra; à direita, as linhas douradas do acordeão crescem uma a
 * uma (como os pontilhados do cardápio), as perguntas sobem por palavras e os
 * botões +/− fazem pop girando; a resposta aberta assenta por último.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, START, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, revealButtons, gentleFade } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { headingIn } from '../../../scripts/motion/heading';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const heading = q1(root, 'heading');
  const head = heading?.parentElement ?? null;
  const list = q1(root, 'faq-list');
  if (c.reduceMotion) {
    gentleFade([head, list].filter((el): el is HTMLElement => !!el), order);
    return;
  }
  const k = speed(c);
  const splits: ReturnType<typeof split>[] = [];

  // Forma sálvia da borda (desktop)
  const edge = q1<SVGPathElement>(root, 'faq-edge');
  if (edge && c.isDesktop) {
    const d = edge.getAttribute('d') ?? '';
    const t = onceInView(root, {}, START.heading, order);
    t.fromTo(edge, { morphSVG: '#faq-edge-seed' }, { morphSVG: d, duration: 1.3, ease: EASE.drip });
  }

  // Cabeçalho
  const tl = onceInView(root, { defaults: { ease: EASE.soft } }, START.heading, order);
  const cta = q(root, 'faq-cta').flatMap((el) => Array.from(el.querySelectorAll('.btn')));

  splits.push(...headingIn(tl, heading, c, 0, k));
  revealButtons(cta, tl, 1.0, k);

  // Acordeão: linhas crescem, perguntas sobem, botões +/− fazem pop
  const rules = q(root, 'faq-rule');
  const items = q(root, 'faq-item');
  const at = c.isDesktop ? 0.3 : 0.9;
  tl.from(rules, { scaleX: 0, duration: 0.8, ease: 'power2.out', stagger: 0.09, clearProps: 'transform' }, at);
  items.forEach((item, i) => {
    const question = q1(item, 'faq-question');
    const toggle = q1(item, 'faq-toggle');
    const pos = at + 0.12 + i * 0.09;
    if (question) {
      const s = split(question, 'words');
      splits.push(s);
      tl.from(s.words, { yPercent: 110, duration: 0.7, stagger: 0.03 }, pos);
    }
    if (toggle) tl.from(toggle, { scale: 0, rotation: -90, duration: 0.55, ease: EASE.pop, clearProps: 'transform' }, pos + 0.15);
  });
  const openContent = root.querySelector('[data-faq-panel][data-state="open"] [data-faq-content]');
  if (openContent) tl.from(openContent, { y: 12, autoAlpha: 0, duration: 0.6, clearProps: 'all' }, '>-0.3');
  finish(tl, splits);
}
