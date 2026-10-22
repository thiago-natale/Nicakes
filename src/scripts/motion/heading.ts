/**
 * headingIn — entrada padrão do cabeçalho de seção (ui/SectionHeading.astro).
 * Uma única linguagem em toda a home:
 *   1. eyebrow: traço(s) dourado(s) se desenham e o texto sai de trás (eyebrowIn);
 *   2. título: palavras sobem da máscara com leve giro 3D (desktop);
 *      no `center`, o divisor desenha as linhas do centro para fora (dividerIn);
 *   3. destaque em itálico: letras com pop;
 *   4. lead: palavras sobem.
 * Devolve os splits para `finish()` reverter ao fim da timeline.
 */
import { EASE } from './eases';
import { DUR, type MotionConditions } from './config';
import { q, q1 } from './utils';
import { split } from './split';
import { dividerIn } from './divider';

type Split = ReturnType<typeof split>;

/** Eyebrow padrão: um traço (start) ou dois (center), depois o texto. */
export function eyebrowEnter(tl: gsap.core.Timeline, scope: Element, at: gsap.Position, k = 1): void {
  const eyebrow = q1(scope, 'eyebrow');
  if (!eyebrow) return;
  const lines = q(eyebrow, 'eyebrow-line').map((svg) => svg.querySelector('line')).filter(Boolean) as Element[];
  const text = q1(eyebrow, 'eyebrow-text');
  if (lines.length) tl.fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'power2.inOut' }, at);
  if (text) {
    const centered = lines.length > 1;
    tl.fromTo(
      text,
      { clipPath: centered ? 'inset(-25% 50% -25% 50%)' : 'inset(-25% 100% -25% 0%)', x: centered ? 0 : -10 },
      { clipPath: 'inset(-25% 0% -25% 0%)', x: 0, duration: 0.75 * k, ease: EASE.soft, clearProps: 'clipPath,transform' },
      lines.length ? '<0.25' : at,
    );
  }
}

export function headingIn(
  tl: gsap.core.Timeline,
  heading: Element | null,
  c: MotionConditions,
  at: gsap.Position = 0,
  k = 1,
): Split[] {
  const splits: Split[] = [];
  if (!heading) return splits;
  const centered = heading.getAttribute('data-heading') === 'center';

  tl.addLabel('heading', at);
  eyebrowEnter(tl, heading, 'heading', k);

  if (centered) {
    const divider = q1(heading, 'divider');
    if (divider) {
      const s = dividerIn(tl, divider, 'heading+=0.2', k);
      if (s) splits.push(s);
    }
  } else {
    q(heading, 'heading-line').forEach((line, i) => {
      const s = split(line, 'words');
      splits.push(s);
      tl.from(
        s.words,
        {
          yPercent: 110,
          rotationX: c.isDesktop ? -55 : 0,
          transformOrigin: '50% 100%',
          transformPerspective: 600,
          duration: 0.85 * k,
          ease: EASE.soft,
          stagger: 0.07,
        },
        i === 0 ? 'heading+=0.3' : '<0.1',
      );
    });
    const accent = q1(heading, 'heading-accent');
    if (accent) {
      // Só o texto do destaque (um floreio/ornamento dentro do <em> é animado pela seção)
      const s = split(accent, 'chars');
      splits.push(s);
      tl.from(s.chars, { yPercent: 60, rotation: -10, autoAlpha: 0, duration: 0.55, ease: EASE.pop, stagger: 0.03 }, '<0.3');
    }
  }

  const lead = q1(heading, 'heading-lead');
  if (lead) {
    const s = split(lead, 'words');
    splits.push(s);
    tl.from(s.words, { yPercent: 110, duration: DUR.base * k, ease: EASE.soft, stagger: 0.012 }, '<0.2');
  }
  return splits;
}
