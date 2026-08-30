"use client";

import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import { Check, Clock, Upload, AlertCircle } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { session as sessionStore } from "@/lib/auth/session";
import { companyProfileApi, EmployerProfile } from "@/lib/api/companyProfile";
import { employerJobsApi, EmployerJob } from "@/lib/api/employerJob";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#8A38F5] sm:py-3";
const labelClass = "mb-1.5 block text-xs font-semibold text-gray-900 sm:text-sm";

function getInitial(name: string) {
  return name ? name.trim()[0]?.toUpperCase() : "?";
}

const statusStyles: Record<string, string> = {
  active: "text-green-600",
  draft: "text-amber-600",
  closed: "text-red-500",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  closed: "Closed",
};

export default function CompanyProfilePage() {
  const { session } = useSession();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [draft, setDraft] = useState({
    companyName: "",
    contactPerson: "",
    industry: "",
    companySize: "",
    rcNumber: "",
    website: "",
    description: "",
    location: "",
    officeAddress: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      // 1. Fetch Profile
      const res = await companyProfileApi.getProfile();
      if (res.ok && res.data) {
        setProfile(res.data);
      } else {
        // Just log the error to state, it will trigger the empty profile view
        setError(res.message || "No profile found.");
      }

      // 2. Fetch Jobs (FIXED)
      if (session?.email) {
        // Await the API call and extract the data property
        const jobsRes = await employerJobsApi.getAll();
        
        if (jobsRes.ok && Array.isArray(jobsRes.data)) {
          setJobs(jobsRes.data); // Set jobs to the actual array
        } else {
          setJobs([]); // Fallback to an empty array to prevent filter errors
        }
      }
      
      setLoading(false);
    }

    loadData();
  }, [session?.email]);

  function openEdit() {
    // We remove the `if (!profile) return;` so you can create a new profile!
    setDraft({
      companyName: profile?.companyName ?? "",
      contactPerson: profile?.contactPerson ?? "",
      industry: profile?.industry ?? "",
      companySize: profile?.companySize ?? "",
      rcNumber: profile?.rcNumber ?? "",
      website: profile?.website ?? "",
      description: profile?.description ?? "",
      location: profile?.location ?? "",
      officeAddress: profile?.officeAddress ?? "",
    });
    setLogoFile(null);
    setLogoPreview(profile?.logoUrl ?? null);
    setError(null);
    setEditing(true);
  }

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSave() {
    if (!draft.companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await companyProfileApi.updateProfile({
      ...draft,
      logo: logoFile,
    });

    setSaving(false);

    if (res.ok && res.data) {
      setProfile(res.data);
      if (session) {
        sessionStore.set({
          ...session,
          displayName: res.data.companyName || session.displayName,
        });
      }
      setEditing(false);
    } else {
      setError(res.message || "Failed to update profile. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
        Loading profile...
      </div>
    );
  }

  const activeJobs = (Array.isArray(jobs) ? jobs : []).filter((j) => j.status !== "draft");

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
            Company Profile
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Manage your organization branding and public page details.
          </p>
        </div>
        <button
          type="button"
          onClick={openEdit}
          className="shrink-0 self-start rounded-xl border border-[#8A38F5] px-4 py-2 text-xs font-semibold text-[#8A38F5] transition-colors hover:bg-[#EDE7F8] sm:px-5 sm:py-2.5 sm:text-sm"
        >
          {profile ? "Edit Profile" : "Create Profile"}
        </button>
      </div>

      {/* IF NO PROFILE EXISTS YET */}
      {!profile ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-bold text-gray-900">Let's set up your profile</h2>
          <p className="mt-2 text-sm text-gray-500">
            You haven't added your company details yet. Complete your profile to start posting jobs.
          </p>
          <button
            onClick={openEdit}
            className="mt-6 inline-flex rounded-xl bg-[#8A38F5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7226e0]"
          >
            Create Company Profile
          </button>
        </div>
      ) : (
        /* IF PROFILE EXISTS, SHOW IT normally */
        <div className="space-y-6">
          {/* Company Header Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE7F8] text-xl font-bold text-[#8A38F5] sm:h-16 sm:w-16 sm:text-2xl">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt={`${profile.companyName} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitial(profile.companyName)}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                    {profile.companyName}
                  </h2>
                  {profile.verificationStatus === "VERIFIED" ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 sm:text-xs">
                      <Check size={12} />
                      Verified Employer
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 sm:text-xs">
                      <Clock size={12} />
                      Verification: {profile.verificationStatus}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 sm:text-sm">
                  {profile.industry && (
                    <span>
                      Industry: <span className="font-semibold text-gray-900">{profile.industry}</span>
                    </span>
                  )}
                  {profile.companySize && (
                    <span>
                      Size: <span className="font-semibold text-gray-900">{profile.companySize}</span>
                    </span>
                  )}
                  {profile.location && (
                    <span>
                      Location: <span className="font-semibold text-gray-900">{profile.location}</span>
                    </span>
                  )}
                  {profile.website && (
                    <span>
                      Website:{" "}
                      <a
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[#8A38F5] hover:underline"
                      >
                        {profile.website}
                      </a>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About + Contact */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 lg:col-span-2">
              <h2 className="text-sm font-bold text-gray-900">About Company</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {profile.description || "No company description added yet."}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-bold text-gray-900">Contact Information</h2>
              <div className="mt-3 flex flex-col gap-3">
                {profile.contactPerson && (
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">Contact Person</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">{profile.contactPerson}</p>
                  </div>
                )}
                {profile.rcNumber && (
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">RC Number</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">{profile.rcNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">Office Address</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {profile.officeAddress || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div>
            <h2 className="mb-3 text-sm font-bold text-gray-900 sm:text-base">
              Open Positions ({activeJobs.length})
            </h2>
            {activeJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
                No open positions yet.{" "}
                <Link href="/employer/jobs/new" className="font-semibold text-[#8A38F5] hover:underline">
                  Post a job
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeJobs.map((job) => (
                  <Link
                    key={job.id}
                    href="/employer/jobs"
                    className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md sm:p-5"
                  >
                    <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {job.location} · {job.workMode}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-[#EDE7F8] px-2.5 py-1 text-[11px] font-medium text-[#8A38F5]">
                        {job.applicants} Applicants
                      </span>
                      <span className={`text-xs font-semibold ${statusStyles[job.status]}`}>
                        {statusLabels[job.status]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal (This is what I meant by the Edit Modal JSX Code!) */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">
              {profile ? "Edit Company Profile" : "Create Company Profile"}
            </h3>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-4">
              {/* Logo Upload */}
              <div>
                <label className={labelClass}>Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">
                        {getInitial(draft.companyName)}
                      </span>
                    )}
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                    <Upload size={14} />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Company Name & Contact Person */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input
                    type="text"
                    value={draft.companyName}
                    onChange={(e) => setDraft({ ...draft, companyName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Person</label>
                  <input
                    type="text"
                    value={draft.contactPerson}
                    onChange={(e) => setDraft({ ...draft, contactPerson: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Industry & Location */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Industry</label>
                  <input
                    type="text"
                    value={draft.industry}
                    onChange={(e) => setDraft({ ...draft, industry: e.target.value })}
                    placeholder="e.g. Software Development"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    placeholder="e.g. Lagos, Nigeria"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Company Size & RC Number */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Company Size</label>
                  <input
                    type="text"
                    value={draft.companySize}
                    onChange={(e) => setDraft({ ...draft, companySize: e.target.value })}
                    placeholder="e.g. 50-100"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>RC Number</label>
                  <input
                    type="text"
                    value={draft.rcNumber}
                    onChange={(e) => setDraft({ ...draft, rcNumber: e.target.value })}
                    placeholder="e.g. RC992831"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className={labelClass}>Website</label>
                <input
                  type="text"
                  value={draft.website}
                  onChange={(e) => setDraft({ ...draft, website: e.target.value })}
                  placeholder="https://techcorp.africa"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>About / Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={4}
                  placeholder="Tell candidates about your company..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Office Address */}
              <div>
                <label className={labelClass}>Office Address</label>
                <input
                  type="text"
                  value={draft.officeAddress}
                  onChange={(e) => setDraft({ ...draft, officeAddress: e.target.value })}
                  placeholder="e.g. 123 Tech Avenue, Victoria Island"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-[#8A38F5] py-2.5 text-sm font-semibold text-white hover:bg-[#7226e0] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}