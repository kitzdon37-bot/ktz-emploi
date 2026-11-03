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
  "main section h2:not([data-split])",
  "main section h2 + p",
  "main section .grid > *",
].join(",");

/** Découpe un titre en mots animés (uniquement les titres statiques marqués data-split). */
function splitWords(el: HTMLElement) {
  let i = 0;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (n.textContent ?? "").split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(" "); return; }
          const w = document.createElement("span");
          const wi = document.createElement("span");
          w.className = "w";
          wi.className = "wi";
          wi.textContent = part;
          wi.style.transitionDelay = `${(i++ * 0.06).toFixed(2)}s`;
          w.append(wi);
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName !== "BR") {
        walk(n);
      }
    });
  };
  walk(el);
  el.classList.add("split");
}

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

  // Cartes inclinées en 3D avec halo, et boutons « magnétiques » (souris uniquement)
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let card: HTMLElement | null = null;
    let btn: HTMLElement | null = null;

    const reset = (el: HTMLElement | null) => { if (el) el.style.transform = ""; };

    const onMove = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const c = t?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (c !== card) { if (card) card.classList.remove("tilting"); reset(card); card = c; }
      if (c) {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", `${x * 100}%`);
        c.style.setProperty("--my", `${y * 100}%`);
        c.classList.add("tilting");
        c.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 7).toFixed(2)}deg) translateY(-4px)`;
      }
      const b = t?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (b !== btn) { reset(btn); btn = b; }
      if (b) {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1)}px)`;
      }
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) { if (card) card.classList.remove("tilting"); reset(card); reset(btn); card = btn = null; }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
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
            io.unobserve(el);
            if (el.classList.contains("split")) { el.classList.add("split-in"); continue; }
            el.classList.add("sr-in");
            // Une fois apparu, l'élément retrouve ses propres effets (survol des cartes…)
            setTimeout(() => el.classList.remove("sr", "sr-in"), 1800);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const scan = () => {
      main.querySelectorAll<HTMLElement>("[data-split]:not(.split)").forEach((el) => {
        splitWords(el);
        io.observe(el);
      });
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
