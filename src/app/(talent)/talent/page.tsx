"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Bookmark,
  User,
  Briefcase,
  Search,
} from "lucide-react";
import { RequireRole } from "@/app/(auth)/requireAuth";
import { useSession } from "@/lib/auth/useSession";
import { applicationsApi, savedJobsApi } from "@/lib/api/applications";
import { profileApi } from "@/lib/api/profile";
import { getProfileCompletion, type ChecklistItem } from "@/lib/utils/profileCompletion";
import { getRecommendedJobs } from "@/lib/utils/recommendations";
import { getLatestUpdates, type UpdateItem } from "@/lib/utils/dashboardUpdates";
import type { ApplicationRecord } from "@/lib/types/application";
import { talentJobsApi, type TalentJob } from "@/lib/utils/talentJobs";
import type { Job } from "@/app/(talent)/talent/jobs/job";
 
import { profileCompletionApi } from "@/lib/api/profileCompletion";



const statusStyles: Record<ApplicationRecord["status"], string> = {
  shortlisted: "bg-[#EDE7F8] text-[#8A38F5]",
  interview: "bg-amber-50 text-[#B77A1E]",
  applied: "bg-gray-100 text-gray-500",
  rejected: "bg-red-50 text-[#C94F3D]",
  hired: "bg-green-50 text-green-600",
};

const statusLabels: Record<ApplicationRecord["status"], string> = {
  shortlisted: "Shortlisted",
  interview: "Interview",
  applied: "Applied",
  rejected: "Rejected",
  hired: "Hired",
};

