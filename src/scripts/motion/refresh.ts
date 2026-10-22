/**
 * Agendador único de ScrollTrigger.refresh().
 * Junta pedidos próximos (debounce) e adia o recálculo para DEPOIS da entrada do
 * hero, num momento ocioso (≥ 400ms após o fim + requestIdleCallback): um refresh
 * custa dezenas de ms e, se cair numa animação, trava quadros.
 * Usado pelo boot (fim do preloader, imagens), pelo header (ResizeObserver) e pelo FAQ.
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { whenHeroIntroDone } from './reveal';

let timer = 0;
let scheduled = false;
let introSettled = false;

// Um refresh no meio de uma rolagem (ex.: rolagem suave após clicar num link do
// menu) interrompe a rolagem — então ele espera a página parar.
let lastScroll = 0;
window.addEventListener('scroll', () => (lastScroll = performance.now()), { passive: true });
const isScrolling = (): boolean => performance.now() - lastScroll < 250;

/** Executa `fn` quando o navegador estiver ocioso (com limite de espera). */
export function whenIdle(fn: () => void, timeout = 1000): void {
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) ric(fn, { timeout });
  else window.setTimeout(fn, 1);
}

/** Resolve ~400ms depois do fim da entrada do hero (folga para os últimos quadros). */
function whenSettled(): Promise<void> {
  if (introSettled) return Promise.resolve();
  return whenHeroIntroDone()
    .then(() => new Promise<void>((resolve) => window.setTimeout(resolve, 400)))
    .then(() => {
      introSettled = true;
    });
}

export function requestRefresh(delay = 200): void {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    whenSettled().then(() => {
      if (scheduled) return;
      scheduled = true;
      whenIdle(() => {
        scheduled = false;
        if (isScrolling()) {
          requestRefresh(300);
          return;
        }
        ScrollTrigger.refresh();
      });
    });
  }, delay);
}
