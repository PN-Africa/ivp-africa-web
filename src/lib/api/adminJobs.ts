import { apiFetch } from "./httpClient";
import { session } from "@/lib/auth/session";

interface AdminJob {
  id: string;
  status: string;
  title: string;
  createdAt?: string;
  deadline?: string;
  employer?: {
    id: string;
    companyName: string;
    logoUrl?: string;
  };
  _count?: {
    applications: number;
  };
}

function authHeaders(): HeadersInit {
  const current = session.get();

  return current?.accessToken
    ? {
        Authorization: `Bearer ${current.accessToken}`,
      }
    : {};
}

export const adminJobsApi = {
  getAll: async (filters?: {
    search?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.set("search", filters.search);
    }

    if (filters?.status) {
      params.set("status", filters.status);
    }

    const query = params.toString()
      ? `?${params.toString()}`
      : "";

    const result = await apiFetch<AdminJob[]>(
      `/api/v1/admin/jobs${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    console.log("ADMIN JOBS:", result);

    if (!result.ok) {
      return {
        ok: false as const,
        message: result.message,
      };
    }

    return {
      ok: true as const,
      jobs: result.data,
    };
  },
   setStatus: async (id: string, status: "PUBLISHED" | "CLOSED" | "DRAFT") => {
    const result = await apiFetch<any>(`/api/v1/admin/jobs/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const };
  },
};