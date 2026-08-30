import { apiFetch } from "@/lib/api/httpClient";
import { session } from "@/lib/auth/session";

function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

export interface RealJob {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  minSalary: number | null;
  maxSalary: number | null;
  description: string;
  requiredSkills: string[];
  qualification: string;
  department: string;
  industry: string;
  deadline: string;
  createdAt: string;
  status: string;
  
}
function normalizeJob(raw: any): RealJob {
  return {
    id: raw.id ?? "",
    title: raw.title ?? "Untitled role",
    company: raw.employer?.companyName ?? "Unknown company",
    companyLogoUrl: raw.employer?.logoUrl ?? undefined,
    location: raw.location ?? "Not specified",
    employmentType: raw.employmentType ?? "Not specified",
    experienceLevel: raw.experienceLevel ?? "Not specified",
    minSalary: raw.minSalary !== undefined && raw.minSalary !== null ? Number(raw.minSalary) : null,
    maxSalary: raw.maxSalary !== undefined && raw.maxSalary !== null ? Number(raw.maxSalary) : null,
    description: raw.description ?? "",
    requiredSkills: Array.isArray(raw.requiredSkills) ? raw.requiredSkills : [],
    qualification: raw.qualification ?? "",
    department: raw.department ?? "",
    industry: raw.industry ?? "",
    deadline: raw.deadline ?? "Not specified",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    status: raw.status ?? "PUBLISHED",
  };
}

export interface SearchFilters {
  jobType?: string;
  location?: string;
  experienceLevel?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const jobsApi = {
  search: async (filters: SearchFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString() ? `?${params.toString()}` : "";

    const result = await apiFetch<{ message: string; data: any[] }>(`/api/v1/jobs/search${query}`);
    console.log("Jobs API response:", result);
    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }
    return { ok: true as const, jobs: result.data.data.map(normalizeJob), message: result.data.message };
  },

  apply: async (jobId: string) => {
    const result = await apiFetch<{
      message: string;
      applicationId: string;
      status: string;
      appliedAt: string;
    }>(`/api/v1/applications/apply/${jobId}`, {
      method: "POST",
      headers: authHeaders(),
    });

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }
    return { ok: true as const, ...result.data };
  },

  saveJob: async (jobId: string) => {
    const result = await apiFetch<{ message: string }>(`/api/v1/jobs/saved/${jobId}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return result.ok ? { ok: true as const } : { ok: false as const, message: result.message };
  },

  getSavedJobs: async () => {
    const result = await apiFetch<{ data: any[] }>("/api/v1/jobs/saved", {
      headers: authHeaders(),
    });
    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }
    return { ok: true as const, jobs: result.data.data.map(normalizeJob) };
  },

  removeSavedJob: async (jobId: string) => {
    const result = await apiFetch<{ message: string }>(`/api/v1/jobs/saved/${jobId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return result.ok ? { ok: true as const } : { ok: false as const, message: result.message };
  },
};