"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Company = { name: string; logo: string | null; sector: string | null; slug: string };

const COLORS = [
  "bg-orange-100 text-orange-600", "bg-blue-100 text-blue-600", "bg-green-100 text-green-600", "bg-purple-100 text-purple-600",
  "bg-rose-100 text-rose-600", "bg-yellow-100 text-yellow-700", "bg-teal-100 text-teal-600", "bg-indigo-100 text-indigo-600",
];

const SPEED = 40; // px par seconde en défilement automatique

/**
 * « Ils recrutent en RCA » : carrousel qui défile tout seul en boucle,
 * avec flèches gauche/droite, glisser à la souris ou au doigt, pause au survol.
 */
export default function CompanyCarousel({ companies }: { companies: Company[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const goByRef = useRef<(dir: number) => void>(() => {});

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || companies.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = companies.length;
    let offset = 0, setW = 1, step = 1;
    let hovered = false, dragging = false, inView = true;
    let glide: { from: number; to: number; t0: number } | null = null;
    let raf = 0, last = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const measure = () => {
      const items = track.children as HTMLCollectionOf<HTMLElement>;
      if (items.length < n + 1) return;
      setW = items[n].offsetLeft - items[0].offsetLeft || 1;
      step = (items[1]?.offsetLeft ?? 0) - items[0].offsetLeft || 1;
    };
    const wrap = (v: number) => ((v % setW) + setW) % setW;
    const render = () => {
      offset = wrap(offset);
      track.style.transform = `translate3d(${-offset}px,0,0)`;
    };
    const glideTo = (target: number) => {
      // on vise la copie la plus proche pour ne jamais « rembobiner »
      const to = target + Math.round((offset - target) / setW) * setW;
      glide = { from: offset, to, t0: performance.now() };
    };
    goByRef.current = (dir: number) => {
      const from = glide ? glide.to : offset;
      glideTo(Math.round(from / step) * step + dir * step);
    };

    // Glisser à la souris ou au doigt
    let startX = 0, startOffset = 0, moved = 0, lastX = 0, lastT = 0, velocity = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true; glide = null; moved = 0; velocity = 0;
      startX = lastX = e.clientX; startOffset = offset; lastT = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 5 && !viewport.hasPointerCapture(e.pointerId)) viewport.setPointerCapture(e.pointerId);
      offset = startOffset - dx;
      const now = performance.now();
      velocity = ((lastX - e.clientX) / Math.max(1, now - lastT)) * 1000;
      lastX = e.clientX; lastT = now;
      render();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      const fling = Math.max(-step * 2, Math.min(step * 2, velocity * 0.25));
      glideTo(Math.round((offset + fling) / step) * step);
    };
    // un glisser ne doit pas ouvrir la fiche entreprise
    const onClickCapture = (e: MouseEvent) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } };
    const onEnter = (e: PointerEvent) => { if (e.pointerType === "mouse") hovered = true; };
    const onLeave = () => { hovered = false; };
    const onFocusIn = () => { hovered = true; };
    const onFocusOut = () => { hovered = false; };

    const loop = (now: number) => {
      const dt = Math.min(1000, now - last) / 1000;
      last = now;
      if (glide) {
        const p = Math.min(1, (now - glide.t0) / 650);
        offset = glide.from + (glide.to - glide.from) * easeOut(p);
        if (p >= 1) glide = null;
        render();
      } else if (!dragging && !hovered && inView && !reduce && !document.hidden) {
        offset += SPEED * dt;
        render();
      }
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; });
    io.observe(viewport);
    const onResize = () => { measure(); render(); };
    measure();
    render();
    raf = requestAnimationFrame(loop);

    viewport.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    viewport.addEventListener("click", onClickCapture, true);
    viewport.addEventListener("pointerenter", onEnter);
    viewport.addEventListener("pointerleave", onLeave);
    viewport.addEventListener("focusin", onFocusIn);
    viewport.addEventListener("focusout", onFocusOut);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      viewport.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("click", onClickCapture, true);
      viewport.removeEventListener("pointerenter", onEnter);
      viewport.removeEventListener("pointerleave", onLeave);
      viewport.removeEventListener("focusin", onFocusIn);
      viewport.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, [companies.length]);

  if (companies.length === 0) return null;

  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-700 hover:text-white hover:bg-orange-500 hover:border-orange-500 transition-colors";

  return (
    <div className="relative">
      <button type="button" onClick={() => goByRef.current(-1)} aria-label="Entreprises précédentes" className={`${arrow} left-0 sm:-left-5`}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => goByRef.current(1)} aria-label="Entreprises suivantes" className={`${arrow} right-0 sm:-right-5`}>
        <ChevronRight className="h-5 w-5" />
      </button>

      <div ref={viewportRef} className="marquee mx-12 sm:mx-6 cursor-grab active:cursor-grabbing select-none touch-pan-y">
        <div ref={trackRef} className="flex gap-4 w-max py-3 will-change-transform">
          {[...companies, ...companies].map((co, i) => {
            const dup = i >= companies.length;
            const color = COLORS[co.name.charCodeAt(0) % COLORS.length];
            return (
              <Link
                key={`${co.slug}-${i}`}
                href={`/entreprises/${co.slug}`}
                draggable={false}
                aria-hidden={dup || undefined}
                tabIndex={dup ? -1 : undefined}
                className="soft-card w-44 shrink-0 rounded-2xl p-5 flex flex-col items-center gap-2.5 group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-base overflow-hidden transition-transform duration-300 group-hover:scale-105 ${co.logo ? "bg-gray-50 border border-gray-100" : color}`}>
                  {co.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={co.logo} alt={co.name} draggable={false} className="w-full h-full object-contain p-1" />
                  ) : (
                    co.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-800 text-center leading-tight group-hover:text-orange-600 line-clamp-2 transition-colors">{co.name}</span>
                {co.sector && <span className="text-[10px] text-gray-400 text-center line-clamp-1">{co.sector}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
