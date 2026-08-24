"use client";

import { useEffect, useState } from "react";
import { PersonalInfoCard } from "./profile";
import { EducationExperienceGrid } from "./educationExperienc";
import { InternshipPreferences } from "./Internship";
import { SkillsAndDocuments } from "./SkillLevel";
import { useSession } from "@/lib/auth/useSession";
import { session as sessionStore } from "@/lib/auth/session";
import { profileApi, ProfileApi_real } from "@/lib/api/profile";
import { notificationsApi } from "@/lib/api/notification";
import { profileCompletionApi } from "@/lib/api/profileCompletion";
import {
  emptyPersonalInfo,
  emptyEducationInfo,
  emptyExperienceInfo,
  emptyInternshipPreferences,
  emptySkillsAndDocuments,
  type CandidateProfileData,
  type PersonalInfo,
  type EducationInfo,
  type ExperienceInfo,
  type InternshipPreferencesInfo,
  type SkillsAndDocumentsInfo,
} from "@/lib/types/Profile";

export default function ProfilePage() {
  const { session } = useSession();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(emptyPersonalInfo);
  const [education, setEducation] = useState<EducationInfo>(emptyEducationInfo);
  const [experience, setExperience] = useState<ExperienceInfo>(emptyExperienceInfo);
  const [internshipPreferences, setInternshipPreferences] = useState<InternshipPreferencesInfo>(
    emptyInternshipPreferences
  );

  const [skillsAndDocuments, setSkillsAndDocuments] = useState<SkillsAndDocumentsInfo>(
    emptySkillsAndDocuments
  );

  const [hasProfile, setHasProfile] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "updated">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
const [avatarFile, setAvatarFile] = useState<File | null>(null);
const [resumeFile, setResumeFile] = useState<File | null>(null);
const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!session?.email) return;
    const existing = profileApi.get(session.email);
    if (existing) {
      setPersonalInfo({ ...emptyPersonalInfo, ...existing.personalInfo });
      setEducation({ ...emptyEducationInfo, ...existing.education });
      setExperience({ ...emptyExperienceInfo, ...existing.experience });
     setInternshipPreferences({ ...emptyInternshipPreferences, ...existing.internshipPreferences });
      setSkillsAndDocuments({ ...emptySkillsAndDocuments, ...existing.skillsAndDocuments });
      setHasProfile(true);
    } else {
      setPersonalInfo((p) => ({ ...p, email: session.email, fullName: session.displayName ?? "" }));
    }
  }, [session?.email]);

  function validateProfile(): string | null {
    if (!personalInfo.fullName.trim()) return "Full name is required.";
    if (!personalInfo.location.trim()) return "Location is required.";
    if (!personalInfo.professionalTitle.trim()) return "Professional title is required.";

    if (!education.institution.trim()) return "Institution name is required.";
    if (!education.courseOfStudy.trim()) return "Course of study is required.";
    if (!education.startDate) return "Education start date is required.";

    if (experience.hasInternship) {
      if (!experience.company.trim()) return "Company is required.";
      if (!experience.role.trim()) return "Role is required.";
      if (!experience.startDate) return "Experience start date is required.";
    }

    const hasAnySkill = skillsAndDocuments.skills.some((s) => s.trim() !== "");
    if (!hasAnySkill) return "Please add at least one skill.";

    return null;
  }

  async function handleSave() {
  if (!session?.email) return;

  setSaveError(null);

  const validationError = validateProfile();

  if (validationError) {
    setSaveError(validationError);
    return;
  }

  setSaving(true);

  const wasNewProfile = !hasProfile;

  try {
    // -----------------------------------------
    // 1. EDUCATION
    // -----------------------------------------
    const eduResult = await ProfileApi_real.addEducation({
      institution: education.institution,
      degree: education.courseOfStudy,
      fieldOfStudy: education.courseOfStudy,
      startDate: new Date(education.startDate).toISOString(),
      endDate: education.currentlyInSchool
        ? undefined
        : education.endDate
          ? new Date(education.endDate).toISOString()
          : undefined,
    });

    // -----------------------------------------
    // 2. EXPERIENCE
    // -----------------------------------------
    let expResult;

    if (experience.hasInternship) {
      expResult = await ProfileApi_real.addExperience({
        company: experience.company,
        role: experience.role,
        startDate: new Date(
          experience.startDate
        ).toISOString(),
      });
    }

    // -----------------------------------------
    // 3. PERSONAL INFO
    // -----------------------------------------
    const personalResult =
      await ProfileApi_real.updatePersonalInfo({
        professionalTitle: personalInfo.professionalTitle,
        bio: personalInfo.bio,
        location: personalInfo.location,
        profileImage: avatarFile,
        phoneNumber: personalInfo.whatsapp,
        age: personalInfo.age,
      });

    // -----------------------------------------
    // 4. EMPLOYMENT PREFERENCES
    // -----------------------------------------
    const prefsResult =
      await ProfileApi_real.updateEmploymentPreferences({
        preferredJobType:
          internshipPreferences.preferredJobType,
        preferredLocation:
          internshipPreferences.preferredLocation,
        expectedSalary:
          internshipPreferences.expectedSalary,
        availability:
          internshipPreferences.availability,
      });

    // -----------------------------------------
    // 5. SKILLS + RESUME
    // -----------------------------------------
    const realSkills = skillsAndDocuments.skills.filter(
      (s) => s.trim() !== ""
    );

    const skillsResult =
      await ProfileApi_real.updateSkills({
        skills: realSkills,
        certifications:
          skillsAndDocuments.certifications,
        portfolioUrl:
          skillsAndDocuments.portfolioLink,
        resume: resumeFile,
      });

    // -----------------------------------------
    // 6. UPDATE RESUME URL
    // -----------------------------------------
    let finalSkillsAndDocuments =
      skillsAndDocuments;

    if (skillsResult.ok && skillsResult.resumeUrl) {
      finalSkillsAndDocuments = {
        ...skillsAndDocuments,
        resumeUrl: skillsResult.resumeUrl,
        resumeFileName: resumeFile?.name ?? skillsAndDocuments.resumeFileName,
      };

      setSkillsAndDocuments(finalSkillsAndDocuments);

      // The important part:
      // Save the returned resumeUrl to localStorage
      console.log(
        "Resume saved:",
        skillsResult.resumeUrl
      );
    }

    // -----------------------------------------
    // 7. SAVE COMPLETE PROFILE LOCALLY
    // -----------------------------------------
    const finalProfile: CandidateProfileData = {
      personalInfo,
      education,
      experience,
      internshipPreferences,
      skillsAndDocuments: finalSkillsAndDocuments,
    };

    profileApi.save(
      session.email,
      finalProfile
    );

    console.log(
      "Profile saved to localStorage:",
      finalProfile
    );

    // -----------------------------------------
    // 8. PROFILE COMPLETION
    // -----------------------------------------
    const results = [
      skillsResult,
      personalResult,
      prefsResult,
      expResult,
      eduResult,
    ].filter(Boolean);

    const withCompletion = results.find(
      (r) =>
        r?.ok &&
        r.profilePercent !== undefined
    );


    if (withCompletion?.ok) {
      profileCompletionApi.set(
        session.email,
        {
          profilePercent:
            withCompletion.profilePercent ?? 0,
          isComplete:
            withCompletion.isComplete ?? false,
        }
      );
    }

    // -----------------------------------------
    // 9. NOTIFICATION
    // -----------------------------------------
    notificationsApi.add(
      session.email,
      "Your profile was updated"
    );

    // -----------------------------------------
    // 10. UPDATE SESSION
    // -----------------------------------------
    sessionStore.set({
      ...session,
      displayName:
        personalInfo.fullName ||
        session.displayName,
      avatarUrl: personalInfo.avatarUrl,
    });

    // -----------------------------------------
    // 11. FINISH
    // -----------------------------------------
    setHasProfile(true);

    setSaveStatus(
      wasNewProfile ? "saved" : "updated"
    );

    setResumeFile(null);
    setAvatarFile(null);

    setTimeout(() => {
      setSaveStatus("idle");
    }, 2000);

  } catch (error) {
    console.error(
      "Profile save error:",
      error
    );

    setSaveError(
      "Something went wrong while saving your profile."
    );
  } finally {
    setSaving(false);
  }
}

  const buttonLabel =
    saveStatus === "saved" ? "Saved ✓" : saveStatus === "updated" ? "Updated ✓" : hasProfile ? "Update" : "Save changes";

  return (
    <div className="flex flex-col gap-4 pb-24 sm:gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Profile</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Manage your personal info, education, and documents. Fields marked{" "}
          <span className="text-red-500">*</span> are required.
        </p>
      </div>

      <PersonalInfoCard onPhotoFileSelected={setAvatarFile} value={personalInfo} onChange={setPersonalInfo} />
      <EducationExperienceGrid
        education={education}
        onEducationChange={setEducation}
        experience={experience}
        onExperienceChange={setExperience}
      />
      <InternshipPreferences value={internshipPreferences} onChange={setInternshipPreferences} />
      <SkillsAndDocuments onResumeFileSelected={setResumeFile} value={skillsAndDocuments} onChange={setSkillsAndDocuments} />

      <div className="fixed right-4 bottom-4 flex flex-col items-end gap-2 sm:right-8 sm:bottom-6">
        {saveError && (
          <span className="max-w-[220px] rounded-lg bg-red-50 px-3 py-2 text-right text-xs font-medium text-red-500 sm:max-w-xs sm:text-sm">
            {saveError}
          </span>
        )}
        <button
  type="button"
  onClick={handleSave}
  disabled={saving}
  className="rounded-full bg-[#8A38F5] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-200 transition-colors hover:bg-[#7226e0] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-3 sm:text-sm"
>
  {saving ? (
    <span className="flex items-center gap-2">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      Saving…
    </span>
  ) : (
    buttonLabel
  )}
</button>
      </div>
    </div>
  );
}