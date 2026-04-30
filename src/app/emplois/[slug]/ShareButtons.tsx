"use client";
import { Share2 } from "lucide-react";

export default function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/emplois/${slug}` : `/emplois/${slug}`;
  const text = `Offre d'emploi : ${title}`;

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
      <span className="text-xs text-gray-400 flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> Partager :</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Facebook
      </a>
      <button
        onClick={() => { navigator.clipboard.writeText(url); }}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Copier le lien
      </button>
    </div>
  );
}
