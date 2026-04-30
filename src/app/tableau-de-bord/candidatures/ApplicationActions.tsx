"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ChevronDown, X, Send, CheckCircle } from "lucide-react";

const STATUSES = [
  { value: "PENDING",   label: "En attente",        color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  { value: "REVIEWING", label: "En cours d'examen", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { value: "INTERVIEW", label: "Entretien",          color: "text-purple-700 bg-purple-50 border-purple-200" },
  { value: "ACCEPTED",  label: "Accepté",            color: "text-green-700 bg-green-50 border-green-200" },
  { value: "REJECTED",  label: "Refusé",             color: "text-red-700 bg-red-50 border-red-200" },
];

const EMAIL_TEMPLATES: Record<string, { subject: string; message: string }> = {
  PENDING: {
    subject: "",
    message: "",
  },
  REVIEWING: {
    subject: "",
    message: "Nous vous informons que votre candidature est désormais en cours d'examen par notre équipe de recrutement. Nous vous tiendrons informé(e) de la suite du processus.",
  },
  INTERVIEW: {
    subject: "",
    message: "Nous avons le plaisir de vous inviter à un entretien. Veuillez nous contacter pour convenir d'un rendez-vous à votre convenance.",
  },
  ACCEPTED: {
    subject: "",
    message: "Toutes nos félicitations ! Nous avons le plaisir de vous informer que votre candidature a été retenue. Nous vous contacterons prochainement pour les prochaines étapes.",
  },
  REJECTED: {
    subject: "",
    message: "Nous avons étudié attentivement votre candidature. Malheureusement, nous ne sommes pas en mesure de donner une suite favorable à votre candidature pour ce poste. Nous vous souhaitons bonne chance dans vos recherches.",
  },
};

interface Props {
  applicationId: string;
  initialStatus: string;
  candidateName: string;
}

export default function ApplicationActions({ applicationId, initialStatus, candidateName }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);
  const [statusError, setStatusError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState(status);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState("");

  const currentStatus = STATUSES.find((s) => s.value === status) ?? STATUSES[0];

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) return;
    setStatusLoading(true);
    setStatusError("");
    setStatusSaved(false);
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(newStatus);
        setStatusSaved(true);
        setTimeout(() => setStatusSaved(false), 2500);
        router.refresh(); // met à jour les données server-side (vue candidat aussi)
      } else {
        setStatusError(data.error || "Erreur");
      }
    } finally {
      setStatusLoading(false);
    }
  }

  function openModal() {
    const template = EMAIL_TEMPLATES[status] ?? EMAIL_TEMPLATES["PENDING"];
    setEmailStatus(status);
    setEmailSubject(template.subject);
    setEmailMessage(template.message);
    setSendSuccess(false);
    setSendError("");
    setModalOpen(true);
  }

  function onTemplateChange(newStatus: string) {
    setEmailStatus(newStatus);
    const template = EMAIL_TEMPLATES[newStatus] ?? EMAIL_TEMPLATES["PENDING"];
    setEmailMessage(template.message);
    setEmailSubject(template.subject);
  }

  async function handleSendEmail() {
    setSendLoading(true);
    setSendError("");
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: emailStatus !== status ? emailStatus : undefined,
          sendEmail: true,
          emailSubject: emailSubject.trim() || undefined,
          emailMessage: emailMessage.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok || res.status === 207) {
        setSendSuccess(true);
        if (emailStatus !== status) setStatus(emailStatus);
        if (res.status === 207) {
          setSendError("Statut mis à jour, mais l'email n'a pas pu être envoyé.");
        }
      } else {
        setSendError(data.error || "Erreur lors de l'envoi");
      }
    } finally {
      setSendLoading(false);
    }
  }

  return (
    <>
      {/* ── Status select ────────────────────────────────────────────── */}
      <div className="flex flex-col items-end gap-1.5">
        <div className="relative">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusLoading}
            className={`appearance-none text-xs font-medium pl-2.5 pr-7 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-colors ${currentStatus.color}`}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {statusLoading ? (
            <Loader2 className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin opacity-60" />
          ) : (
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-60" />
          )}
        </div>
        {statusSaved && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle className="h-3 w-3" /> Sauvegardé
          </span>
        )}
        {statusError && <p className="text-xs text-red-500">{statusError}</p>}

        {/* ── Email button ──────────────────────────────────────────── */}
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors font-medium"
        >
          <Mail className="h-3.5 w-3.5" />
          Envoyer un email
        </button>
      </div>

      {/* ── Email modal ───────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Envoyer un email à {candidateName}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Le candidat recevra un email personnalisé avec les informations ci-dessous.
            </p>

            {sendSuccess ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-base font-semibold text-gray-800">Email envoyé avec succès !</p>
                {sendError && <p className="text-xs text-yellow-600 text-center">{sendError}</p>}
                <button
                  onClick={() => setModalOpen(false)}
                  className="mt-2 px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Modèle / statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de message
                  </label>
                  <select
                    value={emailStatus}
                    onChange={(e) => onTemplateChange(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {emailStatus !== status && (
                    <p className="text-xs text-blue-600 mt-1">
                      Le statut de la candidature sera aussi mis à jour vers « {STATUSES.find(s => s.value === emailStatus)?.label} ».
                    </p>
                  )}
                </div>

                {/* Objet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objet de l&apos;email{" "}
                    <span className="text-gray-400 font-normal">(laissez vide pour l&apos;objet par défaut)</span>
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Objet personnalisé…"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message personnalisé
                  </label>
                  <textarea
                    rows={5}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Écrivez votre message ici… (optionnel)"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  />
                </div>

                {sendError && (
                  <p className="text-xs text-red-500 text-center">{sendError}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-60"
                  >
                    {sendLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {sendLoading ? "Envoi…" : "Envoyer l'email"}
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
