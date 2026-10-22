/** Helpers de DrawSVG para ícones lineares e linhas douradas. */
import gsap from 'gsap';

/** Desenha os traços de um <Icon> (ícones de preenchimento recebem um pop). */
export function drawIcon(svg: Element, vars: gsap.TweenVars = {}): gsap.core.Tween {
  const filled = svg.getAttribute('fill') === 'currentColor';
  if (filled) {
    return gsap.from(svg, { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'nicakes.pop', ...vars });
  }
  const paths = svg.querySelectorAll('path, line, circle');
  return gsap.fromTo(
    paths,
    { drawSVG: '0%' },
    { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut', stagger: 0.08, ...vars },
  );
}

/** Linha desenhada a partir do centro (`center`), da esquerda (`start`) ou da direita (`end`). */
export function drawLine(el: Element, from: 'center' | 'start' | 'end' = 'start', vars: gsap.TweenVars = {}): gsap.core.Tween {
  const origin = from === 'center' ? '50% 50%' : from === 'end' ? '100% 100%' : '0% 0%';
  return gsap.fromTo(el, { drawSVG: origin }, { drawSVG: '0% 100%', duration: 0.8, ease: 'power2.inOut', ...vars });
}
