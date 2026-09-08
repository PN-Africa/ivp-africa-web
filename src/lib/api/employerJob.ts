import { apiFetch } from "./httpClient";

export type EmployerJobStatus = "active" | "draft" | "closed";

export interface EmployerJob {
  id: string;
  title: string;
  location: string;
  workMode: string;
  department: string;
  description: string;
  qualification?: string;
  minSalary: string | number;
  maxSalary: string | number;
  deadline: string;
  skills: string[];
  applicants: number;
  status: EmployerJobStatus;
  postedOn: string;
}

export interface CreateBackendJobPayload {
  title: string;
  description: string;
  location: string;
  employmentType: string;
  qualification: string;
  deadline: string;
  department: string;
  minSalary?: number;
  maxSalary?: number;
  requiredSkills: string[];
  status?: "PUBLISHED" | "DRAFT";
}

function mapBackendJobToEmployerJob(rawInput: any): EmployerJob {
  // Handle envelope responses wrapped in { data: { ... } }
  const raw =
    rawInput?.data && typeof rawInput.data === "object" && !Array.isArray(rawInput.data)
      ? rawInput.data
      : rawInput || {};

  let mappedStatus: EmployerJobStatus = "active";
  const statusUpper = String(raw.status || "").toUpperCase();
  if (statusUpper === "DRAFT") mappedStatus = "draft";
  else if (statusUpper === "CLOSED" || statusUpper === "ARCHIVED") mappedStatus = "closed";

  // Check all common Prisma/NestJS variations for applicant counts
  const applicantCount =
    raw._count?.applications ??
    raw._count?.JobApplication ??
    raw._count?.jobApplications ??
    raw._count?.Application ??
    raw.applicationCount ??
    raw.applicantCount ??
    raw.applicationsCount ??
    raw.totalApplicants ??
    (Array.isArray(raw.applications) ? raw.applications.length : 0);

  return {
    id: raw.id || raw._id || "",
    title: raw.title || "",
    location: raw.location || "",
    workMode: raw.employmentType || raw.workMode || "Full-Time",
    department: raw.department || "General",
    description: raw.description || "",
    qualification: raw.qualification || "",
    minSalary: raw.minSalary ?? "",
    maxSalary: raw.maxSalary ?? "",
    deadline: raw.deadline ? new Date(raw.deadline).toISOString().split("T")[0] : "",
    skills: raw.requiredSkills || raw.skills || [],
    applicants: Number(applicantCount) || 0,
    status: mappedStatus,
    postedOn: raw.createdAt
      ? new Date(raw.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  };
}

export const employerJobsApi = {
  async getAll(): Promise<{ ok: boolean; data?: EmployerJob[]; message?: string }> {
    const res = await apiFetch<any>("/api/v1/jobs/my-postings", { method: "GET" });
    if (!res.ok) {
      return { ok: false, message: res.message || "Failed to fetch jobs" };
    }

    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    return { ok: true, data: list.map(mapBackendJobToEmployerJob) };
  },

  async getById(id: string): Promise<{ ok: boolean; data?: EmployerJob; message?: string }> {
    const res = await apiFetch<any>(`/api/v1/jobs/${id}`, { method: "GET" });
    if (!res.ok) {
      return { ok: false, message: res.message || "Job not found" };
    }

    const payload = res.data?.data ?? res.data;
    if (!payload || (!payload.id && !payload._id && !payload.title)) {
      return { ok: false, message: "Job not found" };
    }

    return { ok: true, data: mapBackendJobToEmployerJob(payload) };
  },

  async create(payload: CreateBackendJobPayload): Promise<{ ok: boolean; data?: EmployerJob; message?: string }> {
    const res = await apiFetch<any>("/api/v1/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { ok: false, message: res.message || "Failed to create job posting" };
    }
    const payloadData = res.data?.data ?? res.data;
    return { ok: true, data: mapBackendJobToEmployerJob(payloadData) };
  },

  async update(id: string, payload: Partial<CreateBackendJobPayload>): Promise<{ ok: boolean; message?: string }> {
    const res = await apiFetch<any>(`/api/v1/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, message: res.message };
    }
    return { ok: true };
  },

  async setStatus(id: string, status: EmployerJobStatus): Promise<{ ok: boolean; message?: string }> {
    const backendStatus = status === "active" ? "PUBLISHED" : status === "draft" ? "DRAFT" : "CLOSED";
    const res = await apiFetch<any>(`/api/v1/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: backendStatus }),
    });
    if (!res.ok) {
      return { ok: false, message: res.message };
    }
    return { ok: true };
  },

  async remove(id: string): Promise<{ ok: boolean; message?: string }> {
    const res = await apiFetch<any>(`/api/v1/jobs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      return { ok: false, message: res.message };
    }
    return { ok: true };
  },
};