function TalentDashboard() {
  const { session } = useSession();

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
 
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<TalentJob[]>([]);


useEffect(() => {
  if (!session?.email) return;
  const email = session.email;

  async function loadDashboard() {
    setApplications(applicationsApi.getAll(email));
    setSavedCount(savedJobsApi.getAll(email).length);

    const profile = profileApi.get(email);
    const { checklist: items } = getProfileCompletion(profile);
    setChecklist(items);

    const completion = profileCompletionApi.get(email);
    setCompletionPercentage(completion.profilePercent);
    setIsProfileComplete(completion.isComplete);

    const recommended = await getRecommendedJobs(profile);
    setRecommendedJobs(recommended);

    const recentUpdates = await getLatestUpdates(email);
    setUpdates(recentUpdates);
  }

  loadDashboard();
}, [session?.email]);

  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const interviewCount = applications.filter((a) => a.status === "interview").length;
  const recentApplications = applications.slice(0, 4);

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Welcome back, {session?.displayName ?? "there"}
        </h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Here&apos;s what&apos;s happening with your job search this week.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Profile completion — filled/gradient card */}
        <div className="group flex cursor-pointer items-center gap-3 rounded-2xl bg-gradient-to-br from-[#8E66FF] to-[#6C3CFF] p-4 text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#6C3CFF]/30 sm:p-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-colors duration-200 group-hover:bg-white/30 sm:h-11 sm:w-11">
            <User size={17} className="text-white sm:size-[19px]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold sm:text-xl">{completionPercentage}%</p>
            <p className="text-xs text-white/80 sm:text-sm">
          {isProfileComplete ? "Profile complete" : "Complete your profile to apply"}
        </p>
          </div>
        </div>

        {/* Applications */}
        <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-[#EDE7F8] p-4 text-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#8A38F5]/10 sm:p-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#8A38F5] transition-colors duration-200 group-hover:bg-[#8A38F5] group-hover:text-white sm:h-11 sm:w-11">
            <FileText size={17} className="sm:size-[19px]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold sm:text-xl">{applications.length}</p>
            <p className="truncate text-xs text-gray-500 sm:text-sm">Applications</p>
            <p className="truncate text-[11px] text-gray-400">{shortlistedCount} shortlisted</p>
          </div>
        </div>

        {/* Interview invites */}
        <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-[#EDE7F8] p-4 text-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#8A38F5]/10 sm:p-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#8A38F5] transition-colors duration-200 group-hover:bg-[#8A38F5] group-hover:text-white sm:h-11 sm:w-11">
            <Calendar size={17} className="sm:size-[19px]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold sm:text-xl">{interviewCount}</p>
            <p className="truncate text-xs text-gray-500 sm:text-sm">Interview invites</p>
          </div>
        </div>

        {/* Saved jobs */}
        <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-[#EDE7F8] p-4 text-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#8A38F5]/10 sm:p-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#8A38F5] transition-colors duration-200 group-hover:bg-[#8A38F5] group-hover:text-white sm:h-11 sm:w-11">
            <Bookmark size={17} className="sm:size-[19px]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold sm:text-xl">{savedCount}</p>
            <p className="truncate text-xs text-gray-500 sm:text-sm">Saved jobs</p>
          </div>
        </div>
      </div>

      {/* Main content: left column (applications + recommended) / right column (profile + updates) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Recent applications */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 sm:text-base">Recent applications</h2>
              <Link
                href="/talent/applications"
                className="text-xs font-medium text-[#8A38F5] transition-colors hover:text-[#6C3CFF] hover:underline sm:text-sm"
              >
                View all
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400 sm:text-sm">
                No applications yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 transition-colors duration-150 hover:bg-[#EDE7F8] sm:px-4 sm:py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                        {app.jobTitle}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-gray-500 sm:text-xs">
                        {app.company} · {app.location}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap sm:px-3 sm:text-xs ${statusStyles[app.status]}`}
                    >
                      {statusLabels[app.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended for you — now sits under Recent applications */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 sm:text-base">Recommended for you</h2>
              <Link
                href="/talent/jobs"
                className="flex items-center gap-1.5 text-xs font-medium text-[#8A38F5] transition-colors hover:text-[#6C3CFF] sm:text-sm"
              >
                <Search size={14} className="sm:size-4" />
                Search jobs
              </Link>
            </div>

            {recommendedJobs.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400 sm:text-sm">
                No recommendations available right now.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-5"
                  >
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#8A38F5] sm:mb-3 sm:text-sm">
                      <Briefcase size={14} className="sm:size-4" />
                      {job.type}
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:text-base">
                      {job.title}
                    </h3>
                    <p className="mb-3 text-xs text-gray-500 sm:mb-4 sm:text-sm">
                      {job.company} · {job.location}
                    </p>
                    <Link
                      href={`/talent/jobs/${job.id}`}
                      className="text-xs font-medium text-[#8A38F5] transition-colors hover:text-[#6C3CFF] sm:text-sm"
                    >
                      View & apply →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Profile completion panel — original design */}
          {/* Profile completion panel — original design, text now reflects completion state */}
<div className="rounded-2xl border border-[#EDE7F8] bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
  <h2 className="text-sm font-bold text-gray-900 sm:text-base">
    {isProfileComplete ? "Profile completed" : "Finish your profile"}
  </h2>
  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
    {isProfileComplete
      ? "Your profile is complete and visible to employers."
      : "A few steps left to stand out to employers."}
  </p>

  <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
    {checklist.map((item) => (
      <li key={item.id} className="flex items-center gap-2.5">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            item.done ? "bg-gray-300" : "bg-[#8A38F5]"
          }`}
        />
        <span
          className={`text-xs sm:text-sm ${
            item.done ? "text-gray-400 line-through" : "font-medium text-gray-900"
          }`}
        >
          {item.label}
        </span>
      </li>
    ))}
  </ul>

  <Link
    href="/talent/Profile"
    className="mt-5 block w-full rounded-full bg-[#8A38F5] py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-[#7226e0] sm:mt-6 sm:py-3 sm:text-sm"
  >
    {isProfileComplete ? "Profile completed" : "Complete profile"}
  </Link>
</div>

          {/* Latest updates */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
            <h2 className="mb-4 text-sm font-bold text-[#3A2680] sm:text-base">Latest updates</h2>

            {updates.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400 sm:text-sm">
                No updates yet — start applying to see activity here.
              </p>
            ) : (
              <div className="flex flex-col gap-2 sm:gap-3">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className="cursor-pointer rounded-xl border border-gray-100 bg-[#EDE7F8] p-3 transition-colors duration-150 hover:bg-[#DCCFF5] sm:p-4"
                  >
                    <p className="text-xs font-semibold text-[#3A2680] sm:text-sm">{update.title}</p>
                    {update.description && (
                      <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">{update.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <RequireRole role="talent">
      <TalentDashboard />
    </RequireRole>
  );
}