"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Download } from "lucide-react";
import { adminAuditLogsApi, type AdminAuditLogEntry } from "@/lib/api/auditLogs";

interface DisplayLogEntry {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timeAgo: string;
  timestamp: number;
}

const dateRangeOptions = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "All time"];
const PAGE_SIZE = 20;

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("");
}

function daysAgoLimit(range: string): number | null {
  if (range === "Last 7 Days") return 7;
  if (range === "Last 30 Days") return 30;
  if (range === "Last 90 Days") return 90;
  return null;
}

function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function toCsv(rows: DisplayLogEntry[]): string {
  const header = "Admin,Action,Target,Time\n";
  const body = rows.map((r) => `"${r.adminName}","${r.action}","${r.target}","${r.timeAgo}"`).join("\n");
  return header + body;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError(null);
      const result = await adminAuditLogsApi.getAll();
      if (result.ok) {
        setLogs(result.logs);
      } else {
        setLoadError(result.message ?? "Failed to load audit logs.");
      }
      setLoading(false);
    }
    load();
  }, []);

  const displayLogs: DisplayLogEntry[] = useMemo(() => {
    return logs.map((log) => ({
      id: log.id,
      adminName: log.adminName,
      action: log.action,
      target: log.target,
      timeAgo: formatTimeAgo(new Date(log.createdAt).getTime()),
      timestamp: new Date(log.createdAt).getTime(),
    }));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const limit = daysAgoLimit(dateRange);
    const cutoff = limit ? Date.now() - limit * 86400_000 : null;

    return displayLogs.filter((log) => {
      const matchesSearch =
        search.trim() === "" ||
        log.adminName.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase());
      const matchesDate = cutoff === null || log.timestamp >= cutoff;
      return matchesSearch && matchesDate;
    });
  }, [displayLogs, search, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startIndex = filteredLogs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredLogs.length);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleDateRangeChange(value: string) {
    setDateRange(value);
    setPage(1);
  }

  function handleExportCsv() {
    const csv = toCsv(filteredLogs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Audit Logs</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Search and review every administrative action taken on the platform.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 sm:max-w-xs">
            <Search size={16} className="shrink-0 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by admin or action..."
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 py-2.5 pr-9 pl-4 text-sm text-gray-700 outline-none sm:w-40"
            >
              {dateRangeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filteredLogs.length === 0}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#8A38F5] px-5 py-2.5 text-sm font-semibold text-[#8A38F5] transition-colors hover:bg-[#EDE7F8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-medium text-gray-400 sm:px-6">Admin</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 sm:px-6">Action</th>
                <th className="hidden px-4 py-3 text-xs font-medium text-gray-400 sm:table-cell sm:px-6">Target</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 sm:px-6">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                    Loading audit logs...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-red-500">
                    {loadError}
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                    No matching audit log entries.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE7F8] text-xs font-semibold text-[#8A38F5]">
                          {getInitials(log.adminName)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{log.adminName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <p className="text-sm text-gray-700">{log.action}</p>
                      <p className="text-xs text-gray-400 sm:hidden">{log.target}</p>
                    </td>
                    <td className="hidden px-4 py-4 text-sm text-gray-400 sm:table-cell sm:px-6">{log.target}</td>
                    <td className="px-4 py-4 text-right text-sm whitespace-nowrap text-gray-400 sm:px-6">
                      {log.timeAgo}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredLogs.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-gray-400 sm:text-sm">
              Showing {startIndex}-{endIndex} of {filteredLogs.length} entries
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
    </>
  );
}