import type { IconName } from '../../ui/Icon.astro';

export const heroHighlights: { icon: IconName; lines: [string, string] }[] = [
  { icon: 'calendar-heart', lines: ['Encomendas', 'sob medida'] },
  { icon: 'storefront', lines: ['Loja física', 'em Uberaba'] },
  { icon: 'delivery', lines: ['Delivery', 'pelo iFood'] },
];

export const heroImage = {
  src: '/images/hero-matilda.webp',
  alt: 'Fatia do bolo Matilda recebendo calda de chocolate, ao lado de um cappuccino e uma rosa',
  width: 1024,
  height: 1024,
};

/**
 * Vídeo do hero (sem áudio, comprimido): versões leves para celular (480p) e
 * desktop (720p), em WebM (VP9) e MP4 (H.264, Safari). O poster é o 1º quadro
 * do vídeo em WebP leve (720px, ~22 KB): aparece na hora (LCP) e o vídeo só é
 * baixado quando a entrada do hero termina.
 * Para voltar à foto, defina `heroVideo` como `null`.
 */
export const heroVideo: {
  mobile: { webm: string; mp4: string };
  desktop: { webm: string; mp4: string };
  poster: { src: string; width: number; height: number };
  position: string;
} | null = {
  mobile: { webm: '/videos/hero-chocolate-480.webm', mp4: '/videos/hero-chocolate-480.mp4' },
  desktop: { webm: '/videos/hero-chocolate-720.webm', mp4: '/videos/hero-chocolate-720.mp4' },
  poster: { src: '/images/hero-chocolate-poster.webp', width: 720, height: 405 },
  position: '30% 55%', // enquadra o bolo e as rosas no recorte orgânico
};

/** Respeita prefers-reduced-motion e controla o botão de pausar/reproduzir. */
export function initHeroVideo(): void {
  const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-hero-video-toggle]');
  if (!video) return;

  const label = toggle?.querySelector<HTMLElement>('[data-label]');
  const iconPause = toggle?.querySelector<SVGElement>('[data-icon-pause]');
  const iconPlay = toggle?.querySelector<SVGElement>('[data-icon-play]');

  const sync = () => {
    const paused = video.paused;
    toggle?.setAttribute('aria-pressed', String(paused));
    if (label) label.textContent = paused ? 'Reproduzir vídeo' : 'Pausar vídeo';
    iconPause?.classList.toggle('hidden', paused);
    iconPlay?.classList.toggle('hidden', !paused);
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyMotionPreference = () => {
    if (reduce.matches) video.pause();
    else {
      // preload="none": o download começa aqui, depois da entrada do hero
      if (video.preload === 'none') video.preload = 'auto';
      video.play().catch(() => {});
    }
  };

  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  toggle?.addEventListener('click', () => (video.paused ? video.play().catch(() => {}) : video.pause()));
  reduce.addEventListener('change', applyMotionPreference);

  // O vídeo só começa a tocar quando o recorte do hero termina de crescer
  // (durante a revelação fica o poster — decodificar vídeo ali trava quadros).
  // Segurança: começa sozinho após 6s se o evento não vier (ex.: JS de animação falhou).
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    applyMotionPreference();
  };
  document.addEventListener('nicakes:hero-media-revealed', start, { once: true });
  window.setTimeout(start, 6000);
  if (reduce.matches) start();
  sync();
}
