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

function mapApplicantToCandidate(applicant: JobApplicant): EmployerCandidate {
  const statusMap: Record<string, PipelineStage> = {
    PENDING: "New",
    SHORTLISTED: "Screening",
    ACCEPTED: "Hired",
    REJECTED: "Rejected", 
  };

  return {
    id: applicant.id,
    jobId: applicant.jobId,
    status: applicant.status,
    name: `${applicant.talentProfile.firstName} ${applicant.talentProfile.lastName}`,
    role: applicant.talentProfile.headline || "Talent",
    stage: statusMap[applicant.status] || "New",
    appliedAt: applicant.appliedAt,
    email: applicant.talentProfile.user.email,
    skills: applicant.talentProfile.skills || [],
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

const BACKEND_STATUS_TO_STAGE: Record<string, PipelineStage> = {
  PENDING: "New",
  SHORTLISTED: "Screening",
  ACCEPTED: "Hired",
  REJECTED: "Rejected",
};

export const employerCandidatesApi = {
  // 1. Fetch all jobs, then fetch applicants for those jobs
  async getAll(token: string): Promise<EmployerCandidate[]> {
    if (typeof window === "undefined") return [];
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ivp-backend.onrender.com"; 
      
      // Step A: Get the employer's jobs using the route from your controller
      const jobsRes = await fetch(`${baseUrl}/api/v1/jobs/my-postings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!jobsRes.ok) throw new Error(`Failed to fetch jobs: ${jobsRes.status}`);
      const jobs = await jobsRes.json();

      // Step B: Fetch applicants for every job concurrently
      const applicantsPromises = jobs.map((job: { id: string }) => 
        this.getApplicantsForJob(job.id, token)
      );
      
      // Resolve all promises and flatten the array of arrays into a single list
      const applicantsArrays = await Promise.all(applicantsPromises);
      return applicantsArrays.flat();

    } catch (error) {
      console.error("getAll error:", error);
      return [];
    }
  },

  async getApplicantsForJob(jobId: string, token: string, status?: string, skill?: string): Promise<EmployerCandidate[]> {
    const query = new URLSearchParams();
    if (status) query.append("status", status);
    if (skill) query.append("skill", skill);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ivp-backend.onrender.com"; 
    
    // Correct URL matching @Get(':id/applicants')
    const res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}/applicants?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch applicants for job ${jobId}: ${res.status}`);

    const data: JobApplicant[] = await res.json();
    return data.map(mapApplicantToCandidate);
  },

  async getById(applicantId: string, token: string): Promise<EmployerCandidate | null> {
    const candidates = await this.getAll(token);
    return candidates.find((c) => c.id === applicantId) ?? null;
  },

  // 2. Fix the update route to include jobId as required by your controller
  async setStage(
    jobId: string,           // <-- ADDED jobId parameter
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