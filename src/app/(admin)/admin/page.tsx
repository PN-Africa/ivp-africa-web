"use client";

import { ShieldCheck, Briefcase, ClipboardList, ClipboardCheck } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import {AdminUserView} from "@/lib/api/adminUsers";
import type { ApplicationRecord } from "@/lib/types/application";
import { useEffect, useState } from "react";
import { adminReportsApi } from "@/lib/api/adminReports";
import { adminJobsApi } from "@/lib/api/adminJobs";
import { adminAuditLogsApi,AdminAuditLogEntry } from "@/lib/api/auditLogs";
import {
  adminDashboardApi,
  type PendingVerification,
} from "@/lib/api/adminDashboard";
// import type { AuditLogEntry } from "@/lib/types/auditLog";

export default function AdminDashboardPage() {
  const { session } = useSession();
 
    const [recentApplications, setRecentApplications] = useState<ApplicationRecord[]>([]);
    // const [latestUpdates, setLatestUpdates] = useState<AuditLogEntry[]>([]);
    const [latestUpdates, setLatestUpdates] = useState<AdminAuditLogEntry[]>([]);
    const [candidateCount, setCandidateCount] = useState(0);
    const [activeJobCount, setActiveJobCount] = useState(0);
    const [totalApplications, setTotalApplications] = useState(0);
    const [pendingVerificationCount, setPendingVerificationCount] = useState(0);
      const [pendingVerifications, setPendingVerifications] =
      useState<PendingVerification[]>([]);
  const stats = [
    { icon: ShieldCheck, label: "Registered candidates", value: candidateCount, filled: true },
    { icon: Briefcase, label: "Job applications", value: totalApplications, filled: false },
    { icon: ClipboardList, label: "Active job postings", value: activeJobCount, filled: false },
   {
  icon: ClipboardCheck,
  label: "Pending verifications",
  value: pendingVerificationCount,
  filled: false,
}];


const statusStyles: Record<ApplicationRecord["status"], string> = {
  applied: "bg-gray-100 text-gray-500",
  shortlisted: "bg-[#EDE7F8] text-[#8A38F5]",
  interview: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-600",
   hired: "bg-green-50 text-green-700",
};
useEffect(() => {
  async function loadDashboard() {
    const result = await adminDashboardApi.getStats();

    if (!result.ok) {
      console.error("Failed to load admin dashboard:", result.message);
      return;
    }

    const { overview, lists } = result.data;

    setCandidateCount(overview.totalCandidates);
    setActiveJobCount(overview.activeJobs);
    setTotalApplications(overview.totalApplications);
    setPendingVerificationCount(overview.pendingVerificationCount);
    setPendingVerifications(lists.pendingVerifications);

    const auditResult = await adminAuditLogsApi.getAll({ limit: 3 });
    if (auditResult.ok) {
      setLatestUpdates(auditResult.logs);
    }
  }

  loadDashboard();
}, []);
function dotColorFor(action: string) {
  if (action.toLowerCase().includes("suspend")) return "bg-red-500";
  if (action.toLowerCase().includes("approv") || action.toLowerCase().includes("reactivat")) return "bg-green-500";
  if (action.toLowerCase().includes("flag") || action.toLowerCase().includes("reject")) return "bg-amber-500";
  return "bg-[#8A38F5]";
}

function formatTimeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Welcome back, {session?.displayName ?? "Admin"}
        </h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Here&apos;s what&apos;s happening on the platform this week.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`group flex cursor-pointer items-center gap-3 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${
                stat.filled
                  ? "bg-gradient-to-br from-[#8E66FF] to-[#6C3CFF] text-white hover:shadow-[#6C3CFF]/30"
                  : "bg-[#F3EEFC] text-gray-900 hover:shadow-gray-200"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 sm:h-11 sm:w-11 ${
                  stat.filled ? "bg-white/20 group-hover:bg-white/30" : "bg-white group-hover:bg-[#8A38F5]"
                }`}
              >
                <Icon
                  size={17}
                  className={`transition-colors duration-200 sm:size-[19px] ${
                    stat.filled ? "text-white" : "text-[#8A38F5] group-hover:text-white"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold sm:text-xl">{stat.value}</p>
                <p className={`truncate text-xs sm:text-sm ${stat.filled ? "text-white/80" : "text-gray-500"}`}>
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent applications */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 sm:text-base">Recent applications</h2>
            <button
              type="button"
              className="text-xs font-medium text-[#8A38F5] transition-colors hover:text-[#6C3CFF] hover:underline sm:text-sm"
            >
              View all
            </button>
          </div>
          <div className="flex flex-col gap-2">
          {recentApplications.map((app) => (
            <div key={app.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-[#EDE7F8]">
              <div>
                <p className="text-sm font-semibold text-gray-900">{app.jobTitle}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {app.company} · {app.location}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[app.status] ?? "bg-gray-100 text-gray-500"}`}>
                {app.status}
              </span>
            </div>
          ))}
          </div>
        </div>

        {/* Platform summary */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
          <h2 className="text-sm font-bold text-gray-900 sm:text-base">Platform summary</h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
            Admin operations are normal.{" "}
            {pendingVerificationCount} employer
            {pendingVerificationCount !== 1 ? "s" : ""} waiting for manual
            verification.
          </p>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-gray-100 pt-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">System Uptime</span>
              <span className="font-semibold text-green-600">99.98%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Average Verification Turnaround</span>
              <span className="font-semibold text-gray-900">4.2 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended actions */}
      <div>
        <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">Recommended actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-5">
            <p className="text-[11px] font-semibold tracking-wide text-[#8A38F5] uppercase sm:text-xs">Edit setup</p>
            <p className="mt-2 text-xs font-bold text-gray-900 sm:text-sm">Review Talent Pool</p>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">18 new profiles have score &gt; 90. Review and feature.</p>
            <button
              type="button"
              className="mt-4 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-[#8A38F5] hover:text-white sm:px-4 sm:py-2 sm:text-sm"
            >
              View profiles
            </button>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-5">
  <p className="text-[11px] font-semibold tracking-wide text-[#8A38F5] uppercase sm:text-xs">
    Verification
  </p>

  <p className="mt-2 text-xs font-bold text-gray-900 sm:text-sm">
    Employer verification pending
  </p>

  {pendingVerifications.length > 0 ? (
    <>
      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
        {pendingVerifications[0].companyName} is waiting for verification.
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {pendingVerifications[0].user.email}
      </p>

      <button
        type="button"
        className="mt-4 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-[#8A38F5] hover:text-white sm:px-4 sm:py-2 sm:text-sm"
      >
        Review employer
      </button>
    </>
  ) : (
    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
      No employers are currently waiting for verification.
    </p>
  )}
</div>
        </div>
      </div>

      {/* Latest updates */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
        <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">Latest updates</h2>
        <div className="flex flex-col gap-3">
        {latestUpdates.map((update) => (
        <div key={update.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${dotColorFor(update.action)}`} />
            <p className="text-sm text-gray-700">
              {update.adminName} — {update.action}: {update.target}
            </p>
          </div>
          <span className="shrink-0 text-xs text-gray-400">{formatTimeAgo(update.createdAt)}</span>
        </div>
      ))}
    </div>
      </div>
    </>
  );
}