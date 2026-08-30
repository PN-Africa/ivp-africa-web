import { apiFetch } from "./httpClient";
import { session } from "@/lib/auth/session";

function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

export interface PendingEmployerView {
  id: string; // EmployerProfile id — used for the /verify call
  companyName: string;
  industry: string | null;
  contactPerson: string | null;
  email: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  location: string | null;
  officeAddress: string | null;
  rcNumber: string | null;
  companySize: string | null;
  submittedAt: string; // createdAt
}

interface BackendPendingEmployer {
  id: string;
  companyName: string;
  industry: string | null;
  contactPerson: string | null;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  location: string | null;
  officeAddress: string | null;
  rcNumber: string | null;
  companySize: string | null;
  createdAt: string;
  user?: { email: string; createdAt: string };
}

function normalizePendingEmployer(raw: BackendPendingEmployer): PendingEmployerView {
  return {
    id: raw.id,
    companyName: raw.companyName,
    industry: raw.industry,
    contactPerson: raw.contactPerson,
    email: raw.user?.email ?? "",
    logoUrl: raw.logoUrl,
    description: raw.description,
    website: raw.website,
    location: raw.location,
    officeAddress: raw.officeAddress,
    rcNumber: raw.rcNumber,
    companySize: raw.companySize,
    submittedAt: raw.createdAt,
  };
}

export const adminEmployersApi = {
  getPendingVerifications: async () => {
    const result = await apiFetch<BackendPendingEmployer[]>(
      "/api/v1/admin/employers/pending-verifications",
      { headers: authHeaders() }
    );
    console.log("PENDING VERIFICATIONS RAW:", result);
    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, employers: result.data.map(normalizePendingEmployer) };
  },

  verify: async (id: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) => {
    const body: { status: string; rejectionReason?: string } = { status };
    if (status === "REJECTED" && rejectionReason) {
      body.rejectionReason = rejectionReason;
    }

    const result = await apiFetch<any>(`/api/v1/admin/employers/${id}/verify`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, employer: result.data };
  },
};