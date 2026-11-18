/** Hero — comportamento do vídeo de fundo (no navegador). Dados em hero.ts. */
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
  document.addEventListener('nicakes:hero-media-revealed', start, { once: true }); // = EVENTS.heroMediaRevealed (literal: mantém este script inline no HTML)
  window.setTimeout(start, 6000);
  if (reduce.matches) start();
  sync();
}
