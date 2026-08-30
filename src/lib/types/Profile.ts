export interface PersonalInfo {
  fullName: string;
  email: string;
  location: string;
  whatsapp: string;
  age: string;
  avatarUrl?: string;
  bio:string,
  professionalTitle:string,
}
export interface SkillsAndDocumentsInfo {
  skills: string[];
  certifications: string[]; // new
  portfolioLink: string;
  resumeUrl: string;
   resumeFileName?: string;
}

export const emptySkillsAndDocuments: SkillsAndDocumentsInfo = {
  skills: ["", "", ""],
  certifications: [],
  portfolioLink: "",
  resumeUrl: "",
};

export interface EducationInfo {
  educationLevel: string;
  courseOfStudy: string;
  institution: string;
  currentlyInSchool: boolean;
  startDate: string;
  endDate: string; // new
}

export const emptyEducationInfo: EducationInfo = {
  educationLevel: "Undergraduate",
  courseOfStudy: "",
  institution: "",
  currentlyInSchool: false,
  startDate: "",
  endDate: "",
};


export interface ExperienceInfo {
  hasInternship: boolean;
  company: string;
  role: string;
  startDate: string;
}

export const emptyPersonalInfo: PersonalInfo = {
  fullName: "",
  email: "",
  location: "",
  whatsapp: "",
  age: "",
  avatarUrl: undefined,
   professionalTitle: "",
  bio: "",
};



export const emptyExperienceInfo: ExperienceInfo = {
  hasInternship: false,
  company: "",
  role: "",
  startDate: "",
};
export interface CandidateProfileData {
  personalInfo: PersonalInfo;
  education?: EducationInfo;
  experience?: ExperienceInfo;
  internshipPreferences?: InternshipPreferencesInfo;
  skillsAndDocuments?: SkillsAndDocumentsInfo;
}
export interface InternshipPreferencesInfo {
  selectedRoles: string[];
  duration: string;
  preferredJobType: string;
  preferredLocation: string;
  expectedSalary: string;
  availability: string;
}

export const emptyInternshipPreferences: InternshipPreferencesInfo = {
  selectedRoles: [],
  duration: "",
  preferredJobType: "",
  preferredLocation: "",
  expectedSalary: "",
  availability: "",
};
