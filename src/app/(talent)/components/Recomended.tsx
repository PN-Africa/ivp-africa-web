"use client";

import { useEffect, useState } from "react";
import { Briefcase, Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth/useSession";
import { profileApi } from "@/lib/api/profile";
import { getRecommendedJobs } from "@/lib/utils/recommendations";
import type { TalentJob } from "@/lib/utils/talentJobs";

export function RecommendedForYou() {
  const { session } = useSession();
  const [recommendedJobs, setRecommendedJobs] = useState<TalentJob[]>([]);
useEffect(() => {
  if (!session?.email) return;
  const email = session.email;

  async function loadRecommended() {
    const profile = profileApi.get(email);
    const jobs = await getRecommendedJobs(profile);
    setRecommendedJobs(jobs);
  }

  loadRecommended();
}, [session?.email]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 sm:text-base">Recommended for you</h2>
        <Link
          href="/talent/jobs"
          className="flex items-center gap-1.5 text-xs font-medium text-[#8A38F5] transition-colors hover:text-[#6C3CFF] sm:text-sm"
        >
          <Search size={14} className="sm:size-4" />
          Search jobs
        </Link>
      </div>

      {recommendedJobs.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-400 sm:text-sm">
          No recommendations available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {recommendedJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-5"
            >
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#8A38F5] sm:mb-3 sm:text-sm">
                <Briefcase size={14} className="sm:size-4" />
                {job.type}
              </div>

              <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:text-base">{job.title}</h3>
              <p className="mb-3 text-xs text-gray-500 sm:mb-4 sm:text-sm">
                {job.company} · {job.location}
              </p>

              <Link
                href={`/talent/jobs/${job.id}`}
                className="text-xs font-medium text-[#8A38F5] transition-colors hover:text-[#6C3CFF] sm:text-sm"
              >
                View & apply →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}