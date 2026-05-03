export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Logo / Nom */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">KTZ Emploi</h1>
          <p className="text-blue-200 text-lg">La plateforme emploi de la République Centrafricaine</p>
        </div>

        {/* Message principal */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-10 mb-8 border border-white/20">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Bientôt disponible
          </h2>
          <p className="text-blue-100 text-base leading-relaxed">
            Nous travaillons dur pour vous offrir la meilleure expérience.
            Le site sera lancé très prochainement.
          </p>
        </div>

        {/* Contact */}
        <p className="text-blue-200 text-sm">
          Contact :{" "}
          <a href="mailto:kitzdon37@gmail.com" className="text-white underline hover:no-underline">
            kitzdon37@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
