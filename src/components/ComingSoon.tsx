"use client";

import { useEffect, useState } from "react";

export default function ComingSoon() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #1e40af 0%, #3730a3 50%, #1e1b4b 100%)" }}
    >
      {/* Cercles animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.15)", top: "-100px", left: "-100px", animation: "pulse 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.1)", bottom: "-80px", right: "-80px", animation: "pulse 5s ease-in-out infinite 1s" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(59,130,246,0.1)", top: "40%", right: "10%", animation: "pulse 6s ease-in-out infinite 2s" }} />
      </div>

      <div className="text-center max-w-lg relative z-10" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
        <div style={{ fontSize: 72, marginBottom: 24, display: "inline-block", animation: "float 3s ease-in-out infinite" }}>🚀</div>

        <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "white", marginBottom: 8, letterSpacing: "-0.02em", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s" }}>
          KTZ Emploi
        </h1>

        <p style={{ color: "#a5b4fc", fontSize: "1.1rem", marginBottom: 40, opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.4s" }}>
          La plateforme emploi de la République Centrafricaine
        </p>

        <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "40px 32px", border: "1px solid rgba(255,255,255,0.15)", marginBottom: 32, opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)", transition: "opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "white", marginBottom: 12 }}>Bientôt disponible</h2>
          <p style={{ color: "#c7d2fe", lineHeight: 1.7, fontSize: "1rem" }}>
            Nous travaillons dur pour vous offrir la meilleure expérience.<br />
            Le site sera lancé <strong style={{ color: "white" }}>très prochainement</strong>.
          </p>
          <div style={{ marginTop: 28, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #818cf8, #a78bfa, #60a5fa)", animation: "progress 3s ease-in-out infinite" }} />
          </div>
          <p style={{ color: "#a5b4fc", fontSize: "0.8rem", marginTop: 8 }}>Préparation en cours...</p>
        </div>

        <p style={{ color: "#93c5fd", fontSize: "0.85rem", opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.9s" }}>
          Contact :{" "}
          <a href="mailto:kitzdon37@gmail.com" style={{ color: "white", textDecoration: "underline" }}>
            kitzdon37@gmail.com
          </a>
        </p>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.1); opacity: 1; } }
        @keyframes progress { 0% { width: 0%; opacity: 1; } 70% { width: 85%; opacity: 1; } 90% { width: 85%; opacity: 0.5; } 100% { width: 0%; opacity: 0; } }
      `}</style>
    </div>
  );
}
