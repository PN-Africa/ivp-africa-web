import { apiFetch } from "./httpClient";
import { session } from "@/lib/auth/session";

export interface PendingVerification {
  id: string;
  companyName: string;
  createdAt: string;
  user: {
    email: string;
  };
}

export interface AdminDashboardStats {
  overview: {
    totalCandidates: number;
    totalEmployers: number;
    activeJobs: number;
    totalApplications: number;
    pendingVerificationCount: number;
  };

  lists: {
    pendingVerifications: PendingVerification[];
    recentUsers: any[];
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

export const adminDashboardApi = {
  getStats: async () => {
    const result = await apiFetch<AdminDashboardStats>(
      "/api/v1/admin/dashboard/stats",
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    console.log("ADMIN DASHBOARD STATS:", result);

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