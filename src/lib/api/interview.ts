export type InterviewStatus = "upcoming" | "completed" | "cancelled";
export type InterviewType = "Video Call" | "Phone Interview" | "In-Person";

export interface Interview {
  id: string;
  candidateName: string;
  candidateInitials: string;
  role: string;
  date: string;
  type: InterviewType;
  status: InterviewStatus;
  meetingLink?: string;
  phoneNumber?: string;
  // We keep location here so you can pass it back during rescheduling
  rawLocation?: string; 
}

function getInitials(name: string) {
  if (!name || name === "Unknown Candidate") return "??";
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ivp-backend.onrender.com";
// Ensure this matches your global NestJS prefix (e.g., /api/v1)
const API_PREFIX = "/api/v1"; 

export const interviewsApi = {
  // 1. Fetch ALL interviews
  async getAll(token: string): Promise<Interview[]> {
    const res = await fetch(`${baseUrl}${API_PREFIX}/jobs/interviews`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 404) return []; 
      throw new Error("Failed to fetch interviews");
    }

    const responseData = await res.json();
    const interviewsList = Array.isArray(responseData) ? responseData : responseData.data || [];

    return interviewsList.map((item: any) => {
      // Map backend status ('SCHEDULED', 'RESCHEDULED', 'CANCELED', 'COMPLETED') to frontend UI status
      const rawStatus = item.status?.toUpperCase() || "SCHEDULED";
      let mappedStatus: InterviewStatus = "upcoming";
      if (rawStatus === "COMPLETED") mappedStatus = "completed";
      if (rawStatus === "CANCELED" || rawStatus === "CANCELLED") mappedStatus = "cancelled";

      // Access the exact Prisma schema structure from your backend
      const firstName = item.application?.talentProfile?.firstName || "";
      const lastName = item.application?.talentProfile?.lastName || "";
      const candidateName = `${firstName} ${lastName}`.trim() || "Unknown Candidate";
      
      const role = item.application?.job?.title || "Unknown Role";
      const locationStr = item.location || "";

      return {
        id: item.id, 
        candidateName,
        candidateInitials: getInitials(candidateName),
        role,
        date: item.scheduledAt || new Date().toISOString(),
        type: locationStr.includes("http") ? "Video Call" : locationStr.toLowerCase().includes("phone") ? "Phone Interview" : "In-Person",
        status: mappedStatus,
        meetingLink: locationStr.includes("http") ? locationStr : undefined,
        phoneNumber: locationStr.toLowerCase().includes("phone") ? locationStr : undefined,
        rawLocation: locationStr, // Save this so we can reuse it for rescheduling
      };
    });
  },

  // 2. Schedule a new interview
  async scheduleApplicationInterview(
    token: string,
    jobId: string,
    applicationId: string,
    payload: { scheduledAt: string; location: string; instructions?: string }
  ) {
    const res = await fetch(`${baseUrl}${API_PREFIX}/jobs/${jobId}/applicants/${applicationId}/interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errMsg = Array.isArray(errorData.message) ? errorData.message.join(", ") : errorData.message;
      throw new Error(errMsg || "Failed to schedule interview.");
    }
    return res.json();
  },

  // 3. Reschedule via API
  async reschedule(token: string, interviewId: string, newDate: string, existingLocation: string) {
    // ⚠️ Your backend DTO requires BOTH scheduledAt and location to be present!
    const res = await fetch(`${baseUrl}${API_PREFIX}/jobs/interviews/${interviewId}/reschedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        scheduledAt: newDate,
        location: existingLocation || "Virtual" // Fallback to prevent 400 Bad Request
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errMsg = Array.isArray(err.message) ? err.message.join(", ") : err.message;
      throw new Error(errMsg || "Failed to reschedule interview");
    }
    return res.json();
  },

  // 4. Cancel via API
  async cancel(token: string, interviewId: string) {
    // ⚠️ Your backend controller expects NO body for the cancel endpoint.
    const res = await fetch(`${baseUrl}${API_PREFIX}/jobs/interviews/${interviewId}/cancel`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to cancel interview");
    }
    return res.json();
  },
};