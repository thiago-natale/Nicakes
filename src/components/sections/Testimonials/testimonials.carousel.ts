/**
 * Carrossel de depoimentos (GSAP Flip + MorphSVG).
 * - Reordena o trilho (anterior · ativo · próximo) e anima a troca de posição
 *   dos cards com Flip; a forma de fundo "escorre" para o desenho do novo ativo.
 * - Pontos (coração dourado no ativo), setas e teclado (← →); status para
 *   leitores de tela. Sem rotação automática.
 * - Movimento reduzido: troca instantânea.
 */
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { testimonials, blobShapes } from './testimonials';
import { registerEases, EASE } from '../../../scripts/motion/eases';

gsap.registerPlugin(Flip, MorphSVGPlugin);
registerEases();

export function initTestimonialsCarousel(): void {
  const region = document.querySelector<HTMLElement>('[data-testimonials]');
  const track = region?.querySelector<HTMLElement>('[data-testimonial-track]');
  if (!region || !track) return;

  const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-testimonial]')).sort(
    (a, b) => Number(a.dataset.testimonial) - Number(b.dataset.testimonial),
  );
  const dots = Array.from(region.querySelectorAll<HTMLButtonElement>('[data-testimonial-dot]'));
  const prev = region.querySelector<HTMLButtonElement>('[data-testimonial-prev]');
  const next = region.querySelector<HTMLButtonElement>('[data-testimonial-next]');
  const status = region.querySelector<HTMLElement>('[data-testimonial-status]');
  const blob = region.querySelector<SVGPathElement>('[data-motion="tm-blob"]');
  const blobLine = region.querySelector<SVGPathElement>('[data-motion="tm-blob-line"]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 56.25rem)');
  const total = cards.length;
  if (total < 2) {
    prev?.setAttribute('hidden', '');
    next?.setAttribute('hidden', '');
    return;
  }

  let current = 0;
  let flip: gsap.core.Timeline | null = null;

  function activate(index: number, announce = true): void {
    const target = (index + total) % total;
    if (target === current) return;
    const direction = index > current ? 1 : -1;
    current = target;
    const before = Flip.getState(cards, { props: 'opacity' });
    const order = total >= 3 ? [(target - 1 + total) % total, target, (target + 1) % total] : cards.map((_, i) => i);
    track!.replaceChildren(...order.map((i) => cards[i]));
    cards.forEach((card, i) => {
      const on = i === target;
      card.classList.toggle('is-active', on);
      card.setAttribute('aria-hidden', String(!on));
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === target)));
    if (announce && status) status.textContent = `Depoimento ${target + 1} de ${total}: ${testimonials[target]?.context ?? ''}.`;

    if (reduce.matches) {
      [blob, blobLine].forEach((path) => path?.setAttribute('d', blobShapes[target % blobShapes.length]));
      return;
    }

    flip?.progress(1);
    if (desktop.matches) {
      // Os três cards trocam de lugar (Flip), incluindo a opacidade dos laterais
      flip = Flip.from(before, { duration: 0.75, ease: EASE.soft, scale: true, simple: true });
    } else {
      // Celular: só o ativo aparece — desliza no sentido da navegação
      const card = cards[target];
      if (card) gsap.fromTo(card, { autoAlpha: 0, x: 28 * direction }, { autoAlpha: 1, x: 0, duration: 0.55, ease: EASE.soft, clearProps: 'transform,opacity,visibility' });
    }

    // Texto do novo ativo assenta de leve; coração do ponto bate
    const quote = cards[target]?.querySelector('[data-motion="tm-quote"]');
    if (quote) gsap.fromTo(quote, { y: 10 }, { y: 0, duration: 0.6, ease: EASE.soft, clearProps: 'transform' });
    const heart = dots[target]?.querySelector('.testimonials__dot-heart');
    if (heart) gsap.fromTo(heart, { scale: 0.4 }, { keyframes: { scale: [0.4, 1.35, 1, 1.15, 1] }, duration: 0.6, ease: 'none', transformOrigin: '50% 50%' });
    if (blob) gsap.to(blob, { morphSVG: blobShapes[target % blobShapes.length], duration: 0.9, ease: EASE.drip, overwrite: true });
    // o contorno dourado segue a forma com um pequeno atraso
    if (blobLine) gsap.to(blobLine, { morphSVG: blobShapes[target % blobShapes.length], duration: 1, delay: 0.08, ease: EASE.drip, overwrite: true });
  }

  prev?.addEventListener('click', () => activate(current - 1));
  next?.addEventListener('click', () => activate(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => activate(i)));
  region.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') activate(current - 1);
    else if (event.key === 'ArrowRight') activate(current + 1);
  });
}
