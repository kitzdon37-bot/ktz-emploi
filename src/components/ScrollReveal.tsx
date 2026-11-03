"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Animations globales, sobres :
 *  - les titres et les cartes des sections apparaissent en douceur au défilement,
 *    en cascade dans chaque grille ;
 *  - les photos marquées data-photo se dévoilent (rideau + léger dézoom) à l'apparition ;
 *  - les photos marquées data-parallax défilent un peu moins vite que la page ;
 *  - une fine barre orange indique la progression du défilement.
 * Rien n'est caché sans JavaScript, et tout est désactivé si l'utilisateur
 * a demandé à réduire les animations.
 */
const TARGETS = [
  "main section h2",
  "main section h2 + p",
  "main section .grid > *",
].join(",");

export default function ScrollReveal() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  // Barre de progression du défilement + parallaxe des photos
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
      if (reduce) return;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const box = el.parentElement?.getBoundingClientRect();
        if (!box || box.bottom < 0 || box.top > window.innerHeight) return;
        const t = (box.top + box.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.transform = `translate3d(0, ${(-t * 12).toFixed(2)}%, 0) scale(1.15)`;
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // Apparition au défilement (relancée à chaque changement de page)
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      main.querySelectorAll("[data-photo]").forEach((el) => el.classList.add("shown"));
      return;
    }
    document.documentElement.classList.add("sr-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          if (el.hasAttribute("data-photo")) { el.classList.add("shown"); continue; }
          el.classList.add("sr-in");
          // Une fois apparu, l'élément retrouve ses propres effets (survol des cartes…)
          setTimeout(() => el.classList.remove("sr", "sr-in"), 1800);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const firstSection = () => main.querySelector("section");
    const scan = () => {
      main.querySelectorAll<HTMLElement>("[data-photo]:not([data-sr])").forEach((el) => {
        el.dataset.sr = "1";
        io.observe(el);
      });
      main.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        if (el.dataset.sr) return;
        // La première section (bannière d'accueil) reste immédiatement visible
        if (el.closest("main section") === firstSection()) return;
        el.dataset.sr = "1";
        const parent = el.parentElement;
        if (parent?.classList.contains("grid")) {
          const i = Array.prototype.indexOf.call(parent.children, el);
          el.style.setProperty("--sr-i", String(Math.min(i, 8)));
        }
        el.classList.add("sr");
        io.observe(el);
      });
    };

    scan();
    // Les listes chargées après coup (offres, entreprises…) sont animées aussi
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (!pending) pending = requestAnimationFrame(() => { pending = 0; scan(); });
    });
    mo.observe(main, { childList: true, subtree: true });

    // Filet de sécurité : tout élément encore masqué qui est entré dans l'écran
    // (ou déjà dépassé) s'affiche, même si la détection ci-dessus n'a pas réagi.
    let fallbackFrame = 0;
    const revealVisible = () => {
      fallbackFrame = 0;
      const limit = window.innerHeight * 0.95;
      main.querySelectorAll<HTMLElement>(".sr:not(.sr-in), [data-photo]:not(.shown)").forEach((el) => {
        if (el.getBoundingClientRect().top > limit) return;
        io.unobserve(el);
        if (el.hasAttribute("data-photo")) { el.classList.add("shown"); return; }
        el.classList.add("sr-in");
        setTimeout(() => el.classList.remove("sr", "sr-in"), 1800);
      });
    };
    const onScrollFallback = () => { if (!fallbackFrame) fallbackFrame = requestAnimationFrame(revealVisible); };
    window.addEventListener("scroll", onScrollFallback, { passive: true });
    const firstCheck = setTimeout(revealVisible, 1200);

    return () => {
      io.disconnect();
      mo.disconnect();
      if (pending) cancelAnimationFrame(pending);
      if (fallbackFrame) cancelAnimationFrame(fallbackFrame);
      clearTimeout(firstCheck);
      window.removeEventListener("scroll", onScrollFallback);
    };
  }, [pathname]);

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
