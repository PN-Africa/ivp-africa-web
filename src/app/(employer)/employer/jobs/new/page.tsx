"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { X, AlertCircle } from "lucide-react";
import { employerJobsApi, CreateBackendJobPayload } from "@/lib/api/employerJob";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#8A38F5] sm:py-3";
const labelClass = "mb-1.5 block text-xs font-semibold text-gray-900 sm:text-sm";

function PostJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get("id");
  const isEditMode = Boolean(editId);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [qualification, setQualification] = useState("");
  const [description, setDescription] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-Time");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(!isEditMode);

  useEffect(() => {
    if (!isEditMode || !editId) return;

    async function loadJob() {
      const res = await employerJobsApi.getById(editId!);
      if (!res.ok || !res.data) {
        setNotFound(true);
        setLoaded(true);
        return;
      }
      const job = res.data;
      setTitle(job.title);
      setDepartment(job.department);
      setQualification(job.qualification || "");
      setDescription(job.description || "");
      setMinSalary(job.minSalary ? String(job.minSalary) : "");
      setMaxSalary(job.maxSalary ? String(job.maxSalary) : "");
      setLocation(job.location);

      if (job.deadline) {
        const d = new Date(job.deadline);
        setDeadline(!isNaN(d.getTime()) ? d.toISOString().split("T")[0] : job.deadline);
      }

      setEmploymentType(job.workMode || "Full-Time");
      setSkills(job.skills || []);
      setLoaded(true);
    }

    loadJob();
  }, [isEditMode, editId]);

  function handleAddSkill(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && skillDraft.trim()) {
      e.preventDefault();
      if (!skills.includes(skillDraft.trim())) {
        setSkills([...skills, skillDraft.trim()]);
      }
      setSkillDraft("");
    }
  }

  function handleRemoveSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleSubmit(targetStatus: "PUBLISHED" | "DRAFT" = "PUBLISHED") {
    setError(null);

    if (!title.trim() || !department.trim() || !location.trim() || !description.trim()) {
      setError("Job title, department, location, and description are required.");
      return;
    }

    if (!qualification.trim()) {
      setError("Please specify the required qualification or experience.");
      return;
    }

    if (skills.length === 0) {
      setError("Please add at least one required skill.");
      return;
    }

    if (!deadline) {
      setError("Application deadline is required.");
      return;
    }

    setSaving(true);

    const parsedMin = minSalary ? Number(minSalary.replace(/[^0-9.]/g, "")) : undefined;
    const parsedMax = maxSalary ? Number(maxSalary.replace(/[^0-9.]/g, "")) : undefined;
    const formattedDeadline = new Date(`${deadline}T23:59:59Z`).toISOString();

    const payload: CreateBackendJobPayload = {
      title: title.trim(),
      department: department.trim(),
      description: description.trim(),
      qualification: qualification.trim(),
      location: location.trim(),
      employmentType: employmentType.trim() || "Full-Time",
      deadline: formattedDeadline,
      requiredSkills: skills,
      minSalary: parsedMin,
      maxSalary: parsedMax,
      status: targetStatus,
    };

    let res;
    if (isEditMode && editId) {
      res = await employerJobsApi.update(editId, payload);
    } else {
      res = await employerJobsApi.create(payload);
    }

    setSaving(false);

    if (res.ok) {
      router.push("/employer/jobs");
    } else {
      setError(res.message || "Failed to submit job. Please check all fields.");
    }
  }

  if (notFound) {
    return (
      <div className="p-6">
        <Link href="/employer/jobs" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Job Postings
        </Link>
        <p className="mt-4 text-sm text-gray-400">No job found with this ID.</p>
      </div>
    );
  }

  if (!loaded) return <div className="p-6 text-sm text-gray-500">Loading job details...</div>;

  return (
    <>
      <div>
        <p className="text-xs text-gray-400 sm:text-sm">
          <Link href="/employer/jobs" className="hover:text-gray-600">Job Postings</Link>
          {" > "}
          <span className="font-semibold text-[#8A38F5]">
            {isEditMode ? "Edit Job" : "Post a Job"}
          </span>
        </p>
        <h1 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
          {isEditMode ? "Edit Job Posting" : "Post a New Job"}
        </h1>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 md:p-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Department / Category *</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Qualification / Experience Required *</label>
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g. Bachelor's degree in Computer Science or equivalent experience"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Job Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail job responsibilities, role expectations, and prerequisites..."
              rows={5}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min Salary (Optional)</label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="500000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max Salary (Optional)</label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="800000"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Location *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lagos, Nigeria (Hybrid)"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Application Deadline *</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Employment Type *</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className={inputClass}
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Required Skills * (Press Enter)</label>
            <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-[#8A38F5]">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 rounded-full bg-[#EDE7F8] px-2.5 py-1 text-xs font-medium text-[#8A38F5]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-[#8A38F5] hover:text-[#6C3CFF]"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder={skills.length === 0 ? "Type skill & press Enter" : "+ Add skill"}
                className="min-w-[100px] flex-1 bg-transparent text-xs text-gray-500 outline-none placeholder:text-gray-400 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          {isEditMode ? (
            <>
              <Link
                href="/employer/jobs"
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-center text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={saving}
                className="rounded-xl bg-[#8A38F5] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSubmit("DRAFT")}
                disabled={saving}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={saving}
                className="rounded-xl bg-[#8A38F5] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0] disabled:opacity-50"
              >
                {saving ? "Publishing…" : "Publish Job"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading…</div>}>
      <PostJobContent />
    </Suspense>
  );
}