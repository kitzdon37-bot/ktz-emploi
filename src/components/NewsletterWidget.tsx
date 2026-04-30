"use client";

import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export default function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), frequency }),
    });

    const data = await res.json();

    if (res.ok || res.status === 200) {
      setStatus("success");
      setMessage(data.message ?? "Abonnement confirmé !");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Une erreur est survenue.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
        <CheckCircle className="text-green-500 shrink-0" size={22} />
        <p className="text-green-800 text-sm font-medium">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="votre@email.com"
            className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60 whitespace-nowrap"
        >
          {status === "loading" ? <Loader2 size={15} className="animate-spin" /> : null}
          S&apos;abonner
        </button>
      </div>

      <div className="flex gap-4 text-xs text-gray-500">
        {(["weekly", "monthly"] as const).map((f) => (
          <label key={f} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="newsletter-freq"
              value={f}
              checked={frequency === f}
              onChange={() => setFrequency(f)}
              className="accent-orange-500"
            />
            {f === "weekly" ? "Hebdomadaire" : "Mensuelle"}
          </label>
        ))}
      </div>

      {status === "error" && (
        <p className="text-xs text-red-500">{message}</p>
      )}
    </form>
  );
}
