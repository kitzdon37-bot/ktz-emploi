"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Briefcase, Menu, X, Bell, User, LogOut, Settings, Building2, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo seul à gauche */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="bg-orange-500 p-1.5 rounded-lg transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">KTZ<span className="text-orange-500"> Emploi</span></span>
          </Link>

          {/* Liens + auth — tout à droite */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/emplois" className="link-underline text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
              Offres d&apos;emploi
            </Link>
            <Link href="/entreprises" className="link-underline text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
              Entreprises
            </Link>
            <Link href="/conseils" className="link-underline text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
              Conseils carrière
            </Link>
            <Link href="/a-propos" className="link-underline text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
              À propos
            </Link>
            {(!session || (session.user as { role?: string })?.role === "EMPLOYER") && (
              <Link href="/tarifs" className="link-underline text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                Tarifs
              </Link>
            )}

            {/* Séparateur vertical */}
            <div className="w-px h-5 bg-gray-200" />

            {session ? (
              <>
                {(session.user as { role?: string })?.role === "EMPLOYER" && (
                  <Link
                    href="/tableau-de-bord/publier"
                    className="btn-press bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    Publier une offre
                  </Link>
                )}

                {/* Menu utilisateur connecté */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-sm font-medium">{session.user?.name?.split(" ")[0]}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-scale-in origin-top-right">
                      <Link
                        href="/tableau-de-bord"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Mon espace
                      </Link>
                      {(session.user as { role?: string })?.role === "EMPLOYER" && (
                        <Link
                          href="/tableau-de-bord/entreprise"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Building2 className="h-4 w-4" />
                          Mon entreprise
                        </Link>
                      )}
                      {(session.user as { role?: string })?.role === "JOBSEEKER" && (
                        <Link
                          href="/tableau-de-bord/candidatures"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Bell className="h-4 w-4" />
                          Mes candidatures
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => { signOut({ callbackUrl: "/connexion" }); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-orange-500 hover:bg-orange-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Bouton Se connecter → dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <User className="h-4 w-4" />
                  Se connecter
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-scale-in origin-top-right">
                    <Link
                      href="/connexion"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/inscription"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      S&apos;inscrire
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 animate-slide-up">
          <Link href="/emplois" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Offres d&apos;emploi</Link>
          <Link href="/entreprises" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Entreprises</Link>
          <Link href="/conseils" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Conseils carrière</Link>
          <Link href="/a-propos" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>À propos</Link>
          {(!session || (session.user as { role?: string })?.role === "EMPLOYER") && (
            <Link href="/tarifs" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Tarifs</Link>
          )}
          <hr />
          {session ? (
            <>
              {(session.user as { role?: string })?.role === "EMPLOYER" && (
                <Link
                  href="/tableau-de-bord/publier"
                  className="block bg-orange-500 text-white text-center py-2.5 rounded-full font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Publier une offre
                </Link>
              )}
              <Link href="/tableau-de-bord" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Mon espace</Link>
              {(session.user as { role?: string })?.role === "EMPLOYER" && (
                <Link href="/tableau-de-bord/entreprise" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Mon entreprise</Link>
              )}
              {(session.user as { role?: string })?.role === "JOBSEEKER" && (
                <Link href="/tableau-de-bord/candidatures" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Mes candidatures</Link>
              )}
              <button onClick={() => { signOut({ callbackUrl: "/connexion" }); setMenuOpen(false); }} className="block text-orange-500 font-medium">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Se connecter</Link>
              <Link href="/inscription" className="block bg-gray-900 text-white text-center py-2.5 rounded-full font-medium" onClick={() => setMenuOpen(false)}>S&apos;inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
