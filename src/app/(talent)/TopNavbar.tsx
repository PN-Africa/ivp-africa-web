"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Bookmark } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { session as sessionStore } from "@/lib/auth/session";
import { notificationsApi } from "@/lib/api/notification";
import { searchTalent } from "@/app/(talent)/talent/search";

interface TopNavbarProps {
  section: string;
  title: string;
  userName: string;
}

function getInitials(name: string) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

export function TopNavbar({ section, title, userName }: TopNavbarProps) {
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchTalent(query), [query]);

  function handleLogout() {
    sessionStore.clear();
    router.push("/login");
  }

  useEffect(() => {
    if (!session?.email) return;
    const update = () => setUnreadCount(notificationsApi.unreadCount(session.email));
    update();
    const unsubscribe = notificationsApi.subscribe(update);
    return unsubscribe;
  }, [session?.email]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(href: string) {
    setDropdownOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <header className="flex items-center justify-between gap-2 border-b border-gray-100 bg-white px-3 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:gap-6 lg:px-8">
      <div ref={searchRef} className="relative min-w-0 flex-1 lg:max-w-md">
        <div className="flex items-center gap-2 rounded-xl bg-[#F5F3FA] px-3 py-2 sm:px-4 sm:py-2.5">
          <Search size={16} className="shrink-0 text-gray-400 sm:size-[18px]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => query.trim() && setDropdownOpen(true)}
            placeholder="Search jobs, applications..."
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-500 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {dropdownOpen && query.trim() && (
          <div className="absolute top-full left-0 z-20 mt-2 w-full rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No matches for &quot;{query}&quot;</p>
            ) : (
              results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelect(result.href)}
                  className="flex w-full flex-col items-start px-4 py-2 text-left hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-900">{result.label}</span>
                  <span className="text-xs text-gray-400">{result.subtitle}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Saved jobs"
          onClick={() => router.push("/talent/saved-jobs")}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-[#EDE7F8] hover:text-[#3A2680] sm:h-10 sm:w-10"
        >
          <Bookmark size={16} className="sm:size-[18px]" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          onClick={() => router.push("/talent/notifications")}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-[#EDE7F8] hover:text-[#3A2680] sm:h-10 sm:w-10"
        >
          <Bell size={16} className="sm:size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#8A38F5] ring-2 ring-white" />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#8A38F5] text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm">
              {session?.avatarUrl ? (
                <img src={session.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                getInitials(session?.displayName ?? "there")
              )}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-900">{session?.displayName ?? "there"}</p>
              <p className="text-xs text-gray-400">Talent</p>
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/talent/Profile");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}