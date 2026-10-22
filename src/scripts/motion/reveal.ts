/** Sinal de "pode começar o site": abertura dos painéis do preloader (ou sem preloader). */
import { EVENTS } from './config';

let revealed = false;
const waiters: Array<() => void> = [];

function markRevealed(): void {
  if (revealed) return;
  revealed = true;
  waiters.splice(0).forEach((fn) => fn());
}

export function listenReveal(): void {
  const root = document.documentElement;
  const skip = root.hasAttribute('data-preloader-skip') || !document.querySelector('#preloader') || root.dataset.preloaderComplete === 'true';
  if (skip) {
    markRevealed();
    return;
  }
  document.addEventListener(EVENTS.preloaderReveal, markRevealed, { once: true });
  document.addEventListener(EVENTS.preloaderComplete, markRevealed, { once: true });
  window.setTimeout(markRevealed, 4500); // segurança
}

export const isRevealed = (): boolean => revealed;

export function whenRevealed(): Promise<void> {
  return revealed ? Promise.resolve() : new Promise((resolve) => waiters.push(resolve));
}

/** O preloader foi pulado nesta visita (sessão já vista)? */
export const preloaderSkipped = (): boolean =>
  document.documentElement.hasAttribute('data-preloader-skip') || !document.querySelector('#preloader');

/* ------------------------------------------------------------------------
   Boot concluído: a entrada do hero só começa depois que todas as seções
   foram montadas (evita que a tarefa longa da inicialização "engasgue" os
   primeiros quadros) — dois quadros de folga após o boot.
   ------------------------------------------------------------------------ */
let booted = false;
const bootWaiters: Array<() => void> = [];

export function markBooted(): void {
  if (booted) return;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      booted = true;
      bootWaiters.splice(0).forEach((fn) => fn());
    }),
  );
}

const whenBooted = (): Promise<void> => (booted ? Promise.resolve() : new Promise((resolve) => bootWaiters.push(resolve)));

/** Preloader liberou a página E o boot terminou: pode tocar a entrada. */
export const whenReadyToPlay = (): Promise<void> => Promise.all([whenRevealed(), whenBooted()]).then(() => undefined);

/* ------------------------------------------------------------------------
   Fim da entrada do hero: recálculos do ScrollTrigger esperam por ele para
   não caírem no meio da animação.
   ------------------------------------------------------------------------ */
let introDone = false;
const introWaiters: Array<() => void> = [];

export function markHeroIntroDone(): void {
  if (introDone) return;
  introDone = true;
  introWaiters.splice(0).forEach((fn) => fn());
}

export const whenHeroIntroDone = (): Promise<void> =>
  introDone ? Promise.resolve() : new Promise((resolve) => introWaiters.push(resolve));
