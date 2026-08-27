import { apiFetch } from "./httpClient";
import { session } from "@/lib/auth/session";

function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

export interface BroadcastHistoryEntry {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  createdAt: string;
  adminName?: string;
}

interface BackendBroadcast {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  createdAt: string;
  admin?: { name?: string; email?: string };
}

function normalizeBroadcast(raw: BackendBroadcast): BroadcastHistoryEntry {
  return {
    id: raw.id,
    title: raw.title,
    message: raw.message,
    targetAudience: raw.targetAudience,
    createdAt: raw.createdAt,
    adminName: raw.admin?.name ?? raw.admin?.email,
  };
}

export const adminNotificationsApi = {
  broadcast: async (title: string, message: string, targetAudience: "ALL" | "TALENT" | "EMPLOYER") => {
    const result = await apiFetch<{ message: string; broadcastId: string; targetCount: number }>(
      "/api/v1/admin/notifications/broadcast",
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title, message, targetAudience }),
      }
    );

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, broadcastId: result.data.broadcastId, targetCount: result.data.targetCount };
  },

  getHistory: async () => {
    const result = await apiFetch<BackendBroadcast[]>("/api/v1/admin/notifications/history", {
      headers: authHeaders(),
    });

    console.log("BROADCAST HISTORY RAW:", result);

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, broadcasts: result.data.map(normalizeBroadcast) };
  },
};