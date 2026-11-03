"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 1800, started: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    if (target === 0) return;

    let startTime: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(startValue + eased * (target - startValue)));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, duration, started]);

  return count;
}

interface Props {
  totalJobs: number;
  totalCompanies: number;
  totalUsers: number;
}

export default function StatsCounter({ totalJobs, totalCompanies, totalUsers }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const jobs      = useCountUp(totalJobs > 0 ? totalJobs : 500, 1800, visible);
  const companies = useCountUp(totalCompanies > 0 ? totalCompanies : 120, 1600, visible);
  const users     = useCountUp(totalUsers > 0 ? totalUsers : 1200, 2000, visible);

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div ref={ref} className="grid grid-cols-3 divide-x divide-gray-100">
      <div className="text-center py-2">
        <div className="text-3xl font-extrabold text-gray-900">{fmt(jobs)}+</div>
        <div className="text-sm text-gray-500 mt-1">Offres d&apos;emploi</div>
      </div>
      <div className="text-center py-2">
        <div className="text-3xl font-extrabold text-gray-900">{fmt(companies)}+</div>
        <div className="text-sm text-gray-500 mt-1">Entreprises partenaires</div>
      </div>
      <div className="text-center py-2">
        <div className="text-3xl font-extrabold text-gray-900">{fmt(users)}+</div>
        <div className="text-sm text-gray-500 mt-1">Candidats inscrits</div>
      </div>
    </div>
  );
}
