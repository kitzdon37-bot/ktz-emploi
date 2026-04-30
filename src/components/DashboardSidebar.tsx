"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, Suspense } from "react";
import {
  LayoutDashboard,
  Send,
  Bell,
  User,
  Settings,
  LogOut,
  Briefcase,
  Building2,
  Users,
  Eye,
  Mail,
  BookOpen,
  BarChart2,
  Columns,
  FileText,
  Banknote,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

interface Props {
  userName?: string | null;
  userRole?: string;
  initials: string;
}

const JOBSEEKER_LINKS = [
  { href: "/tableau-de-bord", label: "Mon espace", icon: LayoutDashboard, exact: true },
  { href: "/tableau-de-bord/cv", label: "Mes CV vus", icon: Eye },
  { href: "/tableau-de-bord/candidatures", label: "Mes candidatures", icon: Send },
  { href: "/tableau-de-bord/alertes", label: "Mes alertes", icon: Bell },
  { href: "/salaires", label: "Salaires RCA", icon: Banknote },
  { href: "/blog", label: "Conseils carrière", icon: BookOpen },
  { href: "/tableau-de-bord/profil", label: "Mon profil", icon: User },
  { href: "/tableau-de-bord/parametres", label: "Paramètres", icon: Settings },
];

const EMPLOYER_LINKS = [
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/tableau-de-bord/publier", label: "Publier une offre", icon: Briefcase },
  { href: "/tableau-de-bord/candidatures", label: "Candidatures reçues", icon: Users },
  { href: "/tableau-de-bord/cvtheque", label: "CVthèque", icon: BookOpen },
  { href: "/tableau-de-bord/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/tableau-de-bord/pipeline", label: "Pipeline", icon: Columns },
  { href: "/tableau-de-bord/modeles", label: "Modèles d'offres", icon: FileText },
  { href: "/tableau-de-bord/admin", label: "Envoyer des offres", icon: Mail },
  { href: "/tableau-de-bord/entreprise", label: "Mon entreprise", icon: Building2 },
  { href: "/tableau-de-bord/abonnement", label: "Mon abonnement", icon: CreditCard },
  { href: "/tableau-de-bord/parametres", label: "Paramètres", icon: Settings },
];

const ADMIN_LINKS = [
  { href: "/tableau-de-bord", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/tableau-de-bord/admin", label: "Tableau admin", icon: BarChart2, exact: true },
  { href: "/tableau-de-bord/admin?tab=abonnements", label: "Abonnements", icon: CreditCard },
  { href: "/tableau-de-bord/admin?tab=utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/tableau-de-bord/admin?tab=recruteurs", label: "Recruteurs", icon: Building2 },
  { href: "/tableau-de-bord/admin?tab=stats", label: "Statistiques", icon: BarChart2 },
  { href: "/tableau-de-bord/admin?tab=offres", label: "Offres à valider", icon: Mail },
  { href: "/tableau-de-bord/admin/articles", label: "Articles & Blog", icon: FileText },
  { href: "/tableau-de-bord/admin/newsletter", label: "Newsletter", icon: Send },
  { href: "/tableau-de-bord/parametres", label: "Paramètres", icon: Settings },
];

function SidebarContent({ userName, userRole, initials }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const links =
    userRole === "ADMIN" ? ADMIN_LINKS :
    userRole === "EMPLOYER" ? EMPLOYER_LINKS :
    JOBSEEKER_LINKS;

  function isActive(href: string, exact?: boolean) {
    const [hrefPath, hrefQuery] = href.split("?");
    if (hrefQuery) {
      const [key, value] = hrefQuery.split("=");
      return pathname === hrefPath && searchParams.get(key) === value;
    }
    if (exact) return pathname === hrefPath;
    return pathname.startsWith(hrefPath) && hrefPath !== "/tableau-de-bord";
  }

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 min-h-[calc(100vh-4rem)] py-6 px-3 flex-shrink-0">
      {/* User info */}
      <div className="flex items-center gap-3 px-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
          <p className="text-xs text-gray-400">{userRole === "ADMIN" ? "Administrateur" : userRole === "EMPLOYER" ? "Recruteur" : "Candidat"}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact) || (exact && pathname === "/tableau-de-bord");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-orange-500" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 mx-4 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-900 font-semibold text-base mb-1">Déconnexion</p>
            <p className="text-gray-500 text-sm mb-5">Voulez-vous vraiment vous déconnecter ?</p>
            <div className="flex gap-3">
              <button
                onClick={() => signOut({ callbackUrl: "/connexion" })}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default function DashboardSidebar(props: Props) {
  return (
    <Suspense fallback={
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 min-h-[calc(100vh-4rem)] py-6 px-3 flex-shrink-0" />
    }>
      <SidebarContent {...props} />
    </Suspense>
  );
}
