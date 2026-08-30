"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Mail, Bug } from "lucide-react";

export default function FeedbackPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // N'afficher qu'une fois par session
    if (sessionStorage.getItem("feedbackPopupSeen")) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    sessionStorage.setItem("feedbackPopupSeen", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[340px] z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icône + titre */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Bug className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Vous avez remarqué quelque chose ?</p>
            <p className="text-xs text-gray-400">Bug, problème ou suggestion</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Aidez-nous à améliorer KTZ Emploi ! Signalez un bug, une erreur ou partagez votre avis — chaque retour compte.
        </p>

        {/* CTAs */}
        <div className="flex gap-2">
          <a
            href="https://wa.me/33754095087?text=Bonjour%20KTZ%20Emploi%20!%20Je%20voudrais%20signaler%20un%20bug%20ou%20donner%20mon%20avis%20:%20"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <a
            href="mailto:contact@ktzemploi.com?subject=Retour%20utilisateur%20KTZ%20Emploi&body=Bonjour%2C%0A%0AJe%20souhaite%20signaler%20%3A%0A"
            onClick={dismiss}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </a>
        </div>

        <button
          onClick={dismiss}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-500 mt-3 transition-colors"
        >
          Non merci
        </button>
      </div>
    </div>
  );
}
