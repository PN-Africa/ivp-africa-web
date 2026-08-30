"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Globe, Building2 } from "lucide-react";
import { adminUsersApi, type AdminUserView, type AdminUserDetail } from "@/lib/api/adminUsers";
import { adminNotesApi } from "@/lib/api/adminNotes";
import { useSession } from "@/lib/auth/useSession";
import { adminJobsApi } from "@/lib/api/adminJobs";

type TabValue = "Overview" | "Job Listings" | "Hiring History" | "Billing" | "Admin Notes";
const tabs: TabValue[] = ["Overview", "Job Listings", "Hiring History", "Billing", "Admin Notes"];

function getInitial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

export function EmployerDetailView({ user }: { user: AdminUserView }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("Overview");
  const [current, setCurrent] = useState<AdminUserDetail>(user as AdminUserDetail);
  const [note, setNote] = useState("");
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  const company = {
    companyName: current.employerProfile?.companyName ?? current.displayName,
    industry: current.employerProfile?.industry ?? null,
    location: current.employerProfile?.location ?? null,
    contactEmail: current.email,
    officeAddress: current.employerProfile?.officeAddress ?? null,
    website: current.employerProfile?.website ?? null,
    about: current.employerProfile?.description ?? null,
    verified: current.employerProfile?.verificationStatus === "VERIFIED" ||
          current.employerProfile?.verificationStatus === "APPROVED",};

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const found = await adminUsersApi.getById(user.id);
      if (found.ok && found.user) {
        setCurrent(found.user);
      }
      setLoading(false);
    }
    loadUser();
  }, [user.id]);

  useEffect(() => {
    async function loadJobs() {
      const result = await adminJobsApi.getAll();
      if (result.ok) {
        const thisEmployersJobs = result.jobs.filter(
          (job) => job.employer?.id === current.id
        );
        setJobs(thisEmployersJobs);
      }
    }
    loadJobs();
  }, [user.id, current.id]);

  async function refresh() {
    const found = await adminUsersApi.getById(user.id);
    if (found.ok && found.user) {
      setCurrent(found.user);
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

  const activeJobs = jobs.filter((j) => j.status === "PUBLISHED");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-gray-400 sm:text-sm">
          <button onClick={() => router.push("/admin/users")} className="hover:text-gray-600">
            User management
          </button>
          {" > "}
          <span className="font-semibold text-[#8A38F5]">{company.companyName}</span>
        </p>
        <h1 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Employer Profile Detail</h1>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE7F8] text-xl font-bold text-[#8A38F5] sm:h-16 sm:w-16">
              {current.employerProfile?.logoUrl ? (
                <img src={current.employerProfile.logoUrl} alt={company.companyName} className="h-full w-full object-cover" />
              ) : (
                getInitial(company.companyName)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">{company.companyName}</h2>
                {jobs.length > 0 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                    Est. company
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                {company.industry || "Industry not provided"}
                {company.location && ` · ${company.location}`}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail size={12} /> {company.contactEmail || user.email}
                </span>
                {company.officeAddress && (
                  <span className="flex items-center gap-1">
                    <Building2 size={12} /> {company.officeAddress}
                  </span>
                )}
                {company.website && (
                  <span className="flex items-center gap-1 text-[#8A38F5]">
                    <Globe size={12} /> {company.website}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <div className="flex gap-2">
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                {company.verified ? "✓ Verified Business" : "Unverified"}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  current.status === "active" ? "bg-[#EDE7F8] text-[#8A38F5]" : "bg-red-50 text-red-600"
                }`}
              >
                {current.status === "active" ? "Active Account" : "Suspended"}
              </span>
            </div>
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
                <h3 className="text-sm font-bold text-gray-900">About Company</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {company.about || "No company description provided yet."}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
                <h3 className="text-sm font-bold text-gray-900">Hiring Statistics</h3>
                <div className="mt-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Active Listings</span>
                    <span className="font-semibold text-[#8A38F5]">{activeJobs.length} Jobs</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Jobs Posted</span>
                    <span className="font-semibold text-gray-900">{jobs.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Job Listings" && (
            <div className="flex flex-col gap-2">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-400">{job.location}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 capitalize">{job.status}</span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No job listings yet.</p>
              )}
            </div>
          )}

          {activeTab === "Hiring History" && (
            <p className="py-8 text-center text-sm text-gray-400">No hiring history recorded yet.</p>
          )}

          {activeTab === "Billing" && (
            <p className="py-8 text-center text-sm text-gray-400">
              Billing details are managed from the employer's own Subscription page.
            </p>
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
                placeholder="Add internal notes about this employer..."
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

      {/* Diagnostics */}
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
            <p className="text-[10px] text-gray-400 uppercase">Total Jobs Posted</p>
            <p className="mt-1 text-sm font-semibold text-[#8A38F5]">{jobs.length} listings</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Internal Verification</p>
            <p className="mt-1 text-sm font-semibold text-green-600">
              {company.verified ? "✓ Passed Verification" : "Pending"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}