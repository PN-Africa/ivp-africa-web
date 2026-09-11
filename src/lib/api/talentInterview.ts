import { apiFetch } from "./httpClient";
import { session } from "@/lib/auth/session";

function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

export type TalentInterviewStatus = "upcoming" | "completed" | "cancelled";

export interface TalentInterview {
  id: string;
  applicationId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  scheduledAt: string;
  instructions?: string;
  status: TalentInterviewStatus;
  meetingLink?: string;
}

interface BackendTalentInterview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  location: string;
  instructions?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  application: {
    id: string;
    status: string;
    appliedAt: string;
    job: {
      id: string;
      title: string;
      location: string;
      jobType: string;
      employer: {
        companyName: string;
        logoUrl?: string;
      };
    };
  };
}

// Only "SCHEDULED" is confirmed from the docs — mapping other guessed
// statuses defensively until we see real examples of completed/cancelled.
function mapStatus(status: string): TalentInterviewStatus {
  const upper = status.toUpperCase();
  if (upper === "SCHEDULED") return "upcoming";
  if (upper === "COMPLETED") return "completed";
  if (upper === "CANCELLED" || upper === "CANCELED") return "cancelled";
  return "upcoming";
}

function normalizeInterview(raw: BackendTalentInterview): TalentInterview {
  const isVideoLink = raw.location?.includes("http");
  return {
    id: raw.id,
    applicationId: raw.applicationId,
    jobTitle: raw.application?.job?.title ?? "Role",
    companyName: raw.application?.job?.employer?.companyName ?? "Unknown company",
    companyLogoUrl: raw.application?.job?.employer?.logoUrl,
    location: raw.location,
    scheduledAt: raw.scheduledAt,
    instructions: raw.instructions,
    status: mapStatus(raw.status),
    meetingLink: isVideoLink ? raw.location.split(": ").pop() : undefined,
  };
}

export const talentInterviewsApi = {
  getAll: async () => {
    const result = await apiFetch<{ message: string; count: number; data: BackendTalentInterview[] }>(
      "/api/v1/jobs/talent/interviews",
      { headers: authHeaders() }
    );

    console.log("TALENT INTERVIEWS RAW:", result);

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, interviews: result.data.data.map(normalizeInterview) };
  },
};