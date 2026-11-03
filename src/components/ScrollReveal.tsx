"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Animations globales, dans l'esprit du site KTZ Group :
 *  - les titres et les cartes des sections apparaissent en douceur au défilement,
 *    en cascade dans chaque grille ;
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

  // Barre de progression du défilement
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
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
  }, []);

  // Apparition au défilement (relancée à chaque changement de page)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.classList.add("sr-in");
            io.unobserve(el);
            // Une fois apparu, l'élément retrouve ses propres effets (survol des cartes…)
            setTimeout(() => el.classList.remove("sr", "sr-in"), 1800);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const scan = () => {
      main.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        if (el.dataset.sr) return;
        // La première section (bannière d'accueil) reste immédiatement visible
        if (el.closest("main section") === main.querySelector("section")) return;
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

    return () => {
      io.disconnect();
      mo.disconnect();
      if (pending) cancelAnimationFrame(pending);
    };
  }, [pathname]);

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
