"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, MoreVertical } from "lucide-react";
import { employerJobsApi, EmployerJob, EmployerJobStatus } from "@/lib/api/employerJob";
import { applicationsApi } from "@/lib/api/applications";
import { useSession } from "@/lib/auth/useSession";
import type { ApplicationRecord } from "@/lib/types/application";

type TabValue = "all" | EmployerJobStatus;

const tabs: { value: TabValue; label: string }[] = [
  { value: "all", label: "All Jobs" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Drafts" },
  { value: "closed", label: "Closed" },
];

const statusStyles: Record<EmployerJobStatus, string> = {
  active: "bg-green-50 text-green-700",
  draft: "bg-amber-50 text-amber-700",
  closed: "bg-red-50 text-red-600",
};

const statusLabels: Record<EmployerJobStatus, string> = {
  active: "Active",
  draft: "Draft",
  closed: "Closed",
};

const avatarPalette = [
  { bg: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
];

function getInitials(title: string) {
  return title.trim().split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

function formatDate(iso: string) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function EmployerJobsPage() {
  const { session } = useSession();
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const [jobsRes, appsRes] = await Promise.all([
      employerJobsApi.getAll(),
      session?.email ? applicationsApi.getAll(session.email) : Promise.resolve([]),
    ]);

    if (jobsRes.ok && jobsRes.data) {
      setJobs(jobsRes.data);
    }

    const apps = Array.isArray(appsRes) ? appsRes : (appsRes as any)?.data ?? [];
    setApplications(apps);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [session?.email]);

  const counts = useMemo(() => {
    return {
      all: jobs.length,
      active: jobs.filter((j) => j.status === "active").length,
      draft: jobs.filter((j) => j.status === "draft").length,
      closed: jobs.filter((j) => j.status === "closed").length,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (activeTab === "all") return jobs;
    return jobs.filter((j) => j.status === activeTab);
  }, [jobs, activeTab]);

  async function handleSetStatus(jobId: string, status: EmployerJobStatus) {
    await employerJobsApi.setStatus(jobId, status);
    setOpenMenuId(null);
    refresh();
  }

  async function handleDelete(jobId: string) {
    await employerJobsApi.remove(jobId);
    setOpenMenuId(null);
    refresh();
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
          Job Postings
        </h1>

        <Link
          href="/employer/jobs/new"
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7226e0] sm:self-start sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Plus size={15} />
          Post a Job
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-3 sm:gap-2 sm:px-5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:py-4 sm:text-sm ${
                activeTab === tab.value
                  ? "border-[#8A38F5] text-[#8A38F5]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === tab.value ? "bg-[#8A38F5] text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        <div className="min-h-[300px] overflow-x-auto pb-20">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading job postings...</div>
          ) : (
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase text-gray-400 sm:px-5 sm:text-xs">Role</th>
                  <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase text-gray-400 md:table-cell sm:text-xs">Department</th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase text-gray-400 sm:text-xs">Applicants</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase text-gray-400 sm:text-xs">Status</th>
                  <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase text-gray-400 lg:table-cell sm:text-xs">Posted on</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase text-gray-400 sm:px-5 sm:text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.map((job, i) => {
                  const palette = avatarPalette[i % avatarPalette.length];
                  
                  // Compute dynamic applicant count
                  const dynamicCount = applications.filter((a) => {
                    if ((a as any).jobId && (a as any).jobId === job.id) return true;
                    return a.jobTitle?.trim().toLowerCase() === job.title?.trim().toLowerCase();
                  }).length;

                  return (
                    <tr key={job.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${palette.bg} ${palette.text}`}>
                            {getInitials(job.title)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{job.title}</p>
                            <p className="truncate text-xs text-gray-400">
                              {job.location} · {job.workMode}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 text-sm text-gray-600 md:table-cell">{job.department}</td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                        {dynamicCount || job.applicants || 0}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[job.status]}`}>
                          {statusLabels[job.status]}
                        </span>
                      </td>
                      <td className="hidden px-4 py-4 text-sm text-gray-400 lg:table-cell">{formatDate(job.postedOn)}</td>

                      <td className={`relative px-4 py-4 text-right sm:px-5 ${openMenuId === job.id ? "z-50" : ""}`}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === job.id ? null : job.id);
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenuId === job.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                              }} 
                            />
                            <div className="absolute right-4 z-20 mt-1 w-40 rounded-xl border border-gray-100 bg-white py-1 text-left shadow-lg sm:right-5">
                              <Link
                                href={`/employer/jobs/new?id=${job.id}`}
                                onClick={() => setOpenMenuId(null)}
                                className="block w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                              >
                                Edit
                              </Link>
                              {job.status !== "active" && (
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(job.id, "active")}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                                >
                                  Mark Active
                                </button>
                              )}
                              {job.status !== "closed" && (
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(job.id, "closed")}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                                >
                                  Close Job
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDelete(job.id)}
                                className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                      No jobs found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}