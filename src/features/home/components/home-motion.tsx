"use client";

import { animate, createTimeline, stagger } from "animejs";
import { useLayoutEffect } from "react";

export function HomeMotion({ recommendationScore }: { recommendationScore?: number }) {
  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const animatedSelector = [
      ".motion-hero-eyebrow",
      ".motion-hero-title",
      ".ledger-day",
      ".motion-feature-image",
      ".motion-pick-word",
      ".motion-pick-detail",
      ".premiere-list",
      "[data-motion-reveal]",
      "[data-motion-stagger] > *",
      "[data-motion-item]",
    ].join(",");
    const revealStaticContent = () => {
      root.classList.remove("motion-enabled");
      document.querySelectorAll<HTMLElement>(animatedSelector).forEach((element) => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
        element.style.removeProperty("clip-path");
        element.style.removeProperty("will-change");
      });
    };

    if (reducedMotion) {
      revealStaticContent();
      return;
    }

    root.classList.add("motion-enabled");
    const watchdog = window.setTimeout(() => {
      const heroTitle = document.querySelector<HTMLElement>(".motion-hero-title");
      if (!heroTitle || Number.parseFloat(getComputedStyle(heroTitle).opacity) < 0.9) revealStaticContent();
    }, 3200);

    try {
      const intro = createTimeline({
        defaults: { ease: "outExpo" },
        onComplete: () => {
          window.clearTimeout(watchdog);
          document.querySelector(".editorial-hero")?.classList.add("motion-intro-complete");
        },
      })
        .add(".motion-hero-eyebrow", { opacity: [0, 1], y: [12, 0], duration: 480 }, 40)
        .add(".motion-hero-title", { opacity: [0, 1], y: ["108%", "0%"], duration: 820 }, 90)
        .add(".hero-rule", { scaleX: [0, 1], duration: 760 }, 110)
        .add(".ledger-day", { opacity: [0, 1], y: [18, 0], delay: stagger(58), duration: 620 }, 320)
        .add(".motion-feature-image", { opacity: [0, 1], clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"], duration: 820 }, 650)
        .add(".motion-pick-word", { opacity: [0, 1], y: [24, 0], delay: stagger(46), duration: 620 }, 720)
        .add(".motion-pick-detail", { opacity: [0, 1], y: [14, 0], delay: stagger(45), duration: 560 }, 800)
        .add(".premiere-list", { opacity: [0, 1], x: [18, 0], duration: 680 }, 820);

      const scoreNode = document.querySelector<HTMLElement>("[data-motion-score]");
      const scoreState = { value: 0 };
      const scoreAnimation = recommendationScore != null && scoreNode
        ? animate(scoreState, {
          value: recommendationScore,
          delay: 920,
          duration: 900,
          ease: "outExpo",
          onUpdate: () => { scoreNode.textContent = scoreState.value.toFixed(1); },
        })
        : undefined;

      const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-motion-reveal]"));
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.classList.add("is-revealed");
          animate(target, {
            opacity: [0, 1],
            y: [24, 0],
            duration: 720,
            ease: "outExpo",
            onComplete: () => { target.style.willChange = "auto"; },
          });

          const staggerContainer = target.hasAttribute("data-motion-stagger")
            ? target
            : target.querySelector<HTMLElement>("[data-motion-stagger]");
          const staggerItems = staggerContainer
            ? Array.from(staggerContainer.querySelectorAll<HTMLElement>("[data-motion-item], :scope > *"))
            : [];
          if (staggerItems.length) {
            animate(staggerItems, {
              opacity: [0, 1],
              y: [18, 0],
              delay: stagger(75),
              duration: 620,
              ease: "outExpo",
              onComplete: () => staggerItems.forEach((item) => { item.style.willChange = "auto"; }),
            });
          }
          observer.unobserve(target);
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -8%" });

      revealTargets.forEach((target) => observer.observe(target));

      return () => {
        window.clearTimeout(watchdog);
        intro.cancel();
        scoreAnimation?.cancel();
        observer.disconnect();
        revealStaticContent();
      };
    } catch (error) {
      console.error("No se pudo iniciar el sistema de movimiento.", error);
      window.clearTimeout(watchdog);
      revealStaticContent();
    }
  }, [recommendationScore]);

  return null;
}
