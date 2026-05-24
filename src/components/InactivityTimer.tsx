"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";

const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_DURATION = 60 * 1000;       // avertissement 60s avant déconnexion

const ACTIVITY_EVENTS = [
  "mousemove", "mousedown", "click",
  "keydown", "touchstart", "scroll", "focus",
];

export default function InactivityTimer() {
  const { data: session } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const warningTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (warningTimer.current)  clearTimeout(warningTimer.current);
    if (logoutTimer.current)   clearTimeout(logoutTimer.current);
    if (countdownRef.current)  clearInterval(countdownRef.current);
  }, []);

  const startLogoutCountdown = useCallback(() => {
    setShowWarning(true);
    setCountdown(60);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    logoutTimer.current = setTimeout(() => {
      signOut({ callbackUrl: "/connexion" });
    }, WARNING_DURATION);
  }, []);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setCountdown(60);

    warningTimer.current = setTimeout(startLogoutCountdown, INACTIVE_TIMEOUT - WARNING_DURATION);
  }, [clearAllTimers, startLogoutCountdown]);

  // Démarrer le suivi uniquement si l'utilisateur est connecté
  useEffect(() => {
    if (!session) return;

    resetTimer();

    const onActivity = () => {
      if (!showWarning) resetTimer();
    };

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!showWarning || !session) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in">
        {/* Icône */}
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h2 className="text-xl font-800 text-gray-900 mb-2">
          Déconnexion automatique
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Vous êtes inactif depuis un moment. Vous serez déconnecté dans{" "}
          <span className="font-bold text-orange-500 text-base">{countdown}s</span>.
        </p>

        {/* Cercle de compte à rebours */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="#f97316"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 60)}`}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
            {countdown}
          </span>
        </div>

        <button
          onClick={resetTimer}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-700 py-3 rounded-xl transition-colors duration-200 text-sm"
        >
          Rester connecté
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/connexion" })}
          className="w-full mt-2 text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
        >
          Se déconnecter maintenant
        </button>
      </div>
    </div>
  );
}
