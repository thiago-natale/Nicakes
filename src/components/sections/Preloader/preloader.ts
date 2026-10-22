/**
 * Preloader — orquestração leve (sem GSAP). A coreografia é CSS (preloader.css)
 * e começa no 1º quadro; aqui só:
 *   1. espera o logo terminar de aparecer (fim da animação CSS) E as animações
 *      do site estarem montadas (`html.motion-ready`) — no máximo +2,5s;
 *   2. após 0,15s abre os painéis (classe .is-opening) e dispara
 *      `nicakes:preloader-reveal` (o hero começa a entrar junto);
 *   3. ao fim da abertura remove o preloader e dispara `nicakes:preloader-complete`.
 */
import { SESSION_KEY } from './preloader-config';

/** Dispara os eventos fora de qualquer callback (microtask). */
function emit(name: string): void {
  queueMicrotask(() => document.dispatchEvent(new CustomEvent(name)));
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Resolve quando a animação CSS do elemento termina (ou já terminou). */
function animationDone(el: Element): Promise<void> {
  const anims = el.getAnimations?.() ?? [];
  if (anims.length) return Promise.all(anims.map((a) => a.finished.catch(() => undefined))).then(() => undefined);
  // Animação ainda não começou (classe .preloader-go chega em até 0,6s)
  return new Promise((resolve) => el.addEventListener('animationend', () => resolve(), { once: true }));
}

/** Resolve quando o boot das animações do site marcou `html.motion-ready`. */
function motionReady(): Promise<void> {
  const root = document.documentElement;
  if (root.classList.contains('motion-ready')) return Promise.resolve();
  return new Promise((resolve) => {
    const mo = new MutationObserver(() => {
      if (root.classList.contains('motion-ready')) {
        mo.disconnect();
        resolve();
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  });
}

export async function initPreloader(): Promise<void> {
  const root = document.documentElement;
  const preloader = document.querySelector<HTMLElement>('#preloader');
  const logo = preloader?.querySelector<HTMLElement>('#preloader-logo');
  const panelUp = preloader?.querySelector<HTMLElement>('#preloader-panel-up');
  let completed = false;
  let revealed = false;

  const reveal = (): void => {
    if (revealed) return;
    revealed = true;
    emit('nicakes:preloader-reveal');
  };

  const complete = (): void => {
    if (completed) return;
    completed = true;
    preloader?.remove();
    root.classList.remove('is-preloading', 'preloader-go');
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Sem sessionStorage (modo privado): o preloader volta na próxima visita.
    }
    root.dataset.preloaderComplete = 'true';
    reveal();
    emit('nicakes:preloader-complete');
  };

  if (preloader) delete root.dataset.preloaderComplete;

  // Já exibido nesta sessão (ou marcação ausente): libera a página na hora.
  if (!preloader || !logo || !panelUp || root.hasAttribute('data-preloader-skip')) {
    complete();
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setTimeout(complete, 2000);
    return;
  }

  try {
    // Segurança: a coreografia CSS dura ~3s; nunca espera mais que 4,5s
    await Promise.race([animationDone(logo), wait(4500)]);
    await Promise.race([motionReady(), wait(2500)]);
    await wait(150);
    reveal();
    preloader.classList.add('is-opening');
    await Promise.race([
      new Promise<void>((resolve) => panelUp.addEventListener('transitionend', () => resolve(), { once: true })),
      wait(1100),
    ]);
    complete();
  } catch (error) {
    console.error('Não foi possível concluir o preloader:', error);
    complete();
  }
}
