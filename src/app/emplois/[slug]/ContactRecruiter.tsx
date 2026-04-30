"use client";

import { useState } from "react";
import { MessageCircle, Mail, Send, CheckCircle, X, Loader2 } from "lucide-react";

interface Props {
  companyName: string;
  phone?: string | null;
  email?: string | null;
}

export default function ContactRecruiter({ companyName, phone, email }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState(`Candidature spontanée — ${companyName}`);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const waLink = phone
    ? `https://wa.me/${phone.replace(/[^\d+]/g, "")}?text=${encodeURIComponent(`Bonjour,\n\nJe vous contacte via *KTZ Emploi* concernant une opportunité au sein de *${companyName}*.\n\nSeriez-vous disponible pour en discuter ?`)}`
    : null;

  async function handleSendEmail() {
    if (!email || !subject.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/cvtheque/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateEmail: email,
          candidateName: companyName,
          subject,
          message,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (!waLink && !email) return null;

  return (
    <>
      {/* Carte sidebar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Contacter le recruteur</h3>
        <p className="text-xs text-gray-400 mb-4">
          Envoyez un message direct à {companyName}
        </p>

        <div className="space-y-2">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Contacter sur WhatsApp
            </a>
          )}
          {email && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <Mail className="h-4 w-4" />
              Envoyer un email
            </button>
          )}
        </div>
      </div>

      {/* Modal email */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-900">Contacter {companyName}</span>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {status === "sent" ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 text-lg">Message envoyé !</p>
                <p className="text-sm text-gray-500 mt-1">Le recruteur recevra votre message par email.</p>
                <button
                  onClick={() => { setShowModal(false); setStatus("idle"); setMessage(""); }}
                  className="mt-5 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Destinataire</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600">
                    {companyName}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Objet</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder={`Bonjour,\n\nJe suis intéressé(e) par vos offres d'emploi et souhaite vous soumettre ma candidature…`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                    Une erreur est survenue. Réessayez.
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={status === "sending" || !subject.trim() || !message.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    {status === "sending" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {status === "sending" ? "Envoi…" : "Envoyer"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
