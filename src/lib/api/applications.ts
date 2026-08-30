import type { ApplicationRecord, RealApplication, SavedJobRecord } from "@/lib/types/application";
import { notificationsApi } from "@/lib/api/notification";
import { apiFetch } from "@/lib/api/httpClient";
import { session } from "@/lib/auth/session";


const APPLICATIONS_PREFIX = "ivp_applications_";
const SAVED_JOBS_PREFIX = "ivp_saved_jobs_";


function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}
function normalizeApplication(raw: any): RealApplication {
  return {
    id: raw.id ?? raw._id ?? "",
    jobId: raw.jobId ?? raw.job?.id ?? "",
    jobTitle: raw.jobTitle ?? raw.job?.title ?? "Untitled role",
    company: raw.company ?? raw.job?.company ?? "Unknown company",
    location: raw.location ?? raw.job?.location ?? "Unknown location",
    status: raw.status ?? "PENDING",
    appliedAt:
      raw.appliedAt ??
      raw.createdAt ??
      new Date().toISOString(),
    interview: raw.interview ?? undefined,
  };
}
export const applicationsApi_Real={
  getApplication: async()=>{
    const res = await apiFetch<{data: any[]} | any[]>("/api/v1/applications/my-applications", {
      headers: authHeaders(),
    });
    if (!res.ok) {
      return { ok: false as const, message: res.message };
    }

    // Response shape (bare array vs. { data: [...] }) is unconfirmed — handle both.
    const rawList = Array.isArray(res.data) ? res.data : res.data.data ?? [];
    console.log("Raw application from backend:", rawList[0]);
    return { ok: true as const, applications: rawList.map(normalizeApplication) };
  }
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

export const applicationsApi = {
  getAll(email: string): ApplicationRecord[] {
    return readList<ApplicationRecord>(APPLICATIONS_PREFIX + email.toLowerCase());
  },


  isApplied(email: string, jobId: string): boolean {
    return this.getAll(email).some((a) => a.jobId === jobId);
  },

  apply(
    email: string,
    job: { id: string; title: string; company: string; location: string },
    cvFileName?: string, employerEmail?: string,
  ): ApplicationRecord {
    const key = APPLICATIONS_PREFIX + email.toLowerCase();
    const applications = readList<ApplicationRecord>(key);

    const record: ApplicationRecord = {
      id: crypto.randomUUID(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      status: "applied",
      appliedAt: new Date().toISOString(),
      cvFileName,
      employerEmail,
    };

    writeList(key, [record, ...applications]);
    notificationsApi.add(email, `You applied to ${job.title} at ${job.company}`);
    return record;
  },
};

export const savedJobsApi = {
  getAll(email: string): SavedJobRecord[] {
    return readList<SavedJobRecord>(SAVED_JOBS_PREFIX + email.toLowerCase());
  },

  isSaved(email: string, jobId: string): boolean {
    return this.getAll(email).some((s) => s.jobId === jobId);
  },

  toggle(
    email: string,
    job: { id: string; title: string; company: string; location: string }
  ): boolean {
    const key = SAVED_JOBS_PREFIX + email.toLowerCase();
    const saved = readList<SavedJobRecord>(key);
    const exists = saved.some((s) => s.jobId === job.id);

    if (exists) {
      writeList(key, saved.filter((s) => s.jobId !== job.id));
      return false;
    }

    writeList(key, [
      { jobId: job.id, jobTitle: job.title, company: job.company, location: job.location, savedAt: new Date().toISOString() },
      ...saved,
    ]);
    return true;
  },
};