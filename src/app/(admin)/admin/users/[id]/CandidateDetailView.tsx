"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, GraduationCap, Languages, Briefcase } from "lucide-react";
import { adminUsersApi, type AdminUserView, type AdminUserDetail } from "@/lib/api/adminUsers";
import { adminNotesApi } from "@/lib/api/adminNotes";
import {    adminAuditLogsApi } from "@/lib/api/auditLogs";
import { useSession } from "@/lib/auth/useSession";

type TabValue = "Overview" | "Resume" | "Skills" | "Activity" | "Admin Notes";
const tabs: TabValue[] = ["Overview", "Resume", "Skills", "Activity", "Admin Notes"];

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

export function CandidateDetailView({ user }: { user: AdminUserView }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("Overview");
  const [current, setCurrent] = useState<AdminUserDetail>(user as AdminUserDetail);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
const [resending, setResending] = useState(false);
const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    async function loadCandidate() {
      setLoading(true);
      const found = await adminUsersApi.getById(user.id);
      if (found.ok && found.user) {
        setCurrent(found.user);
      }
      setLoading(false);
    }
    loadCandidate();
  }, [user.id]);

  useEffect(() => {
    setNote(adminNotesApi.get(user.id));
  }, [user.id]);

  async function refresh() {
    const found = await adminUsersApi.getById(user.id);
    if (found.ok && found.user) {
      setCurrent(found.user);
    }
  }

 async function handleToggleStatus() {
  const nextStatus = current.status === "active" ? "suspended" : "active";
  const result = await adminUsersApi.setStatus(current.id, nextStatus);

  if (result.ok) {
    await refresh();
  } else {
    console.error("Failed to update status:", result.message);
  }
}
async function handleResendVerification() {
  setResending(true);
  setActionMessage(null);
  const result = await adminUsersApi.resendVerification(current.id);
  setResending(false);

  if (result.ok) {
    setActionMessage({ type: "success", text: result.message ?? "Verification email resent." });
  } else {
    setActionMessage({ type: "error", text: result.message ?? "Failed to resend verification." });
  }
}

