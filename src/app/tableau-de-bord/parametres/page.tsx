import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, Shield, Bell, Trash2 } from "lucide-react";

export default async function ParametresPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h1>
      <p className="text-gray-500 mb-6">Gérez votre compte et vos préférences.</p>

      <div className="space-y-4">
        {/* Account */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4 text-orange-500" /> Mon compte
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">Nom</p>
                <p className="text-sm text-gray-500">{session.user?.name}</p>
              </div>
              <button className="text-sm text-orange-500 hover:underline">Modifier</button>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">Email</p>
                <p className="text-sm text-gray-500">{session.user?.email}</p>
              </div>
              <button className="text-sm text-orange-500 hover:underline">Modifier</button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">Mot de passe</p>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
              <button className="text-sm text-orange-500 hover:underline">Modifier</button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" /> Confidentialité
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-800">Profil visible par les recruteurs</p>
                <p className="text-xs text-gray-400">Les recruteurs peuvent trouver votre profil</p>
              </div>
              <div className="relative w-9 h-5 bg-orange-500 rounded-full">
                <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
              </div>
            </label>
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-800">Recevoir des suggestions d&apos;emploi</p>
                <p className="text-xs text-gray-400">Notifications hebdomadaires par email</p>
              </div>
              <div className="relative w-9 h-5 bg-orange-500 rounded-full">
                <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
              </div>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-500" /> Notifications
          </h2>
          <div className="space-y-3">
            {[
              { label: "Nouvelles offres correspondant à mon profil", desc: "Envoyé chaque semaine" },
              { label: "Réponses à mes candidatures", desc: "En temps réel" },
              { label: "Conseils carrière et actualités", desc: "Envoyé chaque mois" },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between py-2 cursor-pointer border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <div className="relative w-9 h-5 bg-orange-500 rounded-full flex-shrink-0">
                  <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <h2 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Zone de danger
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            La suppression de votre compte est irréversible. Toutes vos données seront effacées.
          </p>
          <button className="text-sm text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}
