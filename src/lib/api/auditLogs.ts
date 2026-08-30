import { apiFetch } from "./httpClient";
import { session } from "@/lib/auth/session";

function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

export interface AdminAuditLogEntry {
  id: string;
  adminName: string;
  action: string;
  target: string;
  createdAt: string;
}

interface BackendAuditLog {
  id: string;
  action: string;
  entity?: string;
  createdAt: string;
  admin?: { name?: string; email?: string };
  [key: string]: any; // unknown extra fields until we see a real sample
}

function normalizeAuditLog(raw: BackendAuditLog): AdminAuditLogEntry {
  return {
    id: raw.id,
    adminName: raw.admin?.name ?? raw.admin?.email ?? "Unknown admin",
    action: raw.action,
    target: raw.entity ?? "—",
    createdAt: raw.createdAt,
  };
}

export const adminAuditLogsApi = {
  getAll: async (filters: {
    search?: string;
    action?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value));
    });
    const query = params.toString() ? `?${params.toString()}` : "";

    const result = await apiFetch<{ meta: any; data: BackendAuditLog[] }>(
      `/api/v1/admin/audit-logs${query}`,
      { headers: authHeaders() }
    );

    console.log("ADMIN AUDIT LOGS RAW:", result);

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, logs: result.data.data.map(normalizeAuditLog), meta: result.data.meta };
  },
};