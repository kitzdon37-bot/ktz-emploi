import { CvData, CvTemplate } from "@/types/cv";

interface Props {
  data: CvData;
  template: CvTemplate;
}

/* ── Utilitaires ───────────────────────────────────────────────────────────── */
function formatPeriod(start: string, end: string, current: boolean) {
  if (!start) return "";
  const fmt = (s: string) => {
    if (!s) return "";
    const [y, m] = s.split("-");
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    return m ? `${months[parseInt(m) - 1]} ${y}` : y;
  };
  return `${fmt(start)} – ${current ? "Présent" : fmt(end)}`;
}

/* ── Template MODERN (orange / sombre) ─────────────────────────────────────── */
function ModernPreview({ data }: { data: CvData }) {
  return (
    <div className="bg-white w-full font-sans text-[13px] leading-relaxed" style={{ minHeight: "297mm" }}>
      {/* Header */}
      <div className="bg-gray-900 text-white px-8 py-7">
        <h1 className="text-3xl font-bold tracking-wide">
          {data.firstName || "Prénom"} <span className="text-orange-400">{data.lastName || "NOM"}</span>
        </h1>
        {data.title && <p className="text-orange-300 text-base mt-1 font-medium">{data.title}</p>}
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-gray-300 text-xs">
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
          {data.website && <span>🌐 {data.website}</span>}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 bg-gray-50 border-r border-gray-200 px-5 py-6 flex-shrink-0">
          {data.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-3">Compétences</h3>
              <div className="space-y-2">
                {data.skills.map((s) => (
                  <div key={s.id}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-gray-700">{s.name}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: `${(s.level / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-3">Langues</h3>
              <div className="space-y-1.5">
                {data.languages.map((l) => (
                  <div key={l.id} className="text-xs">
                    <span className="font-medium text-gray-700">{l.name}</span>
                    <span className="text-gray-400"> — {l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main */}
        <div className="flex-1 px-7 py-6">
          {data.summary && (
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">Profil</h3>
              <p className="text-gray-600 text-xs leading-relaxed">{data.summary}</p>
            </div>
          )}
          {data.experiences.length > 0 && (
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-3">Expériences</h3>
              <div className="space-y-4">
                {data.experiences.map((e) => (
                  <div key={e.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800 text-xs">{e.position}</p>
                        <p className="text-orange-500 text-xs">{e.company}{e.location ? ` · ${e.location}` : ""}</p>
                      </div>
                      <p className="text-gray-400 text-[10px] whitespace-nowrap ml-2">{formatPeriod(e.startDate, e.endDate, e.current)}</p>
                    </div>
                    {e.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{e.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-3">Formation</h3>
              <div className="space-y-3">
                {data.education.map((e) => (
                  <div key={e.id}>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 text-xs">{e.degree}{e.field ? ` — ${e.field}` : ""}</p>
                        <p className="text-orange-500 text-xs">{e.school}</p>
                      </div>
                      <p className="text-gray-400 text-[10px] whitespace-nowrap ml-2">{formatPeriod(e.startDate, e.endDate, e.current)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.interests && data.interests.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">Centres d&apos;intérêts</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.interests.map((i) => (
                  <span key={i} className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px] px-2 py-0.5 rounded-full">{i}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Template CLASSIC (noir / blanc professionnel) ──────────────────────────── */
function ClassicPreview({ data }: { data: CvData }) {
  return (
    <div className="bg-white w-full font-serif text-[13px] leading-relaxed px-10 py-8" style={{ minHeight: "297mm" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-900 pb-5 mb-5">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">
          {data.firstName || "Prénom"} {data.lastName || "NOM"}
        </h1>
        {data.title && <p className="text-gray-600 text-sm mt-1 italic">{data.title}</p>}
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-1 mt-3 text-gray-500 text-xs">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>

      {data.summary && (
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Profil Professionnel</h3>
          <div className="border-t border-gray-300 pt-2">
            <p className="text-gray-600 text-xs leading-relaxed">{data.summary}</p>
          </div>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Expériences Professionnelles</h3>
          <div className="border-t border-gray-300 pt-3 space-y-4">
            {data.experiences.map((e) => (
              <div key={e.id} className="flex gap-4">
                <div className="w-28 flex-shrink-0 text-right">
                  <p className="text-[10px] text-gray-400">{formatPeriod(e.startDate, e.endDate, e.current)}</p>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-xs">{e.position}</p>
                  <p className="text-gray-600 text-xs italic">{e.company}{e.location ? `, ${e.location}` : ""}</p>
                  {e.description && <p className="text-gray-500 text-xs mt-1">{e.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Formation</h3>
          <div className="border-t border-gray-300 pt-3 space-y-3">
            {data.education.map((e) => (
              <div key={e.id} className="flex gap-4">
                <div className="w-28 flex-shrink-0 text-right">
                  <p className="text-[10px] text-gray-400">{formatPeriod(e.startDate, e.endDate, e.current)}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs">{e.degree}{e.field ? ` en ${e.field}` : ""}</p>
                  <p className="text-gray-600 text-xs italic">{e.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {data.skills.length > 0 && (
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Compétences</h3>
            <div className="border-t border-gray-300 pt-2">
              <p className="text-xs text-gray-600">{data.skills.map((s) => s.name).join(" · ")}</p>
            </div>
          </div>
        )}
        {data.languages.length > 0 && (
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Langues</h3>
            <div className="border-t border-gray-300 pt-2">
              <p className="text-xs text-gray-600">{data.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}</p>
            </div>
          </div>
        )}
      </div>
      {data.interests && data.interests.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Centres d&apos;intérêts</h3>
          <div className="border-t border-gray-300 pt-2">
            <p className="text-xs text-gray-600">{data.interests.join(" · ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Template CREATIVE (teal / coloré) ─────────────────────────────────────── */
function CreativePreview({ data }: { data: CvData }) {
  return (
    <div className="bg-white w-full font-sans text-[13px] flex" style={{ minHeight: "297mm" }}>
      {/* Left column */}
      <div className="w-52 bg-teal-700 text-white px-5 py-7 flex-shrink-0">
        <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center mb-4 text-2xl font-bold">
          {(data.firstName?.[0] || "?")}{(data.lastName?.[0] || "")}
        </div>
        <h1 className="text-lg font-bold leading-tight">
          {data.firstName || "Prénom"}<br /><span className="text-teal-200">{data.lastName || "NOM"}</span>
        </h1>
        {data.title && <p className="text-teal-300 text-xs mt-1">{data.title}</p>}

        <div className="mt-5 space-y-1.5 text-xs text-teal-100">
          {data.email && <p>✉ {data.email}</p>}
          {data.phone && <p>📞 {data.phone}</p>}
          {data.location && <p>📍 {data.location}</p>}
          {data.linkedin && <p>in {data.linkedin}</p>}
        </div>

        {data.skills.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-teal-300 mb-2">Compétences</h3>
            <div className="space-y-2">
              {data.skills.map((s) => (
                <div key={s.id}>
                  <p className="text-xs text-white mb-0.5">{s.name}</p>
                  <div className="h-1 bg-teal-800 rounded-full">
                    <div className="h-1 bg-teal-300 rounded-full" style={{ width: `${(s.level / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="mt-5">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-teal-300 mb-2">Langues</h3>
            <div className="space-y-1">
              {data.languages.map((l) => (
                <div key={l.id} className="text-xs">
                  <span className="text-white">{l.name}</span>
                  <span className="text-teal-300"> · {l.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right main */}
      <div className="flex-1 px-7 py-7">
        {data.summary && (
          <div className="mb-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-600 border-b border-teal-200 pb-1 mb-2">À propos</h3>
            <p className="text-gray-600 text-xs leading-relaxed">{data.summary}</p>
          </div>
        )}
        {data.experiences.length > 0 && (
          <div className="mb-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-600 border-b border-teal-200 pb-1 mb-3">Expériences</h3>
            <div className="space-y-4">
              {data.experiences.map((e) => (
                <div key={e.id} className="pl-3 border-l-2 border-teal-200">
                  <div className="flex justify-between">
                    <p className="font-bold text-gray-800 text-xs">{e.position}</p>
                    <p className="text-teal-500 text-[10px]">{formatPeriod(e.startDate, e.endDate, e.current)}</p>
                  </div>
                  <p className="text-teal-600 text-xs">{e.company}{e.location ? ` · ${e.location}` : ""}</p>
                  {e.description && <p className="text-gray-500 text-xs mt-1">{e.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {data.education.length > 0 && (
          <div className="mb-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-600 border-b border-teal-200 pb-1 mb-3">Formation</h3>
            <div className="space-y-3">
              {data.education.map((e) => (
                <div key={e.id} className="pl-3 border-l-2 border-teal-200">
                  <div className="flex justify-between">
                    <p className="font-bold text-gray-800 text-xs">{e.degree}{e.field ? ` — ${e.field}` : ""}</p>
                    <p className="text-teal-500 text-[10px]">{formatPeriod(e.startDate, e.endDate, e.current)}</p>
                  </div>
                  <p className="text-teal-600 text-xs">{e.school}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.interests && data.interests.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-600 border-b border-teal-200 pb-1 mb-2">Centres d&apos;intérêts</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.interests.map((i) => (
                <span key={i} className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] px-2 py-0.5 rounded-full">{i}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Export ─────────────────────────────────────────────────────────────────── */
export default function CvPreview({ data, template }: Props) {
  if (template === "classic") return <ClassicPreview data={data} />;
  if (template === "creative") return <CreativePreview data={data} />;
  return <ModernPreview data={data} />;
}
