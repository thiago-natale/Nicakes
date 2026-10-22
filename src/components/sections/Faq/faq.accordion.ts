/**
 * Acordeão do FAQ — uma pergunta aberta por vez.
 * A altura do painel é animada com GSAP (0 ↔ auto) e a resposta assenta de leve;
 * o botão +/− vira − (CSS). Movimento reduzido: abre e fecha na hora.
 * Teclado: Enter/Espaço (nativo do <button>), ↑ ↓ Home End entre as perguntas.
 */
import gsap from 'gsap';
import { registerEases, EASE } from '../../../scripts/motion/eases';
import { requestRefresh } from '../../../scripts/motion/refresh';

registerEases();

export function initFaqAccordion(): void {
  const root = document.querySelector<HTMLElement>('[data-faq]');
  if (!root) return;
  const triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-faq-trigger]'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const panelOf = (trigger: HTMLButtonElement): HTMLElement | null =>
    document.getElementById(trigger.getAttribute('aria-controls') ?? '');

  function close(trigger: HTMLButtonElement): void {
    const panel = panelOf(trigger);
    trigger.setAttribute('aria-expanded', 'false');
    if (!panel) return;
    if (reduce.matches) {
      panel.dataset.state = 'closed';
      return;
    }
    gsap.to(panel, {
      height: 0,
      duration: 0.45,
      ease: EASE.soft,
      overwrite: true,
      onComplete: () => {
        panel.dataset.state = 'closed';
        gsap.set(panel, { clearProps: 'height' });
      },
    });
  }

  function open(trigger: HTMLButtonElement): void {
    const panel = panelOf(trigger);
    trigger.setAttribute('aria-expanded', 'true');
    if (!panel) return;
    panel.dataset.state = 'open';
    if (reduce.matches) return;
    gsap.fromTo(panel, { height: 0 }, { height: 'auto', duration: 0.55, ease: EASE.soft, overwrite: true, clearProps: 'height', onComplete: () => requestRefresh(50) });
    const content = panel.querySelector('[data-faq-content]');
    if (content) gsap.fromTo(content, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.1, ease: EASE.soft, clearProps: 'all' });
  }

  triggers.forEach((trigger, i) => {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      triggers.forEach((other) => {
        if (other !== trigger && other.getAttribute('aria-expanded') === 'true') close(other);
      });
      if (isOpen) close(trigger);
      else open(trigger);
    });
    trigger.addEventListener('keydown', (event) => {
      const keys: Record<string, number> = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: triggers.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      const target = triggers[(keys[event.key] + triggers.length) % triggers.length];
      target?.focus();
    });
  });
}
