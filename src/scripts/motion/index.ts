/**
 * Boot das animações do site (GSAP).
 *
 * 1. Registra plugins e eases da marca.
 * 2. Espera as fontes (SplitText precisa das métricas finais).
 * 3. Cria um único gsap.matchMedia(). Hero (e, no desktop, a seção com pin)
 *    iniciam já; as demais seções são baixadas e montadas SOB DEMANDA, quando
 *    chegam perto da tela (IntersectionObserver), uma por tarefa — a mesma
 *    animação em todos os aparelhos, sem a tarefa longa de ~1,8s no carregamento
 *    (que montava todas as seções de uma vez). Cada seção roda no contexto do
 *    matchMedia (escopo + cleanup automático ao trocar de breakpoint).
 * 4. O hero só toca a entrada quando o preloader abre os painéis (whenRevealed).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { registerEases } from './eases';
import { EVENTS, MEDIA, type MotionConditions } from './config';
import { listenReveal, markBooted, markHeroIntroDone, whenHeroIntroDone, preloaderSkipped } from './reveal';
import { requestRefresh, whenIdle } from './refresh';
import { onApproach, nextTask } from './lazy';

import { initMotion as heroBackdrop } from '../../components/sections/Hero/heroBackdrop.motion';
import { initMotion as hero } from '../../components/sections/Hero/hero.motion';
import { initMotion as menuHeader } from '../../components/sections/MenuHeader/menuHeader.motion';
import { initMotion as notFound } from '../../components/sections/NotFound/notFound.motion';

export type SectionInit = (root: HTMLElement, c: MotionConditions, order: number) => (() => void) | void;


type Loader = () => Promise<{ initMotion: SectionInit }>;
type Entry = [name: string, init: SectionInit | Loader, mode: 'eager' | 'lazy' | 'eager-desktop'];

/**
 * Ordem de página — define a ordem de criação e o refreshPriority.
 * `eager`: inicia no boot (acima da dobra). `lazy`: chunk próprio, montado ao se
 * aproximar da tela. `eager-desktop`: no desktop inicia no boot (o pin das
 * Encomendas precisa existir antes, senão o espaçador "empurra" a página).
 */
const SECTIONS: Entry[] = [
  ['hero-backdrop', heroBackdrop, 'eager'],
  ['hero', hero, 'eager'],
  ['about', () => import('../../components/sections/About/about.motion'), 'lazy'],
  ['bestsellers', () => import('../../components/sections/Bestsellers/bestsellers.motion'), 'lazy'],
  ['recommended', () => import('../../components/sections/Recommended/recommended.motion'), 'lazy'],
  ['menu-preview', () => import('../../components/sections/MenuPreview/menuPreview.motion'), 'lazy'],
  ['custom-orders', () => import('../../components/sections/CustomOrders/customOrders.motion'), 'eager-desktop'],
  ['store', () => import('../../components/sections/Store/store.motion'), 'lazy'],
  ['testimonials', () => import('../../components/sections/Testimonials/testimonials.motion'), 'lazy'],
  ['faq', () => import('../../components/sections/Faq/faq.motion'), 'lazy'],
  ['contact', () => import('../../components/sections/Contact/contact.motion'), 'lazy'],
  ['menu-header', menuHeader, 'eager'],
  ['not-found', notFound, 'eager'],
  ['menu-category', () => import('../../components/sections/MenuCategory/menuCategory.motion'), 'lazy'],
  ['birthday-cakes', () => import('../../components/sections/BirthdayCakes/birthdayCakes.motion'), 'lazy'],
  ['footer', () => import('../../components/sections/Footer/footer.motion'), 'lazy'],
];

/** Módulos já baixados (o chunk é reaproveitado ao trocar de breakpoint). */
const loaded = new Map<string, SectionInit>();
async function resolveInit(name: string, init: SectionInit | Loader): Promise<SectionInit> {
  const hit = loaded.get(name);
  if (hit) return hit;
  // Loader = função sem parâmetros; SectionInit recebe (root, c, order)
  const fn = init.length === 0 ? (await (init as Loader)()).initMotion : (init as SectionInit);
  loaded.set(name, fn);
  return fn;
}

/**
 * Margem de "aproximação": monta a seção quando ela está a ~12% de altura da
 * tela de aparecer (o estado inicial é aplicado ainda fora da vista). Margem
 * maior fazia a seção logo abaixo do hero (Sobre) montar já no carregamento.
 * O código das seções é baixado antes, em momento ocioso.
 */
const APPROACH = '12%';

const root = document.documentElement;
const ready = (): void => root.classList.add('motion-ready');

/**
 * Monta as seções pendentes em momentos ociosos, uma por vez, a partir da
 * primeira interação. Se houve rolagem há menos de 300ms, espera a próxima folga.
 */
function idleMountQueue(pending: Array<() => Promise<void>>, alive: () => boolean): () => void {
  const events = ['scroll', 'touchstart', 'pointerdown', 'keydown', 'wheel'] as const;
  let lastScroll = 0;
  let started = false;
  const onScroll = (): void => {
    lastScroll = performance.now();
  };
  const idle = (cb: () => void): void => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(cb);
    else window.setTimeout(cb, 200);
  };
  const step = (): void => {
    if (!alive() || !pending.length) return;
    if (performance.now() - lastScroll < 300) {
      window.setTimeout(() => idle(step), 300);
      return;
    }
    const next = pending.shift();
    if (next) void next().then(() => window.setTimeout(() => idle(step), 120));
  };
  const start = (): void => {
    if (started) return;
    started = true;
    events.forEach((e) => window.removeEventListener(e, start));
    whenHeroIntroDone().then(() => idle(step));
  };
  events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    events.forEach((e) => window.removeEventListener(e, start));
    window.removeEventListener('scroll', onScroll);
    pending.length = 0;
  };
}

