"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Send,
  Bell,
  User,
  Settings,
  LogOut,
  Briefcase,
  Building2,
  Users,
  Eye,
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
  { href: "/tableau-de-bord/profil", label: "Mon profil", icon: User },
  { href: "/tableau-de-bord/parametres", label: "Paramètres", icon: Settings },
];

const EMPLOYER_LINKS = [
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/tableau-de-bord/publier", label: "Publier une offre", icon: Briefcase },
  { href: "/tableau-de-bord/candidatures", label: "Candidatures reçues", icon: Users },
  { href: "/tableau-de-bord/entreprise", label: "Mon entreprise", icon: Building2 },
  { href: "/tableau-de-bord/parametres", label: "Paramètres", icon: Settings },
];

export default function DashboardSidebar({ userName, userRole, initials }: Props) {
  const pathname = usePathname();
  const links = userRole === "EMPLOYER" ? EMPLOYER_LINKS : JOBSEEKER_LINKS;

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== "/tableau-de-bord";
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
          <p className="text-xs text-gray-400">{userRole === "EMPLOYER" ? "Recruteur" : "Candidat"}</p>
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
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
