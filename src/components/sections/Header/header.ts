/** Header: menu móvel (<dialog>), seção ativa e altura dinâmica. Portado do projeto de origem. */
import { initHeaderIntro } from "./header-intro";
import type { MenuMotion } from "./header-menu.motion";

export function initHeader() {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header || header.hasAttribute("data-intro-initialized")) return;
  header.setAttribute("data-intro-initialized", "");
  const disposeIntro = initHeaderIntro(header);
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) disposeIntro();
  });

  const toggle = header?.querySelector<HTMLButtonElement>(".header__toggle");
  const menu = document.querySelector<HTMLDialogElement>("#mobile-menu");
  const closeButton = menu?.querySelector<HTMLButtonElement>(
    ".header-menu__close",
  );

  if (
    !header ||
    !toggle ||
    !menu ||
    !closeButton ||
    header.hasAttribute("data-enhanced")
  )
    return;
  if (typeof menu.showModal !== "function") return;

  const controller = new AbortController();
  const { signal } = controller;
  const desktop = window.matchMedia("(min-width: 48rem)");
  let previousOverflow = "";
  let destination: HTMLElement | null = null;
  let disposeMotion: (() => void) | undefined;
  // Animação de cardápio (carregada sob demanda); sem ela o menu abre/fecha seco.
  let menuMotion: MenuMotion | null = null;
  let closing = false;
  const requestClose = () => {
    if (!menu.open || closing) return;
    if (!menuMotion) {
      menu.close();
      return;
    }
    closing = true;
    void menuMotion.close().then(() => {
      closing = false;
      if (menu.open) menu.close();
    });
  };
  // Só os links de âncora desta página participam do destaque de seção ativa.
  const samePage = (link: HTMLAnchorElement) =>
    link.hash !== "" && link.pathname === window.location.pathname;
  const links = [
    ...header.querySelectorAll<HTMLAnchorElement>("nav a"),
    ...menu.querySelectorAll<HTMLAnchorElement>("nav a"),
  ].filter(samePage);
  const sections = [
    ...new Set(
      links
        .map((link) => document.getElementById(link.hash.slice(1)))
        .filter((section): section is HTMLElement => section !== null),
    ),
  ].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

  const setCurrent = (id: string) => {
    links.forEach((link) => {
      if (link.hash === `#${id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  setCurrent(
    sections.find((section) => `#${section.id}` === window.location.hash)?.id ??
      sections[0]?.id ??
      "",
  );

  toggle.addEventListener(
    "click",
    () => {
      if (menu.open) return;
      destination = null;
      previousOverflow = document.body.style.overflow;
      closing = false;
      menu.showModal();
      menuMotion?.open();
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    },
    { signal },
  );

  closeButton.addEventListener("click", requestClose, { signal });
  // Esc: fecha com a animação (o <dialog> fecharia seco)
  menu.addEventListener(
    "cancel",
    (event) => {
      event.preventDefault();
      requestClose();
    },
    { signal },
  );
  menu.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Tab") return;
      const controls = [
        ...menu.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ),
      ];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    },
    { signal },
  );
  menu.addEventListener(
    "close",
    () => {
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = previousOverflow;
      if (destination) {
        const target = destination;
        destination = null;
        const temporaryTabindex = !target.hasAttribute("tabindex");
        if (temporaryTabindex) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        if (temporaryTabindex)
          target.addEventListener(
            "blur",
            () => target.removeAttribute("tabindex"),
            { once: true, signal },
          );
      } else if (!desktop.matches) {
        toggle.focus({ preventScroll: true });
      } else {
        header
          .querySelector<HTMLAnchorElement>(".header__brand")
          ?.focus({ preventScroll: true });
      }
    },
    { signal },
  );

  menu.querySelectorAll<HTMLAnchorElement>("nav a").forEach((link) => {
    link.addEventListener(
      "click",
      (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        destination = samePage(link)
          ? document.getElementById(link.hash.slice(1))
          : null;
        if (destination) setCurrent(destination.id);
        // A página já rola até o destino por trás do cardápio que se fecha
        requestClose();
      },
      { signal },
    );
  });

  desktop.addEventListener(
    "change",
    ({ matches }) => {
      if (matches && menu.open) {
        menuMotion?.reset();
        closing = false;
        menu.close();
      }
    },
    { signal },
  );

  // Seção ativa = a que cruza a linha de leitura (logo abaixo do header fixo).
  // Avaliada a cada scroll (no máximo 1x por quadro): marca assim que a seção
  // chega ao topo útil da tela, sem esperar metade dela passar.
  // No fim da página, a última seção (Contato) é marcada mesmo que não alcance a linha.
  let frame = 0;
  const pickCurrent = () => {
    frame = 0;
    const doc = document.documentElement;
    const atBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 4;
    if (atBottom && sections.length) {
      setCurrent(sections[sections.length - 1].id);
      return;
    }
    const line = header.getBoundingClientRect().height + window.innerHeight * 0.18;
    let current: HTMLElement | undefined;
    for (const section of sections) {
      // Seção com pin (Encomendas, desktop): mede o espaçador do pin, que rola
      // normalmente — a seção fixada fica centralizada e não alcançaria a linha.
      const parent = section.parentElement;
      const box = parent?.classList.contains("pin-spacer") ? parent : section;
      if (box.getBoundingClientRect().top <= line) current = section;
      else break;
    }
    setCurrent((current ?? sections[0])?.id ?? "");
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(pickCurrent);
  };
  window.addEventListener("scroll", schedule, { passive: true, signal });
  window.addEventListener("resize", schedule, { signal });
  window.addEventListener("load", schedule, { once: true, signal });
  schedule();

  const resizeObserver = new ResizeObserver(() => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.getBoundingClientRect().height}px`,
    );
  });
  resizeObserver.observe(header);

  toggle.hidden = false;
  header.setAttribute("data-enhanced", "");

  void import("./header-menu.motion")
    .then(({ createMenuMotion }) => {
      if (!signal.aborted) menuMotion = createMenuMotion(menu);
    })
    .catch(() => {
      // Sem a animação, o menu continua abrindo e fechando normalmente.
    });

  // The menu is ready before the optional animation bundle is loaded.
  void import("./header-motion")
    .then(({ initHeaderMotion }) => {
      if (!signal.aborted) disposeMotion = initHeaderMotion(header);
    })
    .catch(() => {
      // Navigation remains available if the animation bundle cannot load.
    });

  window.addEventListener(
    "pagehide",
    (event) => {
      if (event.persisted) return;
      if (menu.open) menu.close();
      controller.abort();
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      disposeMotion?.();
      menuMotion?.dispose();
    },
    { signal },
  );
}
