import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Mise en page simple pour les pages de texte (contact, mentions légales…)
export default function TextPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-orange-500">Accueil</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-700">{title}</span>
      </nav>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {updated && <p className="text-sm text-gray-400 mb-8">Dernière mise à jour : {updated}</p>}
      <div className="space-y-6 text-gray-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-orange-600 [&_a:hover]:underline">
        {children}
      </div>
    </div>
  );
}
