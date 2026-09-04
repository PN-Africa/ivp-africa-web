export type PipelineStage = "New" | "Screening" | "Interview" | "Offered" | "Hired" | "Rejected";

export interface ExperienceEntry {
  title: string;
  company: string;
  period: string;
  description?: string;
}

export interface EmployerCandidate {
  id: string;
  jobId: string;
  status: string;
  name: string;
  role: string;
  stage: PipelineStage;
  appliedAt: string;
  location: string;
  email: string;
  matchPercentage: number;
  about: string;
  experienceYears: number;
  availability: string;
  languages: string[];
  skills: string[];
  experience: ExperienceEntry[];
}

export interface TalentProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  skills: string[];
  user: {
    email: string;
  };
}

export interface JobApplicant {
  id: string;
  jobId: string;
  talentProfileId: string;
  status: "PENDING" | "SHORTLISTED" | "REJECTED" | "ACCEPTED";
  appliedAt: string;
  talentProfile: TalentProfile;
}

// 1. Add jobTitle parameter to the mapper
function mapApplicantToCandidate(applicant: any, fallbackJobId?: string, jobTitle?: string): EmployerCandidate {
  const statusMap: Record<string, PipelineStage> = {
    PENDING: "New",
    SHORTLISTED: "Screening",
    ACCEPTED: "Hired",
    REJECTED: "Rejected", 
  };

  return {
    id: applicant.id || applicant._id, 
    jobId: applicant.jobId || fallbackJobId || "", 
    status: applicant.status,
    name: `${applicant.talentProfile?.firstName || "Unknown"} ${applicant.talentProfile?.lastName || ""}`.trim(),
    // 2. Prioritize jobTitle over the talent headline
    role: jobTitle || applicant.talentProfile?.headline || "Talent",
    stage: statusMap[applicant.status] || "New",
    appliedAt: applicant.appliedAt,
    email: applicant.talentProfile?.user?.email || "",
    skills: applicant.talentProfile?.skills || [],
    location: "Remote",
    matchPercentage: Math.floor(Math.random() * 41) + 60,
    about: "No bio provided.",
    experienceYears: 0,
    availability: "Unknown",
    languages: ["English"],
    experience: [],
  };
}

const STAGE_TO_BACKEND_STATUS: Record<PipelineStage, string> = {
  New: "PENDING",
  Screening: "SHORTLISTED",
  Interview: "SHORTLISTED",
  Offered: "SHORTLISTED",
  Hired: "ACCEPTED",
  Rejected: "REJECTED",
};

export const employerCandidatesApi = {
  async getAll(token: string): Promise<EmployerCandidate[]> {
    if (typeof window === "undefined") return [];
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ivp-backend.onrender.com"; 
      
      const jobsRes = await fetch(`${baseUrl}/api/v1/jobs/my-postings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!jobsRes.ok) throw new Error(`Failed to fetch jobs: ${jobsRes.status}`);
      const jobs = await jobsRes.json();

      const applicantsPromises = jobs.map((job: any) => {
        const actualJobId = job.id || job._id; 
        // 3. Extract title from the job object (fallback gracefully if keys differ)
        const title = job.title || job.position || job.name; 
        return this.getApplicantsForJob(actualJobId, token, undefined, undefined, title);
      });
      
      const applicantsArrays = await Promise.all(applicantsPromises);
      return applicantsArrays.flat();

    } catch (error) {
      console.error("getAll error:", error);
      return [];
    }
  },

  // 4. Accept jobTitle as a parameter and pass it into the mapper
  async getApplicantsForJob(jobId: string, token: string, status?: string, skill?: string, jobTitle?: string): Promise<EmployerCandidate[]> {
    const query = new URLSearchParams();
    if (status) query.append("status", status);
    if (skill) query.append("skill", skill);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ivp-backend.onrender.com"; 
    
    const res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}/applicants?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch applicants for job ${jobId}: ${res.status}`);

    const data = await res.json();
    return data.map((app: any) => mapApplicantToCandidate(app, jobId, jobTitle));
  },

  async getById(applicantId: string, token: string): Promise<EmployerCandidate | null> {
    const candidates = await this.getAll(token);
    return candidates.find((c) => c.id === applicantId) ?? null;
  },

  async setStage(
    jobId: string,          
    applicationId: string,
    stage: PipelineStage,
    token: string
  ): Promise<{ id: string; status: string; updatedAt: string }> {
    const backendStatus = STAGE_TO_BACKEND_STATUS[stage] || stage;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ivp-backend.onrender.com";

    const response = await fetch(
      `${baseUrl}/api/v1/jobs/${jobId}/applicants/${applicationId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: backendStatus,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update candidate status (${response.status})`
      );
    }

    return response.json();
  },

  async remove(applicationId: string, token: string): Promise<void> {
    console.log("Removing candidate", applicationId);
  }
};