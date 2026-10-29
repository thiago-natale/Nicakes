/**
 * Slider de bolos (ui/CakeSlider.astro).
 *
 * - Troca automática a cada INTERVAL s: o segmento da foto atual enche (GSAP,
 *   scaleX) e, ao terminar, a próxima entra com crossfade + leve zoom (Ken Burns).
 * - Pausa: mouse em cima, foco do teclado dentro, fora da tela, aba oculta ou
 *   botão de pausa (fica pausado até a pessoa retomar).
 * - Setas, ← → com o foco no slider e arraste horizontal no celular.
 * - Só a 1ª foto vem no HTML; a próxima é pré-carregada no início de cada slide.
 * - Movimento reduzido: sem troca automática nem zoom; as setas trocam com fade curto.
 * - Com `data-await-intro`, só começa depois do evento `cake-slider:ready`
 *   (disparado pela entrada da seção), com uma garantia de alguns segundos.
 */
import gsap from 'gsap';
import { EASE } from '../../scripts/motion/eases';

const INTERVAL = 5.5;
const FADE = 0.9;
const READY_FALLBACK_MS = 6000;
/** Disparado pela entrada da seção (scripts/motion/utils.ts › sliderReady). */
const READY_EVENT = 'cake-slider:ready';

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const pad = (n: number): string => String(n).padStart(2, '0');

function load(img: HTMLImageElement | null): void {
  if (!img || img.getAttribute('src')) return;
  const { src, srcset } = img.dataset;
  if (srcset) img.srcset = srcset;
  if (src) img.src = src;
  img.loading = 'eager';
}

