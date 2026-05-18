"use client";

import { useState, useEffect } from "react";
import { Eye, TrendingUp, Building2, Loader2, Bell, BellOff } from "lucide-react";
import Link from "next/link";

interface CvViewItem {
  id: string;
  companyName: string | null;
  viewedAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
  return `Il y a ${Math.floor(days / 365)} an(s)`;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function CVPage() {
  const [views, setViews] = useState<CvViewItem[]>([]);
  const [thisMonth, setThisMonth] = useState(0);
  const [uniqueCompanies, setUniqueCompanies] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cv-views")
      .then((r) => r.json())
      .then((data) => {
        if (data.views) setViews(data.views);
        if (data.thisMonth !== undefined) setThisMonth(data.thisMonth);
        if (data.uniqueCompanies !== undefined) setUniqueCompanies(data.uniqueCompanies);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Mon CV</h1>
        <Link
          href="/tableau-de-bord/cv/builder"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          ✏️ Créer / Modifier mon CV
        </Link>
      </div>
      <p className="text-gray-500 mb-6">Créez un CV professionnel et suivez les recruteurs qui l&apos;ont consulté.</p>

      {/* Bannière activation */}
      {views.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
          <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800">Activez les notifications pour être alerté !</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Rendez votre CV visible et activez WhatsApp dans votre profil pour être notifié quand un recruteur consulte votre CV.
            </p>
            <div className="flex gap-2 mt-3">
              <Link
                href="/tableau-de-bord/profil"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                Compléter mon profil
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{thisMonth}</div>
          <div className="text-xs text-gray-500 mt-0.5">Vues ce mois</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{views.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total des vues</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-2">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{uniqueCompanies}</div>
          <div className="text-xs text-gray-500 mt-0.5">Entreprises</div>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          Historique des vues
          {views.length > 0 && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
              {views.length}
            </span>
          )}
        </h2>
        {views.length > 0 ? (
          <div className="space-y-3">
            {views.map((v) => (
              <div key={v.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                  {v.companyName ? getInitials(v.companyName) : <Building2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {v.companyName ?? "Recruteur anonyme"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Eye className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-400">A consulté votre CV</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400">{timeAgo(v.viewedAt)}</span>
                  <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-medium">
                    Nouveau
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <BellOff className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">Votre CV n&apos;a pas encore été consulté</p>
            <p className="text-sm mt-1 mb-4">
              Complétez votre profil et rendez votre CV visible pour être trouvé par les recruteurs
            </p>
            <Link
              href="/tableau-de-bord/profil"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Compléter mon profil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
