"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, FileText, AlertCircle, MessageCircle } from "lucide-react";
import { talentJobsApi, type TalentJob } from "@/lib/utils/talentJobs";
import { useSession } from "@/lib/auth/useSession";
import { jobsApi } from "@/lib/api/jobs";import { profileApi } from "@/lib/api/profile";
import { messageApi_Real } from "@/lib/api/message";
import { applicationsApi_Real } from "@/lib/api/applications";
import { profileCompletionApi } from "@/lib/api/profileCompletion";
const statusBadgeStyles: Record<"filled" | "flagged", string> = {
  filled: "bg-gray-100 text-gray-500",
  flagged: "bg-amber-50 text-amber-700",
};
const statusBadgeLabels: Record<"filled" | "flagged", string> = {
  filled: "Filled",
  flagged: "Flagged",
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
const jobId = params?.id;
  const router = useRouter();

  const { session } = useSession();
  const [job, setJob] = useState<TalentJob | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const completion = session?.email ? profileCompletionApi.get(session.email) : { profilePercent: 0, isComplete: false };

 useEffect(() => {
  if (!jobId) return;
  talentJobsApi.getById(jobId).then(setJob);
}, [jobId]);

useEffect(() => {
  if (!session?.email || !job) return;

  applicationsApi_Real.getApplication().then((result) => {
    console.log("getApplication result:", result);
    if (result.ok) {
      const match = result.applications.find((a)=> a.jobId === job.id );

      setApplied(!!match);
      setApplicationId(match?.id ?? null)
    }
  });

  jobsApi.getSavedJobs().then((result) => {
    if (result.ok) {
      setSaved(result.jobs.some((j) => j.id === job.id));
    }
  });
}, [session?.email, job?.id]);

  if (!job) {
    return <p className="text-sm text-gray-400">Job not found.</p>;
  }

 const resumeUrl = session?.email ? profileApi.get(session.email)?.skillsAndDocuments?.resumeUrl : null;
  
 
async function handleConfirmApply() {
    if (!session?.email || !job) return;

    const result = await  jobsApi.apply(job.id);
    if(result.ok) {
      setApplied(true);
      setShowConfirm(false);
    }else{
      console.error("Apply failed:", result.message);
    }
  }

  async function handleToggleSave() {
  if (!session?.email || !job) return;
  if (saved) {
    const result = await jobsApi.removeSavedJob(job.id);
    if (result.ok) setSaved(false);
  } else {
    const result = await jobsApi.saveJob(job.id);
    if (result.ok) setSaved(true);
  }
}
  function handleMessageEmployer() {
  if (!applicationId || !job) return;
  const params = new URLSearchParams({
    newApplicationId: applicationId,
    employerName: job.company,
  });
  router.push(`/talent/messages?${params.toString()}`);  
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/talent/jobs" className="flex w-fit items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} />
        Back to jobs
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-lg font-semibold text-white">
              {job.initial}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {job.company} · {job.location}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#EDE7F8] px-3 py-1 text-xs font-medium text-[#8A38F5]">{job.type}</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{job.level}</span>
            {job.status !== "active" && (
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeStyles[job.status]}`}>
                {statusBadgeLabels[job.status]}
              </span>
            )}
          </div>

          <h2 className="mt-6 text-base font-bold text-gray-900">About this role</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{job.description}</p>

          <h2 className="mt-6 text-base font-bold text-gray-900">Requirements</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-600">
            {job.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
           {job.status !== "active" ? (
  <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-center text-sm font-semibold text-gray-500">
          {job.status === "filled" ? "This position has been filled" : "This job has been flagged and is under review"}
        </div>
      ) : !completion.isComplete ? (
        <div className="rounded-xl bg-amber-50 p-4 text-center">
          <p className="text-sm font-semibold text-amber-700">Complete your profile to apply</p>
          <p className="mt-1 text-xs text-amber-600">
            Your profile is {completion.profilePercent}% complete. Fill in every required field to unlock applying.
          </p>
          <Link
            href="/talent/profile"
            className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Complete profile
          </Link>
        </div>
      ) : applied ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-sm font-semibold text-green-700">
          <Check size={16} />
          Applied
        </div>
      ) : (
        <button type="button" onClick={() => setShowConfirm(true)} className="w-full rounded-xl bg-[#8A38F5] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0]">
          Apply Now
        </button>
      )}
            {!applied && job.status === "active" && (
              <button type="button" onClick={handleToggleSave} className="mt-3 w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
                {saved ? "Saved" : "Save for later"}
              </button>
            )}

           <button
            type="button"
            onClick={handleMessageEmployer}
            disabled={!applicationId}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle size={16} />
            {applicationId ? "Message employer" : "Apply to message employer"}
          </button>

            <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Salary</span>
                <span className="font-semibold text-gray-900">{job.salary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Posted</span>
                <span className="font-semibold text-gray-900">{job.postedDaysAgo} days ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Deadline</span>
                <span className="font-semibold text-gray-900">{job.deadline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-semibold text-gray-900">{job.category}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="text-sm font-bold text-gray-900">About {job.company}</h3>
            <p className="mt-2 text-sm text-gray-500">{job.category}</p>
            <p className="text-sm text-gray-500">{job.companyEmployees}</p>
            {job.verifiedEmployer && <p className="mt-2 text-sm font-medium text-[#8A38F5]">✓ Verified employer</p>}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Confirm application</h3>
            <p className="mt-1 text-sm text-gray-500">
              You&apos;re applying to <span className="font-medium text-gray-900">{job.title}</span> at {job.company}.
            </p>

            {resumeUrl ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F5F3FA] px-4 py-3 text-sm text-gray-700">
              <FileText size={16} className="shrink-0 text-[#8A38F5]" />
              <span className="truncate">Using your saved resume link</span>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              No resume link added yet. You can still apply, but adding one to your profile first is recommended.
            </div>
          )}

            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowConfirm(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmApply} className="flex-1 rounded-xl bg-[#8A38F5] py-2.5 text-sm font-semibold text-white hover:bg-[#7226e0]">
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}