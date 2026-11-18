/**
 * Menu móvel como um cardápio (<dialog id="mobile-menu">).
 *
 * Abertura (~1,5s):
 *   1. o véu escurece a página;
 *   2. o cartão é "arrastado" de baixo para a frente da tela: chega inclinado
 *      (deitado sobre a mesa), com cantos arredondados, e assenta plano;
 *   3. a capa sálvia (logo + "Menu", moldura dourada) gira na dobra da
 *      esquerda, como a capa de um cardápio, projetando sombra na página;
 *   4. a página é "lida": eyebrow, linhas douradas crescendo, números, nomes e
 *      setas de cada item, botão e nota.
 * Fechamento (~0,75s): os itens recolhem, a capa volta a fechar e o cartão
 * desce inclinando para trás; o véu clareia. Só então o <dialog> fecha.
 * Movimento reduzido: fade curto na entrada e na saída.
 * Usa só eases nativos do GSAP: o menu pode abrir antes do boot das animações.
 */
import gsap from 'gsap';

export interface MenuMotion {
  open(): void;
  close(): Promise<void>;
  /** Estado final imediato (ex.: o menu fecha por troca para desktop). */
  reset(): void;
  dispose(): void;
}

export function createMenuMotion(menu: HTMLDialogElement): MenuMotion | null {
  const pick = <T extends Element = HTMLElement>(name: string) => menu.querySelector<T>(`[data-menu="${name}"]`);
  const pickAll = <T extends Element = HTMLElement>(name: string) => Array.from(menu.querySelectorAll<T>(`[data-menu="${name}"]`));

  const scrim = pick('scrim');
  const card = pick('card');
  const sheet = pick('sheet');
  const cover = pick('cover');
  if (!scrim || !card || !sheet || !cover) return null;
  const coverShade = pick('cover-shade');
  const pageShade = pick('page-shade');
  const close = pick('close');
  const eyebrow = pick('eyebrow');
  const eyebrowLine = pick('eyebrow-line');
  const links = pickAll('link');
  const rules = pickAll('link-rule');
  const nums = pickAll('link-num');
  const labels = pickAll('link-label');
  const arrows = pickAll('link-arrow');
  const cta = pick('cta');
  const note = pick('note');
  // O botão Fechar recebe o foco (autofocus) no showModal(): anima só a opacidade
  // dele, nunca a visibilidade, para o foco não se perder durante a abertura.
  const content = [eyebrow, ...links, cta, note].filter(Boolean) as HTMLElement[];

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current: gsap.core.Timeline | null = null;

  const kill = (): void => {
    current?.kill();
    current = null;
  };

  /** Limpa tudo que a animação tocou (estado natural do menu aberto). */
  const settle = (): void => {
    gsap.set([scrim, card, sheet, cover, close, coverShade, pageShade, eyebrowLine, ...content, ...rules, ...nums, ...labels, ...arrows].filter(Boolean), {
      clearProps: 'all',
    });
  };

  const open = (): void => {
    kill();
    settle();
    if (reduce.matches) {
      current = gsap.timeline().fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'none', clearProps: 'opacity,visibility' });
      return;
    }

    sheet.scrollTop = 0;
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        gsap.set(cover, { clearProps: 'all' });
        current = null;
        if (!menu.contains(document.activeElement)) close?.focus({ preventScroll: true });
      },
    });
    current = tl;

    // Estado inicial aplicado no mesmo quadro do showModal() (sem flash)
    gsap.set(cover, { visibility: 'visible', rotationY: 0, transformPerspective: 900, transformOrigin: '0% 50%' });
    gsap.set(content, { autoAlpha: 0 });
    if (close) gsap.set(close, { opacity: 0 });

    // 1. véu
    tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: 'power1.out', clearProps: 'opacity,visibility' }, 0);

    // 2. o cartão chega de baixo, inclinado sobre a mesa, e assenta plano
    tl.fromTo(
      card,
      { yPercent: 104, rotationX: 22, scale: 0.9, borderRadius: 28, transformPerspective: 1100, transformOrigin: '50% 100%' },
      { yPercent: 0, rotationX: 0, scale: 1, borderRadius: 0, duration: 0.8, ease: 'power3.out', clearProps: 'transform,borderRadius' },
      0.05,
    );

    // 3. a capa se abre na dobra da esquerda, projetando sombra na página
    tl.addLabel('cover', 0.7);
    // até ~90° (de perfil) a capa fica visível; logo depois some (backface)
    tl.to(cover, { rotationY: -92, duration: 0.9, ease: 'power1.inOut' }, 'cover');
    if (coverShade) tl.fromTo(coverShade, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.in' }, 'cover');
    if (pageShade) {
      tl.fromTo(pageShade, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 'cover');
      tl.to(pageShade, { opacity: 0, duration: 0.55, ease: 'power1.in', clearProps: 'opacity' }, 'cover+=0.35');
    }
    tl.set(cover, { visibility: 'hidden' }, 'cover+=0.9');

    // 4. a página é lida, de cima para baixo
    tl.addLabel('read', 'cover+=0.45');
    if (close) tl.to(close, { opacity: 1, duration: 0.4, clearProps: 'opacity' }, 'read');
    if (eyebrow) {
      tl.to(eyebrow, { autoAlpha: 1, duration: 0.01 }, 'read');
      if (eyebrowLine) tl.from(eyebrowLine, { scaleX: 0, duration: 0.5, ease: 'power2.inOut', clearProps: 'transform' }, 'read');
      tl.fromTo(eyebrow, { clipPath: 'inset(-25% 100% -25% 0%)' }, { clipPath: 'inset(-25% 0% -25% 0%)', duration: 0.6, clearProps: 'clipPath,opacity,visibility' }, 'read+=0.1');
    }
    links.forEach((link, i) => {
      const at = `read+=${(0.12 + i * 0.07).toFixed(2)}`;
      tl.to(link, { autoAlpha: 1, duration: 0.01, clearProps: 'opacity,visibility' }, at);
      if (rules[i]) tl.from(rules[i], { scaleX: 0, duration: 0.6, ease: 'power2.out', clearProps: 'transform' }, at);
      if (nums[i]) tl.from(nums[i], { x: -8, autoAlpha: 0, duration: 0.4, clearProps: 'transform,opacity,visibility' }, at);
      if (labels[i]) tl.from(labels[i], { yPercent: 70, autoAlpha: 0, duration: 0.55, clearProps: 'transform,opacity,visibility' }, `${at}+=0.04`);
      if (arrows[i]) tl.from(arrows[i], { scale: 0, rotation: -45, duration: 0.45, ease: 'back.out(2.2)', clearProps: 'transform' }, `${at}+=0.12`);
    });
    const after = `read+=${(0.2 + links.length * 0.07).toFixed(2)}`;
    if (cta) tl.fromTo(cta, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)', clearProps: 'transform,opacity,visibility' }, after);
    if (note) tl.fromTo(note, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, clearProps: 'opacity,visibility' }, `${after}+=0.1`);
  };

  const closeMenu = (): Promise<void> =>
    new Promise((resolve) => {
      kill();
      if (reduce.matches) {
        current = gsap.timeline({ onComplete: () => { settle(); gsap.set(menu, { clearProps: 'opacity,visibility' }); resolve(); } })
          .to(menu, { autoAlpha: 0, duration: 0.2, ease: 'none' });
        return;
      }
      const visibleLinks = links.filter((link) => link.getBoundingClientRect().top < window.innerHeight);
      const tl = gsap.timeline({
        defaults: { ease: 'power2.in' },
        onComplete: () => {
          current = null;
          settle();
          resolve();
        },
      });
      current = tl;

      // Itens recolhem (de baixo para cima)
      tl.to([note, cta].filter(Boolean), { autoAlpha: 0, y: 8, duration: 0.18, stagger: 0.03 }, 0);
      tl.to([...visibleLinks].reverse(), { autoAlpha: 0, y: 10, duration: 0.2, stagger: 0.025 }, 0.02);

      // A capa volta a fechar sobre a página
      gsap.set(cover, { visibility: 'visible', rotationY: -92, transformPerspective: 900, transformOrigin: '0% 50%' });
      tl.to(cover, { rotationY: 0, duration: 0.45, ease: 'power2.inOut' }, 0.08);
      if (coverShade) tl.fromTo(coverShade, { opacity: 1 }, { opacity: 0, duration: 0.45, ease: 'power2.out' }, 0.08);

      // O cartão desce inclinando para trás; o véu clareia
      tl.to(card, { yPercent: 104, rotationX: 16, scale: 0.92, borderRadius: 28, transformPerspective: 1100, transformOrigin: '50% 100%', duration: 0.42, ease: 'power3.in' }, 0.48);
      tl.to(scrim, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, 0.56);
    });

  const reset = (): void => {
    kill();
    settle();
    gsap.set(menu, { clearProps: 'opacity,visibility' });
  };

  return {
    open,
    close: closeMenu,
    reset,
    dispose: reset,
  };
}
