import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestRefresh } from "../../../scripts/motion/refresh";

gsap.registerPlugin(ScrollTrigger);

export function initHeaderMotion(header: HTMLElement) {
  const progress = header.querySelector<HTMLElement>(".header__progress");
  if (!progress) return;

  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(progress, { scaleX: 0 }, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: 0,
        end: "max",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });

  // Recálculo unificado com o das animações (debounce + espera a entrada do hero)
  const observer = new ResizeObserver(() => requestRefresh());
  observer.observe(document.body);

  return () => {
    observer.disconnect();
    media.revert();
  };
}
