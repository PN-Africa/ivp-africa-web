import { apiFetch } from "./httpClient";
import { session } from "@/lib/auth/session";

interface AdminReportMetrics {
  candidates: number;
  employers: number;
  jobs: number;
  applications: number;
}

interface AdminReportSummary {
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
  metrics: AdminReportMetrics;
}

function authHeaders(): HeadersInit {
  const current = session.get();

  return current?.accessToken
    ? {
        Authorization: `Bearer ${current.accessToken}`,
      }
    : {};
}

export const adminReportsApi = {
  getSummary: async (filters?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();

    if (filters?.startDate) {
      params.set("startDate", filters.startDate);
    }

    if (filters?.endDate) {
      params.set("endDate", filters.endDate);
    }

    const query = params.toString()
      ? `?${params.toString()}`
      : "";

    const result = await apiFetch<AdminReportSummary>(
      `/api/v1/admin/reports/summary${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    console.log("ADMIN REPORT SUMMARY:", result);

    if (!result.ok) {
      return {
        ok: false as const,
        message: result.message,
      };
    }

    return {
      ok: true as const,
      data: result.data,
    };
  },
};