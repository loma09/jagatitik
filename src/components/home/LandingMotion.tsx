"use client";

import { useEffect } from "react";

export default function LandingMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const elements = new Set<HTMLElement>();
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        element.dataset.motionState = "entered";
        const isMedia = element.matches("[data-ui], .story-visual");
        const isRow = element.matches(".timeline-list li");
        const index = Array.from(element.parentElement?.children ?? []).indexOf(element);
        const animation = element.animate([
          { opacity: 0, transform: isMedia ? "translateY(48px) scale(0.94)" : isRow ? "translateX(30px)" : "translateY(40px)" },
          { opacity: 1, transform: "none" },
        ], { duration: isMedia ? 1000 : 800, delay: Math.min(Math.max(index, 0), 3) * 85, fill: "backwards", easing: "cubic-bezier(0.16,1,0.3,1)" });
        animations.add(animation);
        animation.addEventListener("finish", () => animations.delete(animation), { once: true });
        if (element.matches(".trust-preview")) {
          const meter = element.querySelector("[role='meter'] > span")?.animate([
            { transform: "scaleX(0)" }, { transform: "scaleX(1)" },
          ], { duration: 1200, delay: 250, fill: "backwards", easing: "cubic-bezier(0.16,1,0.3,1)" });
          if (meter) animations.add(meter);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    const register = () => {
      const pending = Array.from(document.querySelectorAll<HTMLElement>(".landing .reveal")).filter(element => !elements.has(element));
      // Read positions together before setting attributes that invalidate layout.
      const initiallyVisible = new Set(pending.filter(element => {
        const bounds = element.getBoundingClientRect();
        return bounds.top < window.innerHeight && bounds.bottom > 0;
      }));
      pending.forEach((element) => {
        elements.add(element);
        // Initial viewport content must paint immediately; keep entrances for scrolling.
        if (element.closest(".landing-hero") || initiallyVisible.has(element)) {
          element.dataset.motionState = "entered";
          return;
        }
        element.dataset.motionState = "ready";
        observer.observe(element);
      });
    };
    register();
    // Next can stream later sections after this component mounts.
    const additions = new MutationObserver(register);
    additions.observe(document.querySelector(".landing") ?? document.body, { childList: true, subtree: true });
    const stop = () => {
      observer.disconnect(); additions.disconnect();
      animations.forEach((animation) => animation.cancel());
      elements.forEach((element) => { delete element.dataset.motionState; });
    };
    const onPreference = () => { if (preference.matches) stop(); };
    preference.addEventListener("change", onPreference);
    return () => { stop(); preference.removeEventListener("change", onPreference); };
  }, []);
  return null;
}
