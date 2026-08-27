"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { adminUsersApi, type AdminUserView } from "@/lib/api/adminUsers";

const PAGE_SIZE = 20;

const statusStyles: Record<AdminUserView["status"], string> = {
  active: "bg-green-50 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  suspended: "bg-red-50 text-red-600",
};

const statusLabels: Record<AdminUserView["status"], string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};
const roleLabels: Record<AdminUserView["role"], string> = {
  talent: "Talent",
  employer: "Employer",
  admin: "Admin",
};

function getInitials(name: string) {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("");
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] =useState(true)
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [page, setPage] = useState(1);

  useEffect(() => {
  async function loadUsers() {
    setLoading(true);
    const result = await adminUsersApi.getAll();

    if (!result.ok) {
      console.error("Failed to load users:", result.message);
      setLoading(false);
      return;
    }

    setUsers(result.users);
    setLoading(false);
  }

  loadUsers();
}, []);


 const filteredUsers = useMemo(() => {
  return users
    .filter((user) => user.role !== "admin") // exclude admin accounts from this list entirely
    .filter((user) => {
      const matchesSearch =
        search.trim() === "" ||
        user.displayName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All types" || roleLabels[user.role] === typeFilter;
      return matchesSearch && matchesType;
    });
}, [users, search, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startIndex = filteredUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleTypeFilterChange(value: string) {
    setTypeFilter(value);
    setPage(1);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">User Management</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Manage candidates, recruiters and admin access permissions.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 sm:max-w-xs">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => handleTypeFilterChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 py-2.5 pr-9 pl-4 text-sm text-gray-700 outline-none sm:w-40"
          >
            <option>All types</option>
            <option>Talent</option>
            <option>Employer</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 sm:px-6">Name</th>
                <th className="hidden px-4 py-3 text-xs font-semibold text-gray-500 sm:table-cell sm:px-6">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 sm:px-6">Status</th>
                <th className="hidden px-4 py-3 text-xs font-semibold text-gray-500 md:table-cell sm:px-6">Verification</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 sm:px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
    <tr>
      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
        Loading users...
      </td>
    </tr>
  ) : (
    <>
      {paginatedUsers.map((user) => (
        <tr key={user.email} className="transition-colors hover:bg-gray-50">
          {/* ...unchanged row content... */}
        </tr>
      ))}

      {paginatedUsers.length === 0 && (
        <tr>
          <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
            No users match your search or filter.
          </td>
        </tr>
      )}
    </>
  )}
              {paginatedUsers.map((user) => (
                <tr key={user.email} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE7F8] text-xs font-semibold text-[#8A38F5]">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
                        ) : (
                          getInitials(user.displayName)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{user.displayName}</p>
                        <p className="text-xs text-gray-400 sm:hidden">{roleLabels[user.role]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-4 text-sm text-gray-600 sm:table-cell sm:px-6">
                    {roleLabels[user.role]}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${statusStyles[user.status]}`}>
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-4 text-sm text-gray-500 md:table-cell sm:px-6">
                    {user.verification}
                  </td>
                  <td className="px-4 py-4 text-right sm:px-6">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-block rounded-lg border border-[#8A38F5] px-3 py-1.5 text-xs font-semibold text-[#8A38F5] transition-colors hover:bg-[#8A38F5] hover:text-white sm:px-4"
                    >
                      View profile
                    </Link>
                  </td>
                </tr>
              ))}

              
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-gray-400 sm:text-sm">
              Showing {startIndex}-{endIndex} of {filteredUsers.length} users
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}