"use client";

import { useState } from "react";
import { Star, X, Loader2, CheckCircle } from "lucide-react";

interface Props {
  companySlug: string;
}

export default function ReviewModal({ companySlug }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Veuillez sélectionner une note.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/company/${companySlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, pros, cons, anonymous }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    // Reset after close animation
    setTimeout(() => {
      setSuccess(false);
      setRating(0);
      setPros("");
      setCons("");
      setAnonymous(true);
      setError("");
    }, 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
      >
        <Star className="h-4 w-4" />
        Laisser un avis
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Laisser un avis</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Merci pour votre avis !</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Votre avis a été soumis et sera affiché après validation.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Star rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note globale <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-gray-500">
                        {["", "Très mauvais", "Mauvais", "Correct", "Bien", "Excellent"][rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Points positifs
                  </label>
                  <textarea
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    rows={3}
                    placeholder="Ce que vous avez apprécié dans cette entreprise..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>

                {/* Cons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Points négatifs
                  </label>
                  <textarea
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    rows={3}
                    placeholder="Ce qui pourrait être amélioré..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>

                {/* Anonymous toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        anonymous ? "bg-orange-500" : "bg-gray-200"
                      }`}
                    />
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        anonymous ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    Publier anonymement
                  </span>
                </label>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || rating === 0}
                    className="flex-1 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 disabled:bg-orange-300 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Envoyer l&apos;avis
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
