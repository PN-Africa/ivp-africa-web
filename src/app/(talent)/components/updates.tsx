"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/useSession";
import { getLatestUpdates, type UpdateItem } from "@/lib/utils/dashboardUpdates";

export function LatestUpdates() {
  const { session } = useSession();
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
useEffect(() => {
  if (!session?.email) return;
  const email = session.email;

  async function loadUpdates() {
    const items = await getLatestUpdates(email);
    setUpdates(items);
  }

  loadUpdates();
}, [session?.email]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
      <h2 className="mb-4 text-sm font-bold text-[#3A2680] sm:text-base">Latest updates</h2>

      {updates.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-400 sm:text-sm">
          No updates yet — start applying to see activity here.
        </p>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-3">
          {updates.map((update) => (
            <div
              key={update.id}
              className="cursor-pointer rounded-xl border border-gray-100 bg-[#EDE7F8] p-3 transition-colors duration-150 hover:bg-[#DCCFF5] sm:p-4"
            >
              <p className="text-xs font-semibold text-[#3A2680] sm:text-sm">{update.title}</p>
              {update.description && (
                <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">{update.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}