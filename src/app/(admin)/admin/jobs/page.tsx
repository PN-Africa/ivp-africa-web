"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { adminJobsApi } from "@/lib/api/adminJobs";

const PAGE_SIZE = 20;

type BackendJobStatus = "PUBLISHED" | "CLOSED" | "DRAFT";

const statusStyles: Record<BackendJobStatus, string> = {
  PUBLISHED: "bg-green-50 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
  DRAFT: "bg-amber-50 text-amber-700",
};

const statusLabels: Record<BackendJobStatus, string> = {
  PUBLISHED: "Published",
  CLOSED: "Closed",
  DRAFT: "Draft",
};

export default function JobManagementPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [managingJob, setManagingJob] = useState<any | null>(null);

  async function refresh() {
    setLoading(true);
    setLoadError(null);
    const result = await adminJobsApi.getAll();
    if (result.ok) {
      setJobs(result.jobs);
    } else {
      setLoadError(result.message ?? "Failed to load jobs.");
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        search.trim() === "" ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        (job.employer?.companyName ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All statuses" || statusLabels[job.status as BackendJobStatus] === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startIndex = filteredJobs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredJobs.length);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  async function handleSetStatus(status: BackendJobStatus) {
    if (!managingJob) return;
    const result = await adminJobsApi.setStatus(managingJob.id, status);
    if (result.ok) {
      await refresh();
      setManagingJob(null);
    } else {
      console.error("Failed to update job status:", result.message);
    }
  }

  return (
    <div className="flex flex-col gap-6 bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Job Management</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Monitor job listings and manage their publication status.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 sm:max-w-xs">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 py-2.5 pr-9 pl-4 text-sm text-gray-700 outline-none sm:w-40"
          >
            <option>All statuses</option>
            <option>Published</option>
            <option>Closed</option>
            <option>Draft</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-medium text-gray-400 sm:px-6">Job Title</th>
                <th className="hidden px-4 py-3 text-xs font-medium text-gray-400 sm:table-cell sm:px-6">Company</th>
                <th className="hidden px-4 py-3 text-xs font-medium text-gray-400 md:table-cell sm:px-6">Location</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 sm:px-6">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 sm:px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    Loading jobs...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-red-500">
                    {loadError}
                  </td>
                </tr>
              ) : paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    No job postings match your search or filter.
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <tr key={job.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4 sm:px-6">
                      <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-400 sm:hidden">{job.employer?.companyName ?? "Unknown company"}</p>
                    </td>
                    <td className="hidden px-4 py-4 text-sm text-gray-600 sm:table-cell sm:px-6">
                      {job.employer?.companyName ?? "Unknown company"}
                    </td>
                    <td className="hidden px-4 py-4 text-sm text-gray-500 md:table-cell sm:px-6">{job.location}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${statusStyles[job.status as BackendJobStatus] ?? "bg-gray-100 text-gray-500"}`}>
                        {statusLabels[job.status as BackendJobStatus] ?? job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right sm:px-6">
                      <button
                        type="button"
                        onClick={() => setManagingJob(job)}
                        className="rounded-lg border border-[#8A38F5] px-4 py-1.5 text-xs font-semibold text-[#8A38F5] transition-colors hover:bg-[#8A38F5] hover:text-white"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredJobs.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-gray-400 sm:text-sm">
              Showing {startIndex}-{endIndex} of {filteredJobs.length} jobs
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manage status modal */}
      {managingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">{managingJob.title}</h3>
            <p className="text-xs text-gray-400">{managingJob.employer?.companyName ?? "Unknown company"}</p>

            <p className="mt-4 text-sm text-gray-500">
              Choose a status for this job posting. This is what candidates will see.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSetStatus("PUBLISHED")}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  managingJob.status === "PUBLISHED"
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-700 hover:bg-green-50/50"
                }`}
              >
                Published
                {managingJob.status === "PUBLISHED" && <Check size={16} />}
              </button>

              <button
                type="button"
                onClick={() => handleSetStatus("CLOSED")}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  managingJob.status === "CLOSED"
                    ? "border-gray-300 bg-gray-100 text-gray-600"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Closed
                {managingJob.status === "CLOSED" && <Check size={16} />}
              </button>

              <button
                type="button"
                onClick={() => handleSetStatus("DRAFT")}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  managingJob.status === "DRAFT"
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-gray-200 text-gray-700 hover:bg-amber-50/50"
                }`}
              >
                Draft
                {managingJob.status === "DRAFT" && <Check size={16} />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setManagingJob(null)}
              className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}