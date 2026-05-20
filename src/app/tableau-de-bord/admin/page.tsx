"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users, Mail, Search, CheckSquare, Square, Send,
  Briefcase, MapPin, Tag, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp,
  ClipboardList, Check, X, Building2, Clock, Shield, UserCog, ChevronDown as ChevDown,
  Star, BadgeCheck, Eye, EyeOff, Banknote, CalendarDays, GraduationCap,
  List, Trash2, Pencil, Save, ToggleLeft, ToggleRight,
  BarChart2, Download, Flag, Settings, FileText, CreditCard, Bell
} from "lucide-react";
import { JOB_CATEGORIES, JOB_TYPES, RCA_LOCATIONS, APPLICATION_STATUSES } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  profile: {
    title: string | null;
    location: string | null;
    skills: string | null;
  } | null;
  matchCount: number;
  matchedJobs: {
    id: string;
    title: string;
    slug: string;
    type: string;
    location: string;
    company: { name: string };
  }[];
}

interface SendResult {
  email: string;
  sent: boolean;
  jobCount: number;
  error?: string;
}

interface AdminCompany {
  id: string;
  name: string;
  logo: string | null;
  sector: string | null;
  verified: boolean;
  superRecruiter: boolean;
  suspended?: boolean;
  _count: { jobs: number };
}

interface SiteUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  suspended?: boolean;
  createdAt: string;
  image: string | null;
}

interface StatsData {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  newUsersLast7Days: number;
  newJobsLast7Days: number;
  newApplicationsLast7Days: number;
  topSectors: { category: string; _count: { id: number } }[];
  expiringJobs: { id: string; title: string; deadline: string; company: { name: string } }[];
  pendingJobsCount: number;
  suspendedUsersCount: number;
  suspendedCompaniesCount: number;
  pendingReportsCount: number;
}

interface AdminApplication {
  id: string;
  status: string;
  createdAt: string;
  coverLetter: string | null;
  cvUrl: string | null;
  job: { title: string; slug: string; company: { name: string } };
  user: { name: string | null; email: string };
}

interface AdminReport {
  id: string;
  type: string;
  targetId: string;
  targetName: string;
  reason: string;
  details: string | null;
  reporterId: string | null;
  status: string;
  createdAt: string;
}

interface PendingJob {
  id: string;
  title: string;
  type: string;
  category: string;
  location: string;
  remote: boolean;
  description: string;
  requirements: string | null;
  benefits: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  experienceLevel: string | null;
  deadline: string | null;
  createdAt: string;
  company: { name: string; logo: string | null; sector: string };
}

interface AllJob {
  id: string;
  title: string;
  type: string;
  category: string;
  location: string;
  remote: boolean;
  description: string;
  requirements: string | null;
  benefits: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  experienceLevel: string | null;
  deadline: string | null;
  published: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
  company: { name: string; logo: string | null; sector: string };
  _count: { applications: number };
}

interface ModerationJob {
  id: string;
  title: string;
  type: string;
  location: string;
  published: boolean;
  createdAt: string;
  company: { name: string; logo: string | null };
  _count: { applications: number };
}

interface LogEntry {
  id: string; type: string; label: string; userEmail: string | null;
  userName: string | null; metadata: string | null; createdAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  return `il y a ${Math.floor(hrs / 24)}j`;
}

