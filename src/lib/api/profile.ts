import type { CandidateProfileData } from "@/lib/types/Profile";
import { session } from "@/lib/auth/session";
import { apiFetch, apiFetchMultipart } from "./httpClient";
const STORAGE_PREFIX = "ivp_profile_";

interface ProfileCompletionMeta {
  profilePercent?: number;
  isComplete?: boolean;
}

function authHeaders(): HeadersInit {
  const current = session.get();

  console.log("Current session:", current);
  console.log("Access token exists:", !!current?.accessToken);

  return current?.accessToken
    ? {
        Authorization: `Bearer ${current.accessToken}`,
      }
    : {};
}
function keyFor(email: string) {
  return `${STORAGE_PREFIX}${email.toLowerCase()}`;
}

export const ProfileApi_real ={

 updatePersonalInfo: async (input: {
  professionalTitle: string;
  bio: string;
  location: string;
  phoneNumber: string;
  age: string;
  profileImage?: File | null;
}) => {
  const formData = new FormData();
  formData.append("professionalTitle", input.professionalTitle);
  formData.append("bio", input.bio);
  formData.append("location", input.location);
  formData.append("phoneNumber", input.phoneNumber);
  formData.append("age", input.age);
  if (input.profileImage) formData.append("profileImage", input.profileImage);

  const result = await apiFetchMultipart<{ message?: string } & ProfileCompletionMeta>(
    "/api/v1/talent/profile/personal",
    formData,
    { method: "PUT", headers: authHeaders() }
  );

console.log("updatePersonalInfo raw result:", result);
  return result.ok
    ? { ok: true as const, profilePercent: result.data.profilePercent, isComplete: result.data.isComplete }
    : { ok: false as const, message: result.message };
},

updateSkills: async (input: {
  skills: string[];
  certifications: string[];
  portfolioUrl: string;
  resume?: File | null;
}) => {
  const formData = new FormData();

  // Send each skill as a separate "skills" field
  input.skills
    .filter((s) => s.trim())
    .forEach((s) => {
      formData.append("skills", s.trim());
    });

  // Send each certification as a separate "certifications" field
  input.certifications
    .filter((c) => c.trim())
    .forEach((c) => {
      formData.append("certifications", c.trim());
    });

  // Portfolio URL
  formData.append("portfolioUrl", input.portfolioUrl);

  // Resume/CV
  if (input.resume) {
    formData.append("resume", input.resume);
  }

  // Debug: check exactly what is being sent
  console.log("========== FORM DATA ==========");

  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  console.log("===============================");

  const result = await apiFetchMultipart<
   {
      message?: string;
      profile?: { resumeUrl?: string };
    } & ProfileCompletionMeta
  >("/api/v1/talent/profile/skills", formData, {
    method: "PUT",
    headers: authHeaders(),
  });

  console.log("Update skills result:", result);

  return result.ok
    ? {
        ok: true as const,
        profilePercent: result.data.profilePercent,
        isComplete: result.data.isComplete,
        resumeUrl: result.data.profile?.resumeUrl,
      }
    : {
        ok: false as const,
        message: result.message,
      };
},


addExperience: async (input: { company: string; role: string; startDate: string }) => {
  const result = await apiFetch<{ message?: string } & ProfileCompletionMeta>("/api/v1/talent/profile/experience", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return result.ok
    ? { ok: true as const, profilePercent: result.data.profilePercent, isComplete: result.data.isComplete }
    : { ok: false as const, message: result.message };
},

addEducation: async (input: {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
}) => {
  const result = await apiFetch<{ message?: string } & ProfileCompletionMeta>(
    "/api/v1/talent/profile/education",
    { method: "POST", headers: authHeaders(), body: JSON.stringify(input) }
  );
  return result.ok
    ? { ok: true as const, profilePercent: result.data.profilePercent, isComplete: result.data.isComplete }
    : { ok: false as const, message: result.message };
},


updateEmploymentPreferences: async (input: {
  preferredJobType: string;
  preferredLocation: string;
  expectedSalary: string;
  availability: string;
}) => {
  const result = await apiFetch<{ message?: string } & ProfileCompletionMeta>(
    "/api/v1/talent/profile/employment-preferences",
    { method: "PUT", headers: authHeaders(), body: JSON.stringify(input) }
  );
  return result.ok
    ? { ok: true as const, profilePercent: result.data.profilePercent, isComplete: result.data.isComplete }
    : { ok: false as const, message: result.message };
},
}

export const profileApi = {
  get(email: string): CandidateProfileData | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(keyFor(email));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  save(email: string, data: CandidateProfileData) {
    localStorage.setItem(keyFor(email), JSON.stringify(data));
  },
};