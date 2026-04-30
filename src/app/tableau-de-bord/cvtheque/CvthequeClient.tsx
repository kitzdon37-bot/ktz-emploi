"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FileText, MapPin, Search, Users, Download, Briefcase,
  X, Mail, Eye, SlidersHorizontal, ChevronDown, Calendar, Send, CheckCircle, MessageCircle,
} from "lucide-react";

interface Candidate {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  phone?: string | null;
  title: string | null;
  location: string | null;
  skills: string | null;
  bio: string | null;
  cv: string;
  updatedAt: string;
  experience?: string | null;
  education?: string | null;
}

function whatsappUrl(
  phone: string,
  candidateName: string | null,
  recruiterName: string | null,
  companyName: string | null,
): string {
  const cleaned = phone.replace(/[^\d+]/g, "");

  const sender = companyName && recruiterName
    ? `*${recruiterName}* de *${companyName}*`
    : companyName
    ? `*${companyName}*`
    : recruiterName
    ? `*${recruiterName}*`
    : "un recruteur";

  const greeting = candidateName ? `Bonjour *${candidateName}*,` : "Bonjour,";
  const msg = encodeURIComponent(
    `${greeting}\n\nJe suis ${sender} et je vous contacte via *KTZ Emploi* concernant une *opportunité d'emploi*.\n\nSeriez-vous disponible pour en discuter ?`
  );
  return `https://wa.me/${cleaned}?text=${msg}`;
}

