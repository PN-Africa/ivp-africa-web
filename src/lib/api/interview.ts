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
}

function getInitials(name: string) {
  if (!name) return "??";
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ivp-backend.onrender.com";

export const interviewsApi = {
  // 1. Fetch ALL interviews from the real backend
  async getAll(token: string): Promise<Interview[]> {
    const res = await fetch(`${baseUrl}/interviews`, { // <-- Verify this endpoint with your backend dev
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 404) return []; // If endpoint doesn't exist yet, don't crash
      throw new Error("Failed to fetch interviews");
    }

    const data = await res.json();
    
    // Map backend data to your UI interface
    // Note: Adjust the mapping based on exactly what your backend JSON looks like
    return data.map((item: any) => ({
      id: item.id,
      candidateName: item.candidateName || item.applicant?.talentProfile?.firstName + " " + item.applicant?.talentProfile?.lastName || "Unknown Candidate",
      candidateInitials: getInitials(item.candidateName || item.applicant?.talentProfile?.firstName || "U"),
      role: item.role || item.job?.title || "Role",
      date: item.scheduledAt || item.date,
      type: item.location?.includes("http") ? "Video Call" : item.location?.includes("Phone") ? "Phone Interview" : "Video Call",
      status: item.status?.toLowerCase() || "upcoming",
      meetingLink: item.location?.includes("http") ? item.location : undefined,
      phoneNumber: item.location?.includes("Phone") ? item.location.replace("Phone Call: ", "") : undefined,
    }));
  },

  // 2. Schedule a new interview (This was already good, just keeping it)
  async scheduleApplicationInterview(
    token: string,
    jobId: string,
    applicationId: string,
    payload: { scheduledAt: string; location: string; instructions?: string }
  ) {
    const res = await fetch(`${baseUrl}/jobs/${jobId}/applicants/${applicationId}/interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to schedule interview.");
    }

    return res.json();
  },

  // 3. Reschedule via API
  async reschedule(token: string, interviewId: string, newDate: string) {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ scheduledAt: newDate }),
    });

    if (!res.ok) throw new Error("Failed to reschedule interview");
    return res.json();
  },

  // 4. Cancel/Update Status via API
  async setStatus(token: string, interviewId: string, status: InterviewStatus) {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: status.toUpperCase() }), // e.g., "CANCELLED"
    });

    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },
};