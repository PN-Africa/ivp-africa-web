"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChevronDown, Download, ShieldCheck, Briefcase, ClipboardList, ClipboardCheck, TrendingUp } from "lucide-react";
import { adminUsersApi, type AdminUserView } from "@/lib/api/adminUsers";
import { adminJobsApi } from "@/lib/api/adminJobs";
import {
  adminDashboardApi,
  type PendingVerification,
} from "@/lib/api/adminDashboard";

type ReportType = "platform" | "candidates" | "employers";
type RangeOption = "Last 6 Months" | "Last 12 Months";

const reportOptions: { value: ReportType; label: string }[] = [
  { value: "platform", label: "Platform Overview" },
  { value: "candidates", label: "Candidate Registrations" },
  { value: "employers", label: "Employer Activity" },
];

const rangeOptions: RangeOption[] = ["Last 6 Months", "Last 12 Months"];

function rangeToMonths(range: RangeOption): number {
  return range === "Last 6 Months" ? 6 : 12;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function buildMonthBuckets(monthsToShow: number) {
  const now = new Date();
  return Array.from({ length: monthsToShow }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1 - i), 1);
    return { label: monthLabel(d), key: monthKey(d) };
  });
}

function countByMonth(dates: Date[], buckets: { label: string; key: string }[]) {
  const counts: Record<string, number> = {};
  buckets.forEach((b) => (counts[b.key] = 0));
  dates.forEach((d) => {
    const key = monthKey(d);
    if (key in counts) counts[key] += 1;
  });
  return counts;
}

function toCsv(rows: Record<string, string | number | undefined>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerRow = headers.join(",") + "\n";
  const body = rows.map((r) => headers.map((h) => `"${r[h] ?? ""}"`).join(",")).join("\n");
  return headerRow + body;
}

