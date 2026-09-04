"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, CheckCircle2, MessageSquare, AlertTriangle, Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { employerNotificationsApi, EmployerNotification, EmployerNotificationType } from "@/lib/api/employerNotification";

type TabValue = "all" | "unread";

const typeIcons: Record<EmployerNotificationType, { icon: typeof FileText; bg: string; text: string }> = {
  application: { icon: FileText, bg: "bg-[#EDE7F8]", text: "text-[#8A38F5]" },
  interview: { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-600" },
  message: { icon: MessageSquare, bg: "bg-[#EDE7F8]", text: "text-[#8A38F5]" },
  subscription: { icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-600" },
};

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function EmployerNotificationsPage() {
  const { session } = useSession();
  const [notifications, setNotifications] = useState<EmployerNotification[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      setLoading(true);
      const data = await employerNotificationsApi.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 1. Properly close the session block
    if (session) {
      refresh();
      
      // Auto-refresh every 30 seconds
      const intervalId = setInterval(() => {
        refresh();
      }, 30000);

      // Cleanup interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [session]); // 2. Add session to the dependency array

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, activeTab]);

  async function handleClick(notification: EmployerNotification) {
    if (notification.read) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      await employerNotificationsApi.markAsRead(notification.id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      refresh();
    }
  }

  async function handleMarkAllRead() {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await employerNotificationsApi.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      refresh();
    }
  }

  async function handleRemove(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await employerNotificationsApi.remove(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      refresh();
    }
  }

  // 3. Actually use the loading and status states to show a loading screen!
  // We only show it if we have 0 notifications so the screen doesn't flash every 30 seconds during background refresh.
  if (status === "loading" || (loading && notifications.length === 0)) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-gray-500 animate-pulse">Loading notifications...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Notification Center</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Stay updated with applicant activity, scheduled panels, and workspace status.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
              activeTab === "all" ? "bg-[#EDE7F8] text-[#8A38F5]" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            All Notifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
              activeTab === "unread" ? "bg-[#EDE7F8] text-[#8A38F5]" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-[#8A38F5] hover:underline sm:text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {filteredNotifications.map((notification) => {
          const { icon: Icon, bg, text } = typeIcons[notification.type];
          return (
            <div
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
                !notification.read
                  ? "border-[#EDE7F8] bg-[#F5F3FA] hover:bg-[#EDE7F8]"
                  : "border-gray-100 bg-white hover:bg-gray-50"
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">{notification.description}</p>
                <p className="mt-1 text-[11px] text-gray-400">{formatTimeAgo(notification.createdAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {!notification.read && <span className="h-2 w-2 rounded-full bg-[#8A38F5]" />}
                
                <button
                  type="button"
                  onClick={(e) => handleRemove(notification.id, e)}
                  aria-label="Delete notification"
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            {activeTab === "unread" ? "No unread notifications." : "No notifications yet."}
          </div>
        )}
      </div>
    </>
  );
}
