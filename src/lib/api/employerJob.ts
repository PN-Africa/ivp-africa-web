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

// Helper to translate backend job entity to frontend shape
function mapBackendJobToEmployerJob(raw: any): EmployerJob {
  let mappedStatus: EmployerJobStatus = "active";
  if (raw.status === "DRAFT") mappedStatus = "draft";
  if (raw.status === "CLOSED") mappedStatus = "closed";

  return {
    id: raw.id,
    title: raw.title,
    location: raw.location,
    workMode: raw.employmentType || "Full-Time",
    department: raw.department || "General",
    description: raw.description || "",
    qualification: raw.qualification || "",
    minSalary: raw.minSalary ?? "",
    maxSalary: raw.maxSalary ?? "",
    deadline: raw.deadline ? new Date(raw.deadline).toISOString().split("T")[0] : "",
    skills: raw.requiredSkills || [],
    applicants: raw._count?.applications ?? 0,
    status: mappedStatus,
    postedOn: raw.createdAt ? new Date(raw.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  };
}

export const employerJobsApi = {
  async getAll(): Promise<{ ok: boolean; data?: EmployerJob[]; message?: string }> {
    const res = await apiFetch<any[]>("/api/v1/jobs/my-jobs", { method: "GET" });
    console.log("my-jobs",res);
    if (!res.ok) {
    return { ok: false, message: res.message || "Failed to fetch jobs" };
    console.log("my-jobs",res);
  }
  if (!res.data) {
    return { ok: false, message: "Failed to fetch jobs" };
  }
  return { ok: true, data: res.data.map(mapBackendJobToEmployerJob) };
   
  },

  async getById(id: string): Promise<{ ok: boolean; data?: EmployerJob; message?: string }> {
    const res = await apiFetch<any>(`/api/v1/jobs/${id}`, { method: "GET" });
    if (!res.ok ) {
      return { ok: false, message: res.message || "Job not found" };
    }
    if(!res.data){
      return { ok: false, message: "Job not found" };
    }
    return { ok: true, data: mapBackendJobToEmployerJob(res.data) };
  },

  async create(payload: CreateBackendJobPayload): Promise<{ ok: boolean; data?: EmployerJob; message?: string }> {
    const res = await apiFetch<any>("/api/v1/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok ) {
      return { ok: false, message: res.message || "Failed to create job posting" };
    }
    if (!res.data) {
      return { ok: false, message: "Failed to create job posting" };
    }
    return { ok: true, data: mapBackendJobToEmployerJob(res.data) };
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