/**
 * Carregamento/inicialização sob demanda: chama `cb` (uma vez) quando `el`
 * chega a `margin` de distância da área visível (IntersectionObserver).
 * Sem IntersectionObserver, chama na hora.
 */
export function onApproach(el: Element, cb: () => void, margin = '50%'): () => void {
  if (!('IntersectionObserver' in window)) {
    cb();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin: `${margin} 0px ${margin} 0px` },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** Próxima tarefa (cede a thread principal entre trabalhos pesados). */
export const nextTask = (): Promise<void> =>
  new Promise((resolve) => {
    const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (s?.yield) s.yield().then(resolve);
    else setTimeout(resolve, 0);
  });
