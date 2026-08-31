"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, MoreVertical } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { employerCandidatesApi, EmployerCandidate, PipelineStage } from "@/lib/api/candidate";


type TabValue = "All" | PipelineStage;

const tabs: TabValue[] = ["All", "New", "Screening", "Interview", "Offered", "Hired", "Rejected"];
const stageStyles: Record<PipelineStage, string> = {
  New: "bg-gray-100 text-gray-600",
  Screening: "bg-[#EDE7F8] text-[#8A38F5]",
  Interview: "bg-blue-50 text-blue-700",
  Offered: "bg-amber-50 text-amber-700",
  Hired: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-600",
};

const stageOptions: PipelineStage[] = ["New", "Screening", "Interview", "Offered", "Hired", "Rejected"];
const avatarPalette = [
  { bg: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
  { bg: "bg-violet-100", text: "text-violet-600" },
];

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

const PAGE_SIZE = 20;

export default function CandidatesPage() {
  const { session } = useSession();
  const [candidates, setCandidates] = useState<EmployerCandidate[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>("All");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  async function refresh() {
    if (!session?.accessToken) return; 
    
    try {
      const data = await employerCandidatesApi.getAll(session.accessToken);
      setCandidates(data);
    } catch (error) {
      console.error("Failed to load candidates", error);
    }
  }

  useEffect(() => {
    refresh();
  }, [session?.accessToken]); // Update dependency array to token


  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesTab = activeTab === "All" || c.stage === activeTab;
      const matchesSearch =
        search.trim() === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [candidates, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const startIndex = filteredCandidates.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredCandidates.length);

  function handleTabChange(tab: TabValue) {
    setActiveTab(tab);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  async function handleSetStage(jobId: string, candidateId: string, stage: PipelineStage) {
    if (!session?.accessToken) return;
    try {
      await employerCandidatesApi.setStage(jobId, candidateId, stage, session.accessToken);
      setOpenMenuId(null);
      refresh();
    } catch (error) {
      console.error(error);
    }
  }

  // FIX: Make this async, pass token instead of email
  async function handleRemove(candidateId: string) {
    if (!session?.accessToken) return;
    
    try {
      await employerCandidatesApi.remove(candidateId, session.accessToken);
      setOpenMenuId(null);
      refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Candidates</h1>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 sm:flex-none sm:px-4 sm:py-2.5">
            <Search size={15} className="shrink-0 text-gray-400 sm:size-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search candidates..."
              className="min-w-0 flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm sm:w-40"
            />
          </div>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <SlidersHorizontal size={14} className="sm:size-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-3 sm:gap-2 sm:px-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:py-4 sm:text-sm ${
                activeTab === tab
                  ? "border-[#8A38F5] text-[#8A38F5]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "All" ? "All Candidates" : tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wide text-gray-400 uppercase sm:px-5 sm:text-xs">Candidate</th>
                <th className="hidden px-4 py-3 text-[10px] font-semibold tracking-wide text-gray-400 uppercase md:table-cell sm:text-xs">Applied Role</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wide text-gray-400 uppercase sm:text-xs">Pipeline Stage</th>
                <th className="hidden px-4 py-3 text-[10px] font-semibold tracking-wide text-gray-400 uppercase lg:table-cell sm:text-xs">Applied On</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold tracking-wide text-gray-400 uppercase sm:px-5 sm:text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCandidates.map((candidate, i) => {
                const palette = avatarPalette[i % avatarPalette.length];
                return (
                  <tr key={candidate.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${palette.bg} ${palette.text}`}>
                          {getInitials(candidate.name)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/employer/candidates/${candidate.id}`}
                            className="truncate text-sm font-semibold text-gray-900 no-underline hover:text-[#8A38F5] hover:underline"
                          >
                            {candidate.name}
                          </Link>
                          <p className="truncate text-xs text-gray-400 md:hidden">{candidate.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 text-sm text-gray-600 md:table-cell">{candidate.role}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap sm:px-3 sm:text-xs ${stageStyles[candidate.stage]}`}>
                        {candidate.stage}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 text-sm text-gray-400 lg:table-cell">
                      {formatTimeAgo(candidate.appliedAt)}
                    </td>
                    <td className="relative px-4 py-4 text-right sm:px-5">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === candidate.id ? null : candidate.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Candidate actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === candidate.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-4 z-20 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 text-left shadow-lg sm:right-5">
                            <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase">Move to</p>
                            {stageOptions
                              .filter((s) => s !== candidate.stage)
                              .map((stage) => (
                                <button
                                  key={stage}
                                  type="button"
                                  onClick={() => handleSetStage(candidate.jobId, candidate.id, stage)}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                                >
                                  {stage}
                                </button>
                              ))}
                            <div className="my-1 border-t border-gray-100" />
                            <button
                              type="button"
                              onClick={() => handleRemove(candidate.id)}
                              className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedCandidates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    No candidates match this stage or search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredCandidates.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-gray-400 sm:text-sm">
              Showing {startIndex}-{endIndex} of {filteredCandidates.length} candidates
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
    </>
  );
}