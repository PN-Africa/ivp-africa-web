"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { employerNotificationsApi } from "@/lib/api/employerNotification";

function getInitials(name: string) {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("");
}

export function EmployerTopbar() {
  const { session } = useSession();
  const [query, setQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Only run if the user is authenticated
    if (!session?.email) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        // Fetch all notifications from your backend
        const notifications = await employerNotificationsApi.getAll();
        
        if (isMounted) {
          // Count the ones that are NOT read
          const unread = notifications.filter((n) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Since your API doesn't have a built-in WebSocket "subscribe" method,
    // we use a polling interval to check for new notifications every 30 seconds.
    const intervalId = setInterval(fetchNotifications, 30000);

    // Cleanup function when component unmounts
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [session?.email]);

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
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/employer/settings")}
          className="hidden items-center gap-2.5 sm:flex"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#8A38F5] text-sm font-semibold text-white">
            {session?.avatarUrl ? (
              <img src={session.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              getInitials(session?.displayName ?? "Employer")
            )}
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-gray-900">{session?.displayName ?? "Employer"}</p>
            <p className="text-xs text-gray-400">Recruiter</p>
          </div>
        </button>
      </div>
    </header>
  );
}