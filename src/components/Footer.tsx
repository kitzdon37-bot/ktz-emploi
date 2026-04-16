import Link from "next/link";
import { Briefcase, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">KTZ<span className="text-yellow-400"> Emploi</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              La première plateforme d&apos;emploi dédiée à la République Centrafricaine.
              Connectez talent et opportunités.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <span>Bangui, République Centrafricaine</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <Mail className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <span>contact@ktz-emploi.cf</span>
            </div>
          </div>

          {/* For jobseekers */}
          <div>
            <h3 className="font-semibold text-white mb-4">Candidats</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/emplois" className="hover:text-yellow-400 transition-colors">Offres d&apos;emploi</Link></li>
              <li><Link href="/emplois?type=Stage" className="hover:text-yellow-400 transition-colors">Stages</Link></li>
              <li><Link href="/emplois?type=Alternance" className="hover:text-yellow-400 transition-colors">Alternance</Link></li>
              <li><Link href="/conseils" className="hover:text-yellow-400 transition-colors">Conseils carrière</Link></li>
              <li><Link href="/inscription" className="hover:text-yellow-400 transition-colors">Créer un compte</Link></li>
            </ul>
          </div>

          {/* For employers */}
          <div>
            <h3 className="font-semibold text-white mb-4">Recruteurs</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/inscription?role=employer" className="hover:text-yellow-400 transition-colors">Publier une offre</Link></li>
              <li><Link href="/entreprises" className="hover:text-yellow-400 transition-colors">Annuaire entreprises</Link></li>
              <li><Link href="/tarifs" className="hover:text-yellow-400 transition-colors">Tarifs</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-400 transition-colors">Nous contacter</Link></li>
            </ul>
          </div>

          {/* Sectors */}
          <div>
            <h3 className="font-semibold text-white mb-4">Secteurs populaires</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/emplois?category=Humanitaire+%26+ONG" className="hover:text-yellow-400 transition-colors">Humanitaire & ONG</Link></li>
              <li><Link href="/emplois?category=Informatique+%26+T%C3%A9l%C3%A9coms" className="hover:text-yellow-400 transition-colors">Informatique</Link></li>
              <li><Link href="/emplois?category=Médecine+%26+Santé" className="hover:text-yellow-400 transition-colors">Santé</Link></li>
              <li><Link href="/emplois?category=Banque+%26+Finance" className="hover:text-yellow-400 transition-colors">Banque & Finance</Link></li>
              <li><Link href="/emplois?category=Éducation+%26+Formation" className="hover:text-yellow-400 transition-colors">Éducation</Link></li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 mt-10 mb-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} KTZ Emploi — Tous droits réservés</p>
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="hover:text-gray-300 transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-gray-300 transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-gray-300 transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