// Couleurs d'avatar basées sur les initiales
const AVATAR_COLORS = [
  { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
  { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
  { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200" },
  { bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-200" },
  { bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-200" },
  { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200" },
  { bg: "bg-cyan-100", text: "text-cyan-600", border: "border-cyan-200" },
  { bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-200" },
];

function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function parseSkills(skills: string | null, limit?: number): string[] {
  if (!skills) return [];
  const list = skills.split(/[,;·\n]/).map((s) => s.trim()).filter(Boolean);
  return limit ? list.slice(0, limit) : list;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
  return `Il y a ${Math.floor(days / 365)} an(s)`;
}

// ─── Modal envoi de message ───────────────────────────────────────────────────
function ContactModal({
  candidateEmail,
  candidateName,
  onClose,
}: {
  candidateEmail: string;
  candidateName: string | null;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("Opportunité d'emploi — KTZ Emploi");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    if (!subject.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/cvtheque/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateEmail, candidateName, subject, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'envoi");
      }
      setStatus("sent");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-gray-900">Contacter {candidateName ?? "le candidat"}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === "sent" ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 text-lg">Message envoyé !</p>
            <p className="text-sm text-gray-500 mt-1">
              {candidateName ?? "Le candidat"} recevra votre message par email.
            </p>
            <button
              onClick={onClose}
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
                {candidateEmail}
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
                placeholder={`Bonjour ${candidateName ?? ""},\n\nNous avons consulté votre profil sur KTZ Emploi et nous aimerions vous proposer…`}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{errorMsg}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={status === "sending" || !subject.trim() || !message.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === "sending" ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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
  );
}

// ─── Modal profil complet ────────────────────────────────────────────────────
function ProfileModal({ candidate, onClose, recruiterName, companyName }: {
  candidate: Candidate;
  onClose: () => void;
  recruiterName: string | null;
  companyName: string | null;
}) {
  const [showContact, setShowContact] = useState(false);
  const color = getAvatarColor(candidate.name ?? candidate.email);

  // Enregistrer la vue côté serveur au montage du modal
  useEffect(() => {
    fetch("/api/cv-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: candidate.id }),
    }).catch(() => {/* silently ignore */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.id]);
  const allSkills = parseSkills(candidate.skills);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 px-6 pt-8 pb-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1.5 shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${color.bg} ${color.border} border-2 flex items-center justify-center font-bold text-xl ${color.text} flex-shrink-0`}>
              {getInitials(candidate.name, candidate.email)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{candidate.name ?? "Candidat"}</h2>
              {candidate.title && (
                <p className="text-sm font-medium text-orange-600 flex items-center gap-1 mt-0.5">
                  <Briefcase className="h-3.5 w-3.5" /> {candidate.title}
                </p>
              )}
              {candidate.location && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {candidate.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-5">
          {candidate.bio && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">À propos</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{candidate.bio}</p>
            </div>
          )}

          {allSkills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill, i) => (
                  <span key={i} className="text-xs bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {candidate.experience && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expérience</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{candidate.experience}</p>
            </div>
          )}

          {candidate.education && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Formation</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{candidate.education}</p>
            </div>
          )}

          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Mis à jour {timeAgo(candidate.updatedAt)}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowContact(true)}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-4 w-4" /> Email
            </button>
            {candidate.phone && (
              <a
                href={whatsappUrl(candidate.phone, candidate.name, recruiterName, companyName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
          <a
            href={candidate.cv}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Download className="h-4 w-4" /> Télécharger CV
          </a>
        </div>
      </div>
      {showContact && (
        <ContactModal
          candidateEmail={candidate.email}
          candidateName={candidate.name}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function CvthequeClient({
  candidates,
  recruiterName,
  companyName,
}: {
  candidates: Candidate[];
  recruiterName: string | null;
  companyName: string | null;
}) {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [contactTarget, setContactTarget] = useState<{ email: string; name: string | null } | null>(null);

  // Extraire les localisations uniques
  const locations = useMemo(() => {
    const locs = candidates.map((c) => c.location).filter(Boolean) as string[];
    return [...new Set(locs)].sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchSearch = !q || [c.title, c.location, c.skills, c.name, c.bio].join(" ").toLowerCase().includes(q);
      const matchLocation = !locationFilter || c.location === locationFilter;
      return matchSearch && matchLocation;
    });
  }, [candidates, search, locationFilter]);

  const hasFilters = search || locationFilter;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-orange-500" />
              CVthèque
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Trouvez les meilleurs talents centrafricains disponibles
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl px-5 py-3">
            <span className="text-2xl font-bold text-orange-600">{candidates.length}</span>
            <div className="text-xs text-orange-700 leading-tight">
              <p className="font-semibold">CV</p>
              <p>disponibles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par poste, compétence, nom…"
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {locations.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors shadow-sm ${
                locationFilter
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {locationFilter && <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">1</span>}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {/* Filtre localisation */}
        {showFilters && locations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <MapPin className="h-3.5 w-3.5 inline mr-1" />
              Localisation
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocationFilter("")}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  !locationFilter ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Toutes
              </button>
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(loc === locationFilter ? "" : loc)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    locationFilter === loc ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      {hasFilters && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{filtered.length}</span> candidat{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
          </p>
          <button
            onClick={() => { setSearch(""); setLocationFilter(""); }}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" /> Réinitialiser
          </button>
        </div>
      )}

      {/* Grille de cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-300" />
          </div>
          <p className="font-medium text-gray-500">
            {hasFilters ? "Aucun candidat ne correspond à vos critères." : "Aucun candidat n'a encore rendu son CV visible."}
          </p>
          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setLocationFilter(""); }}
              className="mt-3 text-sm text-orange-500 hover:underline"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const color = getAvatarColor(c.name ?? c.email);
            const skills = parseSkills(c.skills, 3);
            const extraSkills = parseSkills(c.skills).length - 3;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelected(c)}
              >
                {/* Avatar + identité */}
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center font-bold text-base ${color.text} flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {getInitials(c.name, c.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{c.name ?? "Candidat"}</p>
                    {c.title ? (
                      <p className={`text-xs font-medium ${color.text} truncate flex items-center gap-1 mt-0.5`}>
                        <Briefcase className="h-3 w-3 flex-shrink-0" />
                        {c.title}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Profil candidat</p>
                    )}
                  </div>
                </div>

                {/* Localisation */}
                {c.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {c.location}
                  </div>
                )}

                {/* Bio */}
                {c.bio && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed flex-1">{c.bio}</p>
                )}

                {/* Compétences */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill, i) => (
                      <span key={i} className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {extraSkills > 0 && (
                      <span className="text-xs text-gray-400 flex items-center">+{extraSkills}</span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {timeAgo(c.updatedAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setContactTarget({ email: c.email, name: c.name }); }}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Contacter par email"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </button>
                    {c.phone && (
                      <a
                        href={whatsappUrl(c.phone, c.name, recruiterName, companyName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Contacter sur WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Voir profil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal profil */}
      {selected && (
        <ProfileModal
          candidate={selected}
          onClose={() => setSelected(null)}
          recruiterName={recruiterName}
          companyName={companyName}
        />
      )}

      {/* Modal contact */}
      {contactTarget && (
        <ContactModal
          candidateEmail={contactTarget.email}
          candidateName={contactTarget.name}
          onClose={() => setContactTarget(null)}
        />
      )}
    </div>
  );
}
