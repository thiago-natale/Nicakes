import gsap from "gsap";

/** O header entra junto com o hero, quando o preloader abre os painéis. */
const PRELOADER_COMPLETE = "nicakes:preloader-reveal";

export function initHeaderIntro(header: HTMLElement) {
  const items = Array.from(header.children);
  let started = false;
  let timeline: gsap.core.Timeline | undefined;
  const context = gsap.context(() => {}, header);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function reveal() {
    header.removeAttribute("data-intro-pending");
    context.revert();
  }

  function start() {
    if (started) return;
    started = true;
    document.removeEventListener(PRELOADER_COMPLETE, start);

    try {
      context.add(() => {
        timeline = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: reveal,
        });
        timeline
          .to(header, { autoAlpha: 1, duration: reducedMotion.matches ? 0 : 0.5 }, 0.3)
          .to(items, { autoAlpha: 1, duration: reducedMotion.matches ? 0 : 0.4 });
      });
    } catch {
      reveal();
    }
  }

  function onMotionChange() {
    if (reducedMotion.matches && timeline) timeline.progress(1);
  }

  document.addEventListener(PRELOADER_COMPLETE, start);
  reducedMotion.addEventListener("change", onMotionChange);
  if (
    document.documentElement.dataset.preloaderComplete === "true" ||
    !document.querySelector("#preloader")
  ) {
    start();
  }

  return () => {
    document.removeEventListener(PRELOADER_COMPLETE, start);
    reducedMotion.removeEventListener("change", onMotionChange);
    reveal();
  };
}