export default function ReportsPage() {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [reportType, setReportType] = useState<ReportType>("platform");
  const [range, setRange] = useState<RangeOption>("Last 12 Months");
  const [checked, setChecked] = useState(false);
  const [pendingVerificationCount, setPendingVerificationCount] = useState(0);
  const [pendingVerifications, setPendingVerifications] =   useState<PendingVerification[]>([]);

 useEffect(() => {
  async function loadReports() {
    const usersResult = await adminUsersApi.getAll();
    if (usersResult.ok) {
      setUsers(usersResult.users.filter((u) => u.role !== "admin"));
    } else {
      console.error("Failed to load users for reports:", usersResult.message);
    }

    const jobsResult = await adminJobsApi.getAll();
    if (jobsResult.ok) {
      setAllJobs(jobsResult.jobs);
    } else {
      console.error("Failed to load jobs for reports:", jobsResult.message);
    }

    const statsResult = await adminDashboardApi.getStats();
    if (statsResult.ok) {
      setPendingVerificationCount(statsResult.data.overview.pendingVerificationCount);
      setPendingVerifications(statsResult.data.lists.pendingVerifications);
    } else {
      console.error("Failed to load dashboard stats for reports:", statsResult.message);
    }

    setChecked(true);
  }

  loadReports();
}, []);
  const candidates = users.filter((u) => u.role === "talent");
  const employers = users.filter((u) => u.role === "employer");
  const candidateCount = candidates.length;
  const employerCount = employers.length;
  const activeJobCount = allJobs.filter((j) => j.status === "PUBLISHED").length;

  const monthsToShow = rangeToMonths(range);
  const buckets = useMemo(() => buildMonthBuckets(monthsToShow), [monthsToShow]);

  const candidateDates = candidates.filter((u) => u.createdAt).map((u) => new Date(u.createdAt!));
  const employerDates = employers.filter((u) => u.createdAt).map((u) => new Date(u.createdAt!));
  const jobDates = allJobs.map((j) => new Date(j.createdAt));

  const candidateCounts = countByMonth(candidateDates, buckets);
  const employerCounts = countByMonth(employerDates, buckets);
  const jobCounts = countByMonth(jobDates, buckets);

  // Overall growth: total registrations this month vs. last month
  const overallGrowthPercent = useMemo(() => {
    if (buckets.length < 2) return 0;
    const thisMonthKey = buckets[buckets.length - 1].key;
    const lastMonthKey = buckets[buckets.length - 2].key;
    const thisMonth = (candidateCounts[thisMonthKey] ?? 0) + (employerCounts[thisMonthKey] ?? 0);
    const lastMonth = (candidateCounts[lastMonthKey] ?? 0) + (employerCounts[lastMonthKey] ?? 0);
    if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
    return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  }, [buckets, candidateCounts, employerCounts]);

  const chartData = useMemo(() => {
    return buckets.map((b) => {
      if (reportType === "platform") {
        return {
          label: b.label,
          "Candidate Registrations": candidateCounts[b.key] ?? 0,
          "Employer Registrations": employerCounts[b.key] ?? 0,
        };
      }
      if (reportType === "candidates") {
        return { label: b.label, "Candidate Registrations": candidateCounts[b.key] ?? 0 };
      }
      return {
        label: b.label,
        "Employer Registrations": employerCounts[b.key] ?? 0,
        "Jobs Posted": jobCounts[b.key] ?? 0,
      };
    });
  }, [buckets, reportType, candidateCounts, employerCounts, jobCounts]);

  const hasActivity = chartData.some((row) =>
    Object.entries(row).some(([key, val]) => key !== "label" && typeof val === "number" && val > 0)
  );

  const lineConfig =
    reportType === "platform"
      ? [
          { key: "Candidate Registrations", color: "#8A38F5" },
          { key: "Employer Registrations", color: "#3B82F6" },
        ]
      : reportType === "candidates"
        ? [{ key: "Candidate Registrations", color: "#8A38F5" }]
        : [
            { key: "Employer Registrations", color: "#8A38F5" },
            { key: "Jobs Posted", color: "#3B82F6" },
          ];

  function handleExport() {
    const csv = toCsv(chartData as unknown as Record<string, string | number>[]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const statCards = [
    { icon: ShieldCheck, label: "Registered candidates", value: candidateCount, filled: true },
    { icon: Briefcase, label: "Registered employers", value: employerCount },
    { icon: ClipboardList, label: "Active job postings", value: activeJobCount },
    { icon: ClipboardCheck, label: "Pending verifications", value: pendingVerificationCount, filled: false  },
    { icon: TrendingUp, label: "Overall growth", value: `${overallGrowthPercent >= 0 ? "+" : ""}${overallGrowthPercent}%` },
  ];

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Reports & Analytics</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Filter platform reports and export for offline review.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <label className="mb-1 block text-xs text-gray-400">Report type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full appearance-none rounded-xl border border-gray-200 py-2.5 pr-9 pl-3 text-sm font-medium text-gray-900 outline-none sm:w-56"
            >
              {reportOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 bottom-3 text-gray-400" />
          </div>

          <div className="relative">
            <label className="mb-1 block text-xs text-gray-400">Date range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as RangeOption)}
              className="w-full appearance-none rounded-xl border border-gray-200 py-2.5 pr-9 pl-3 text-sm font-medium text-gray-900 outline-none sm:w-44"
            >
              {rangeOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 bottom-3 text-gray-400" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#8A38F5] px-5 py-2.5 text-sm font-semibold text-[#8A38F5] transition-colors hover:bg-[#EDE7F8]"
        >
          <Download size={16} />
          Export Data
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`flex items-center gap-3 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-5 ${
                stat.filled ? "bg-gradient-to-br from-[#8E66FF] to-[#6C3CFF] text-white" : "bg-[#F3EEFC] text-gray-900"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.filled ? "bg-white/20" : "bg-white"}`}>
                <Icon size={18} className={stat.filled ? "text-white" : "text-[#8A38F5]"} />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className={`text-xs sm:text-sm ${stat.filled ? "text-white/80" : "text-gray-500"}`}>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 sm:text-base">Monthly Activity Performance Trend</h2>
          <div className="flex items-center gap-3">
            {lineConfig.map((line) => (
              <span key={line.key} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
                {line.key}
              </span>
            ))}
          </div>
        </div>

        {!checked || !hasActivity ? (
          <p className="py-16 text-center text-sm text-gray-400">
            No real data yet for this report — activity will appear here as candidates and employers register and post jobs.
          </p>
        ) : (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EDE7F8", fontSize: 13 }} />
                {lineConfig.map((line) => (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    stroke={line.color}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: line.color }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );
}