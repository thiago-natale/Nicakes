/** Eases da marca — "feito à mão, com calda". */
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';

gsap.registerPlugin(CustomEase, CustomBounce);

export const EASE = {
  /** Desaceleração longa e macia — textos e máscaras. */
  soft: 'nicakes.soft',
  /** Arranque lento e queda rápida, como uma gota de calda — morphs. */
  drip: 'nicakes.drip',
  /** Overshoot leve — ícones, corações e selo. */
  pop: 'nicakes.pop',
  /** Quique com squash (pin do mapa) e o par de deformação. */
  squash: 'nicakes.squash',
  squashSq: 'nicakes.squash-sq',
} as const;

let registered = false;

export function registerEases(): void {
  if (registered) return;
  registered = true;
  CustomEase.create(EASE.soft, 'M0,0 C0.16,0.84 0.32,1 1,1');
  CustomEase.create(EASE.drip, 'M0,0 C0.55,0 0.25,1 1,1');
  CustomEase.create(EASE.pop, 'M0,0 C0.2,0 0.3,1.18 0.6,1.06 0.75,0.99 0.85,1 1,1');
  CustomBounce.create(EASE.squash, { strength: 0.55, squash: 2, squashID: EASE.squashSq });
}
