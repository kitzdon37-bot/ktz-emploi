"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Briefcase, Menu, X, Bell, User, LogOut, Settings, Building2, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">KTZ<span className="text-orange-500"> Emploi</span></span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex ml-8 gap-6">
              <Link href="/emplois" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                Offres d&apos;emploi
              </Link>
              <Link href="/entreprises" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                Entreprises
              </Link>
              <Link href="/conseils" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                Conseils carrière
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                {(session.user as { role?: string })?.role === "EMPLOYER" && (
                  <Link
                    href="/tableau-de-bord/publier"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    Publier une offre
                  </Link>
                )}

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-sm font-medium">{session.user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link
                        href="/tableau-de-bord"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Tableau de bord
                      </Link>
                      {(session.user as { role?: string })?.role === "EMPLOYER" && (
                        <Link
                          href="/tableau-de-bord/entreprise"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Building2 className="h-4 w-4" />
                          Mon entreprise
                        </Link>
                      )}
                      {session.user?.role === "JOBSEEKER" && (
                        <Link
                          href="/tableau-de-bord/candidatures"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Bell className="h-4 w-4" />
                          Mes candidatures
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-orange-500 hover:bg-orange-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/connexion" className="text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors">
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  S&apos;inscrire
                </Link>
                <Link
                  href="/inscription?role=employer"
                  className="border border-orange-500 text-orange-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                >
                  Recruter
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/emplois" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Offres d&apos;emploi</Link>
          <Link href="/entreprises" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Entreprises</Link>
          <Link href="/conseils" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Conseils carrière</Link>
          <hr />
          {session ? (
            <>
              <Link href="/tableau-de-bord" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Tableau de bord</Link>
              <button onClick={() => signOut()} className="block text-orange-500 font-medium">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link href="/inscription" className="block bg-orange-500 text-white text-center py-2 rounded-lg font-medium" onClick={() => setMenuOpen(false)}>S&apos;inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

