import Link from "next/link";
import { MapPin, Clock, Banknote, Star } from "lucide-react";
import { formatSalary, timeAgo } from "@/lib/utils";

interface JobCardProps {
  job: {
    id: string;
    slug: string;
    title: string;
    type: string;
    category: string;
    location: string;
    remote: boolean;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string;
    featured: boolean;
    coverImage?: string | null;
    createdAt: Date | string;
    company: {
      name: string;
      logo?: string | null;
      verified: boolean;
      superRecruiter?: boolean;
    };
  };
}

const TYPE_COLORS: Record<string, string> = {
  CDI: "bg-orange-100 text-orange-700",
  CDD: "bg-blue-100 text-blue-700",
  Stage: "bg-orange-100 text-orange-700",
  Alternance: "bg-purple-100 text-purple-700",
  Freelance: "bg-yellow-100 text-yellow-700",
  "Temps partiel": "bg-pink-100 text-pink-700",
  Bénévolat: "bg-gray-100 text-gray-700",
};

export default function JobCard({ job }: JobCardProps) {
  const initials = job.company.name.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/emplois/${job.slug}`}
      className={`flex flex-col bg-white rounded-xl border transition-all hover:shadow-md hover:border-orange-200 overflow-hidden relative ${
        job.featured ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-200"
      }`}
    >
      {job.featured && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full border border-yellow-200">
          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          À la une
        </div>
      )}

      {/* Zone visuelle en haut : cover image ou logo en grand */}
      {job.coverImage ? (
        <div className="relative h-24 bg-gray-100 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={job.coverImage}
            alt={job.title}
            className="w-full h-full object-cover"
          />
          {/* Logo en overlay bas-gauche */}
          {job.company.logo && (
            <div className="absolute bottom-2 left-3 w-8 h-8 rounded-lg bg-white shadow border border-gray-100 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-100 flex-shrink-0">
          {job.company.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company.logo}
              alt={job.company.name}
              className="max-h-20 max-w-[160px] object-contain"
            />
          ) : (
            <span className="text-2xl font-bold text-orange-300">{initials}</span>
          )}
        </div>
      )}

      {/* Contenu */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-xs text-gray-500 font-medium truncate">{job.company.name}</span>
          {job.company.verified && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100">✓</span>
          )}
          {job.company.superRecruiter && (
            <span className="flex items-center gap-0.5 text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full border border-yellow-200 font-medium">
              <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" /> Super Recruteur
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 flex-1">
          {job.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[job.type] || "bg-gray-100 text-gray-700"}`}>
            {job.type}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-3 w-3" />
            {job.remote ? "Télétravail" : job.location}
          </span>
          {(job.salaryMin || job.salaryMax) && (
            <span className="flex items-center gap-1 text-gray-500">
              <Banknote className="h-3 w-3" />
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{job.category}</span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {timeAgo(job.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
