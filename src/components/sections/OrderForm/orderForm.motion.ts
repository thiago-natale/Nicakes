/**
 * /encomendas — entrada das etapas e do resumo.
 * Cada etapa: o card sobe com leve giro 3D, o selo numerado dá um pop, o título
 * sobe por palavras e as opções entram em cascata (ao entrar na tela, START.list).
 * O resumo abre do centro (clip-path), como os painéis do site.
 * Microinterações (check desenhado, contador, valor) ficam no CSS/client.
 * Só opacidade (nunca visibility): os campos continuam focáveis pelo teclado
 * antes de a entrada tocar — o foco rola a etapa para a tela e dispara a entrada.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, START, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const steps = q(root, 'of-step');
  const summary = q1(root, 'of-summary');
  // Movimento reduzido: o formulário já fica visível e focável, sem entrada
  if (c.reduceMotion) return;
  const k = speed(c);

  steps.forEach((step) => {
    const splits: ReturnType<typeof split>[] = [];
    const tl = onceInView(step, { defaults: { ease: EASE.soft } }, START.list, order);
    tl.from(step, {
      y: 36,
      rotationX: c.isDesktop ? 8 : 0,
      transformOrigin: '50% 0%',
      transformPerspective: 900,
      opacity: 0,
      duration: 0.8 * k,
      clearProps: 'transform,opacity',
    });
    const badge = q1(step, 'of-badge');
    if (badge) tl.from(badge, { scale: 0, rotation: -30, duration: 0.6, ease: EASE.pop, clearProps: 'transform' }, '<0.2');
    const legend = q1(step, 'of-legend');
    if (legend) {
      const s = split(legend, 'words');
      splits.push(s);
      tl.from(s.words, { yPercent: 110, duration: 0.6 * k, stagger: 0.05 }, '<0.05');
    }
    const options = q(step, 'choice');
    if (options.length) {
      tl.from(options, { y: 14, opacity: 0, duration: 0.5 * k, stagger: Math.min(0.05, 0.5 / options.length), clearProps: 'transform,opacity' }, '<0.15');
    }
    finish(tl, splits);
  });

  if (summary) {
    const card = summary.firstElementChild ?? summary;
    const tl = onceInView(summary, { defaults: { ease: EASE.soft } }, START.list, order);
    tl.fromTo(
      card,
      { clipPath: 'inset(8% 8% 8% 8% round 1.5rem)', opacity: 0 },
      { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', opacity: 1, duration: 0.9 * k, clearProps: 'clipPath,opacity' },
      c.isDesktop ? 0.25 : 0,
    );
    tl.from(card.children, { y: 10, opacity: 0, duration: 0.5, stagger: 0.05, clearProps: 'transform,opacity' }, '<0.25');
  }
}
