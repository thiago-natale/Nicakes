/**
 * Imagens responsivas: cada foto de conteúdo tem uma versão menor gerada ao
 * lado (`nome-<largura>.webp`). Use `srcsetOf()` + um `sizes` adequado no <img>
 * para o celular baixar só o necessário.
 */
const SMALL: Record<string, number> = {
  '/images/bestseller-morango-cravejado.webp': 280,
  '/images/bestseller-coxinha-costela.webp': 280,
  '/images/bestseller-cake-matilda.webp': 280,
  '/images/treat-donut-ninho.webp': 280,
  '/images/treat-brownie-nutella.webp': 280,
  '/images/treat-red-velvet.webp': 280,
  '/images/custom-birthday-cake.webp': 640,
};

/** `srcset` com a versão menor (se existir) e a original (`width` = largura real). */
export function srcsetOf(src: string, width: number): string | undefined {
  const small = SMALL[src];
  if (!small) return undefined;
  return `${src.replace(/\.webp$/, `-${small}.webp`)} ${small}w, ${src} ${width}w`;
}
