"use client";

import { useEffect, useState } from "react";
import { Calendar, Video, Loader2 } from "lucide-react";
import { talentInterviewsApi, type TalentInterview, type TalentInterviewStatus } from "@/lib/api/talentInterview";

const tabs: { value: TalentInterviewStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDateTime(iso: string) {
  if (!iso) return "TBD";
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} - ${time}`;
}

export default function TalentInterviewsPage() {
  const [interviews, setInterviews] = useState<TalentInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TalentInterviewStatus>("upcoming");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const result = await talentInterviewsApi.getAll();
      if (result.ok) {
        setInterviews(result.interviews);
      } else {
        setLoadError(result.message ?? "Failed to load interviews.");
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = interviews
    .filter((i) => i.status === activeTab)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8A38F5]" />
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">My Interviews</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Track your upcoming, completed, and cancelled interviews.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-100 sm:gap-2 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
              activeTab === tab.value
                ? "border-[#8A38F5] text-[#8A38F5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadError ? (
        <p className="mt-6 text-center text-sm text-red-500">{loadError}</p>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {filtered.map((interview) => (
            <div
              key={interview.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE7F8]">
                  {interview.companyLogoUrl ? (
                    <img src={interview.companyLogoUrl} alt={interview.companyName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-[#8A38F5]">
                      {interview.companyName.trim()[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{interview.jobTitle}</p>
                  <p className="text-xs font-medium text-[#8A38F5]">{interview.companyName}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={12} />
                    {formatDateTime(interview.scheduledAt)}
                  </p>
                  {interview.instructions && (
                    <p className="mt-1 text-xs text-gray-500">{interview.instructions}</p>
                  )}
                </div>
              </div>

              {activeTab === "upcoming" && interview.meetingLink && (
                
                 <a href={interview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#EDE7F8] px-3 py-1.5 text-center text-xs font-semibold text-[#8A38F5] hover:bg-[#DCCFF5] sm:text-sm"
                >
                  <Video size={13} />
                  Join Meeting
                </a>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
              No {activeTab} interviews found.
            </div>
          )}
        </div>
      )}
    </>
  );
}