function ActivityTab({
  logs, loading, filter, onFilterChange, onRefresh, colors, icons,
}: {
  logs: LogEntry[];
  loading: boolean;
  filter: string;
  onFilterChange: (v: string) => void;
  onRefresh: () => void;
  colors: Record<string, string>;
  icons: Record<string, string>;
}) {
  const filtered = filter ? logs.filter(l => l.type === filter) : logs;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-semibold text-gray-900 text-lg">Journal d&apos;activité</h2>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={e => onFilterChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">Tous les types</option>
            <option value="USER_REGISTERED">Inscriptions</option>
            <option value="JOB_PUBLISHED">Offres publiées</option>
            <option value="JOB_DELETED">Offres supprimées</option>
            <option value="APPLICATION_SUBMITTED">Candidatures</option>
            <option value="SUBSCRIPTION_REQUESTED">Abonnements demandés</option>
            <option value="SUBSCRIPTION_ACTIVATED">Abonnements activés</option>
            <option value="SUBSCRIPTION_CANCELLED">Abonnements annulés</option>
            <option value="COMPANY_UPDATED">Entreprises modifiées</option>
            <option value="PROFILE_UPDATED">Profils modifiés</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart2 className="h-4 w-4" />}
            Actualiser
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BarChart2 className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="font-medium text-gray-500">Aucune activité enregistrée</p>
          <p className="text-sm text-gray-400 mt-1">Les actions des utilisateurs apparaîtront ici</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {filtered.map(log => (
            <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
              <span className="text-xl flex-shrink-0 mt-0.5">{icons[log.type] ?? "🔹"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[log.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {log.type.replace(/_/g, " ")}
                  </span>
                  {log.userName && <span className="text-xs text-gray-600 font-medium">{log.userName}</span>}
                  {log.userEmail && <span className="text-xs text-gray-400">{log.userEmail}</span>}
                </div>
                <p className="text-sm text-gray-800">{log.label}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 mt-1">{timeAgo(log.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type AdminTab = "offres" | "toutes-offres" | "moderation" | "recruteurs" | "candidats" | "utilisateurs" | "stats" | "all-applications" | "reports" | "settings" | "abonnements" | "activite" | "messages" | "visiteurs";

function AdminDashboard() {
  const searchParamsHook = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>("offres");

  // --- Activité ---
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState("");

  // --- Visiteurs ---
  const [visitors, setVisitors] = useState<LogEntry[]>([]);
  const [visitorsLoading, setVisitorsLoading] = useState(false);

  async function loadVisiteurs() {
    setVisitorsLoading(true);
    try {
      const r = await fetch("/api/admin/activity?type=PAGE_VIEW&limit=200");
      const d = await r.json();
      setVisitors(Array.isArray(d) ? d : []);
    } finally { setVisitorsLoading(false); }
  }

  async function loadActivity() {
    setActivityLoading(true);
    try {
      const r = await fetch("/api/admin/activity?limit=100");
      const d = await r.json();
      setActivityLogs(Array.isArray(d) ? d : []);
    } finally { setActivityLoading(false); }
  }

  const ACTIVITY_COLORS: Record<string, string> = {
    USER_REGISTERED: "bg-blue-100 text-blue-700",
    JOB_PUBLISHED: "bg-orange-100 text-orange-700",
    JOB_DELETED: "bg-red-100 text-red-700",
    APPLICATION_SUBMITTED: "bg-purple-100 text-purple-700",
    SUBSCRIPTION_REQUESTED: "bg-yellow-100 text-yellow-700",
    SUBSCRIPTION_ACTIVATED: "bg-green-100 text-green-700",
    SUBSCRIPTION_CANCELLED: "bg-gray-100 text-gray-600",
    COMPANY_UPDATED: "bg-indigo-100 text-indigo-700",
    PROFILE_UPDATED: "bg-teal-100 text-teal-700",
  };

  const ACTIVITY_ICONS: Record<string, string> = {
    USER_REGISTERED: "👤", JOB_PUBLISHED: "📋", JOB_DELETED: "🗑️",
    APPLICATION_SUBMITTED: "📨", SUBSCRIPTION_REQUESTED: "💳",
    SUBSCRIPTION_ACTIVATED: "✅", SUBSCRIPTION_CANCELLED: "❌",
    COMPANY_UPDATED: "🏢", PROFILE_UPDATED: "✏️",
  };

  // --- Abonnements ---
  interface CompanyWithSub {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    createdAt: string;
    _count: { jobs: number };
    subscription: {
      id: string; plan: string; status: string;
      paymentRef: string | null; paymentMethod: string | null;
      startDate: string; endDate: string | null;
      createdAt: string; updatedAt: string;
    } | null;
  }
  interface SubStats { pendingCount: number; activeCount: number; revenue: number; }
  const [subsData, setSubsData] = useState<CompanyWithSub[]>([]);
  const [subStats, setSubStats] = useState<SubStats>({ pendingCount: 0, activeCount: 0, revenue: 0 });
  const [subsLoading, setSubsLoading] = useState(false);
  const [subAction, setSubAction] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<"all" | "PENDING" | "ACTIVE" | "CANCELLED" | "FREE">("all");

  async function loadSubs() {
    setSubsLoading(true);
    try {
      const r = await fetch("/api/admin/subscriptions");
      const d = await r.json();
      setSubsData(d.companies ?? []);
      setSubStats(d.stats ?? { pendingCount: 0, activeCount: 0, revenue: 0 });
    } finally { setSubsLoading(false); }
  }

  async function handleSubAction(id: string, action: "activate" | "cancel" | "reset") {
    setSubAction(id + action);
    try {
      await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: id, action }),
      });
      await loadSubs();
    } finally { setSubAction(null); }
  }

  // --- Offres en attente ---
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobAction, setJobAction] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  // --- Toutes les offres ---
  const [allJobs, setAllJobs] = useState<AllJob[]>([]);
  const [allJobsLoading, setAllJobsLoading] = useState(false);
  const [allJobsSearch, setAllJobsSearch] = useState("");
  const [deletingJob, setDeletingJob] = useState<string | null>(null);
  const [confirmDeleteJob, setConfirmDeleteJob] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<AllJob | null>(null);
  const [editForm, setEditForm] = useState<Partial<AllJob>>({});
  const [savingJob, setSavingJob] = useState(false);
  const [notifyingJob, setNotifyingJob] = useState<string | null>(null);
  const [notifyResults, setNotifyResults] = useState<Record<string, { smsSent: number; whatsappSent: number }>>({});

  async function notifyJob(jobId: string) {
    setNotifyingJob(jobId);
    try {
      const res = await fetch("/api/admin/notify-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotifyResults(prev => ({ ...prev, [jobId]: { smsSent: data.smsSent, whatsappSent: data.whatsappSent } }));
      }
    } catch {
      // silence
    } finally {
      setNotifyingJob(null);
    }
  }

  function loadAllJobs() {
    setAllJobsLoading(true);
    fetch("/api/admin/jobs?all=true")
      .then(r => r.json())
      .then(d => { setAllJobs(d.jobs ?? []); })
      .catch(() => {})
      .finally(() => setAllJobsLoading(false));
  }

  function openEdit(job: AllJob) {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      type: job.type,
      category: job.category,
      location: job.location,
      remote: job.remote,
      description: job.description,
      requirements: job.requirements ?? "",
      benefits: job.benefits ?? "",
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      experienceLevel: job.experienceLevel ?? "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      featured: job.featured,
      published: job.published,
    });
  }

  async function saveEdit() {
    if (!editingJob) return;
    setSavingJob(true);
    const res = await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: editingJob.id, updates: editForm }),
    });
    const data = await res.json();
    if (data.success) {
      setAllJobs(prev => prev.map(j => j.id === editingJob.id ? { ...j, ...editForm } as AllJob : j));
      setEditingJob(null);
    }
    setSavingJob(false);
  }

  async function deleteJob(jobId: string) {
    setDeletingJob(jobId);
    setConfirmDeleteJob(null);
    await fetch("/api/admin/jobs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    setAllJobs(prev => prev.filter(j => j.id !== jobId));
    setDeletingJob(null);
  }

  async function toggleJobField(jobId: string, field: "featured" | "published", value: boolean) {
    const res = await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, updates: { [field]: value } }),
    });
    const data = await res.json();
    if (data.success) {
      setAllJobs(prev => prev.map(j => j.id === jobId ? { ...j, [field]: value } : j));
    }
  }

  // Charge les offres en attente une seule fois (badge dans l'onglet)
  useEffect(() => {
    fetch("/api/admin/jobs")
      .then((r) => r.json())
      .then((data) => { setPendingJobs(data.jobs ?? []); setJobsLoading(false); })
      .catch(() => setJobsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Réagit à chaque changement d'URL (clic dans la sidebar ou sur les onglets)
  useEffect(() => {
    const tab = (searchParamsHook.get("tab") as AdminTab) || "offres";
    setActiveTab(tab);
    if (tab === "abonnements" && subsData.length === 0) loadSubs();
    if (tab === "utilisateurs" && siteUsers.length === 0) loadUsers();
    if (tab === "recruteurs" && companies.length === 0) loadCompanies();
    if (tab === "stats" && !stats) loadStats();
    if (tab === "toutes-offres" && allJobs.length === 0) loadAllJobs();
    if (tab === "all-applications" && allApps.length === 0) loadAllApps();
    if (tab === "reports" && reports.length === 0) loadReports("PENDING");
    if (tab === "activite" && activityLogs.length === 0) loadActivity();
    if (tab === "visiteurs" && visitors.length === 0) loadVisiteurs();
    if (tab === "moderation" && moderationJobs.length === 0) loadModerationJobs();
    if (tab === "settings" && Object.keys(settings).length === 0) loadSettings();
  }, [searchParamsHook]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleJobAction(jobId: string, action: "approve" | "reject") {
    setJobAction(jobId + action);
    await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, action }),
    });
    setPendingJobs((prev) => prev.filter((j) => j.id !== jobId));
    setJobAction(null);
  }

  // --- Recruteurs ---
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [togglingCompany, setTogglingCompany] = useState<string | null>(null);

  function loadCompanies() {
    setCompaniesLoading(true);
    fetch("/api/admin/companies")
      .then(r => r.json())
      .then(d => { setCompanies(d.companies ?? []); })
      .catch(() => {})
      .finally(() => setCompaniesLoading(false));
  }

  async function toggleCompanyField(companyId: string, field: "superRecruiter" | "verified", value: boolean) {
    setTogglingCompany(companyId + field);
    await fetch("/api/admin/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, field, value }),
    });
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, [field]: value } : c));
    setTogglingCompany(null);
  }

  // --- Utilisateurs ---
  const [siteUsers, setSiteUsers] = useState<SiteUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  function loadUsers() {
    setUsersLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setSiteUsers(data.users ?? []); })
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }

  async function changeRole(userId: string, role: string) {
    setUpdatingRole(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    setSiteUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    setUpdatingRole(null);
  }

  const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    ADMIN:     { label: "Admin",      color: "bg-red-100 text-red-700" },
    EMPLOYER:  { label: "Recruteur",  color: "bg-blue-100 text-blue-700" },
    JOBSEEKER: { label: "Candidat",   color: "bg-gray-100 text-gray-600" },
  };

  // ─── Stats ───────────────────────────────────────────────────────────
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  function loadStats() {
    setStatsLoading(true);
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { setStats(d); })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }

  // ─── All Applications ─────────────────────────────────────────────────
  const [allApps, setAllApps] = useState<AdminApplication[]>([]);
  const [allAppsLoading, setAllAppsLoading] = useState(false);
  const [appsSearch, setAppsSearch] = useState("");
  const [appsStatusFilter, setAppsStatusFilter] = useState("");
  function loadAllApps() {
    setAllAppsLoading(true);
    fetch(`/api/admin/all-applications?search=${appsSearch}&status=${appsStatusFilter}`)
      .then(r => r.json())
      .then(d => { setAllApps(d.applications ?? []); })
      .catch(() => {})
      .finally(() => setAllAppsLoading(false));
  }

  // ─── Reports ─────────────────────────────────────────────────────────
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsFilter, setReportsFilter] = useState<"PENDING" | "REVIEWED" | "DISMISSED">("PENDING");
  function loadReports(status = "PENDING") {
    setReportsLoading(true);
    fetch(`/api/admin/reports?status=${status}`)
      .then(r => r.json())
      .then(d => { setReports(d.reports ?? []); setReportsLoading(false); });
  }
  async function handleReportAction(reportId: string, status: "REVIEWED" | "DISMISSED") {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    setReports(prev => prev.filter(r => r.id !== reportId));
  }

  // ─── WhatsApp (Green API) ─────────────────────────────────────────────
  const [waState, setWaState] = useState<"unknown" | "authorized" | "notAuthorized" | "not_configured" | "error">("unknown");
  const [waStateLoading, setWaStateLoading] = useState(false);
  const [waQR, setWaQR] = useState<string | null>(null);
  const [waQRLoading, setWaQRLoading] = useState(false);
  const [waTestPhone, setWaTestPhone] = useState("");
  const [waTesting, setWaTesting] = useState(false);
  const [waTestResult, setWaTestResult] = useState<"ok" | "fail" | null>(null);

  async function loadWaStatus() {
    setWaStateLoading(true);
    setWaQR(null);
    try {
      const res = await fetch("/api/admin/whatsapp/status");
      const data = await res.json();
      setWaState(data.state ?? "error");
    } catch {
      setWaState("error");
    } finally {
      setWaStateLoading(false);
    }
  }

  async function loadWaQR() {
    setWaQRLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp/qr");
      const data = await res.json();
      if (data.qr) setWaQR(data.qr);
    } catch {
      // ignore
    } finally {
      setWaQRLoading(false);
    }
  }

  async function testWhatsApp() {
    if (!waTestPhone) return;
    setWaTesting(true);
    setWaTestResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: waTestPhone }),
      });
      const data = await res.json();
      setWaTestResult(data.success ? "ok" : "fail");
    } catch {
      setWaTestResult("fail");
    } finally {
      setWaTesting(false);
    }
  }

  // ─── Messages directs ────────────────────────────────────────────────
  interface DirectMessage { id: string; phone: string; name: string; message: string; sentAt: string; ok: boolean; }
  const [dmSearch, setDmSearch] = useState("");
  const [dmPhone, setDmPhone] = useState("");
  const [dmName, setDmName] = useState("");
  const [dmMessage, setDmMessage] = useState("");
  const [dmSending, setDmSending] = useState(false);
  const [dmHistory, setDmHistory] = useState<DirectMessage[]>([]);
  const [dmSearchResults, setDmSearchResults] = useState<{ id: string; name: string | null; email: string; phone: string | null }[]>([]);
  const [dmSearching, setDmSearching] = useState(false);

  async function searchCandidates(q: string) {
    if (!q || q.length < 2) { setDmSearchResults([]); return; }
    setDmSearching(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}&role=JOBSEEKER&limit=8`);
      const data = await res.json();
      const withPhone = (data.users ?? []).filter((u: { phone: string | null }) => u.phone);
      setDmSearchResults(withPhone);
    } catch {
      setDmSearchResults([]);
    } finally {
      setDmSearching(false);
    }
  }

  async function sendDirectMessage() {
    if (!dmPhone || !dmMessage) return;
    setDmSending(true);
    try {
      const res = await fetch("/api/admin/whatsapp/send-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: dmPhone, message: dmMessage }),
      });
      const data = await res.json();
      const entry: DirectMessage = {
        id: Date.now().toString(),
        phone: dmPhone,
        name: dmName || dmPhone,
        message: dmMessage,
        sentAt: new Date().toISOString(),
        ok: data.success,
      };
      setDmHistory(prev => [entry, ...prev]);
      if (data.success) setDmMessage("");
    } catch {
      // ignore
    } finally {
      setDmSending(false);
    }
  }

  // ─── Settings ────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  function loadSettings() {
    setSettingsLoading(true);
    fetch("/api/admin/settings").then(r => r.json()).then(d => { setSettings(d.settings ?? {}); setSettingsLoading(false); });
  }
  async function saveSetting(key: string, value: string) {
    setSavingSettings(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSettings(p => ({ ...p, [key]: value }));
    setSavingSettings(false);
  }

  // ─── Suspend ─────────────────────────────────────────────────────────
  async function suspendUser(userId: string, suspended: boolean) {
    await fetch("/api/admin/suspend", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "user", id: userId, suspended }),
    });
    setSiteUsers(prev => prev.map(u => u.id === userId ? { ...u, suspended } : u));
  }

  async function deleteUser(userId: string, userName: string | null) {
    if (!confirm(`Supprimer définitivement le compte de ${userName || "cet utilisateur"} ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
    if (res.ok) {
      setSiteUsers(prev => prev.filter(u => u.id !== userId));
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors de la suppression");
    }
  }
  async function suspendCompany(companyId: string, suspended: boolean) {
    await fetch("/api/admin/suspend", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "company", id: companyId, suspended }),
    });
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, suspended } : c));
  }

  // ─── Modération des offres ────────────────────────────────────────────
  const [moderationJobs, setModerationJobs] = useState<ModerationJob[]>([]);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [togglingJobId, setTogglingJobId] = useState<string | null>(null);

  function loadModerationJobs() {
    setModerationLoading(true);
    fetch("/api/admin/jobs?all=true")
      .then(r => r.json())
      .then(d => {
        // Prend les offres publiées récentes (max 50) pour modération
        const jobs = (d.jobs ?? []) as ModerationJob[];
        setModerationJobs(jobs.filter((j: ModerationJob) => j.published).slice(0, 50));
        setModerationLoading(false);
      });
  }

  async function toggleJobPublished(jobId: string, published: boolean) {
    setTogglingJobId(jobId);
    const res = await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, updates: { published } }),
    });
    const data = await res.json();
    if (data.success) {
      setModerationJobs(prev => prev.map(j => j.id === jobId ? { ...j, published } : j));
    }
    setTogglingJobId(null);
  }

  // ─── Bulk jobs ────────────────────────────────────────────────────────
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  async function bulkJobAction(action: "approve" | "delete") {
    for (const jobId of selectedJobs) {
      if (action === "approve") {
        await fetch("/api/admin/jobs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, action: "approve" }),
        });
      } else {
        await fetch("/api/admin/jobs", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
      }
    }
    if (action === "approve") {
      setAllJobs(prev => prev.map(j => selectedJobs.has(j.id) ? { ...j, published: true } : j));
    } else {
      setAllJobs(prev => prev.filter(j => !selectedJobs.has(j.id)));
    }
    setSelectedJobs(new Set());
  }

  // ─── Bulk email ──────────────────────────────────────────────────────
  const [bulkEmailModal, setBulkEmailModal] = useState(false);
  const [bulkEmailSubject, setBulkEmailSubject] = useState("");
  const [bulkEmailBody, setBulkEmailBody] = useState("");
  const [bulkEmailSending, setBulkEmailSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  async function sendBulkEmail() {
    setBulkEmailSending(true);
    await fetch("/api/admin/bulk-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: Array.from(selectedUsers), subject: bulkEmailSubject, body: bulkEmailBody }),
    });
    setBulkEmailModal(false);
    setBulkEmailSending(false);
    setSelectedUsers(new Set());
  }

  // --- Candidats ---
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/candidates")
      .then((r) => r.json())
      .then((data) => { setCandidates(data.candidates ?? []); setLoading(false); });
  }, []);

  const filtered = candidates.filter((c) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.profile?.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.profile?.location?.toLowerCase().includes(search.toLowerCase())
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  }

  async function sendEmails() {
    if (selected.size === 0) return;
    setSending(true);
    setResults(null);
    const res = await fetch("/api/admin/send-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateIds: Array.from(selected) }),
    });
    const data = await res.json();
    setResults(data.results);
    setSending(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-500 mt-0.5">Gestion du site KTZ Emploi</p>
      </div>

      {/* Onglets avec défilement */}
      <div className="relative mb-6">
        {/* Bouton flèche gauche */}
        <button
          onClick={() => { const el = document.getElementById("admin-tabs"); if (el) el.scrollBy({ left: -200, behavior: "smooth" }); }}
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 bg-gradient-to-r from-gray-50 to-transparent text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Défiler à gauche"
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
        </button>

        {/* Barre d'onglets */}
        <div
          id="admin-tabs"
          className="flex gap-1 border-b border-gray-200 overflow-x-auto px-8"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#f97316 #f3f4f6" }}
        >
          <style>{`#admin-tabs::-webkit-scrollbar { height: 3px; } #admin-tabs::-webkit-scrollbar-track { background: #f3f4f6; } #admin-tabs::-webkit-scrollbar-thumb { background: #f97316; border-radius: 9999px; }`}</style>
        <button
          onClick={() => setActiveTab("offres")}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "offres"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Offres à valider
          {pendingJobs.length > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
              {pendingJobs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("toutes-offres"); if (allJobs.length === 0) loadAllJobs(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "toutes-offres"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <List className="h-4 w-4" />
          Toutes les offres
        </button>
        <button
          onClick={() => { setActiveTab("moderation"); if (moderationJobs.length === 0) loadModerationJobs(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "moderation"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Shield className="h-4 w-4" />
          Modération
        </button>
        <button
          onClick={() => { setActiveTab("recruteurs"); if (companies.length === 0) loadCompanies(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "recruteurs"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Recruteurs
        </button>
        <button
          onClick={() => setActiveTab("candidats")}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "candidats"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="h-4 w-4" />
          Candidats
          <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">
            {candidates.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab("utilisateurs"); if (siteUsers.length === 0) loadUsers(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "utilisateurs"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserCog className="h-4 w-4" />
          Utilisateurs
        </button>
        <button
          onClick={() => { setActiveTab("stats"); if (!stats) loadStats(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "stats"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          Statistiques
        </button>
        <button
          onClick={() => { setActiveTab("all-applications"); if (allApps.length === 0) loadAllApps(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "all-applications"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Send className="h-4 w-4" />
          Candidatures
        </button>
        <button
          onClick={() => { setActiveTab("reports"); loadReports(reportsFilter); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "reports"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Flag className="h-4 w-4" />
          Signalements
          {reports.filter(r => r.status === "PENDING").length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {reports.filter(r => r.status === "PENDING").length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("activite"); if (activityLogs.length === 0) loadActivity(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "activite"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          Activité
        </button>
        <button
          onClick={() => { setActiveTab("visiteurs"); if (visitors.length === 0) loadVisiteurs(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "visiteurs"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Eye className="h-4 w-4" />
          Visiteurs
        </button>
        <button
          onClick={() => { setActiveTab("abonnements"); if (subsData.length === 0) loadSubs(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "abonnements"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Abonnements
          {subStats.pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {subStats.pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "messages"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell className="h-4 w-4" />
          Messages directs
        </button>
        <button
          onClick={() => { setActiveTab("settings"); if (!Object.keys(settings).length) loadSettings(); }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "settings"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </button>
        </div>{/* fin barre d'onglets */}

        {/* Bouton flèche droite */}
        <button
          onClick={() => { const el = document.getElementById("admin-tabs"); if (el) el.scrollBy({ left: 200, behavior: "smooth" }); }}
          className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 bg-gradient-to-l from-gray-50 to-transparent text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Défiler à droite"
        >
          <ChevronDown className="h-4 w-4 -rotate-90" />
        </button>
      </div>{/* fin relative wrapper */}

      {/* ══════ ONGLET OFFRES À VALIDER ══════ */}
      {activeTab === "offres" && (
        <div>
          {jobsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : pendingJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
              <p className="font-medium text-gray-500">Aucune offre en attente</p>
              <p className="text-sm text-gray-400 mt-1">Toutes les offres ont été traitées</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Logo entreprise */}
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.company.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Building2 className="h-5 w-5 text-gray-400" />
                        )}
                      </div>

                      {/* Infos offre */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{job.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Building2 className="h-3 w-3" /> {job.company.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" /> {job.location}{job.remote ? " · Télétravail" : ""}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Briefcase className="h-3 w-3" /> {job.type}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Tag className="h-3 w-3" /> {job.category}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" /> {new Date(job.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                          {(job.salaryMin || job.salaryMax) && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Banknote className="h-3 w-3" />
                              {job.salaryMin ? job.salaryMin.toLocaleString() : "—"}
                              {job.salaryMax ? ` – ${job.salaryMax.toLocaleString()}` : "+"} {job.salaryCurrency}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Boutons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                          title={expandedJob === job.id ? "Masquer" : "Voir le contenu"}
                        >
                          {expandedJob === job.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {expandedJob === job.id ? "Masquer" : "Voir"}
                        </button>
                        <button
                          onClick={() => handleJobAction(job.id, "approve")}
                          disabled={jobAction !== null}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          {jobAction === job.id + "approve"
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Check className="h-4 w-4" />}
                          Approuver
                        </button>
                        <button
                          onClick={() => handleJobAction(job.id, "reject")}
                          disabled={jobAction !== null}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          {jobAction === job.id + "reject"
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <X className="h-4 w-4" />}
                          Rejeter
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Détails complets (expandé) */}
                  {expandedJob === job.id && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-4">
                      {/* Infos complémentaires */}
                      <div className="flex flex-wrap gap-3">
                        {job.experienceLevel && (
                          <span className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">
                            <GraduationCap className="h-3.5 w-3.5 text-gray-400" /> {job.experienceLevel}
                          </span>
                        )}
                        {job.deadline && (
                          <span className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-400" /> Date limite : {new Date(job.deadline).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                      </div>

                      {/* Profil recherché */}
                      {job.requirements && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Profil recherché</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
                        </div>
                      )}

                      {/* Avantages */}
                      {job.benefits && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Avantages</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.benefits}</p>
                        </div>
                      )}

                      {/* Boutons répétés en bas pour faciliter l'action */}
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleJobAction(job.id, "approve")}
                          disabled={jobAction !== null}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        >
                          {jobAction === job.id + "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Approuver l&apos;offre
                        </button>
                        <button
                          onClick={() => handleJobAction(job.id, "reject")}
                          disabled={jobAction !== null}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        >
                          {jobAction === job.id + "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          Rejeter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET MODÉRATION ══════ */}
      {activeTab === "moderation" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Modération des offres publiées</h2>
              <p className="text-sm text-gray-500 mt-0.5">Suspendez ou réactivez les offres visibles sur le site.</p>
            </div>
            <button
              onClick={loadModerationJobs}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors border border-gray-200 px-3 py-2 rounded-xl"
            >
              <Loader2 className={`h-3.5 w-3.5 ${moderationLoading ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>

          {moderationLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : moderationJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium text-gray-500">Aucune offre publiée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moderationJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {job.company.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Building2 className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{job.title}</p>
                      <div className="flex flex-wrap gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{job.company.name}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">{job.location}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">{job.type}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(job.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="text-xs text-gray-400">
                          · {job._count.applications} candidature(s)
                        </span>
                      </div>
                    </div>

                    {/* Statut + toggle */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        job.published ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {job.published ? "Publiée" : "Suspendue"}
                      </span>
                      <button
                        onClick={() => toggleJobPublished(job.id, !job.published)}
                        disabled={togglingJobId === job.id}
                        title={job.published ? "Suspendre l'offre" : "Réactiver l'offre"}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-60 ${
                          job.published
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {togglingJobId === job.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : job.published ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        {job.published ? "Suspendre" : "Réactiver"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET TOUTES LES OFFRES ══════ */}
      {activeTab === "toutes-offres" && (
        <div>
          {/* Modal édition */}
          {editingJob && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingJob(null)}>
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Modifier l&apos;offre</h2>
                  <button onClick={() => setEditingJob(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre *</label>
                    <input type="text" value={editForm.title ?? ""} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  {/* Type + Catégorie */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                      <select value={editForm.type ?? ""} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                        {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
                      <select value={editForm.category ?? ""} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                        {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Localisation + Télétravail */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Localisation</label>
                      <select value={editForm.location ?? ""} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                        {RCA_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Salaire min / max (XAF)</label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={editForm.salaryMin ?? ""} onChange={e => setEditForm(p => ({ ...p, salaryMin: e.target.value ? Number(e.target.value) : null }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        <input type="number" placeholder="Max" value={editForm.salaryMax ?? ""} onChange={e => setEditForm(p => ({ ...p, salaryMax: e.target.value ? Number(e.target.value) : null }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      </div>
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                    <textarea value={editForm.description ?? ""} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={5}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                  </div>
                  {/* Profil + Avantages */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Profil recherché</label>
                      <textarea value={editForm.requirements ?? ""} onChange={e => setEditForm(p => ({ ...p, requirements: e.target.value }))} rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Avantages</label>
                      <textarea value={editForm.benefits ?? ""} onChange={e => setEditForm(p => ({ ...p, benefits: e.target.value }))} rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                    </div>
                  </div>
                  {/* Toggles */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!editForm.remote} onChange={e => setEditForm(p => ({ ...p, remote: e.target.checked }))} className="rounded text-orange-500" />
                      <span className="text-sm text-gray-700">Télétravail</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!editForm.featured} onChange={e => setEditForm(p => ({ ...p, featured: e.target.checked }))} className="rounded text-orange-500" />
                      <span className="text-sm text-gray-700">À la une</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!editForm.published} onChange={e => setEditForm(p => ({ ...p, published: e.target.checked }))} className="rounded text-orange-500" />
                      <span className="text-sm text-gray-700">Publiée</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                  <button onClick={saveEdit} disabled={savingJob}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    {savingJob ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Sauvegarder
                  </button>
                  <button onClick={() => setEditingJob(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Barre bulk */}
          {selectedJobs.size > 0 && (
            <div className="flex items-center gap-3 mb-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-orange-700">{selectedJobs.size} offre(s) sélectionnée(s)</span>
              <button onClick={() => bulkJobAction("approve")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors">
                <Check className="h-3.5 w-3.5" /> Approuver tout
              </button>
              <button onClick={() => bulkJobAction("delete")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Supprimer tout
              </button>
              <button onClick={() => setSelectedJobs(new Set())}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                <X className="h-3.5 w-3.5" /> Désélectionner
              </button>
            </div>
          )}

          {/* Barre de recherche */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
              <Search className="h-4 w-4 text-gray-400" />
              <input type="text" value={allJobsSearch} onChange={e => setAllJobsSearch(e.target.value)}
                placeholder="Rechercher par titre, entreprise..." className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400" />
            </div>
          </div>

          {allJobsLoading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
          ) : (
            <div className="space-y-3">
              {allJobs
                .filter(j => !allJobsSearch ||
                  j.title.toLowerCase().includes(allJobsSearch.toLowerCase()) ||
                  j.company.name.toLowerCase().includes(allJobsSearch.toLowerCase()))
                .map(job => (
                  <div key={job.id} className={`bg-white rounded-2xl border p-5 ${selectedJobs.has(job.id) ? "border-orange-300 ring-1 ring-orange-100" : "border-gray-200"}`}>
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedJobs.has(job.id)}
                        onChange={() => setSelectedJobs(p => { const n = new Set(p); n.has(job.id) ? n.delete(job.id) : n.add(job.id); return n; })}
                        className="mt-1 rounded text-orange-500 flex-shrink-0"
                      />
                      {/* Logo */}
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.company.logo
                          ? <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain p-1" />
                          : <Building2 className="h-5 w-5 text-gray-400" />}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-gray-900">{job.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {job.published ? "Publié" : "En attente"}
                          </span>
                          {job.featured && (
                            <span className="flex items-center gap-0.5 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> À la une
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.company.name}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job._count.applications} candidature(s)</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.views} vue(s)</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(job.createdAt).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {/* Toggle à la une */}
                        <button onClick={() => toggleJobField(job.id, "featured", !job.featured)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${job.featured ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                          title={job.featured ? "Retirer de la une" : "Mettre à la une"}>
                          <Star className={`h-3.5 w-3.5 ${job.featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                          {job.featured ? "Une ✓" : "Une"}
                        </button>

                        {/* Toggle publié */}
                        <button onClick={() => toggleJobField(job.id, "published", !job.published)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${job.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          {job.published ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                          {job.published ? "Dépublier" : "Publier"}
                        </button>

                        {/* Notifier SMS/WhatsApp */}
                        {notifyResults[job.id] ? (
                          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {notifyResults[job.id].smsSent}SMS / {notifyResults[job.id].whatsappSent}WA
                          </span>
                        ) : (
                          <button
                            onClick={() => notifyJob(job.id)}
                            disabled={notifyingJob === job.id || !job.published}
                            title={!job.published ? "L'offre doit être publiée pour notifier" : "Notifier les candidats opt-in par SMS/WhatsApp"}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-600 rounded-lg text-xs font-medium transition-colors"
                          >
                            {notifyingJob === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
                            Notifier
                          </button>
                        )}

                        {/* Modifier */}
                        <button onClick={() => openEdit(job)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors">
                          <Pencil className="h-3.5 w-3.5" /> Modifier
                        </button>

                        {/* Supprimer */}
                        {confirmDeleteJob === job.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => deleteJob(job.id)} disabled={deletingJob === job.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-60">
                              {deletingJob === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              Oui
                            </button>
                            <button onClick={() => setConfirmDeleteJob(null)} className="p-1.5 text-gray-400 hover:text-gray-600">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteJob(job.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-medium transition-colors">
                            <Trash2 className="h-3.5 w-3.5" /> Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {allJobs.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                  <p className="font-medium text-gray-500">Aucune offre</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET CANDIDATS ══════ */}
      {activeTab === "candidats" && (
      <div>
      {/* Actions candidats */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{candidates.length} candidat(s) inscrit(s)</p>
        <button
          onClick={sendEmails}
          disabled={selected.size === 0 || sending}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Envoi en cours..." : `Envoyer les offres (${selected.size})`}
        </button>
      </div>

      {/* Résultats envoi */}
      {results && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">
            Résultats : {results.filter((r) => r.sent).length}/{results.length} emails envoyés
          </h3>
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.email} className="flex items-center gap-3 text-sm">
                {r.sent
                  ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                <span className="font-medium text-gray-700">{r.email}</span>
                {r.sent
                  ? <span className="text-gray-400">· {r.jobCount} offre(s) envoyée(s)</span>
                  : <span className="text-red-400">· {r.jobCount === 0 ? "Aucune offre correspondante" : r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, poste, ville..."
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {selected.size === filtered.length && filtered.length > 0
            ? <CheckSquare className="h-4 w-4 text-orange-500" />
            : <Square className="h-4 w-4" />}
          Tout sélectionner
        </button>
      </div>

      {/* Liste des candidats */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">Aucun candidat trouvé</p>
          </div>
        )}

        {filtered.map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-2xl border transition-all ${
              selected.has(c.id) ? "border-orange-300 ring-1 ring-orange-100" : "border-gray-200"
            }`}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">

                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(c.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {selected.has(c.id)
                    ? <CheckSquare className="h-5 w-5 text-orange-500" />
                    : <Square className="h-5 w-5 text-gray-300 hover:text-gray-500" />}
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm flex-shrink-0">
                  {(c.name ?? c.email).slice(0, 2).toUpperCase()}
                </div>

                {/* Info candidat */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900">{c.name ?? "—"}</p>
                      <a href={`mailto:${c.email}`} className="text-sm text-orange-500 hover:underline flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {c.email}
                      </a>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      c.matchCount > 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {c.matchCount} offre(s) correspondante(s)
                    </span>
                  </div>

                  {/* Tags profil */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {c.profile?.title && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        <Briefcase className="h-3 w-3" /> {c.profile.title}
                      </span>
                    )}
                    {c.profile?.location && (
                      <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        <MapPin className="h-3 w-3" /> {c.profile.location}
                      </span>
                    )}
                    {c.profile?.skills && c.profile.skills.split(",").slice(0, 3).map((s) => (
                      <span key={s} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        <Tag className="h-3 w-3" /> {s.trim()}
                      </span>
                    ))}
                    {!c.profile?.title && !c.profile?.location && (
                      <span className="text-xs text-gray-400 italic">Profil non complété</span>
                    )}
                  </div>
                </div>

                {/* Bouton développer */}
                {c.matchedJobs.length > 0 && (
                  <button
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {expanded === c.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {/* Offres correspondantes (développé) */}
              {expanded === c.id && c.matchedJobs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 pl-9">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Offres qui lui seront envoyées
                  </p>
                  {c.matchedJobs.map((job) => (
                    <div key={job.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                        {job.company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{job.title}</p>
                        <p className="text-xs text-gray-400">{job.company.name} · {job.location} · {job.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
      )}

      {/* ══════ ONGLET RECRUTEURS ══════ */}
      {activeTab === "recruteurs" && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="Rechercher une entreprise..."
                className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>

          {companiesLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {companies
                .filter(c => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase()))
                .map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                    {/* Ligne 1 : logo + nom + infos */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {c.logo
                          ? <img src={c.logo} alt={c.name} className="w-full h-full object-contain p-1" />
                          : <Building2 className="h-4 w-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium text-gray-900 truncate">{c.name}</p>
                          {c.superRecruiter && (
                            <span className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> Super Recruteur
                            </span>
                          )}
                          {c.verified && (
                            <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                              <BadgeCheck className="h-3 w-3" /> Vérifié
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{c.sector ?? "—"} · {c._count.jobs} offre(s)</p>
                      </div>
                    </div>

                    {/* Ligne 2 : actions */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => toggleCompanyField(c.id, "superRecruiter", !c.superRecruiter)}
                        disabled={togglingCompany === c.id + "superRecruiter"}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          c.superRecruiter ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {togglingCompany === c.id + "superRecruiter"
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Star className={`h-3 w-3 ${c.superRecruiter ? "fill-yellow-500 text-yellow-500" : ""}`} />}
                        {c.superRecruiter ? "Retirer badge" : "Super Recruteur"}
                      </button>

                      <button
                        onClick={() => toggleCompanyField(c.id, "verified", !c.verified)}
                        disabled={togglingCompany === c.id + "verified"}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          c.verified ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {togglingCompany === c.id + "verified"
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <BadgeCheck className="h-3 w-3" />}
                        {c.verified ? "Vérifié ✓" : "Vérifier"}
                      </button>

                      <button
                        onClick={() => suspendCompany(c.id, !c.suspended)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto ${
                          c.suspended ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {c.suspended ? "Réactiver" : "Suspendre"}
                      </button>
                    </div>
                  </div>
                ))}

              {companies.filter(c => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase())).length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <Building2 className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                  <p className="font-medium text-gray-500">Aucun recruteur inscrit</p>
                  <p className="text-sm text-gray-400 mt-1">Les entreprises apparaîtront ici dès leur inscription</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET UTILISATEURS ══════ */}
      {activeTab === "utilisateurs" && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
            {selectedUsers.size > 0 && (
              <button
                onClick={() => setBulkEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Mail className="h-4 w-4" /> Email groupé ({selectedUsers.size})
              </button>
            )}
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {siteUsers
                .filter((u) =>
                  !userSearch ||
                  u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearch.toLowerCase())
                )
                .map((u) => (
                  <div key={u.id} className={`bg-white rounded-2xl border p-4 ${selectedUsers.has(u.id) ? "border-orange-300 ring-1 ring-orange-100" : "border-gray-200"}`}>
                    {/* Ligne 1 : checkbox + avatar + nom/email + badge rôle */}
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(u.id)}
                        onChange={() => setSelectedUsers(p => { const n = new Set(p); n.has(u.id) ? n.delete(u.id) : n.add(u.id); return n; })}
                        className="rounded text-orange-500 flex-shrink-0"
                      />
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm flex-shrink-0">
                        {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">{u.name ?? "—"}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${ROLE_LABELS[u.role]?.color}`}>
                        {u.role === "ADMIN" && <Shield className="h-3 w-3 inline mr-1" />}
                        {ROLE_LABELS[u.role]?.label ?? u.role}
                      </span>
                    </div>

                    {/* Ligne 2 : changer le rôle + suspendre */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap pl-12">
                      <div className="relative">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          disabled={updatingRole === u.id}
                          className="appearance-none border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-xs text-gray-700 bg-white hover:border-orange-300 focus:outline-none focus:border-orange-400 disabled:opacity-50 cursor-pointer"
                        >
                          <option value="JOBSEEKER">Candidat</option>
                          <option value="EMPLOYER">Recruteur</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        {updatingRole === u.id
                          ? <Loader2 className="h-3 w-3 animate-spin absolute right-2 top-2 text-gray-400 pointer-events-none" />
                          : <ChevDown className="h-3 w-3 absolute right-2 top-2 text-gray-400 pointer-events-none" />
                        }
                      </div>
                      <button
                        onClick={() => suspendUser(u.id, !u.suspended)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto ${
                          u.suspended ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {u.suspended ? "Réactiver" : "Suspendre"}
                      </button>
                      <button
                        onClick={() => deleteUser(u.id, u.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}

              {siteUsers.filter((u) =>
                !userSearch ||
                u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(userSearch.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <Users className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                  <p className="font-medium text-gray-500">Aucun utilisateur trouvé</p>
                  <p className="text-sm text-gray-400 mt-1">Essayez une autre recherche</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET STATISTIQUES ══════ */}
      {activeTab === "stats" && (
        <div>
          {statsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : stats && (
            <div className="space-y-6">
              {/* Metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Utilisateurs", value: stats.totalUsers, delta: stats.newUsersLast7Days, color: "bg-blue-50 text-blue-600" },
                  { label: "Entreprises", value: stats.totalCompanies, delta: 0, color: "bg-purple-50 text-purple-600" },
                  { label: "Offres publiées", value: stats.totalJobs, delta: stats.newJobsLast7Days, color: "bg-orange-50 text-orange-600" },
                  { label: "Candidatures", value: stats.totalApplications, delta: stats.newApplicationsLast7Days, color: "bg-green-50 text-green-600" },
                ].map(m => (
                  <div key={m.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
                      <BarChart2 className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{m.value}</div>
                    <div className="text-sm text-gray-500">{m.label}</div>
                    {m.delta > 0 && <div className="text-xs text-green-600 mt-1">+{m.delta} cette semaine</div>}
                  </div>
                ))}
              </div>

              {/* Alert cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-amber-800">En attente de validation</p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">{stats.pendingJobsCount}</p>
                </div>
                <div className={`${stats.pendingReportsCount > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"} border rounded-2xl p-4`}>
                  <p className="text-sm font-semibold text-gray-700">Signalements en attente</p>
                  <p className={`text-2xl font-bold mt-1 ${stats.pendingReportsCount > 0 ? "text-red-600" : "text-gray-500"}`}>{stats.pendingReportsCount}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-gray-700">Comptes suspendus</p>
                  <p className="text-2xl font-bold text-gray-700 mt-1">{stats.suspendedUsersCount + stats.suspendedCompaniesCount}</p>
                </div>
              </div>

              {/* Top sectors + expiring */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Top secteurs</h3>
                  <div className="space-y-2">
                    {stats.topSectors.map((s, i) => (
                      <div key={s.category} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{s.category}</span>
                            <span className="font-semibold text-orange-500">{s._count.id}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div
                              className="h-1.5 bg-orange-400 rounded-full"
                              style={{ width: `${Math.min(100, (s._count.id / (stats.totalJobs || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-orange-500" />
                    Offres qui expirent bientôt
                  </h3>
                  {stats.expiringJobs.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucune offre en expiration dans les 7 prochains jours</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.expiringJobs.map(j => (
                        <div key={j.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{j.title}</p>
                            <p className="text-xs text-gray-400">{j.company.name}</p>
                          </div>
                          <span className="text-xs text-red-500 font-medium">
                            {new Date(j.deadline).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Export buttons */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="h-4 w-4" />Exporter les données
                </h3>
                <div className="flex flex-wrap gap-3">
                  {["users", "companies", "jobs", "applications"].map(type => (
                    <a
                      key={type}
                      href={`/api/admin/export?type=${type}`}
                      download
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-orange-300 transition-colors"
                    >
                      <Download className="h-4 w-4 text-orange-500" />
                      {type === "users" ? "Utilisateurs" : type === "companies" ? "Entreprises" : type === "jobs" ? "Offres" : "Candidatures"} (CSV)
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
          {!statsLoading && !stats && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <BarChart2 className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <button onClick={loadStats} className="text-orange-500 hover:underline text-sm">Charger les statistiques</button>
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET TOUTES LES CANDIDATURES ══════ */}
      {activeTab === "all-applications" && (
        <div>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={appsSearch}
                onChange={e => setAppsSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadAllApps()}
                placeholder="Candidat, offre, entreprise..."
                className="flex-1 text-sm outline-none"
              />
            </div>
            <select
              value={appsStatusFilter}
              onChange={e => setAppsStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="REVIEWING">En examen</option>
              <option value="INTERVIEW">Entretien</option>
              <option value="ACCEPTED">Accepté</option>
              <option value="REJECTED">Refusé</option>
            </select>
            <button onClick={loadAllApps} className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600">
              Filtrer
            </button>
          </div>

          {allAppsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {allApps.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400">
                  Aucune candidature
                </div>
              )}
              {allApps.map(app => {
                const st = APPLICATION_STATUSES[app.status];
                return (
                  <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm flex-shrink-0">
                      {(app.user.name ?? app.user.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{app.user.name ?? "—"}</p>
                      <a href={`mailto:${app.user.email}`} className="text-sm text-orange-500 hover:underline">{app.user.email}</a>
                      <p className="text-sm text-gray-500 mt-0.5">
                        → <span className="font-medium">{app.job.title}</span> chez {app.job.company.name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st?.color ?? "bg-gray-100 text-gray-600"}`}>
                        {st?.label ?? app.status}
                      </span>
                      {app.cvUrl && (
                        <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-orange-500 hover:underline flex items-center gap-1">
                          <FileText className="h-3 w-3" />CV
                        </a>
                      )}
                      <span className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET SIGNALEMENTS ══════ */}
      {activeTab === "reports" && (
        <div>
          <div className="flex gap-2 mb-4">
            {(["PENDING", "REVIEWED", "DISMISSED"] as const).map(s => (
              <button
                key={s}
                onClick={() => { setReportsFilter(s); loadReports(s); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  reportsFilter === s
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s === "PENDING" ? "En attente" : s === "REVIEWED" ? "Traités" : "Ignorés"}
              </button>
            ))}
          </div>

          {reportsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {reports.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <Flag className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-500">Aucun signalement</p>
                </div>
              )}
              {reports.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.type === "JOB" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                          {r.type === "JOB" ? "Offre" : "Entreprise"}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{r.targetName}</span>
                      </div>
                      <p className="text-sm text-gray-700"><span className="font-medium">Raison :</span> {r.reason}</p>
                      {r.details && <p className="text-sm text-gray-500 mt-1">{r.details}</p>}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(r.createdAt).toLocaleDateString("fr-FR")} · {r.reporterId ? "Utilisateur connecté" : "Anonyme"}
                      </p>
                    </div>
                    {reportsFilter === "PENDING" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleReportAction(r.id, "REVIEWED")}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-medium"
                        >
                          <Check className="h-3.5 w-3.5" />Traité
                        </button>
                        <button
                          onClick={() => handleReportAction(r.id, "DISMISSED")}
                          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-medium"
                        >
                          <X className="h-3.5 w-3.5" />Ignorer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET ABONNEMENTS ══════ */}
      {activeTab === "abonnements" && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{subsData.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Entreprises</p>
            </div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{subStats.pendingCount}</p>
              <p className="text-xs text-yellow-600 mt-0.5">En attente</p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{subStats.activeCount}</p>
              <p className="text-xs text-green-600 mt-0.5">Actifs payants</p>
            </div>
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
              <p className="text-2xl font-bold text-orange-700">{subStats.revenue.toLocaleString("fr-FR")}</p>
              <p className="text-xs text-orange-600 mt-0.5">XAF encaissés</p>
            </div>
          </div>

          {/* Filtres + Actualiser */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              {(["all", "PENDING", "ACTIVE", "CANCELLED", "FREE"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSubFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                    subFilter === f
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {f === "all" ? "Tous" : f === "FREE" ? "Gratuit" : f === "PENDING" ? "En attente" : f === "ACTIVE" ? "Actif" : "Annulé"}
                  {f === "PENDING" && subStats.pendingCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white rounded-full px-1.5">{subStats.pendingCount}</span>
                  )}
                </button>
              ))}
            </div>
            <button onClick={loadSubs} disabled={subsLoading} className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium">
              {subsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Actualiser
            </button>
          </div>

          {subsLoading ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
          ) : (
            <div className="space-y-2">
              {subsData
                .filter(c => {
                  if (subFilter === "all") return true;
                  if (subFilter === "FREE") return !c.subscription;
                  return c.subscription?.status === subFilter;
                })
                .map(company => {
                  const sub = company.subscription;
                  const plan = sub?.plan ?? "FREE";
                  const status = sub?.status ?? "FREE";
                  const planInfo = { FREE: { label: "Gratuit", price: 0, color: "bg-gray-100 text-gray-600" }, STARTER: { label: "Starter", price: 5000, color: "bg-blue-100 text-blue-700" }, PRO: { label: "Pro", price: 20000, color: "bg-orange-100 text-orange-700" } }[plan] ?? { label: plan, price: 0, color: "bg-gray-100 text-gray-600" };
                  const statusInfo = { FREE: { label: "Aucun abonnement", color: "bg-gray-100 text-gray-500" }, PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700" }, ACTIVE: { label: "Actif", color: "bg-green-100 text-green-700" }, CANCELLED: { label: "Annulé", color: "bg-red-100 text-red-600" }, EXPIRED: { label: "Expiré", color: "bg-gray-100 text-gray-500" } }[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };

                  return (
                    <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          {/* Ligne 1 : Nom + badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-semibold text-gray-900">{company.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planInfo.color}`}>{planInfo.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                            {planInfo.price > 0 && (
                              <span className="text-xs text-gray-500 font-medium">{planInfo.price.toLocaleString("fr-FR")} XAF/mois</span>
                            )}
                          </div>
                          {/* Ligne 2 : Infos contact + offres */}
                          <p className="text-xs text-gray-500">
                            {company.email ?? "—"} · {company._count.jobs} offre{company._count.jobs !== 1 ? "s" : ""}
                            {" · "}Inscrit le {new Date(company.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                          {/* Ligne 3 : Infos paiement si applicable */}
                          {sub && (
                            <p className="text-xs text-gray-400 mt-1">
                              {sub.paymentMethod ? sub.paymentMethod.replace("_", " ") : "—"}
                              {sub.paymentRef && <> · Réf : <code className="font-mono bg-gray-50 px-1 rounded">{sub.paymentRef}</code></>}
                              {" · "}Demande le {new Date(sub.createdAt).toLocaleDateString("fr-FR")}
                              {sub.endDate && <> · Expire le {new Date(sub.endDate).toLocaleDateString("fr-FR")}</>}
                            </p>
                          )}
                        </div>
                        {/* Boutons d'action */}
                        {sub?.status === "PENDING" && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleSubAction(sub.id, "activate")}
                              disabled={subAction === sub.id + "activate"}
                              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                            >
                              {subAction === sub.id + "activate" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              Activer
                            </button>
                            <button
                              onClick={() => handleSubAction(sub.id, "cancel")}
                              disabled={subAction === sub.id + "cancel"}
                              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200"
                            >
                              <X className="h-3 w-3" />Refuser
                            </button>
                          </div>
                        )}
                        {sub?.status === "ACTIVE" && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleSubAction(sub.id, "cancel")}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                            >
                              Résilier
                            </button>
                            <button
                              onClick={() => { if (confirm("Remettre à zéro (plan FREE) ?")) handleSubAction(sub.id, "reset"); }}
                              disabled={subAction === sub.id + "reset"}
                              className="text-xs text-gray-400 hover:text-orange-500 transition-colors border border-gray-200 px-2 py-1 rounded"
                            >
                              Remettre à zéro
                            </button>
                          </div>
                        )}
                        {sub?.status === "CANCELLED" && (
                          <button
                            onClick={() => { if (confirm("Remettre à zéro (plan FREE) ?")) handleSubAction(sub.id, "reset"); }}
                            disabled={subAction === sub.id + "reset"}
                            className="text-xs text-gray-400 hover:text-orange-500 transition-colors border border-gray-200 px-2 py-1 rounded flex-shrink-0"
                          >
                            Remettre à zéro
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              {subsData.filter(c => {
                if (subFilter === "all") return true;
                if (subFilter === "FREE") return !c.subscription;
                return c.subscription?.status === subFilter;
              }).length === 0 && (
                <div className="text-center py-12 text-gray-400">Aucune entreprise dans cette catégorie.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET ACTIVITÉ ══════ */}
      {activeTab === "activite" && (
        <ActivityTab
          logs={activityLogs}
          loading={activityLoading}
          filter={activityFilter}
          onFilterChange={setActivityFilter}
          onRefresh={loadActivity}
          colors={ACTIVITY_COLORS}
          icons={ACTIVITY_ICONS}
        />
      )}

      {/* ══════ ONGLET VISITEURS ══════ */}
      {activeTab === "visiteurs" && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Visiteurs du site</h2>
              <p className="text-sm text-gray-500 mt-0.5">Personnes qui ont visité le site (connectées ou non)</p>
            </div>
            <button onClick={loadVisiteurs} className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium">
              <Clock className="h-4 w-4" /> Actualiser
            </button>
          </div>
          {visitorsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : visitors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">Aucun visiteur enregistré pour le moment</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Visiteur</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Compte</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Page visitée</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Date &amp; heure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visitors.map((v) => {
                      const meta = v.metadata ? (() => { try { return JSON.parse(v.metadata!); } catch { return {}; } })() : {};
                      return (
                        <tr key={v.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                                {v.userName ? v.userName.slice(0, 2).toUpperCase() : "?"}
                              </div>
                              <span className="font-medium text-gray-800">{v.userName || "Anonyme"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {v.userEmail ? (
                              <div>
                                <div className="text-gray-700">{v.userEmail}</div>
                                <div className="text-xs text-gray-400">{meta.role || "—"}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Non connecté</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{meta.page || "/"}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {new Date(v.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
                {visitors.length} visite{visitors.length > 1 ? "s" : ""} enregistrée{visitors.length > 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET PARAMÈTRES ══════ */}
      {activeTab === "settings" && (
        <div>
          {settingsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-4 max-w-xl">
              {/* Mode maintenance */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Mode maintenance</p>
                    <p className="text-sm text-gray-500 mt-0.5">Affiche un message de maintenance à tous les visiteurs</p>
                  </div>
                  <button
                    onClick={() => saveSetting("maintenance_mode", settings["maintenance_mode"] === "true" ? "false" : "true")}
                    disabled={savingSettings}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings["maintenance_mode"] === "true" ? "bg-orange-500" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings["maintenance_mode"] === "true" ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              {/* Inscriptions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Inscriptions ouvertes</p>
                    <p className="text-sm text-gray-500 mt-0.5">Permet aux nouveaux utilisateurs de s&apos;inscrire</p>
                  </div>
                  <button
                    onClick={() => saveSetting("registrations_enabled", settings["registrations_enabled"] === "false" ? "true" : "false")}
                    disabled={savingSettings}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings["registrations_enabled"] !== "false" ? "bg-orange-500" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings["registrations_enabled"] !== "false" ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              {/* Message bannière */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="font-semibold text-gray-900 mb-2">Message de bannière</p>
                <p className="text-sm text-gray-500 mb-3">Affiché en haut du site pour tous les visiteurs (laisser vide pour désactiver)</p>
                <textarea
                  value={settings["banner_message"] ?? ""}
                  onChange={e => setSettings(p => ({ ...p, banner_message: e.target.value }))}
                  rows={2}
                  placeholder="Ex: Le site sera en maintenance dimanche de 2h à 4h..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
                <button
                  onClick={() => saveSetting("banner_message", settings["banner_message"] ?? "")}
                  disabled={savingSettings}
                  className="mt-3 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sauvegarder
                </button>
              </div>

              {/* ── Templates de notification ── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-500" /> Templates de notification
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Variables disponibles :&nbsp;
                  {["{{prenom}}", "{{offre}}", "{{entreprise}}", "{{ville}}", "{{type}}", "{{lien}}"].map(v => (
                    <code key={v} className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-xs font-mono mr-1">{v}</code>
                  ))}
                </p>

                {/* Template WhatsApp */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    💬 Message WhatsApp
                  </label>
                  <textarea
                    value={settings["wa_template"] ?? ""}
                    onChange={e => setSettings(p => ({ ...p, wa_template: e.target.value }))}
                    rows={5}
                    placeholder={`Bonjour {{prenom}} 👋\n\nNouvelle offre : *{{offre}}*\n🏢 {{entreprise}} — 📍 {{ville}}\n\n👉 {{lien}}`}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none font-mono"
                  />
                  <button
                    onClick={() => saveSetting("wa_template", settings["wa_template"] ?? "")}
                    disabled={savingSettings}
                    className="mt-2 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Sauvegarder
                  </button>
                </div>

                {/* Objet email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    📧 Objet de l&apos;email
                  </label>
                  <input
                    type="text"
                    value={settings["email_subject_template"] ?? ""}
                    onChange={e => setSettings(p => ({ ...p, email_subject_template: e.target.value }))}
                    placeholder="Nouvelle offre pour vous : {{offre}} chez {{entreprise}}"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                {/* Corps email */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    📧 Corps de l&apos;email
                  </label>
                  <textarea
                    value={settings["email_body_template"] ?? ""}
                    onChange={e => setSettings(p => ({ ...p, email_body_template: e.target.value }))}
                    rows={6}
                    placeholder={`Bonjour {{prenom}},\n\nUne nouvelle offre correspond à votre profil :\n\n{{offre}} — {{entreprise}}\n📍 {{ville}} · {{type}}\n\nPostuler : {{lien}}`}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>

                <button
                  onClick={async () => {
                    await saveSetting("email_subject_template", settings["email_subject_template"] ?? "");
                    await saveSetting("email_body_template", settings["email_body_template"] ?? "");
                  }}
                  disabled={savingSettings}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sauvegarder les templates email
                </button>

                {/* Prévisualisation */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Aperçu (exemple) :</p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 font-mono whitespace-pre-wrap">
                    {(settings["wa_template"] || `Bonjour {{prenom}} 👋\n\nNouvelle offre : *{{offre}}*\n🏢 {{entreprise}} — 📍 {{ville}}\n\n👉 {{lien}}`)
                      .replace(/\{\{prenom\}\}/g, "Marie")
                      .replace(/\{\{offre\}\}/g, "Comptable Senior")
                      .replace(/\{\{entreprise\}\}/g, "Total RCA")
                      .replace(/\{\{ville\}\}/g, "Bangui")
                      .replace(/\{\{type\}\}/g, "CDI")
                      .replace(/\{\{lien\}\}/g, "ktzemploi.com/offres/...")
                    }
                  </div>
                </div>
              </div>

              {/* ── WhatsApp (Green API) ── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-lg">💬</span> WhatsApp — Green API
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">Statut de la connexion WhatsApp pour les notifications</p>
                  </div>
                  <button
                    onClick={loadWaStatus}
                    disabled={waStateLoading}
                    className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    {waStateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart2 className="h-4 w-4" />}
                    Vérifier
                  </button>
                </div>

                {/* Statut */}
                {waState !== "unknown" && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium mb-4 ${
                    waState === "authorized" ? "bg-green-50 text-green-700 border border-green-200" :
                    waState === "not_configured" ? "bg-gray-50 text-gray-500 border border-gray-200" :
                    "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      waState === "authorized" ? "bg-green-500" :
                      waState === "not_configured" ? "bg-gray-400" : "bg-red-500"
                    }`} />
                    {waState === "authorized" && "✅ WhatsApp connecté — prêt à envoyer"}
                    {waState === "notAuthorized" && "⚠️ Non connecté — scannez le QR code"}
                    {waState === "not_configured" && "⚙️ Green API non configuré — ajoutez les clés dans .env"}
                    {waState === "error" && "❌ Erreur de connexion à Green API"}
                  </div>
                )}

                {/* Bouton QR si non connecté */}
                {waState === "notAuthorized" && (
                  <div className="mb-4">
                    <button
                      onClick={loadWaQR}
                      disabled={waQRLoading}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 mb-3"
                    >
                      {waQRLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>📱</span>}
                      Obtenir le QR code
                    </button>
                    {waQR && (
                      <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium">Scannez ce QR avec WhatsApp → Appareil lié</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`data:image/png;base64,${waQR}`}
                          alt="QR Code WhatsApp"
                          className="w-48 h-48 rounded-xl"
                        />
                        <button
                          onClick={loadWaStatus}
                          className="text-xs text-orange-500 hover:underline font-medium"
                        >
                          J&apos;ai scanné → vérifier la connexion
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Test d'envoi */}
                {waState === "authorized" && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Envoyer un message test</p>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={waTestPhone}
                        onChange={e => { setWaTestPhone(e.target.value); setWaTestResult(null); }}
                        placeholder="+236 77 00 00 00"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <button
                        onClick={testWhatsApp}
                        disabled={waTesting || !waTestPhone}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      >
                        {waTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Tester
                      </button>
                    </div>
                    {waTestResult === "ok" && (
                      <p className="flex items-center gap-1.5 text-sm text-green-600 mt-2">
                        <CheckCircle className="h-4 w-4" /> Message envoyé avec succès !
                      </p>
                    )}
                    {waTestResult === "fail" && (
                      <p className="flex items-center gap-1.5 text-sm text-red-500 mt-2">
                        <XCircle className="h-4 w-4" /> Échec — vérifiez le numéro et la connexion
                      </p>
                    )}
                  </div>
                )}

                {/* Instructions si non configuré */}
                {waState === "not_configured" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
                    <p className="font-semibold">Pour configurer Green API :</p>
                    <p>1. Crée un compte sur <span className="font-mono">green-api.com</span></p>
                    <p>2. Crée une instance → copie l&apos;ID et le token</p>
                    <p>3. Ajoute dans <span className="font-mono">.env</span> :</p>
                    <pre className="bg-amber-100 rounded-lg px-3 py-2 text-xs mt-1 font-mono">
{`GREEN_API_INSTANCE="ton_instance_id"
GREEN_API_TOKEN="ton_api_token"
WA_PROVIDER="greenapi"`}
                    </pre>
                    <p>4. Redémarre le serveur et clique sur Vérifier</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ══════ ONGLET MESSAGES DIRECTS ══════ */}
      {activeTab === "messages" && (
        <div className="max-w-2xl">
          <h2 className="font-semibold text-gray-900 text-lg mb-1">Messages directs WhatsApp</h2>
          <p className="text-sm text-gray-500 mb-6">Envoyez un message WhatsApp à n&apos;importe quel candidat.</p>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">

            {/* Recherche candidat */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rechercher un candidat</label>
              <div className="relative">
                <input
                  type="text"
                  value={dmSearch}
                  onChange={e => { setDmSearch(e.target.value); searchCandidates(e.target.value); }}
                  placeholder="Nom ou email du candidat..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
                />
                {dmSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
              </div>

              {/* Résultats */}
              {dmSearchResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {dmSearchResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setDmPhone(u.phone ?? "");
                        setDmName(u.name ?? u.email);
                        setDmSearch(u.name ?? u.email);
                        setDmSearchResults([]);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left border-b border-gray-100 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                        {(u.name ?? u.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.name ?? "—"}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email} · {u.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {dmSearch.length >= 2 && dmSearchResults.length === 0 && !dmSearching && (
                <p className="text-xs text-gray-400 mt-1">Aucun candidat trouvé avec un numéro enregistré.</p>
              )}
            </div>

            {/* Ou saisie manuelle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ou entrer un numéro directement
              </label>
              <input
                type="tel"
                value={dmPhone}
                onChange={e => { setDmPhone(e.target.value); setDmName(""); }}
                placeholder="+236 77 00 00 00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Destinataire sélectionné */}
            {dmPhone && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-lg">💬</span>
                <div>
                  {dmName && <p className="text-sm font-semibold text-emerald-800">{dmName}</p>}
                  <p className="text-xs text-emerald-600">{dmPhone}</p>
                </div>
                <button onClick={() => { setDmPhone(""); setDmName(""); setDmSearch(""); }} className="ml-auto text-emerald-400 hover:text-emerald-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                value={dmMessage}
                onChange={e => setDmMessage(e.target.value)}
                rows={4}
                placeholder="Bonjour [Prénom], nous avons une opportunité qui pourrait vous intéresser..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{dmMessage.length} caractères</p>
            </div>

            {/* Bouton envoyer */}
            <button
              onClick={sendDirectMessage}
              disabled={dmSending || !dmPhone || !dmMessage}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              {dmSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {dmSending ? "Envoi en cours..." : "Envoyer via WhatsApp"}
            </button>
          </div>

          {/* Historique des envois */}
          {dmHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Historique de cette session</h3>
              <div className="space-y-2">
                {dmHistory.map(entry => (
                  <div key={entry.id} className={`flex items-start gap-3 p-4 rounded-xl border ${entry.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <span className="text-lg flex-shrink-0">{entry.ok ? "✅" : "❌"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{entry.name}</p>
                        <p className="text-xs text-gray-400">{entry.phone}</p>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{entry.message}</p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(entry.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════ MODAL EMAIL GROUPÉ ══════ */}
      {bulkEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setBulkEmailModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Email groupé — {selectedUsers.size} destinataire(s)</h2>
              <button onClick={() => setBulkEmailModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Objet</label>
              <input
                type="text"
                value={bulkEmailSubject}
                onChange={e => setBulkEmailSubject(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                value={bulkEmailBody}
                onChange={e => setBulkEmailBody(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
            <button
              onClick={sendBulkEmail}
              disabled={bulkEmailSending || !bulkEmailSubject || !bulkEmailBody}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {bulkEmailSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {bulkEmailSending ? "Envoi en cours..." : "Envoyer"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    }>
      <AdminDashboard />
    </Suspense>
  );
}
