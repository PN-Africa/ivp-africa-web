"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { talentJobsApi, type TalentJob } from "@/lib/utils/talentJobs";

const jobTypes = ["Full-time", "Internship", "Part-time", "Contract", "Remote"];

const categories = [
  "Technology", "Data & AI", "Finance", "Agriculture", "Logistics",
  "Healthcare", "Media", "Energy", "Hospitality", "Retail", "Human Resources",
  "General", "Administration", "Operations",
];

const statusBadgeStyles: Record<"filled" | "flagged", string> = {
  filled: "bg-gray-100 text-gray-500",
  flagged: "bg-amber-50 text-amber-700",
};
const statusBadgeLabels: Record<"filled" | "flagged", string> = {
  filled: "Filled",
  flagged: "Flagged",
};

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-700 sm:gap-2.5 sm:text-sm">
      <span
        onClick={onChange}
        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded transition-colors sm:h-5 sm:w-5 sm:rounded-md ${
          checked ? "bg-[#8A38F5]" : "border border-gray-300 bg-white"
        }`}
      >
        {checked && (
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className="sm:h-3 sm:w-3">
            <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="truncate">{label}</span>
    </label>
  );
}

function JobsContent() {
 
  
  const [allJobs, setAllJobs] = useState<TalentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 const searchParams = useSearchParams();

const searchQuery = searchParams?.get("search") ?? "";
const [query, setQuery] = useState(searchQuery);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

 useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const jobs = await talentJobsApi.getAll();

        setAllJobs(jobs);
      } catch (err) {
        console.error("Failed to load jobs:", err);

        setError(
          "Unable to load jobs. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    setQuery(searchParams?.get("search") ?? "");
  }, [searchParams]);

  const toggle = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesQuery =
        query.trim() === "" ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(job.category);
      return matchesQuery && matchesType && matchesCategory;
    });
  }, [allJobs, query, selectedTypes, selectedCategories]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-black sm:text-2xl">Jobs</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Browse and filter open roles across every category.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
        <Search size={16} className="shrink-0 text-gray-400 sm:size-[18px]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, companies..."
          className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[180px_1fr]">
        <div className="h-fit rounded-2xl border border-gray-100 bg-white p-3 sm:p-5">
          <h2 className="text-[11px] font-bold text-gray-900 sm:text-sm">Job type</h2>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:flex sm:flex-col sm:gap-2.5">
            {jobTypes.map((type) => (
              <FilterCheckbox key={type} label={type} checked={selectedTypes.includes(type)} onChange={() => toggle(type, selectedTypes, setSelectedTypes)} />
            ))}
          </div>

          <h2 className="mt-3 text-[11px] font-bold text-gray-900 sm:mt-6 sm:text-sm">Category</h2>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:flex sm:flex-col sm:gap-2.5">
            {categories.map((cat) => (
              <FilterCheckbox key={cat} label={cat} checked={selectedCategories.includes(cat)} onChange={() => toggle(cat, selectedCategories, setSelectedCategories)} />
            ))}
          </div>
        </div>

<div className="flex flex-col gap-2.5 sm:gap-4">
  {loading && (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
      <p className="text-sm text-gray-400">
        Loading jobs...
      </p>
    </div>
  )}

  {!loading && error && (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <p className="text-sm text-red-600">
        {error}
      </p>
    </div>
  )}

  {!loading && !error && (
    <p className="text-xs text-gray-400 sm:text-sm">
      {filteredJobs.length} jobs found
    </p>
  )}
          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/talent/jobs/${job.id}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-sm sm:rounded-2xl sm:gap-3 sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs font-semibold text-white sm:h-12 sm:w-12 sm:rounded-xl sm:text-base">
                  {job.initial}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs font-bold text-gray-900 sm:text-base">{job.title}</p>
                    
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-gray-500 sm:text-sm">
                    {job.company} · {job.location}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-gray-400 sm:mt-1 sm:text-sm">
                    {job.salary} · {job.postedDaysAgo}d ago · {job.level}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {job.status !== "active" && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap sm:px-3 sm:py-1 sm:text-xs ${statusBadgeStyles[job.status]}`}>
                    {statusBadgeLabels[job.status]}
                  </span>
                )}
                <span className="rounded-full bg-[#EDE7F8] px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-[#8A38F5] sm:px-3 sm:py-1 sm:text-xs">
                  {job.type}
                </span>
              </div>
            </Link>
          ))}

          {filteredJobs.length === 0 && (
            <p className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-xs text-gray-400 sm:p-8 sm:text-sm">
              No jobs match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading jobs…</div>}>
      <JobsContent />
    </Suspense>
  );
}