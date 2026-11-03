"use client";

import { useEffect, useRef } from "react";

/**
 * Effets de la bannière d'accueil, dans l'esprit du site KTZ Group :
 *  - réseau de particules aux couleurs de la RCA qui s'écarte de la souris ;
 *  - parallaxe de la photo de fond au défilement (élément `.hero-parallax`).
 * Placé dans la <section> du hero ; tout est coupé si l'utilisateur
 * a demandé à réduire les animations.
 */
const COLORS = ["249,115,22", "37,99,235", "34,197,94", "250,204,21", "255,255,255"];

export default function HeroFx() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !hero || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bg = hero.querySelector<HTMLElement>(".hero-parallax");
    let W = 0, H = 0, raf = 0, visible = true;
    const pointer = { x: -9999, y: -9999 };
    type P = { x: number; y: number; vx: number; vy: number; r: number; c: string };
    let parts: P[] = [];

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(60, Math.round((W * H) / 22000));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const link = 120;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 20000) {
          const f = ((20000 - d2) / 20000) * 1.8;
          const d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < link) {
            ctx.strokeStyle = `rgba(${p.c},${(1 - d / link) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${p.c},.85)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (visible && !document.hidden) draw();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => { pointer.x = pointer.y = -9999; };

    let ticking = false;
    const onScroll = () => {
      if (ticking || !bg) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const r = hero.getBoundingClientRect();
        if (r.bottom > 0) bg.style.transform = `translate3d(0, ${(-r.top * 0.3).toFixed(1)}px, 0)`;
      });
    };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(hero);
    init();
    loop();
    onScroll();
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", init);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", init);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}
