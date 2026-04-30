"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Users, ExternalLink, MessageCircle, Mail, Building2, CheckCircle, Star } from "lucide-react";
import Link from "next/link";

interface CompanyInfo {
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  sector?: string | null;
  size?: string | null;
  location?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  verified: boolean;
  superRecruiter: boolean;
  allowContact: boolean;
}

export default function CompanyPopup({ company }: { company: CompanyInfo }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const initials = company.name.slice(0, 2).toUpperCase();
  const waLink = company.phone
    ? `https://wa.me/${company.phone.replace(/[^\d+]/g, "")}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={() => setShow(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideUp .28s cubic-bezier(.22,.68,0,1.2)" }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-orange-50 via-orange-50 to-amber-100 px-6 pt-7 pb-5">
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 rounded-full p-1.5 shadow-sm transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-white border border-orange-100 shadow flex items-center justify-center font-bold text-orange-600 text-xl flex-shrink-0 overflow-hidden">
              {company.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="h-7 w-7 text-orange-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className="font-bold text-gray-900 text-lg leading-tight">{company.name}</span>
                {company.verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
                {company.superRecruiter && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                )}
              </div>
              {company.sector && (
                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                  {company.sector}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Corps */}
        <div className="px-6 py-4 space-y-4">
          {/* Infos rapides */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
            {company.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                {company.location}
              </span>
            )}
            {company.size && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-orange-400" />
                {company.size}
              </span>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-orange-500 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Site web
              </a>
            )}
          </div>

          {/* Description */}
          {company.description ? (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {company.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">Aucune description disponible pour cette entreprise.</p>
          )}

          {/* Boutons de contact — uniquement si le recruteur l'a autorisé */}
          {company.allowContact && (waLink || company.email) && (
            <div className="pt-1 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Contacter le recruteur
              </p>
              <div className="flex gap-2">
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-2 pt-1">
            <Link
              href={`/entreprises/${company.slug}`}
              onClick={() => setShow(false)}
              className="flex-1 text-center text-sm text-orange-500 hover:text-orange-600 font-medium border border-orange-100 rounded-xl py-2.5 hover:bg-orange-50 transition-colors"
            >
              Voir l&apos;entreprise
            </Link>
            <button
              onClick={() => setShow(false)}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Voir l&apos;offre
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
