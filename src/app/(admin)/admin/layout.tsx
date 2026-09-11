"use client";

import { RequireRole } from "@/app/(auth)/requireAuth";
import { AdminSidebar } from "../admin/components/AdminSidebar";
import { AdminTopbar } from "../admin/components/AdminNavbar";
// layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="admin">
      <div className="flex bg-gray-50 h-screen">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminTopbar />
          <main className="flex h-screen flex-col gap-6 p-4 sm:p-6 lg:p-8 bg-gray-50 ">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}