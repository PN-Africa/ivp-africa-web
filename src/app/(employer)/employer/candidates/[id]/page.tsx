"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { employerCandidatesApi ,EmployerCandidate, PipelineStage } from "@/lib/api/candidate";


type TabValue = "Overview" | "Resume" | "Skills" | "Experience" | "Assessment" | "Activity";
const tabs: TabValue[] = ["Overview", "Resume", "Skills", "Experience", "Assessment", "Activity"];

const stageOptions: PipelineStage[] = ["New", "Screening", "Interview", "Offered", "Hired"];

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

function getMatchColor(percentage: number) {
  if (percentage >= 80) return "#22C55E";
  if (percentage >= 60) return "#F59E0B";
  return "#EF4444";
}

function getMatchLabel(percentage: number): { text: string; bg: string; text_: string } {
  if (percentage >= 80) return { text: "Great match", bg: "bg-green-50", text_: "text-green-700" };
  if (percentage >= 60) return { text: "Good match", bg: "bg-amber-50", text_: "text-amber-700" };
  return { text: "Weak match", bg: "bg-red-50", text_: "text-red-600" };
}

export default function CandidateProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
    const { session } = useSession();

  const [candidate, setCandidate] = useState<EmployerCandidate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("Overview");
  const [menuOpen, setMenuOpen] = useState(false);

  async function refresh() {
    if (!id || !session?.accessToken) return; 
    
    try {
      const found = await employerCandidatesApi.getById(id as string, session.accessToken);
      
      if (!found) {
        setNotFound(true);
        return;
      }
      setCandidate(found);
    } catch (error) {
      console.error("Failed to load candidate", error);
    }
  }

  useEffect(() => {
    refresh();
  }, [id, session?.accessToken]);

  async function handleMoveToNextStage() {
    if (!candidate || !session?.accessToken) return;
    
    const currentIndex = stageOptions.indexOf(candidate.stage);
    const nextStage = stageOptions[Math.min(currentIndex + 1, stageOptions.length - 1)];
    
    try {
      // Pass candidate.jobId first
      await employerCandidatesApi.setStage(candidate.jobId, candidate.id, nextStage, session.accessToken);
      refresh();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSetStage(stage: PipelineStage) {
    if (!candidate || !session?.accessToken) return;
    
    try {
      // Pass candidate.jobId first
      await employerCandidatesApi.setStage(candidate.jobId, candidate.id, stage, session.accessToken);
      setMenuOpen(false);
      refresh();
    } catch (error) {
      console.error(error);
    }
  }

  if (notFound) {
    return (
      <div>
        <button
          type="button"
          onClick={() => router.push("/employer/candidates")}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to candidates
        </button>
        <p className="text-sm text-gray-400">No candidate found with this ID.</p>
      </div>
    );
  }

  if (!candidate) return null;

  const nextStage = stageOptions[Math.min(stageOptions.indexOf(candidate.stage) + 1, stageOptions.length - 1)];
  const isFinalStage = candidate.stage === "Hired";
  const match = getMatchLabel(candidate.matchPercentage);

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/employer/candidates")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to candidates
        </button>

        <div className="flex items-center gap-2">
          {!isFinalStage && (
            <button
              type="button"
              onClick={handleMoveToNextStage}
              className="rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7226e0] sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Move to {nextStage}
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
              aria-label="More actions"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                  {stageOptions
                    .filter((s) => s !== candidate.stage)
                    .map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => handleSetStage(stage)}
                        className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Move to {stage}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-900 text-base font-bold text-white sm:h-16 sm:w-16 sm:text-lg">
              {getInitials(candidate.name)}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{candidate.name}</h1>
              <p className="text-sm text-gray-500">{candidate.role}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {candidate.location} · {candidate.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 self-start rounded-xl border border-gray-100 bg-gray-50 px-6 py-4 sm:self-auto">
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={getMatchColor(candidate.matchPercentage)}
                  strokeWidth="3"
                  strokeDasharray={`${candidate.matchPercentage} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                {candidate.matchPercentage}%
              </div>
            </div>
            <p className="text-[10px] text-gray-400">Overall Match</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${match.bg} ${match.text_}`}>
              {match.text}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-3 sm:gap-2 sm:px-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:py-4 sm:text-sm ${
                activeTab === tab
                  ? "border-[#8A38F5] text-[#8A38F5]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
                <h2 className="text-sm font-bold text-gray-900">About Candidate</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{candidate.about}</p>
                <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-semibold text-gray-900">{candidate.experienceYears} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Availability</span>
                    <span className="font-semibold text-green-600">{candidate.availability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Language</span>
                    <span className="font-semibold text-gray-900">{candidate.languages.join(", ")}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
                  <h2 className="text-sm font-bold text-gray-900">Skills</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
                  <h2 className="text-sm font-bold text-gray-900">Experience</h2>
                  <div className="mt-3 flex flex-col gap-3">
                    {candidate.experience.map((exp, i) => (
                      <div key={i} className="flex gap-2.5">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i === 0 ? "bg-[#8A38F5]" : "bg-gray-300"}`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                          <p className="text-xs font-medium text-[#8A38F5]">
                            {exp.company} · {exp.period}
                          </p>
                          {exp.description && <p className="mt-0.5 text-xs text-gray-500">{exp.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Skills" && (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-[#EDE7F8] px-3 py-1.5 text-sm font-medium text-[#8A38F5]">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {activeTab === "Experience" && (
            <div className="flex flex-col gap-4">
              {candidate.experience.map((exp, i) => (
                <div key={i} className="flex gap-3 border-b border-gray-100 pb-4 last:border-0">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i === 0 ? "bg-[#8A38F5]" : "bg-gray-300"}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                    <p className="text-xs font-medium text-[#8A38F5]">
                      {exp.company} · {exp.period}
                    </p>
                    {exp.description && <p className="mt-1 text-sm text-gray-500">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeTab === "Resume" || activeTab === "Assessment" || activeTab === "Activity") && (
            <p className="py-8 text-center text-sm text-gray-400">
              No {activeTab.toLowerCase()} data available yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}