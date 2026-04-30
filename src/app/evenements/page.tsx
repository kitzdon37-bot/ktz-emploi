import { prisma } from "@/lib/prisma";
import { CalendarDays, MapPin, ExternalLink, Inbox } from "lucide-react";

function formatEventDate(date: Date) {
  return {
    day: new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date).replace(".", ""),
    year: new Intl.DateTimeFormat("fr-FR", { year: "numeric" }).format(date),
    full: new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date),
  };
}

export default async function EvenementsPage() {
  const events = await prisma.recruitmentEvent.findMany({
    where: { published: true, date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CalendarDays className="h-5 w-5 text-orange-500" />
            <span className="text-orange-500 font-semibold text-sm">KTZ Emploi</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Événements de recrutement
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Forums, salons et journées de recrutement à venir en République Centrafricaine
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="h-14 w-14 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold text-gray-500 mb-1">Aucun événement à venir</p>
            <p className="text-sm text-gray-400">
              Les prochains événements de recrutement seront affichés ici.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-14 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block" />

            <div className="space-y-6">
              {events.map((event) => {
                const d = formatEventDate(event.date);
                return (
                  <div key={event.id} className="flex gap-4 sm:gap-6 items-start">
                    {/* Date badge */}
                    <div className="flex-shrink-0 w-16 sm:w-28 flex flex-col items-center">
                      <div className="bg-orange-500 text-white rounded-xl px-3 py-2 text-center shadow-sm relative z-10">
                        <div className="text-xl font-bold leading-none">{d.day}</div>
                        <div className="text-xs font-medium uppercase opacity-90 mt-0.5">
                          {d.month}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 hidden sm:block">{d.year}</div>
                    </div>

                    {/* Event card */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-5 hover:border-orange-200 hover:shadow-sm transition-all">
                      <h2 className="font-bold text-gray-900 text-base mb-1">{event.title}</h2>

                      <p className="text-xs text-gray-400 mb-2">
                        <CalendarDays className="h-3.5 w-3.5 inline mr-1" />
                        {d.full}
                      </p>

                      {event.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-2">
                          <MapPin className="h-4 w-4 text-orange-400 flex-shrink-0" />
                          {event.location}
                        </p>
                      )}

                      {event.description && (
                        <p className="text-sm text-gray-500 leading-relaxed mb-3">
                          {event.description}
                        </p>
                      )}

                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Plus d&apos;informations
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