/** Poster do vídeo do hero carregado e pintado (dois quadros depois). */
function posterPainted(): Promise<void> {
  const video = document.querySelector<HTMLVideoElement>('video[data-hero-video]');
  if (!video?.poster) return Promise.resolve();
  const img = new Image();
  img.src = video.poster; // já veio do <link rel="preload">: sai do cache
  return img
    .decode()
    .catch(() => undefined)
    .then(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}

async function boot(): Promise<void> {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin);
  registerEases();
  // Sem refresh automático no `load`: ele caía nos primeiros quadros da entrada.
  // O carregamento é tratado pelo agendador (refresh.ts), depois da entrada.
  ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,resize' });
  listenReveal();

  // Fontes carregadas (no máximo 2,5s de espera)
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);

  // 1ª visita: o hero já está pintado por baixo do preloader. Antes de aplicar o
  // estado inicial da entrada (que esconde a mídia), deixa o poster ser pintado
  // — ele é o maior elemento da página (LCP). Coberto, o usuário não vê nada.
  if (!preloaderSkipped()) await Promise.race([posterPainted(), new Promise((r) => setTimeout(r, 1500))]);

  const mm = gsap.matchMedia();
  mm.add(MEDIA, (context) => {
    const c = context.conditions as unknown as MotionConditions;
    const cleanups: Array<() => void> = [];
    let alive = true;

    const run = (name: string, fn: SectionInit, el: HTMLElement, order: number): void => {
      try {
        // Dentro do contexto do matchMedia, mesmo quando chamado depois (lazy)
        context.add(() => {
          const cleanup = fn(el, c, order);
          if (cleanup) cleanups.push(cleanup);
        });
      } catch (error) {
        console.error(`[motion] falha ao iniciar "${name}":`, error);
      }
    };

    let order = 0;
    // Montagens pendentes (em ordem de página), para a fila ociosa abaixo
    const pending: Array<() => Promise<void>> = [];
    SECTIONS.forEach(([name, init, mode]) => {
      document.querySelectorAll<HTMLElement>(`[data-motion-section="${name}"]`).forEach((el) => {
        order += 1;
        const myOrder = order;
        const eager = mode === 'eager' || (mode === 'eager-desktop' && c.isDesktop);
        if (eager && init.length !== 0) {
          run(name, init as SectionInit, el, myOrder);
          return;
        }
        let mounted = false;
        let stopApproach = (): void => {};
        const mount = async (): Promise<void> => {
          if (mounted) return;
          mounted = true;
          stopApproach();
          const fn = await resolveInit(name, init);
          if (!alive) return;
          await nextTask(); // uma seção por tarefa
          if (!alive) return;
          run(name, fn, el, myOrder);
          requestRefresh(); // posições dos gatilhos montados fora de ordem
        };
        if (eager) void mount();
        else {
          stopApproach = onApproach(el, () => void mount(), APPROACH);
          cleanups.push(stopApproach);
          pending.push(mount);
        }
      });
    });

    // Fila ociosa: assim que a pessoa interage (rola, toca, tecla), as seções
    // restantes são montadas uma a uma nos momentos em que a página está parada
    // — quando ela chegar a cada seção, a montagem já aconteceu (sem engasgo no
    // scroll). Sem interação (ex.: medição de laboratório), nada roda à toa.
    cleanups.push(idleMountQueue(pending, () => alive));

    ready();
    markBooted();
    // Sem hero na página (ex.: /cardapio): nada a esperar para os recálculos
    if (!document.querySelector('[data-motion-section="hero"]') || c.reduceMotion) markHeroIntroDone();
    // Ao trocar de breakpoint/preferência o matchMedia reverte as animações; aqui limpamos o resto
    return () => {
      alive = false;
      cleanups.forEach((fn) => fn());
    };
  });

  // Depois da entrada do hero, em momento ocioso, baixa (sem montar) os chunks
  // das seções: quando o usuário rolar, o código já está no cache.
  whenHeroIntroDone().then(() =>
    whenIdle(() => {
      SECTIONS.forEach(([name, init]) => {
        if (init.length === 0 && document.querySelector(`[data-motion-section="${name}"]`)) void resolveInit(name, init);
      });
    }, 3000),
  );

  // Layout muda quando o preloader libera a rolagem (barra de rolagem) e após as imagens.
  // O agendador junta os pedidos e espera a entrada do hero terminar.
  const refresh = (): void => requestRefresh();
  document.addEventListener(EVENTS.preloaderComplete, refresh);
  if (document.readyState === 'complete') refresh();
  else window.addEventListener('load', refresh, { once: true });
  document.querySelectorAll('main img[loading="lazy"]').forEach((img) => {
    if (!(img as HTMLImageElement).complete) img.addEventListener('load', refresh, { once: true });
  });
}

boot().catch((error) => {
  console.error('[motion] boot falhou:', error);
  ready();
});
