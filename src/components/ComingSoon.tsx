"use client";

import { useEffect, useState } from "react";

export default function ComingSoon() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #1e40af 0%, #3730a3 50%, #1e1b4b 100%)" }}
    >
      {/* Cercles animés en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.15)", top: "-100px", left: "-100px", animation: "pulse 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.1)", bottom: "-80px", right: "-80px", animation: "pulse 5s ease-in-out infinite 1s" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(59,130,246,0.1)", top: "40%", right: "10%", animation: "pulse 6s ease-in-out infinite 2s" }} />
      </div>

      <div
        className="text-center relative z-10"
        style={{ maxWidth: 540, width: "100%", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}
      >
        {/* ── Drapeau RCA avec mât ── */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", marginBottom: 32, opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.1s" }}>
          {/* Mât */}
          <div style={{ width: 7, height: 220, background: "linear-gradient(to right, #c9a227, #f5d060, #c9a227)", borderRadius: "4px 4px 2px 2px", flexShrink: 0, boxShadow: "2px 2px 6px rgba(0,0,0,0.4)" }} />

          {/* Drapeau */}
          <div
            style={{
              width: 320,
              height: 192,
              position: "relative",
              overflow: "hidden",
              borderRadius: "0 6px 6px 0",
              boxShadow: "6px 6px 24px rgba(0,0,0,0.45)",
              animation: "cloth-wave 2.4s ease-in-out infinite",
              transformOrigin: "left center",
            }}
          >
            {/* Bande bleue */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "25%", background: "#003082" }} />
            {/* Bande blanche */}
            <div style={{ position: "absolute", top: "25%", left: 0, right: 0, height: "25%", background: "#FFFFFF" }} />
            {/* Bande verte */}
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "25%", background: "#289728" }} />
            {/* Bande jaune */}
            <div style={{ position: "absolute", top: "75%", left: 0, right: 0, height: "25%", background: "#FFCB00" }} />
            {/* Bande rouge verticale centrale */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "11%", background: "#BC0026" }} />
            {/* Étoile jaune (canton haut gauche) */}
            <div style={{ position: "absolute", top: "3%", left: "4%", color: "#FFCB00", fontSize: "2.2rem", lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>★</div>
            {/* Reflet tissu */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Titre */}
        <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "white", marginBottom: 8, letterSpacing: "-0.02em", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s" }}>
          KTZ Emploi
        </h1>

        {/* Sous-titre */}
        <p style={{ color: "#a5b4fc", fontSize: "1.05rem", marginBottom: 36, opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.45s" }}>
          1ère plateforme de recherche d&apos;emploi en Centrafrique
        </p>

        {/* Carte "Bientôt disponible" */}
        <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "36px 32px", border: "1px solid rgba(255,255,255,0.15)", marginBottom: 28, opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)", transition: "opacity 0.9s ease 0.55s, transform 0.9s ease 0.55s" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "white", marginBottom: 12 }}>Bientôt disponible</h2>
          <p style={{ color: "#c7d2fe", lineHeight: 1.7, fontSize: "1rem" }}>
            La plateforme sera disponible <strong style={{ color: "white" }}>très prochainement</strong>.
          </p>
          <div style={{ marginTop: 28, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #818cf8, #a78bfa, #60a5fa)", animation: "progress 3s ease-in-out infinite" }} />
          </div>
          <p style={{ color: "#a5b4fc", fontSize: "0.8rem", marginTop: 8 }}>Préparation en cours...</p>
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
        @keyframes progress {
          0%   { width: 0%;  opacity: 1; }
          70%  { width: 85%; opacity: 1; }
          90%  { width: 85%; opacity: 0.5; }
          100% { width: 0%;  opacity: 0; }
        }
        @keyframes cloth-wave {
          0%   { transform: perspective(700px) rotateY(0deg)   skewY(0deg); }
          15%  { transform: perspective(700px) rotateY(9deg)   skewY(-1.2deg); }
          35%  { transform: perspective(700px) rotateY(-4deg)  skewY(0.8deg); }
          55%  { transform: perspective(700px) rotateY(7deg)   skewY(-0.8deg); }
          75%  { transform: perspective(700px) rotateY(-2deg)  skewY(0.5deg); }
          100% { transform: perspective(700px) rotateY(0deg)   skewY(0deg); }
        }
      `}</style>
    </div>
  );
}
