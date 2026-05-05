"use client";

import { useEffect, useState } from "react";

// ← Modifie cette date pour changer le compte à rebours
const LAUNCH_DATE = new Date("2026-07-01T00:00:00");

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false });

  useEffect(() => {
    function compute() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
        return;
      }
      const s = Math.floor(diff / 1000);
      setTimeLeft({
        days:    Math.floor(s / 86400),
        hours:   Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60,
        done: false,
      });
    }
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 64 }}>
      <div style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 14,
        padding: "14px 10px",
        minWidth: 64,
        textAlign: "center",
        backdropFilter: "blur(8px)",
      }}>
        <span style={{ fontSize: "2.2rem", fontWeight: 800, color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}

export default function ComingSoon() {
  const [visible, setVisible] = useState(false);
  const { days, hours, minutes, seconds, done } = useCountdown(LAUNCH_DATE);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #1e40af 0%, #3730a3 50%, #1e1b4b 100%)" }}
    >
      {/* Cercles animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.15)", top: "-100px", left: "-100px", animation: "pulse 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.1)", bottom: "-80px", right: "-80px", animation: "pulse 5s ease-in-out infinite 1s" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(59,130,246,0.1)", top: "40%", right: "10%", animation: "pulse 6s ease-in-out infinite 2s" }} />
      </div>

      {/* Filtre SVG vague tissu */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="flag-wave" x="0%" y="-20%" width="125%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.04"
              numOctaves="2"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.012 0.04; 0.018 0.05; 0.012 0.04"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="28"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="text-center relative z-10"
        style={{ maxWidth: 540, width: "100%", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}
      >
        {/* ── Drapeau RCA ── */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", marginBottom: 32, opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.1s" }}>
          {/* Mât */}
          <div style={{ width: 6, height: 180, background: "linear-gradient(to right, #c9a227, #f5d060, #c9a227)", borderRadius: "4px 4px 2px 2px", flexShrink: 0, boxShadow: "2px 2px 8px rgba(0,0,0,0.5)", zIndex: 2 }} />

          {/* Tissu du drapeau avec filtre vague */}
          <div
            style={{
              width: 250,
              height: 150,
              position: "relative",
              overflow: "hidden",
              borderRadius: "0 8px 8px 0",
              boxShadow: "8px 8px 28px rgba(0,0,0,0.5)",
              filter: "url(#flag-wave)",
            }}
          >
            {/* 4 bandes horizontales */}
            <div style={{ position: "absolute", top: 0,    left: 0, right: 0, height: "25%", background: "#003082" }} />
            <div style={{ position: "absolute", top: "25%", left: 0, right: 0, height: "25%", background: "#FFFFFF" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "25%", background: "#289728" }} />
            <div style={{ position: "absolute", top: "75%", left: 0, right: 0, height: "25%", background: "#FFCB00" }} />
            {/* Barre rouge verticale centrale */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "11%", background: "#BC0026" }} />
            {/* Étoile jaune */}
            <div style={{ position: "absolute", top: "4%", left: "5%", color: "#FFCB00", fontSize: "2.4rem", lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>★</div>
            {/* Reflet lumière */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(255,255,255,0.14) 0%, transparent 45%, rgba(0,0,0,0.1) 100%)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Titre */}
        <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "white", marginBottom: 10, letterSpacing: "-0.02em", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s" }}>
          KTZ Emploi
        </h1>

        {/* Sous-titre — dégradé or/orange qui attire */}
        <p style={{
          fontSize: "1.15rem",
          fontWeight: 800,
          letterSpacing: "0.01em",
          marginBottom: 36,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease 0.45s",
          background: "linear-gradient(90deg, #FFD700 0%, #FF8C00 55%, #FF4500 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 2px 8px rgba(255,180,0,0.45))",
        }}>
          1ère plateforme de recherche d&apos;emploi en Centrafrique
        </p>

        {/* Carte Bientôt disponible + Compte à rebours */}
        <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "36px 32px", border: "1px solid rgba(255,255,255,0.15)", marginBottom: 28, opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)", transition: "opacity 0.9s ease 0.55s, transform 0.9s ease 0.55s" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "white", marginBottom: 8 }}>
            {done ? "Nous sommes en ligne !" : "Bientôt disponible"}
          </h2>
          <p style={{ color: "#c7d2fe", lineHeight: 1.7, fontSize: "0.95rem", marginBottom: 28 }}>
            {done
              ? "La plateforme est maintenant disponible. Bienvenue !"
              : <>Lancement prévu le <strong style={{ color: "white" }}>1er juillet 2026</strong>. Restez connectés !</>
            }
          </p>

          {/* Compte à rebours */}
          {!done && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <CountUnit value={days}    label="Jours"    />
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "2rem", fontWeight: 700, alignSelf: "flex-start", paddingTop: 14 }}>:</div>
              <CountUnit value={hours}   label="Heures"   />
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "2rem", fontWeight: 700, alignSelf: "flex-start", paddingTop: 14 }}>:</div>
              <CountUnit value={minutes} label="Minutes"  />
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "2rem", fontWeight: 700, alignSelf: "flex-start", paddingTop: 14 }}>:</div>
              <CountUnit value={seconds} label="Secondes" />
            </div>
          )}
        </div>

        {/* Contact */}
        <p style={{ color: "#93c5fd", fontSize: "0.85rem", opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.9s" }}>
          Contact :{" "}
          <a href="mailto:kitzdon37@gmail.com" style={{ color: "white", textDecoration: "underline" }}>
            kitzdon37@gmail.com
          </a>
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
