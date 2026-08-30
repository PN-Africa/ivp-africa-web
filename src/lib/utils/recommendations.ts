import { talentJobsApi, type TalentJob } from "@/lib/utils/talentJobs";
import type { CandidateProfileData } from "@/lib/types/Profile";

const roleToCategoryMap: Record<string, string> = {
  "Software Development": "Technology",
  "Data Analysis": "Data & AI",
  "Product Design (UI/UX)": "Technology",
  "Digital Marketing": "Media",
  "Graphic Design": "Media",
  "Content Writing": "Media",
  "Human Resources": "Human Resources",
  "Finance & Accounting": "Finance",
  "Sales & Business Development": "Retail",
  "Customer Service": "Hospitality",
  "Project Management": "Technology",
  "Engineering": "Technology",
  "Agriculture & Agribusiness": "Agriculture",
  "Healthcare & Medical": "Healthcare",
};

export async function getRecommendedJobs(
  profile: CandidateProfileData | null,
  limit = 4
): Promise<TalentJob[]> {
  const allJobs = await talentJobsApi.getAll();

  const selectedRoles = profile?.internshipPreferences?.selectedRoles ?? [];
  const candidateLocation = profile?.personalInfo?.location?.trim().toLowerCase() ?? "";

  const targetCategories = selectedRoles
    .map((role) => roleToCategoryMap[role])
    .filter((category): category is string => Boolean(category));

  if (targetCategories.length === 0 && !candidateLocation) {
    return [...allJobs].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo).slice(0, limit);
  }

  const scored = allJobs.map((job) => {
    let score = 0;

    if (targetCategories.some((category) => category.toLowerCase() === job.category.toLowerCase())) {
      score += 2;
    }

    if (candidateLocation && job.location.toLowerCase().includes(candidateLocation)) {
      score += 1;
    }

    return { job, score };
  });

  const matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.job);

  if (matched.length > 0) {
    return matched.slice(0, limit);
  }

  return [...allJobs].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo).slice(0, limit);
}