function setup(root: HTMLElement): void {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
  const fills = Array.from(root.querySelectorAll<HTMLElement>('[data-fill]'));
  const viewport = root.querySelector<HTMLElement>('[data-slider-viewport]');
  const current = root.querySelector<HTMLElement>('[data-current]');
  const live = root.querySelector<HTMLElement>('[data-live]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]');
  const total = slides.length;
  if (total < 2 || !viewport) return;

  const imgOf = (i: number): HTMLImageElement | null => slides[i]?.querySelector('img') ?? null;
  const reduce = (): boolean => reduceQuery.matches;

  let index = 0;
  let ready = false;
  let timer: gsap.core.Tween | null = null;
  let kenBurns: gsap.core.Tween | null = null;
  const holds = new Set<string>(); // motivos de pausa ativos

  /* ---------- Progresso ---------- */
  function paintFills(): void {
    fills.forEach((fill, i) => gsap.set(fill, { scaleX: i < index ? 1 : 0 }));
  }

  function canRun(): boolean {
    return ready && !reduce() && holds.size === 0;
  }

  function startTimer(): void {
    timer?.kill();
    const fill = fills[index];
    if (!fill || reduce()) return;
    timer = gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: INTERVAL, ease: 'none', paused: true, onComplete: () => go(index + 1) });
    if (canRun()) timer.play();
  }

  function sync(): void {
    if (!timer) return;
    if (canRun()) timer.play();
    else timer.pause();
    if (canRun()) kenBurns?.play();
    else kenBurns?.pause();
  }

  const hold = (reason: string, on: boolean): void => {
    if (on) holds.add(reason);
    else holds.delete(reason);
    sync();
  };

  /* ---------- Troca ---------- */
  function go(next: number, manual = false): void {
    const to = (next + total) % total;
    if (to === index) return;
    const from = index;
    index = to;
    const incoming = slides[to];
    const outgoing = slides[from];
    const img = imgOf(to);
    load(img);
    load(imgOf((to + 1) % total)); // pré-carrega a seguinte

    incoming.removeAttribute('inert');
    incoming.removeAttribute('aria-hidden');
    outgoing.setAttribute('inert', '');
    outgoing.setAttribute('aria-hidden', 'true');
    if (current) current.textContent = pad(to + 1);
    if (manual && live) live.textContent = `Foto ${to + 1} de ${total}: ${img?.alt ?? ''}`;

    gsap.killTweensOf([incoming, outgoing]);
    kenBurns?.kill();
    slides.forEach((s) => s.style.removeProperty('z-index'));
    gsap.set(outgoing, { zIndex: 1 });
    gsap.set(incoming, { zIndex: 2, visibility: 'visible' });
    incoming.classList.add('is-active');

    const done = (): void => {
      outgoing.classList.remove('is-active');
      gsap.set(outgoing, { clearProps: 'opacity,visibility,zIndex' });
      gsap.set(incoming, { clearProps: 'zIndex' });
    };
    if (reduce()) {
      gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none', onComplete: done, clearProps: 'opacity' });
    } else {
      gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: FADE, ease: EASE.soft, onComplete: done, clearProps: 'opacity' });
      if (img) {
        kenBurns = gsap.fromTo(img, { scale: 1.06 }, { scale: 1, duration: INTERVAL + FADE, ease: 'sine.out', clearProps: 'transform' });
        if (!canRun()) kenBurns.pause();
      }
    }
    paintFills();
    startTimer();
  }

  /* ---------- Controles ---------- */
  root.querySelector('[data-prev]')?.addEventListener('click', () => go(index - 1, true));
  root.querySelector('[data-next]')?.addEventListener('click', () => go(index + 1, true));
  toggle?.addEventListener('click', () => {
    const paused = !holds.has('user');
    hold('user', paused);
    root.classList.toggle('is-paused-by-user', paused);
    toggle.setAttribute('aria-label', paused ? 'Retomar troca automática' : 'Pausar troca automática');
  });

  root.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      go(index - 1, true);
    } else if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      go(index + 1, true);
    }
  });

  // Mouse em cima / foco dentro (só pausa com mouse; toque não gera hover estável)
  root.addEventListener('pointerenter', (ev) => ev.pointerType === 'mouse' && hold('hover', true));
  root.addEventListener('pointerleave', (ev) => ev.pointerType === 'mouse' && hold('hover', false));
  root.addEventListener('focusin', () => hold('focus', true));
  root.addEventListener('focusout', (ev) => {
    if (!root.contains(ev.relatedTarget as Node | null)) hold('focus', false);
  });

  // Arraste horizontal (celular)
  let startX = 0;
  let startY = 0;
  let tracking = false;
  viewport.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType === 'mouse') return;
    tracking = true;
    startX = ev.clientX;
    startY = ev.clientY;
  });
  viewport.addEventListener('pointerup', (ev) => {
    if (!tracking) return;
    tracking = false;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) go(index + (dx < 0 ? 1 : -1), true);
  });
  viewport.addEventListener('pointercancel', () => (tracking = false));

  // Fora da tela / aba oculta
  if ('IntersectionObserver' in window) {
    hold('offscreen', true);
    new IntersectionObserver(([entry]) => hold('offscreen', !entry.isIntersecting), { threshold: 0.25 }).observe(root);
  }
  document.addEventListener('visibilitychange', () => hold('hidden', document.hidden));

  // Preferência de movimento mudou com a página aberta
  reduceQuery.addEventListener('change', () => {
    root.classList.toggle('is-static', reduce());
    if (reduce()) {
      timer?.kill();
      kenBurns?.kill();
      timer = null;
    } else startTimer();
  });

  /* ---------- Início ---------- */
  const begin = (): void => {
    if (ready) return;
    ready = true;
    root.classList.add('is-ready');
    load(imgOf(1));
    const first = imgOf(index);
    if (first && !reduce()) {
      kenBurns = gsap.fromTo(first, { scale: 1.04 }, { scale: 1, duration: INTERVAL, ease: 'sine.out', clearProps: 'transform', paused: !canRun() });
    }
    startTimer();
  };
  root.classList.toggle('is-static', reduce());
  paintFills();
  if (!root.hasAttribute('data-await-intro') || reduce()) {
    begin();
  } else {
    root.addEventListener(READY_EVENT, begin, { once: true });
    // Garantia: se a animação de entrada não avisar (erro, aba em segundo plano),
    // começa depois de alguns segundos na tela.
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      window.setTimeout(begin, READY_FALLBACK_MS);
    });
    io.observe(root);
  }
}

document.querySelectorAll<HTMLElement>('[data-cake-slider]').forEach(setup);
