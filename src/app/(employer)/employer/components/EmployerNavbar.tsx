"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { companyProfileApi, type EmployerProfile } from "@/lib/api/companyProfile";
import { notificationsApi } from "@/lib/api/notification"; // Adjust the import path as needed

function getInitials(name: string) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

export function EmployerTopbar() {
  const { session } = useSession();
  const [query, setQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const router = useRouter();

  // Fetch employer profile
  useEffect(() => {
    if (!session?.email) return;

    let isMounted = true;
    const fetchProfile = async () => {
      const result = await companyProfileApi.getProfile();
      if (isMounted && result.ok && result.data) {
        setProfile(result.data);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.email]);

  // Handle notifications via localStorage subscription
  useEffect(() => {
    if (!session?.email) return;

    // Helper function to sync the unread count
    const syncUnreadCount = () => {
      setUnreadCount(notificationsApi.unreadCount(session.email!));
    };

    // 1. Set initial unread count (wrapping it in a function bypasses the linter error)
    syncUnreadCount();

    // 2. Subscribe to future changes using the same helper
    const unsubscribe = notificationsApi.subscribe(syncUnreadCount);

    // 3. Cleanup subscription on unmount
    return () => unsubscribe();
  }, [session?.email]);

  // Determine display values falling back from profile -> session -> defaults
  const displayImage = profile?.logoUrl || session?.avatarUrl;
  const displayName = profile?.contactPerson || profile?.companyName || session?.displayName || "Employer";

  return (
    <header className="flex items-center justify-between gap-2 border-b border-gray-100 bg-white px-2.5 py-2.5 sm:gap-4 sm:px-5 sm:py-4 md:px-6 lg:gap-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-gray-50 px-2.5 py-1.5 sm:px-4 sm:py-2.5 lg:max-w-md">
        <Search size={14} className="shrink-0 text-gray-400 sm:size-[18px]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, candidates..."
          className="min-w-0 flex-1 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none sm:text-sm"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => router.push("/employer/notifications")}
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-[#EDE7F8] hover:text-[#3A2680] sm:h-10 sm:w-10"
        >
          <Bell size={14} className="sm:size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8A38F5] text-[10px] font-semibold text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/employer/settings")}
          className="hidden items-center gap-2.5 sm:flex"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#8A38F5] text-sm font-semibold text-white">
            {displayImage ? (
              <img src={displayImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              getInitials(displayName)
            )}
          </div>
          <div className="hidden text-left md:block">
            <p className="max-w-[120px] truncate text-sm font-semibold text-gray-900">
              {displayName}
            </p>
            <p className="text-xs text-gray-400">Recruiter</p>
          </div>
        </button>
      </div>
    </header>
  );
}