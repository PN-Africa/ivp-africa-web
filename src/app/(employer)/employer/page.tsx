"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useSession } from "@/lib/auth/useSession";
import { employerJobsApi } from "@/lib/api/employerJob";
import { adminUsersApi } from "@/lib/api/adminUsers";
import { applicationsApi } from "@/lib/api/applications";
import { companyProfileApi } from "@/lib/api/companyProfile";
import type { EmployerJob } from "@/lib/api/employerJob";
import type { ApplicationRecord } from "@/lib/types/application";

const statusStyles: Record<ApplicationRecord["status"], string> = {
  applied: "bg-gray-100 text-gray-600",
  shortlisted: "bg-[#EDE7F8] text-[#8A38F5]",
  interview: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-600",
  hired: "bg-green-50 text-green-700",
};

const funnelColors: Record<ApplicationRecord["status"], string> = {
  applied: "#9CA3AF",
  shortlisted: "#8A38F5",
  interview: "#3B82F6",
  rejected: "#EF4444",
  hired: "#22C55E",
};

export default function EmployerDashboardPage() {
  const { session } = useSession();
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
useEffect(() => {
  async function loadDashboardData() {
    if (!session?.email) return;

    // 1. Real jobs — works today, employer-scoped by auth token.
    const jobsRes = await employerJobsApi.getAll();
    if (jobsRes.ok && jobsRes.data) {
      setJobs(jobsRes.data);
    } else {
      setJobs([]);
    }

    // 2. Applications to this employer's jobs — no real endpoint exists yet.
    // adminUsersApi.getAll() is admin-only and can't be used here; looping
    // through every talent user to find matching applications was never a
    // valid approach either. Leaving this empty until a real
    // "my applications" (or similar) employer-scoped endpoint exists.
    setApplications([]);
  }

  loadDashboardData();
}, [session]);

  const firstName = session?.displayName?.split(" ")[0] ?? "there";

  const activeJobCount = jobs.filter((j) => j.status === "active").length;
  const interviewCount = applications.filter((a) => a.status === "interview").length;
  const hiredCount = applications.filter((a) => a.status === "hired").length;

  const stats = [
    { label: "Active Jobs", value: activeJobCount, dot: "bg-[#8A38F5]" },
    { label: "Applicants", value: applications.length, dot: "bg-blue-500" },
    { label: "Interviews", value: interviewCount, dot: "bg-amber-500" },
    { label: "Hires", value: hiredCount, dot: "bg-green-500" },
  ];

  const recentApplications = applications.slice(0, 4);

  const funnelKeys: ApplicationRecord["status"][] = ["applied", "shortlisted", "interview", "hired"];
  const funnelData = funnelKeys
    .map((status) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: applications.filter((a) => a.status === status).length,
      color: funnelColors[status],
    }))
    .filter((d) => d.value > 0);
  const funnelTotal = applications.length;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
            Good morning, {firstName} 👋
          </h1>
          <p className="mt-1 text-[11px] text-gray-500 sm:text-xs md:text-sm">
            Here&apos;s what&apos;s happening with your recruitment platform today.
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7226e0] sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Plus size={15} className="sm:size-4" />
          Post a Job
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative rounded-2xl border border-gray-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4 md:p-5"
          >
            <span className={`absolute top-3 right-3 h-2 w-2 rounded-full sm:top-4 sm:right-4 ${stat.dot}`} />
            <p className="text-[11px] text-gray-500 sm:text-xs md:text-sm">{stat.label}</p>
            <p className="mt-1.5 text-lg font-bold text-gray-900 sm:mt-2 sm:text-xl md:text-2xl">
              {stat.value}
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

          {recentApplications.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No applicants yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0 sm:gap-3 sm:py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">{app.jobTitle}</p>
                    <p className="truncate text-[10px] text-gray-500 sm:text-xs">{app.location}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize whitespace-nowrap sm:px-3 sm:py-1 sm:text-xs ${statusStyles[app.status]}`}>
                    {app.status}
                  </span>
                </div>
              ))}
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

      {/* Top Performing Jobs — real jobs, matched against real applications by title */}
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
      ) : applications.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No applications yet — this will populate once candidates start applying.
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
                  const matched = applications.filter(
                    (a) => a.jobTitle.trim().toLowerCase() === job.title.trim().toLowerCase()
                  );
                  return (
                    <tr key={job.id}>
                      <td className="py-2.5 sm:py-3">
                        <p className="text-xs font-semibold text-gray-900 sm:text-sm">{job.title}</p>
                        <p className="text-[10px] text-gray-400 sm:text-xs">
                          {job.location} · {job.workMode}
                        </p>
                      </td>
                      <td className="py-2.5 text-right text-xs text-gray-700 sm:py-3 sm:text-sm">{matched.length}</td>
                      <td className="py-2.5 text-right text-xs text-gray-700 sm:py-3 sm:text-sm">
                        {matched.filter((a) => a.status === "interview").length}
                      </td>
                      <td className="py-2.5 text-right text-xs text-gray-700 sm:py-3 sm:text-sm">
                        {matched.filter((a) => a.status === "hired").length}
                      </td>
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