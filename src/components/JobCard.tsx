import Link from "next/link";
import { MapPin, Clock, Banknote, Building2, Star } from "lucide-react";
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
    createdAt: Date | string;
    company: {
      name: string;
      logo?: string | null;
      verified: boolean;
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
      className={`block bg-white rounded-xl border transition-all hover:shadow-md hover:border-orange-200 p-5 relative ${
        job.featured ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-200"
      }`}
    >
      {job.featured && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full border border-yellow-200">
          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          À la une
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center border border-orange-100 font-bold text-orange-600 text-sm">
          {job.company.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain rounded-xl" />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm text-gray-500 font-medium truncate">{job.company.name}</span>
            {job.company.verified && (
              <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100">✓</span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2 pr-16">
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

            <span className="flex items-center gap-1 text-gray-400 ml-auto">
              <Clock className="h-3 w-3" />
              {timeAgo(job.createdAt)}
            </span>
          </div>

          <div className="mt-2">
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{job.category}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

