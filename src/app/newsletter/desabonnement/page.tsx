import Link from "next/link";
import { CheckCircle, Info } from "lucide-react";

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <UnsubscribeContent searchParams={searchParams} />
  );
}

async function UnsubscribeContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const already = status === "already";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full text-center space-y-5">
        {already ? (
          <Info className="mx-auto text-gray-400" size={48} />
        ) : (
          <CheckCircle className="mx-auto text-green-500" size={48} />
        )}

        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {already ? "Déjà désabonné" : "Désabonnement confirmé"}
          </h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {already
              ? "Vous étiez déjà désabonné de notre newsletter."
              : "Vous ne recevrez plus nos emails. Vous pouvez vous réabonner à tout moment depuis notre site."}
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
