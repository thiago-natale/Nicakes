/**
 * Formas iniciais das máscaras de revelação das fotos de encomenda (MorphSVG,
 * clipPathUnits="objectBoundingBox"): cada uma cresce até o retângulo `MASK_FULL`.
 * - drop: gota (bolo de aniversário);
 * - cup: forminha plissada de docinho (docinhos de festa).
 */
export const MASK_SEEDS = {
  drop: 'M0.5 0.3 C0.62 0.3 0.7 0.42 0.7 0.52 C0.7 0.64 0.6 0.72 0.5 0.72 C0.4 0.72 0.3 0.64 0.3 0.52 C0.3 0.42 0.38 0.3 0.5 0.3 Z',
  cup: 'M0.500 0.320 Q0.563 0.285 0.600 0.347 Q0.672 0.348 0.673 0.420 Q0.735 0.457 0.700 0.520 Q0.735 0.583 0.673 0.620 Q0.672 0.692 0.600 0.693 Q0.563 0.755 0.500 0.720 Q0.437 0.755 0.400 0.693 Q0.328 0.692 0.327 0.620 Q0.265 0.583 0.300 0.520 Q0.265 0.457 0.327 0.420 Q0.328 0.348 0.400 0.347 Q0.437 0.285 0.500 0.320 Z',
} as const;

export type MaskName = keyof typeof MASK_SEEDS;

export const MASK_FULL = 'M0 0 H1 V1 H0 Z';