async function handleResetPassword() {
  setResettingPassword(true);
  setActionMessage(null);
  const result = await adminUsersApi.resetPassword(current.id);
  setResettingPassword(false);

  if (result.ok) {
    setActionMessage({ type: "success", text: result.message ?? "Password reset email sent." });
  } else {
    setActionMessage({ type: "error", text: result.message ?? "Failed to send password reset." });
  }
}
  function handleSaveNote() {
    adminNotesApi.save(user.id, note);
  }

  function formatDate(iso?: string) {
    if (!iso) return "Not available";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatRelative(iso?: string) {
    if (!iso) return "Never logged in";
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diffMs / 3600_000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  // Real data — nested directly in GET /admin/users/:id, no separate lookup needed.
  const skills = current.talentProfile?.skills?.filter((s) => s.trim() !== "") ?? [];
  const certifications = current.talentProfile?.certifications ?? [];
  const resumeUrl = current.talentProfile?.resumeUrl;
  const bio = current.talentProfile?.bio;
  const location = current.talentProfile?.location;
  const phoneNumber = current.talentProfile?.phoneNumber;
  const professionalTitle = current.talentProfile?.professionalTitle;
  const profileImageUrl = current.talentProfile?.profileImageUrl;
  const completionPercent = current.talentProfile
    ? Math.round(
        ([current.displayName, location, skills.length > 0, resumeUrl].filter(Boolean).length / 4) * 100
      )
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-gray-400 sm:text-sm">
          <button onClick={() => router.push("/admin/users")} className="hover:text-gray-600">
            User management
          </button>
          {" > "}
          <span className="font-semibold text-[#8A38F5]">{current.displayName}</span>
        </p>
        <h1 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
          Candidate Profile Detail
        </h1>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE7F8] text-lg font-bold text-[#8A38F5] sm:h-16 sm:w-16">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={current.displayName}
                  className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
                />
              ) : (
                getInitials(current.displayName)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">{current.displayName}</h2>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                {professionalTitle || "Title not provided"}
                {location && ` · ${location}`}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail size={12} /> {current.email}
                </span>
                {phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <div className="flex gap-2">
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                {current.verification === "Verified" ? "✓ Verified" : "Unverified"}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  current.status === "active" ? "bg-[#EDE7F8] text-[#8A38F5]" : "bg-red-50 text-red-600"
                }`}
              >
                {current.status === "active" ? "Active Account" : "Suspended"}
              </span>
            </div>
           <div className="flex flex-wrap gap-2">
  <button
    type="button"
    onClick={handleToggleStatus}
    className={`rounded-xl px-3 py-2 text-xs font-semibold text-white transition-colors sm:px-4 sm:text-sm ${
      current.status === "active" ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
    }`}
  >
    {current.status === "active" ? "Suspend Account" : "Reactivate"}
  </button>
  <button
    type="button"
    onClick={handleResendVerification}
    disabled={resending}
    className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
  >
    {resending ? "Sending…" : "Resend Verification"}
  </button>
  <button
    type="button"
    onClick={handleResetPassword}
    disabled={resettingPassword}
    className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
  >
    {resettingPassword ? "Sending…" : "Reset Password"}
  </button>
</div>
{actionMessage && (
  <p className={`mt-2 text-xs ${actionMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
    {actionMessage.text}
  </p>
)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-3 sm:gap-2 sm:px-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                activeTab === tab ? "border-[#8A38F5] text-[#8A38F5]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
                <h3 className="text-sm font-bold text-gray-900">About Candidate</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {bio || "No about section provided yet."}
                </p>
                {/* Education not available from this endpoint yet — backend has no
                    education fields on talentProfile currently. */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                    <GraduationCap size={13} /> Education & Credentials
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Not available yet.</p>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                    <Languages size={13} /> Languages
                  </p>
                  <p className="mt-1 text-sm text-gray-700">English Language (assumed)</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
                  <h3 className="text-sm font-bold text-gray-900">Key Skills & Competencies</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-[#EDE7F8] px-3 py-1 text-xs font-medium text-[#8A38F5]">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No skills listed yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
                  <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                    <Briefcase size={14} /> Certifications
                  </h3>
                  {certifications.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {certifications.map((cert) => (
                        <span key={cert} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {cert}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400">No certifications recorded.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Resume" && (
            <div>
              {resumeUrl ? (
                
                 <a href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EDE7F8] px-4 py-2.5 text-sm font-semibold text-[#8A38F5] hover:bg-[#DCCFF5]"
                >
                  View resume
                </a>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No resume link added yet.</p>
              )}
            </div>
          )}

          {activeTab === "Skills" && (
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-[#EDE7F8] px-3 py-1.5 text-sm font-medium text-[#8A38F5]">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No skills listed yet.</p>
              )}
            </div>
          )}

          {activeTab === "Activity" && (
            <div className="flex flex-col gap-2">
              {/* No admin endpoint exists yet for a candidate's application
                  history — needs backend support before this can show real data. */}
              <p className="py-8 text-center text-sm text-gray-400">
                Application activity is not available yet.
              </p>
            </div>
          )}

          {activeTab === "Admin Notes" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-900 sm:text-sm">
                Internal notes (only visible to admins)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={6}
                placeholder="Add internal notes about this candidate..."
                className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
              />
              <button
                type="button"
                onClick={handleSaveNote}
                className="mt-3 rounded-xl bg-[#8A38F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7226e0]"
              >
                Save note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Platform diagnostics */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-bold text-gray-900">Platform Diagnostics & Activity</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            
            <p className="text-[10px] text-gray-400 uppercase">Account Created</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(current.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Last Login Activity</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{formatRelative(current.lastLoginAt)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Profile Completeness</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full bg-[#8A38F5]" style={{ width: `${completionPercent}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-900">{completionPercent}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Internal Verification</p>
            <p className="mt-1 text-sm font-semibold text-green-600">
              {current.verification === "Verified" ? "✓ Passed Verification" : "Pending"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}