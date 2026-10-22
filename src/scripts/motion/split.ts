/**
 * Helpers de SplitText.
 *
 * Estratégia: o texto é dividido na criação da timeline (fontes já carregadas)
 * e revertido ao final da animação (`finish`), devolvendo o HTML original —
 * assim as quebras de linha voltam a ser 100% responsivas depois da entrada.
 * Fora do hero preferimos `words` (resistente a resize antes da entrada).
 */
import { SplitText } from 'gsap/SplitText';

export type SplitKind = 'lines' | 'words' | 'chars';

/** Elementos cujo papel ARIA aceita aria-label (títulos, links, botões, itens…). */
const LABELABLE = /^(H[1-6]|A|BUTTON|LI|LABEL|TD|TH|SUMMARY)$/;

/**
 * Acessibilidade do texto dividido:
 * - títulos/links/botões: `aria-label` com o texto e pedaços ocultos (padrão do SplitText);
 * - palavras/linhas em <p>, <span>, <em>…: nada a fazer — o texto continua lido
 *   normalmente (aria-label nesses elementos é proibido pelo ARIA);
 * - letras em <p>, <span>, <em>…: pedaços ocultos + uma cópia só para leitores de
 *   tela ao lado (removida no revert), para não soletrar a palavra.
 */
export function split(el: Element, kind: SplitKind): SplitText {
  const labelable = LABELABLE.test(el.tagName);
  const aria = labelable ? 'auto' : kind === 'chars' ? 'hidden' : 'none';
  let s: SplitText;
  switch (kind) {
    case 'lines':
      s = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'motion-line', aria });
      break;
    case 'words':
      s = SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'motion-word', aria });
      break;
    case 'chars':
    default:
      // Kerning desligado de forma permanente: a largura não muda ao dividir/reverter
      (el as HTMLElement).style.fontKerning = 'none';
      s = SplitText.create(el, { type: 'words,chars', charsClass: 'motion-char', wordsClass: 'motion-word', aria });
  }
  if (aria === 'hidden') {
    const copy = document.createElement('span');
    copy.className = 'sr-only';
    copy.textContent = (el.textContent || '').trim();
    el.after(copy);
    const revert = s.revert.bind(s);
    s.revert = () => {
      copy.remove();
      return revert();
    };
  }
  return s;
}

export const partsOf = (s: SplitText, kind: SplitKind): Element[] =>
  kind === 'lines' ? s.lines : kind === 'words' ? s.words : s.chars;

/** Reverte os splits quando a timeline termina (deve ser a última chamada ao montar a timeline). */
export function finish(tl: gsap.core.Timeline, splits: SplitText[]): gsap.core.Timeline {
  if (splits.length) tl.call(() => splits.forEach((s) => s.revert()));
  return tl;
}
