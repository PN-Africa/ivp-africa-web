import { apiFetch } from "./httpClient";
import { session } from "@/lib/auth/session";

export interface AdminUserView {
  id: string;
  email: string;
  displayName: string;
  role: "talent" | "employer" | "admin";
  status: "active" | "inactive" | "suspended";
  verification: "Verified" | "Unverified" | "Pending";
  createdAt?: string;
  lastLoginAt?: string;
  avatarUrl?: string;

  talentProfile?: {
    firstName?: string;
    lastName?: string;
    [key: string]: unknown;
  } | null;

  employerProfile?: {
    companyName?: string;
    verificationStatus?: string;
    [key: string]: unknown;
  } | null;
}

interface BackendUser {
  id: string;
  email: string;
  role: string;
  status: string;
  verificationStatus?: string;
  createdAt?: string;
  lastLoginAt?: string;

  talentProfile?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    location?: string;
    phoneNumber?: string;
    professionalTitle?: string;
    profileImageUrl?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    skills?: string[];
    certifications?: string[];
  };

  employerProfile?: {
    companyName?: string;
    verificationStatus?: string;
    logoUrl?: string;
    industry?: string;
    location?: string;
    officeAddress?: string;
    website?: string;
    description?: string;
    companySize?: string;
    contactPerson?: string;
    phoneNumber?: string;
    rcNumber?: string;
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


export interface AdminUserDetail extends AdminUserView {
  employerProfile?: BackendUser["employerProfile"];
  talentProfile?: BackendUser["talentProfile"];
}

function normalizeAdminUserDetail(raw: BackendUser): AdminUserDetail {
  return {
    ...normalizeAdminUser(raw),
    employerProfile: raw.employerProfile,
    talentProfile: raw.talentProfile,
  };
}
function normalizeAdminUser(raw: BackendUser): AdminUserView {
  const role = raw.role.toLowerCase();

  let displayName = raw.email;

  if (role === "talent") {
    displayName =
      `${raw.talentProfile?.firstName ?? ""} ${
        raw.talentProfile?.lastName ?? ""
      }`.trim() || raw.email;
  }

  if (role === "employer") {
    displayName =
      raw.employerProfile?.companyName?.trim() || raw.email;
  }

  let status: AdminUserView["status"];

  switch (raw.status) {
    case "ACTIVE":
      status = "active";
      break;

    case "INACTIVE":
      status = "inactive";
      break;

    case "SUSPENDED":
      status = "suspended";
      break;

    default:
      status = "active";
  }

  let verification: AdminUserView["verification"];

  if (role === "employer") {
    switch (raw.employerProfile?.verificationStatus) {
      case "APPROVED":
        verification = "Verified";
        break;

      case "PENDING":
        verification = "Pending";
        break;

      default:
        verification = "Unverified";
    }
  } else {
    verification = "Unverified";
  }

  return {
  id: raw.id,
  email: raw.email,
  displayName,
  role:
    role === "talent" ||
    role === "employer" ||
    role === "admin"
      ? role
      : "talent",
  status,
  verification,
  createdAt: raw.createdAt,
  talentProfile: raw.talentProfile,
  employerProfile: raw.employerProfile,
};
}

export const adminUsersApi = {
  async getAll(
    filters: {
      search?: string;
      role?: string;
      status?: string;
      verificationStatus?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const query = params.toString()
      ? `?${params.toString()}`
      : "";

    const result = await apiFetch<BackendUser[]>(
      `/api/v1/admin/users${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    console.log("ADMIN USERS RESPONSE:", result);

    if (!result.ok) {
      return {
        ok: false as const,
        message: result.message,
      };
    }

    return {
      ok: true as const,
      users: result.data.map(normalizeAdminUser),
    };
  },
 getById: async (id: string) => {
  const result = await apiFetch<BackendUser>(`/api/v1/admin/users/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });

  console.log("ADMIN USER DETAIL RESPONSE:", result);

  if (!result.ok) {
    return { ok: false as const, message: result.message };
  }

  return { ok: true as const, user: normalizeAdminUserDetail(result.data) };
},
setStatus: async (id: string, status: "active" | "inactive" | "suspended") => {
    const backendStatus = status === "active" ? "ACTIVE" : status === "suspended" ? "SUSPENDED" : "INACTIVE";

    const result = await apiFetch<{ id: string; email: string; status: string }>(
      `/api/v1/admin/users/${id}/status`,
      {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: backendStatus }),
      }
    );

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const };
  },

  
  resendVerification: async (id: string) => {
    const result = await apiFetch<{ message: string }>(
      `/api/v1/admin/users/${id}/resend-verification`,
      { method: "POST", headers: authHeaders() }
    );

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, message: result.data.message };
  },

  resetPassword: async (id: string) => {
    const result = await apiFetch<{ message: string }>(
      `/api/v1/admin/users/${id}/reset-password`,
      { method: "POST", headers: authHeaders() }
    );

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, message: result.data.message };
  },
};