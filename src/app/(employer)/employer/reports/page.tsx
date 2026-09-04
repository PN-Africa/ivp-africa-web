"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Download, MoreVertical } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { employerCandidatesApi, EmployerCandidate, PipelineStage } from "@/lib/api/candidate";
// Adjust this import path based on where you saved your employer jobs API
import { employerJobsApi, EmployerJob } from "@/lib/api/employerJob"; 

const funnelStages: { stage: PipelineStage; color: string }[] = [
  { stage: "New", color: "#8A38F5" },
  { stage: "Screening", color: "#3B82F6" },
  { stage: "Interview", color: "#22C55E" },
  { stage: "Offered", color: "#F59E0B" },
  { stage: "Hired", color: "#EF4444" },
];

function toCsv(candidates: EmployerCandidate[]): string {
  const header = "Name,Role,Stage,Applied On\n";
  const body = candidates
    .map((c) => `"${c.name}","${c.role}","${c.stage}","${new Date(c.appliedAt).toISOString().slice(0, 10)}"`)
    .join("\n");
  return header + body;
}

export default function ReportsPage() {
  const { session } = useSession();
  const [candidates, setCandidates] = useState<EmployerCandidate[]>([]);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [range, setRange] = useState<"Weekly" | "Monthly">("Monthly");

 useEffect(() => {
  if (!session?.accessToken) return;
  const token = session.accessToken;

  async function loadReportData() {
    try {
      const [candidatesData, jobsRes] = await Promise.all([
        employerCandidatesApi.getAll(token),
        employerJobsApi.getAll()
      ]);

      setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
      setJobs(jobsRes.ok && jobsRes.data ? jobsRes.data : []);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setCandidates([]);
      setJobs([]);
    }
  }

  loadReportData();
}, [session?.accessToken]);

  const totalApplications = candidates.length;

  // --- 1. Funnel & Acceptance Rate Calculation ---
  const funnelCounts = useMemo(() => {
    return funnelStages.map(({ stage, color }) => ({
      stage,
      color,
      count: candidates.filter((c) => c.stage === stage).length,
    }));
  }, [candidates]);

  const funnelMax = Math.max(...funnelCounts.map((f) => f.count), 1);
  
  // Real acceptance rate: Hired / Total Offers (Hired + Currently Offered)
  const hiredCount = candidates.filter((c) => c.stage === "Hired").length;
  const offeredCount = candidates.filter((c) => c.stage === "Offered").length;
  const totalOffers = hiredCount + offeredCount;
  const offerAcceptanceRate = totalOffers > 0 ? Math.round((hiredCount / totalOffers) * 100) : 0;

  // --- 2. Time to Hire Calculation ---
  // Average days between appliedAt and today (for Hired candidates)
  const avgTimeToHire = useMemo(() => {
    const hiredCandidates = candidates.filter(c => c.stage === "Hired");
    if (hiredCandidates.length === 0) return 0;

    const totalDays = hiredCandidates.reduce((sum, c) => {
      const appliedTime = new Date(c.appliedAt).getTime();
      const nowTime = new Date().getTime(); 
      const days = Math.max(0, Math.floor((nowTime - appliedTime) / (1000 * 60 * 60 * 24)));
      return sum + days;
    }, 0);

    return Math.round(totalDays / hiredCandidates.length);
  }, [candidates]);

  // --- 3. Dynamic Applications Over Time (Last 6 Months) ---
 const dynamicMonthlyTrend = useMemo(() => {
  const result: { month: string; monthIndex: number; year: number; applications: number }[] = [];
  const now = new Date();

  // Generate the last 6 months layout
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      month: d.toLocaleString('default', { month: 'short' }),
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      applications: 0
    });
  }

  // Populate with real data
  candidates.forEach(c => {
    const applied = new Date(c.appliedAt);
    const match = result.find(r => r.monthIndex === applied.getMonth() && r.year === applied.getFullYear());
    if (match) {
      match.applications += 1;
    }
  });

  return result;
}, [candidates]);

  // --- 4. Dynamic Department Breakdown ---
  const dynamicDepartmentBreakdown = useMemo(() => {
    const deptMap: Record<string, { applicants: number; hires: number }> = {};

    // Initialize mapping with available jobs
    jobs.forEach((job) => {
      const dept = job.department || "General";
      if (!deptMap[dept]) deptMap[dept] = { applicants: 0, hires: 0 };
    });

    // Count applicants and hires per department
    candidates.forEach((c) => {
      const job = jobs.find((j) => j.id === c.jobId);
      const dept = job?.department || "General";
      
      if (!deptMap[dept]) deptMap[dept] = { applicants: 0, hires: 0 };
      
      deptMap[dept].applicants += 1;
      if (c.stage === "Hired") {
        deptMap[dept].hires += 1;
      }
    });

    // Convert map to array and sort by most applicants
    return Object.entries(deptMap)
      .map(([department, stats]) => ({
        department,
        applicants: stats.applicants,
        hires: stats.hires,
        efficiency: stats.applicants > 0 ? Math.round((stats.hires / stats.applicants) * 100) : 0
      }))
      .sort((a, b) => b.applicants - a.applicants);
  }, [candidates, jobs]);

  function handleExportCsv() {
    const csv = toCsv(candidates);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `talent-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Talent Performance Report</h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Hiring efficiency metrics, demographic conversions, and cost optimization tables.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7226e0] sm:px-5 sm:py-2.5 sm:text-sm"
        >
          <Download size={15} className="sm:size-4" />
          Export CSV/PDF
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md sm:p-4 md:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500 sm:text-xs md:text-sm">Total Applications</p>
            <span className="h-2 w-2 rounded-full bg-[#8A38F5]" />
          </div>
          <p className="mt-1.5 text-lg font-bold text-gray-900 sm:mt-2 sm:text-xl md:text-2xl">{totalApplications}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md sm:p-4 md:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500 sm:text-xs md:text-sm">Avg Time to Hire</p>
            <span className="h-2 w-2 rounded-full bg-green-500" />
          </div>
          <p className="mt-1.5 text-lg font-bold text-gray-900 sm:mt-2 sm:text-xl md:text-2xl">{avgTimeToHire} Days</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md sm:p-4 md:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500 sm:text-xs md:text-sm">Offer Acceptance</p>
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
          <p className="mt-1.5 text-lg font-bold text-gray-900 sm:mt-2 sm:text-xl md:text-2xl">{offerAcceptanceRate}%</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md sm:p-4 md:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500 sm:text-xs md:text-sm">Cost per Hire</p>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <p className="mt-1.5 text-lg font-bold text-gray-900 sm:mt-2 sm:text-xl md:text-2xl">N/A</p>
          <p className="mt-1 text-[10px] font-medium text-gray-400 sm:text-[11px] md:text-xs">No budget tracking active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Applications over time */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 sm:text-base">Applications Over Time (Last 6 Months)</h2>
          </div>

          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicMonthlyTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EDE7F8", fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#8A38F5"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#8A38F5" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application funnel */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md sm:p-6">
          <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">Application Funnel</h2>
          <div className="flex flex-col gap-3">
            {funnelCounts.map(({ stage, color, count }) => {
              const widthPercent = totalApplications > 0 ? Math.max((count / funnelMax) * 100, count > 0 ? 8 : 0) : 0;
              const percentOfTotal = totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-gray-500 sm:text-sm">{stage}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${widthPercent}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-semibold text-gray-900">{count}</span>
                  <span className="w-9 shrink-0 text-right text-[10px] text-gray-400">{percentOfTotal}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance by department */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md sm:p-6">
        <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">Performance metrics by Business Department</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-[10px] font-medium text-gray-400 uppercase sm:text-xs">Department</th>
                <th className="pb-3 text-right text-[10px] font-medium text-gray-400 uppercase sm:text-xs">Applicants</th>
                <th className="pb-3 text-right text-[10px] font-medium text-gray-400 uppercase sm:text-xs">Hires</th>
                <th className="pb-3 text-right text-[10px] font-medium text-gray-400 uppercase sm:text-xs">Process Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dynamicDepartmentBreakdown.length > 0 ? (
                dynamicDepartmentBreakdown.map((dept) => (
                  <tr key={dept.department}>
                    <td className="py-3 text-sm font-semibold text-gray-900">{dept.department}</td>
                    <td className="py-3 text-right text-sm text-gray-700">{dept.applicants}</td>
                    <td className="py-3 text-right text-sm text-gray-700">{dept.hires}</td>
                    <td className="py-3 text-right text-sm text-green-600 font-medium">
                      {dept.efficiency}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                    No department data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}