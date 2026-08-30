"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { adminNotificationsApi, type BroadcastHistoryEntry } from "@/lib/api/adminNotifications";

const audienceOptions: { label: string; value: "ALL" | "TALENT" | "EMPLOYER" }[] = [
  { label: "All Users", value: "ALL" },
  { label: "Talent", value: "TALENT" },
  { label: "Employers", value: "EMPLOYER" },
];

export default function AdminNotificationsPage() {
  const [audience, setAudience] = useState<"ALL" | "TALENT" | "EMPLOYER">("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [history, setHistory] = useState<BroadcastHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  function loadHistory() {
    setLoading(true);
    setLoadError(null);
    adminNotificationsApi.getHistory().then((result) => {
      if (result.ok) {
        setHistory(result.broadcasts);
      } else {
        setLoadError(result.message ?? "Failed to load broadcast history.");
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSend() {
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setSendError(null);

    const result = await adminNotificationsApi.broadcast(title.trim(), message.trim(), audience);

    setSending(false);

    if (!result.ok) {
      setSendError(result.message ?? "Failed to send broadcast.");
      return;
    }

    setTitle("");
    setMessage("");
    loadHistory();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Notifications</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Compose and send platform-wide announcements.
        </p>
      </div>

      {/* Compose */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">Compose Platform Broadcast</h2>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Broadcast title"
            className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#8A38F5] focus:bg-white"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Audience</label>
          <div className="relative">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as "ALL" | "TALENT" | "EMPLOYER")}
              className="w-full appearance-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-900 outline-none focus:border-[#8A38F5] focus:bg-white"
            >
              {audienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Notification Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Notification message"
            rows={5}
            className="w-full resize-none rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#8A38F5] focus:bg-white"
          />
        </div>

        {sendError && <p className="mt-3 text-sm text-red-500">{sendError}</p>}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSend}
            disabled={!title.trim() || !message.trim() || sending}
            className="rounded-xl bg-[#6C3CFF] px-6 py-2.5 text-sm font-semibold !text-white transition-colors hover:bg-[#7226e0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send Broadcast Alert"}
          </button>
        </div>
      </div>

      {/* Delivery History */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">Delivery History</h2>

        {loading ? (
          <p className="py-6 text-center text-sm text-gray-400">Loading broadcast history...</p>
        ) : loadError ? (
          <p className="py-6 text-center text-sm text-red-500">{loadError}</p>
        ) : history.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No broadcasts sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 pr-4 text-xs font-medium text-gray-400">Title</th>
                  <th className="hidden py-3 pr-4 text-xs font-medium text-gray-400 sm:table-cell">Audience</th>
                  <th className="py-3 text-right text-xs font-medium text-gray-400">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.message}</p>
                      <p className="text-xs text-gray-400 sm:hidden">{item.targetAudience}</p>
                    </td>
                    <td className="hidden py-3 pr-4 text-sm text-gray-500 sm:table-cell">{item.targetAudience}</td>
                    <td className="py-3 text-right text-sm text-gray-400 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}