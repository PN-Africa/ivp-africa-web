
import { jobsApi, type RealJob } from "@/lib/api/jobs";

export interface TalentJob {
 id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDaysAgo: number;
  deadline: string;
  category: string;
  companyEmployees: string;
  verifiedEmployer: boolean;
  initial: string;
  status: "active" | "filled" | "flagged";
}

function daysAgo(iso: string): number {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diffMs / 86400_000));
}
function formatSalary(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;
  if (min) return `From ₦${min.toLocaleString()}`;
  if (max) return `Up to ₦${max.toLocaleString()}`;
  return "Not specified";
}

function mapBackendStatus(status: string): "active" | "filled" | "flagged" {
  if (status === "PUBLISHED") return "active";
  if (status === "CLOSED") return "filled";
  return "active"; // covers DRAFT and anything else unrecognized, for now
}

function fromRealJob(job: RealJob): TalentJob {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.employmentType,
    level: job.experienceLevel,
    salary: formatSalary(job.minSalary, job.maxSalary),
    description: job.description,
    requirements: job.requiredSkills.length > 0 ? job.requiredSkills : [job.qualification || "Not specified"],
    postedDaysAgo: daysAgo(job.createdAt),
    deadline: job.deadline,
    category: job.department || job.industry || "General",
    companyEmployees: "Not specified",
    verifiedEmployer: false,
    initial: (job.company || "?").trim()[0]?.toUpperCase() ?? "?",
    status: mapBackendStatus(job.status),
  };
}



export const talentJobsApi = {
getAll: async (): Promise<TalentJob[]> => {
    const result = await jobsApi.search();
    return result.ok ? result.jobs.map(fromRealJob) : [];
  },

  getById: async (id: string): Promise<TalentJob | null> => {
    const all = await talentJobsApi.getAll();
    return all.find((j) => j.id === id) ?? null;
  },
  
};