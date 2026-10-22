/**
 * Entradas do cardápio: o card desenrola (clip-path), o nome desliza, a linha pontilhada dourada
 * cresce da esquerda e o preço sobe de uma máscara até assentar.
 * Usado pela prévia da home e pelo /cardapio.
 */
import gsap from 'gsap';
import { EASE } from './eases';
import { q, q1 } from './utils';
import { split } from './split';
import { priceIn } from './counters';

export function menuCardIn(
  tl: gsap.core.Timeline,
  card: Element,
  at: gsap.Position,
  k: number,
  splits: ReturnType<typeof split>[],
  titleName = 'menu-card-title',
): void {
  const title = q1(card, titleName);
  const rows = q(card, 'ml-row');
  // O card "desenrola" de cima para baixo, como um cardápio aberto
  tl.fromTo(
    card,
    { clipPath: 'inset(0% 0% 100% 0% round 1rem)' },
    { clipPath: 'inset(0% 0% 0% 0% round 1rem)', duration: 0.9 * k, ease: 'power3.inOut', clearProps: 'clipPath' },
    at,
  );
  if (title) {
    const s = split(title, 'words');
    splits.push(s);
    tl.from(s.words, { yPercent: 110, duration: 0.7 * k, ease: EASE.soft, stagger: 0.05 }, '<0.25');
  }
  rows.forEach((row, i) => {
    const pos = `<${i === 0 ? 0.2 : 0.06}`;
    const name = q1(row, 'ml-name');
    const leader = q1(row, 'ml-leader');
    const prices = q(row, 'ml-price');
    if (name) tl.from(name, { x: -14, autoAlpha: 0, duration: 0.5, ease: EASE.soft, clearProps: 'transform,opacity,visibility' }, pos);
    if (leader) tl.from(leader, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'power2.out', clearProps: 'transform' }, '<0.05');
    // Preço sobe de uma máscara e assenta suavemente
    if (prices.length) tl.add(priceIn(prices), '<0.1');
  });
}
