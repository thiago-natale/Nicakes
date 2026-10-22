/**
 * Contact — "Peça do seu jeito." (fechamento da página).
 * O painel sobe de baixo (clip-path), o cabeçalho entra no padrão (headingIn),
 * os botões abrem do centro, a divisória cresce, os contatos deslizam, o pin
 * cai e quica com squash (CustomBounce) e o ícone da marca flutua em loop.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, START, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, revealButtons, pauseOffscreen, gentleFade } from '../../../scripts/motion/utils';
import { finish } from '../../../scripts/motion/split';
import { headingIn } from '../../../scripts/motion/heading';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const panel = q1(root, 'ct-panel');
  if (!panel) return;
  if (c.reduceMotion) {
    gentleFade(panel, order);
    return;
  }
  const k = speed(c);
  const divider = q1(root, 'ct-divider');
  const items = q(root, 'ct-item');
  const pin = q1(root, 'ct-pin');
  const buttons = q(root, 'ct-buttons').flatMap((el) => Array.from(el.querySelectorAll('.btn')));
  const mark = q1(root, 'ct-mark');

  const tl = onceInView(root, { defaults: { ease: EASE.soft } }, START.heading, order);
  tl.fromTo(panel, { clipPath: 'inset(100% 0% 0% 0% round 1.5rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1 * k, ease: 'power3.inOut', clearProps: 'clipPath' });
  const splits = headingIn(tl, q1(root, 'heading'), c, '<0.45', k);
  revealButtons(buttons, tl, '<0.2', k);
  if (divider) tl.from(divider, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.9, clearProps: 'transform' }, '<');
  tl.from(items, { x: -10, autoAlpha: 0, duration: 0.5, stagger: 0.08, clearProps: 'transform,opacity,visibility' }, '<0.1');

  // Pin do mapa cai e quica com squash
  if (pin) {
    tl.from(pin, { y: -40, autoAlpha: 0, duration: 1.1, ease: EASE.squash }, '<0.2');
    tl.to(pin, { scaleX: 1.35, scaleY: 0.65, transformOrigin: '50% 100%', duration: 1.1, ease: EASE.squashSq, clearProps: 'transform' }, '<');
  }

  if (mark) tl.from(mark, { scale: 0.7, rotation: -12, autoAlpha: 0, duration: 0.9, ease: EASE.pop }, '<0.1');
  finish(tl, splits);

  // Ícone da marca flutua (pausado fora da tela)
  if (mark && c.isDesktop) {
    const loop = gsap.to(mark, { y: -6, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true });
    pauseOffscreen(loop, mark);
  }
}
