"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Calendar, Video, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { employerCandidatesApi, EmployerCandidate } from "@/lib/api/candidate";
import { interviewsApi, Interview, InterviewStatus, InterviewType } from "@/lib/api/interview";

type TabValue = InterviewStatus;
const tabs: { value: TabValue; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const avatarPalette = [
  { bg: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
];

function formatDateTime(iso: string) {
  if (!iso) return "TBD";
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} - ${time}`;
}

export default function InterviewsPage() {
  const { session } = useSession();
  
  // Data States
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<EmployerCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [activeTab, setActiveTab] = useState<TabValue>("upcoming");
  const [showSchedule, setShowSchedule] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);

  // Form State
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("Video Call");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Async data fetcher
  async function refresh() {
    // If there's no token, stop loading and exit
    if (!session?.accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch Real Interviews
      const realInterviews = await interviewsApi.getAll(session.accessToken);
      setInterviews(realInterviews);

      // 2. Fetch Real Candidates using your API file
      const allCandidates = await employerCandidatesApi.getAll(session.accessToken);
      
      // Filter for candidates that are ready to be interviewed
      const shortlistedCandidates = allCandidates.filter(
        (candidate) => candidate.status === "SHORTLISTED" || candidate.stage === "Screening"
      );
      
      setCandidates(shortlistedCandidates);
      
    } catch (err) {
      console.error("Failed to load interviews or candidates:", err);
    } finally {
      // Always stop loading, even if the API throws an error
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [session?.accessToken]);

  const counts = useMemo(() => {
    return {
      upcoming: interviews.filter((i) => i.status === "upcoming").length,
      completed: interviews.filter((i) => i.status === "completed").length,
      cancelled: interviews.filter((i) => i.status === "cancelled").length,
    };
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    return interviews
      .filter((i) => i.status === activeTab)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [interviews, activeTab]);

  async function handleScheduleSubmit() {
    if (!session?.accessToken || !selectedCandidateId || !scheduleDate || !scheduleTime) return;
    
    const candidate = candidates.find((c) => c.id === selectedCandidateId);
    if (!candidate) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      
      let locationStr = "";
      if (interviewType === "Video Call") {
        locationStr = `Virtual Meeting: https://meet.ivpafrica.com/${crypto.randomUUID().slice(0, 8)}`;
      } else if (interviewType === "Phone Interview") {
        locationStr = `Phone Call: ${phoneNumber}`;
      } else {
        locationStr = "In-Person Office Location";
      }

      await interviewsApi.scheduleApplicationInterview(
        session.accessToken,
        candidate.jobId,
        candidate.id,  
        {
          scheduledAt,
          location: locationStr,
          instructions: instructions || undefined,
        }
      );

      // Reset form and re-fetch from backend
      setShowSchedule(false);
      setSelectedCandidateId("");
      setScheduleDate("");
      setScheduleTime("");
      setInterviewType("Video Call");
      setPhoneNumber("");
      setInstructions("");
      await refresh();
      
    } catch (err: any) {
      setError(err.message || "Something went wrong while scheduling.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel(interviewId: string) {
    if (!session?.accessToken) return;
    try {
      await interviewsApi.setStatus(session.accessToken, interviewId, "cancelled");
      await refresh(); // Reload list after cancel
    } catch (err) {
      alert("Failed to cancel interview: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  function openReschedule(interview: Interview) {
    const d = new Date(interview.date);
    setNewDate(d.toISOString().slice(0, 10));
    setNewTime(d.toTimeString().slice(0, 5));
    setRescheduleId(interview.id);
  }

  async function handleRescheduleSubmit() {
    if (!session?.accessToken || !rescheduleId || !newDate || !newTime) return;
    try {
      await interviewsApi.reschedule(
        session.accessToken,
        rescheduleId,
        new Date(`${newDate}T${newTime}`).toISOString()
      );
      setRescheduleId(null);
      await refresh(); // Reload list after reschedule
    } catch (err) {
      alert("Failed to reschedule interview: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  // --- UI RENDERING ---

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8A38F5]" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Interview Scheduling</h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Schedule, update, and manage candidate video panels and phone screenings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSchedule(true)}
          className="flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7226e0] sm:px-5 sm:py-2.5 sm:text-sm"
        >
          <Plus size={15} className="sm:size-4" />
          Schedule Interview
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-100 sm:gap-2 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
              activeTab === tab.value
                ? "border-[#8A38F5] text-[#8A38F5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold sm:text-[11px] ${
                activeTab === tab.value ? "bg-[#8A38F5] text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Interview cards */}
      <div className="flex flex-col gap-3 mt-4">
        {filteredInterviews.map((interview, i) => {
          const palette = avatarPalette[i % avatarPalette.length];
          return (
            <div
              key={interview.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${palette.bg} ${palette.text}`}>
                  {interview.candidateInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{interview.candidateName}</p>
                  <p className="text-xs font-medium text-[#8A38F5]">{interview.role}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={12} />
                    {formatDateTime(interview.date)}
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden items-center gap-1 sm:flex">
                      <Video size={12} />
                      {interview.type}
                    </span>
                  </p>
                </div>
              </div>

              {activeTab === "upcoming" && (
                <div className="flex shrink-0 gap-2">
                  {interview.type === "Video Call" ? (
                      <a href={interview.meetingLink ?? "#"}
                      target={interview.meetingLink ? "_blank" : undefined}
                      rel="noreferrer"
                      className={`rounded-lg px-3 py-1.5 text-center text-xs font-semibold sm:text-sm ${
                        interview.meetingLink
                          ? "bg-[#EDE7F8] text-[#8A38F5] hover:bg-[#DCCFF5]"
                          : "cursor-not-allowed bg-gray-100 text-gray-400"
                      }`}
                      onClick={(e) => !interview.meetingLink && e.preventDefault()}
                    >
                      Join Meeting
                    </a>
                  ) : interview.type === "Phone Interview" ? (
                     <a href={
                        interview.phoneNumber
                          ? `https://wa.me/${interview.phoneNumber.replace(/[^\d]/g, "")}`
                          : "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-center text-xs font-semibold text-green-700 hover:bg-green-100 sm:text-sm"
                    >
                      <MessageCircle size={13} className="sm:size-[14px]" />
                      WhatsApp
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openReschedule(interview)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:text-sm"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel(interview.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredInterviews.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            No {activeTab} interviews found.
          </div>
        )}
      </div>

      {/* Schedule modal */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Schedule Interview</h3>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">Candidate</label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
                >
                  <option value="">Select a candidate</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.role} {c.status ? `(${c.status})` : ""}
                    </option>
                  ))}
                </select>
                {candidates.length === 0 && (
                   <p className="text-[10px] text-gray-500 mt-1">No shortlisted candidates found. Please shortlist someone first.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
                >
                  <option>Video Call</option>
                  <option>Phone Interview</option>
                  <option>In-Person</option>
                </select>
              </div>

              {interviewType === "Phone Interview" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">
                    Candidate&apos;s WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">
                  Instructions (Optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="E.g., Please prepare a 5-minute presentation..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSchedule(false);
                  setError(null);
                }}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScheduleSubmit}
                disabled={
                  isSubmitting ||
                  !selectedCandidateId ||
                  !scheduleDate ||
                  !scheduleTime ||
                  (interviewType === "Phone Interview" && !phoneNumber.trim())
                }
                className="flex-1 rounded-xl bg-[#8A38F5] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Scheduling..." : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Reschedule Interview</h3>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setRescheduleId(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRescheduleSubmit}
                className="flex-1 rounded-xl bg-[#8A38F5] py-2.5 text-sm font-semibold text-white hover:bg-[#7226e0]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}