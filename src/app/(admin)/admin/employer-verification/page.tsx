"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Check, X, Search, ChevronDown } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import type { AuditLogEntry as RealAuditLogEntry } from "@/lib/types/auditLog";
import { adminEmployersApi, type PendingEmployerView } from "@/lib/api/adminEmployer";

const dateOptions = ["All time", "Last 7 days", "Last 14 days", "Last 30 days"];
const PAGE_SIZE = 20;

function daysLimit(option: string): number | null {
  if (option === "Last 7 days") return 7;
  if (option === "Last 14 days") return 14;
  if (option === "Last 30 days") return 30;
  return null;
}

export default function EmployerVerificationPage() {
  const [requests, setRequests] = useState<PendingEmployerView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<PendingEmployerView | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("All time");
  const [page, setPage] = useState(1);
  const { session } = useSession();

  function loadRequests() {
    setLoading(true);
    setLoadError(null);
    adminEmployersApi.getPendingVerifications().then((result) => {
      if (result.ok) {
        setRequests(result.employers);
      } else {
        setLoadError(result.message ?? "Failed to load pending verifications.");
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const limit = daysLimit(dateFilter);
    const cutoff = limit ? Date.now() - limit * 86400_000 : null;

    return requests.filter((req) => {
      const matchesSearch =
        search.trim() === "" || req.companyName.toLowerCase().includes(search.toLowerCase());
      const matchesDate = cutoff === null || new Date(req.submittedAt).getTime() >= cutoff;
      return matchesSearch && matchesDate;
    });
  }, [requests, search, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startIndex = filteredRequests.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredRequests.length);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleDateChange(value: string) {
    setDateFilter(value);
    setPage(1);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  async function handleDecision(decision: "approve" | "reject") {
    if (!reviewing) return;

    const status = decision === "approve" ? "APPROVED" : "REJECTED";
    const result = await adminEmployersApi.verify(
      reviewing.id,
      status,
      decision === "reject" ? rejectionReason : undefined
    );

    if (!result.ok) {
      console.error("Verification failed:", result.message);
      return;
    }

    // adminAuditLogsApi.add(
    //   session?.displayName ?? "Admin",
    //   decision === "approve" ? "Approved verification" : "Rejected verification",
    //   reviewing.companyName
    // );

    setRequests((prev) => prev.filter((r) => r.id !== reviewing.id));
    setReviewing(null);
    setRejectionReason("");
    setPage((p) => Math.min(p, Math.max(1, Math.ceil((requests.length - 1) / PAGE_SIZE))));
  }

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Employer Verification</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Review and approve companies applying to recruit on the platform.
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 sm:max-w-xs">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by Company name..."
            className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="relative">
          <select
            value={dateFilter}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 py-2.5 pr-9 pl-4 text-sm text-gray-700 outline-none sm:w-40"
          >
            {dateOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">Pending requests</h2>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading pending requests...</p>
        ) : loadError ? (
          <p className="py-8 text-center text-sm text-red-500">{loadError}</p>
        ) : filteredRequests.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No pending employer requests match your search or filter.
          </p>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-medium text-gray-400">Company</th>
                    <th className="hidden pb-3 text-xs font-medium text-gray-400 sm:table-cell">Submitted date</th>
                    <th className="pb-3 text-right text-xs font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRequests.map((req) => (
                    <tr key={req.id} className="transition-colors hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EDE7F8]">
                            {req.logoUrl ? (
                              <img src={req.logoUrl} alt={req.companyName} className="h-full w-full object-cover" />
                            ) : (
                              <Building2 size={18} className="text-[#8A38F5]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{req.companyName}</p>
                            <p className="text-xs text-gray-400">{req.industry ?? "Industry not provided"}</p>
                            <p className="mt-0.5 text-xs text-gray-400 sm:hidden">{formatDate(req.submittedAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden py-4 text-sm text-gray-500 sm:table-cell">
                        {formatDate(req.submittedAt)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                          <button
                            type="button"
                            onClick={() => setReviewing(req)}
                            className="rounded-xl bg-[#8A38F5] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0]"
                          >
                            Review Request
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-400 sm:text-sm">
                Showing {startIndex}-{endIndex} of {filteredRequests.length} requests
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
          </div>
        )}
      </div>

      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EDE7F8]">
                {reviewing.logoUrl ? (
                  <img src={reviewing.logoUrl} alt={reviewing.companyName} className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={20} className="text-[#8A38F5]" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{reviewing.companyName}</h3>
                <p className="text-xs text-gray-400">{reviewing.industry ?? "Industry not provided"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1 text-sm text-gray-500">
              <p>Submitted on {formatDate(reviewing.submittedAt)}.</p>
              {reviewing.contactPerson && <p>Contact: {reviewing.contactPerson} ({reviewing.email})</p>}
              {reviewing.rcNumber && <p>RC Number: {reviewing.rcNumber}</p>}
              {reviewing.website && <p>Website: {reviewing.website}</p>}
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (only needed if rejecting)"
              rows={2}
              className="mt-4 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#8A38F5]"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => handleDecision("reject")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <X size={16} />
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleDecision("approve")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#8A38F5] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0]"
              >
                <Check size={16} />
                Approve
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setReviewing(null);
                setRejectionReason("");
              }}
              className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}