"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Bell,
  Settings,
  MessageSquare,
  LogOut,Calendar
} from "lucide-react";

import { navItems } from "../data/data";
import { session as sessionStore } from "@/lib/auth/session";

const icons: Record<string, React.ElementType> = {
  "/talent": LayoutDashboard,
  "/talent/Profile": User,
  "/talent/applications": FileText,
  "/talent/jobs": Bookmark,
  "/talent/interview": Calendar,
  "/talent/notifications": Bell,
  "/talent/messages": MessageSquare,
  "/talent/settings": Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(link: string) {
    if (link === "/talent") return pathname === "/talent";
    return pathname?.startsWith(link);
  }

  function handleLogout() {
    sessionStore.clear();
    router.push("/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-gray-100 bg-white lg:w-64">
      {/* Logo */}
      <div className="flex items-center justify-center border-b border-gray-100 px-2 py-3 lg:justify-start lg:px-4">
        {/* <Image
          alt="IVP Africa"
          width={100}
          height={100}
          className="h-10 w-10 lg:h-16 lg:w-16"
          src="/img_ivp/ivp_logo.png"
        /> */}
        <div className="mt-4 flex items-center justify-center gap-2 px-0 lg:justify-start lg:px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8A38F5] text-sm font-bold text-white">
            IV
          </div>
          <span className="hidden text-sm font-bold tracking-wide text-gray-900 lg:inline">
            IVP AFRICA
          </span>
          </div>
      </div>
       {/* <div className="mb-4 mt-5 flex items-center justify-center gap-2 px-0 lg:justify-start lg:px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8A38F5] text-sm font-bold text-white">
            IV
          </div>
          <span className="hidden text-sm font-bold tracking-wide text-gray-900 lg:inline">
            IVP AFRICA
          </span>
        </div> */}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 lg:px-3">
        <p className="mb-2 hidden px-2 text-[10px] font-medium tracking-widest text-gray-400 uppercase lg:block">
          Talent portal
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = icons[item.href];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  className={`flex items-center justify-center gap-3 rounded-lg border-l-4 px-0 py-2.5 text-sm transition-colors duration-150 lg:justify-start lg:px-3 lg:text-[16px] ${
                    isActive(item.href)
                      ? "border-[#8A38F5] bg-[#8A38F5] font-medium text-[#EDE7F8]"
                      : "border-transparent text-gray-600 hover:bg-[#EDE7F8]/60 hover:text-[#3A2680]"
                  }`}
                >
                  <span className="shrink-0">
                    <Icon size={18} />
                  </span>
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-2 lg:p-3">
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className="flex w-full items-center justify-center gap-3 rounded-lg px-0 py-2.5 text-sm text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500 lg:justify-start lg:px-3"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:inline">Log out</span>
        </button>
      </div>
      <div className="hidden border-t border-gray-100 px-4 py-3 text-center text-[11px] text-gray-300 lg:block">
        IVP Africa — talent placement platform
      </div>
    </aside>
  );
}