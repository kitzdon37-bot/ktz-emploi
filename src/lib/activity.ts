import { prisma } from "@/lib/prisma";

export type ActivityType =
  | "USER_REGISTERED"
  | "JOB_PUBLISHED"
  | "JOB_DELETED"
  | "APPLICATION_SUBMITTED"
  | "SUBSCRIPTION_REQUESTED"
  | "SUBSCRIPTION_ACTIVATED"
  | "SUBSCRIPTION_CANCELLED"
  | "COMPANY_UPDATED"
  | "PROFILE_UPDATED"
  | "PAGE_VIEW";

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  USER_REGISTERED: "Nouvelle inscription",
  JOB_PUBLISHED: "Offre publiée",
  JOB_DELETED: "Offre supprimée",
  APPLICATION_SUBMITTED: "Candidature envoyée",
  SUBSCRIPTION_REQUESTED: "Demande d'abonnement",
  SUBSCRIPTION_ACTIVATED: "Abonnement activé",
  SUBSCRIPTION_CANCELLED: "Abonnement annulé",
  COMPANY_UPDATED: "Profil entreprise mis à jour",
  PROFILE_UPDATED: "Profil candidat mis à jour",
  PAGE_VIEW: "Visite du site",
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  USER_REGISTERED: "👤",
  JOB_PUBLISHED: "📋",
  JOB_DELETED: "🗑️",
  APPLICATION_SUBMITTED: "📨",
  SUBSCRIPTION_REQUESTED: "💳",
  SUBSCRIPTION_ACTIVATED: "✅",
  SUBSCRIPTION_CANCELLED: "❌",
  COMPANY_UPDATED: "🏢",
  PROFILE_UPDATED: "✏️",
  PAGE_VIEW: "👁️",
};

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  USER_REGISTERED: "bg-blue-100 text-blue-700",
  JOB_PUBLISHED: "bg-orange-100 text-orange-700",
  JOB_DELETED: "bg-red-100 text-red-700",
  APPLICATION_SUBMITTED: "bg-purple-100 text-purple-700",
  SUBSCRIPTION_REQUESTED: "bg-yellow-100 text-yellow-700",
  SUBSCRIPTION_ACTIVATED: "bg-green-100 text-green-700",
  SUBSCRIPTION_CANCELLED: "bg-gray-100 text-gray-600",
  COMPANY_UPDATED: "bg-indigo-100 text-indigo-700",
  PROFILE_UPDATED: "bg-teal-100 text-teal-700",
  PAGE_VIEW: "bg-gray-100 text-gray-600",
};

interface LogOptions {
  userId?: string;
  userEmail?: string;
  userName?: string;
  type: ActivityType;
  label?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(opts: LogOptions) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: opts.userId ?? null,
        userEmail: opts.userEmail ?? null,
        userName: opts.userName ?? null,
        type: opts.type,
        label: opts.label ?? ACTIVITY_LABELS[opts.type],
        metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
      },
    });
  } catch {
    // Ne jamais bloquer l'action principale si le log échoue
  }
}
