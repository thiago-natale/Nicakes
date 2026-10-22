/**
 * "Nossa loja" (#loja) — entrada no fluxo da landing, logo após as Encomendas.
 *
 * Painel sálvia abre de baixo (clip-path) → eyebrow (traço + texto revelado) →
 * título sobe das máscaras com giro 3D e "um pouquinho." entra letra a letra →
 * texto por palavras → pin do endereço quica → botão abre do centro.
 * Convite: a moldura dupla dourada se desenha (DrawSVG), a xícara é desenhada
 * em traço, "uma pausa doce." ganha o floreio dourado e os horários entram com
 * as linhas crescendo. No desktop o convite gira levemente com o scroll
 * (-4° → 2°, como no projeto de origem) e o vapor do café ondula em loop.
 */
import gsap from 'gsap';
import { EASE } from '../../../scripts/motion/eases';
import { speed, START, type MotionConditions } from '../../../scripts/motion/config';
import { q, q1, onceInView, revealButtons, pauseOffscreen, gentleFade } from '../../../scripts/motion/utils';
import { split, finish } from '../../../scripts/motion/split';
import { headingIn } from '../../../scripts/motion/heading';

export function initMotion(root: HTMLElement, c: MotionConditions, order: number): void {
  const panel = q1(root, 'st-panel');
  const invite = q1(root, 'st-invite');
  if (!panel) return;
  if (c.reduceMotion) {
    gentleFade(panel, order);
    return;
  }
  const k = speed(c);
  const splits: ReturnType<typeof split>[] = [];

  /* ---------- Texto ---------- */
  const tl = onceInView(root, { defaults: { ease: EASE.soft } }, START.heading, order);
  tl.fromTo(
    panel,
    { clipPath: 'inset(100% 0% 0% 0% round 1.5rem)' },
    { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1 * k, ease: 'power3.inOut', clearProps: 'clipPath' },
  );
  splits.push(...headingIn(tl, q1(root, 'heading'), c, '<0.45', k));
  const address = q1(root, 'st-address');
  const pin = q1(root, 'st-pin');
  if (address) tl.from(address, { x: -10, autoAlpha: 0, duration: 0.6, clearProps: 'transform,opacity,visibility' }, '<0.2');
  if (pin) {
    tl.from(pin, { y: -26, autoAlpha: 0, duration: 1, ease: EASE.squash }, '<');
    tl.to(pin, { scaleX: 1.3, scaleY: 0.7, transformOrigin: '50% 100%', duration: 1, ease: EASE.squashSq, clearProps: 'transform' }, '<');
  }
  revealButtons(q(root, 'st-cta').flatMap((el) => Array.from(el.querySelectorAll('.btn'))), tl, '<0.3', k);
  finish(tl, splits.splice(0));

  if (!invite) return;

  /* ---------- Convite ---------- */
  const card = onceInView(invite, { defaults: { ease: EASE.soft } }, c.isDesktop ? START.heading : START.list, order);
  card.from(invite, { autoAlpha: 0, y: 30, duration: 0.8, clearProps: 'opacity,visibility' });
  const frames = q(invite, 'st-frame');
  frames.forEach((frame, i) => card.fromTo(frame, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut' }, i === 0 ? '<0.1' : '<0.2'));
  const eyebrow = q1(invite, 'st-invite-eyebrow');
  if (eyebrow) card.fromTo(eyebrow, { clipPath: 'inset(-25% 50% -25% 50%)' }, { clipPath: 'inset(-25% 0% -25% 0%)', duration: 0.7, clearProps: 'clipPath' }, '<0.2');
  const art = q1(invite, 'st-art');
  if (art) card.fromTo(art.querySelectorAll('path, ellipse'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut', stagger: 0.08 }, '<0.1');
  const line = q1(invite, 'st-invite-line');
  if (line) {
    const s = split(line, 'words');
    splits.push(s);
    card.from(s.words, { yPercent: 110, duration: 0.7, stagger: 0.06 }, '<0.5');
  }
  const swashWord = invite.querySelector('.store__swash-word');
  if (swashWord) card.from(swashWord, { yPercent: 40, autoAlpha: 0, duration: 0.6, ease: EASE.pop, clearProps: 'transform,opacity,visibility' }, '<0.2');
  const swash = invite.querySelector('[data-motion="st-swash"] path');
  if (swash) card.fromTo(swash, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut' }, '<0.3');
  q(invite, 'st-hour').forEach((row, i) => {
    const rule = q1(row, 'st-hour-rule');
    if (rule) card.from(rule, { scaleX: 0, duration: 0.6, ease: 'power2.out', clearProps: 'transform' }, i === 0 ? '<0.1' : '<0.1');
    card.from(Array.from(row.children).filter((el) => el.tagName !== 'SPAN'), { y: 8, autoAlpha: 0, duration: 0.45, stagger: 0.05, clearProps: 'all' }, '<0.05');
  });
  finish(card, splits);

  // Desktop: o convite gira de leve com o scroll (como no projeto de origem)
  if (c.isDesktop) {
    gsap.fromTo(
      invite,
      { rotation: -4, y: 24 },
      { rotation: 2, y: 0, ease: 'none', scrollTrigger: { trigger: invite, start: 'top 95%', end: 'top 35%', scrub: 0.5, refreshPriority: order } },
    );
  }

  // Vapor do café ondula (pausa fora da tela)
  const steam = q1(invite, 'st-steam');
  if (steam) {
    const loop = gsap.to(steam, { y: -6, duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true });
    pauseOffscreen(loop, invite);
  }
}
