"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useSession } from "@/lib/auth/useSession";
import { employerJobsApi } from "@/lib/api/employerJob";
import { employerCandidatesApi, type EmployerCandidate } from "@/lib/api/candidate";
import type { EmployerJob } from "@/lib/api/employerJob";

type StageKey = "applied" | "shortlisted" | "interview" | "rejected" | "hired";

const statusStyles: Record<StageKey, string> = {
  applied: "bg-gray-100 text-gray-600",
  shortlisted: "bg-[#EDE7F8] text-[#8A38F5]",
  interview: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-600",
  hired: "bg-green-50 text-green-700",
};

const funnelColors: Record<StageKey, string> = {
  applied: "#9CA3AF",
  shortlisted: "#8A38F5",
  interview: "#3B82F6",
  rejected: "#EF4444",
  hired: "#22C55E",
};

function getCandidateStageKey(candidate: EmployerCandidate): StageKey {
  const stage = (candidate.stage || candidate.status || "").toLowerCase();
  if (stage.includes("hire") || stage.includes("accept")) return "hired";
  if (stage.includes("interv")) return "interview";
  if (stage.includes("short")) return "shortlisted";
  if (stage.includes("reject")) return "rejected";
  return "applied";
}

export default function EmployerDashboardPage() {
  const { session } = useSession();
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [candidates, setCandidates] = useState<EmployerCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const token = session?.accessToken || session?.accessToken;
      if (!token) return;

      setLoading(true);

      const [jobsRes, candidatesList] = await Promise.all([
        employerJobsApi.getAll(),
        employerCandidatesApi.getAll(token),
      ]);

      if (jobsRes.ok && jobsRes.data) {
        setJobs(jobsRes.data);
      }

      setCandidates(candidatesList);
      setLoading(false);
    }

    loadDashboard();
  }, [session]);

  const firstName = session?.displayName?.split(" ")[0] || "Employer";

  // Dynamic calculations across candidates and jobs
  const totalApplicants = candidates.length;
  const interviewCount = candidates.filter((c) => getCandidateStageKey(c) === "interview").length;
  const hiredCount = candidates.filter((c) => getCandidateStageKey(c) === "hired").length;
  const activeJobCount = jobs.filter((j) => j.status === "active").length;

  const stats = [
    { label: "Active Jobs", value: activeJobCount, dot: "bg-[#8A38F5]" },
    { label: "Applicants", value: totalApplicants, dot: "bg-blue-500" },
    { label: "Interviews", value: interviewCount, dot: "bg-amber-500" },
    { label: "Hires", value: hiredCount, dot: "bg-green-500" },
  ];

  const recentCandidates = candidates.slice(0, 4);

  const funnelKeys: StageKey[] = ["applied", "shortlisted", "interview", "hired"];
  const funnelData = funnelKeys
    .map((status) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: candidates.filter((c) => getCandidateStageKey(c) === status).length,
      color: funnelColors[status],
    }))
    .filter((d) => d.value > 0);

  const funnelTotal = candidates.length;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-[11px] text-gray-500 sm:text-xs md:text-sm">
            Here&apos;s what&apos;s happening with your recruitment platform today.
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-[#7226e0] sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Plus size={15} className="sm:size-4" />
          Post a Job
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative rounded-2xl border border-gray-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4 md:p-5"
          >
            <span className={`absolute top-3 right-3 h-2 w-2 rounded-full sm:top-4 sm:right-4 ${stat.dot}`} />
            <p className="text-[11px] text-gray-500 sm:text-xs md:text-sm">{stat.label}</p>
            <p className="mt-1.5 text-lg font-bold text-gray-900 sm:mt-2 sm:text-xl md:text-2xl">
              {loading ? "..." : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Recent Applicants */}
        <div className="rounded-2xl border border-gray-100 bg-white p-3 transition-shadow duration-200 hover:shadow-md sm:p-5 md:p-6 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <h2 className="text-xs font-bold text-gray-900 sm:text-sm md:text-base">Recent Applicants</h2>
            <Link
              href="/employer/candidates"
              className="text-[11px] font-medium text-[#8A38F5] hover:underline sm:text-xs md:text-sm"
            >
              View all
            </Link>
          </div>

          {recentCandidates.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No applicants yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {recentCandidates.map((candidate) => {
                const stageKey = getCandidateStageKey(candidate);
                return (
                  <div key={candidate.id} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0 sm:gap-3 sm:py-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                        {candidate.name || "Anonymous Applicant"}
                      </p>
                      <p className="truncate text-[10px] text-gray-500 sm:text-xs">
                        {candidate.id || "Applied Role"}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize whitespace-nowrap sm:px-3 sm:py-1 sm:text-xs ${statusStyles[stageKey]}`}>
                      {stageKey}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Application Funnel */}
        <div className="rounded-2xl border border-gray-100 bg-white p-3 transition-shadow duration-200 hover:shadow-md sm:p-5 md:p-6">
          <h2 className="mb-3 text-xs font-bold text-gray-900 sm:mb-4 sm:text-sm md:text-base">
            Application Funnel
          </h2>

          {funnelTotal === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No applications yet.</p>
          ) : (
            <>
              <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={funnelData} dataKey="value" innerRadius="65%" outerRadius="100%" paddingAngle={2} strokeWidth={0}>
                      {funnelData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{funnelTotal}</p>
                  <p className="text-[10px] text-gray-400 sm:text-[11px] md:text-xs">Total</p>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5 sm:mt-4 sm:gap-2">
                {funnelData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Performing Jobs */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 transition-shadow duration-200 hover:shadow-md sm:p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="text-xs font-bold text-gray-900 sm:text-sm md:text-base">Top Performing Jobs</h2>
          <Link
            href="/employer/jobs"
            className="text-[11px] font-medium text-[#8A38F5] hover:underline sm:text-xs md:text-sm"
          >
            View all
          </Link>
        </div>

        {jobs.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            No jobs posted yet.{" "}
            <Link href="/employer/jobs/new" className="font-semibold text-[#8A38F5] hover:underline">
              Post your first job
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-[10px] font-medium text-gray-400 sm:pb-3 sm:text-xs">Job role</th>
                  <th className="pb-2 text-right text-[10px] font-medium text-gray-400 sm:pb-3 sm:text-xs">Applicants</th>
                  <th className="pb-2 text-right text-[10px] font-medium text-gray-400 sm:pb-3 sm:text-xs">Interviews</th>
                  <th className="pb-2 text-right text-[10px] font-medium text-gray-400 sm:pb-3 sm:text-xs">Hires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.slice(0, 5).map((job) => {
                  const jobCandidates = candidates.filter((c) => c.jobId === job.id);
                  const interviews = jobCandidates.filter((c) => getCandidateStageKey(c) === "interview").length;
                  const hires = jobCandidates.filter((c) => getCandidateStageKey(c) === "hired").length;

                  return (
                    <tr key={job.id}>
                      <td className="py-2.5 sm:py-3">
                        <p className="text-xs font-semibold text-gray-900 sm:text-sm">{job.title}</p>
                        <p className="text-[10px] text-gray-400 sm:text-xs">
                          {job.location} · {job.workMode}
                        </p>
                      </td>
                      <td className="py-2.5 text-right text-xs text-gray-700 sm:py-3 sm:text-sm">{jobCandidates.length}</td>
                      <td className="py-2.5 text-right text-xs text-gray-700 sm:py-3 sm:text-sm">{interviews}</td>
                      <td className="py-2.5 text-right text-xs text-gray-700 sm:py-3 sm:text-sm">{hires}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}