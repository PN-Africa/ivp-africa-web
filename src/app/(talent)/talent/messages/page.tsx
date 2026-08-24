"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, ArrowLeft, Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { messageApi_Real, } from "@/lib/api/message";
import { type RealConversation, type RealMessage   } from "@/lib/types/message";
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function MessagesContent() {
  const { session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [conversations, setConversations] = useState<RealConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<RealMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [loading, setLoading] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const newApplicationId = searchParams?.get("newApplicationId") ?? null;
  const employerNameParam = searchParams?.get("employerName") ?? null;

  function refreshConversations() {
    setLoading(true);
    setLoadError(null);
    messageApi_Real.getConversation().then((result) => {
      if (result.ok) {
        setConversations(result.conversations);
      } else {
        setConversations([]);
        setLoadError(result.message);
      }
      setLoading(false);
      setInitialLoad(false)
    });
  }

  useEffect(() => {
    refreshConversations();
  }, [session?.email]);
  useEffect(() => {
    console.log("draft effect running:", { newApplicationId, loading, conversationsCount: conversations.length });
  if (!newApplicationId) return;
  const existing = conversations.find((c) => c.applicationId === newApplicationId);
  if (existing) {
    setActiveId(existing.id);
    setIsDraft(false);
    setMobileView("chat");
  } else if (!loading) {
    setIsDraft(true);
    setActiveId(null);
    setMobileView("chat");
  }
}, [newApplicationId, conversations, loading]);

  useEffect(() => {
    if (conversations.length === 0 || activeId) return;
    const requestedId = searchParams?.get("conversation") ?? null;
    const validRequested = requestedId && conversations.some((c) => c.id === requestedId);
    const initial = validRequested ? requestedId! : conversations[0].id;
    setActiveId(initial);
    if (validRequested) setMobileView("chat");
  }, [conversations, searchParams]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  function refreshMessages() {
    if (!activeId) return;
    messageApi_Real.getMessages(activeId).then((result) => {
      setMessages(result.ok ? result.messages : []);
    });
  }

  useEffect(() => {
    refreshMessages();
  }, [activeId]);

  function handleSelectConversation(conv: RealConversation) {
    setActiveId(conv.id);
    setMobileView("chat");
    router.replace(`/talent/messages?conversation=${conv.id}`);
  }

  async function handleSend() {
  if (!draft.trim()) return;

  if (isDraft && newApplicationId) {
    setSending(true);
    const result = await messageApi_Real.sendMessage(newApplicationId, draft.trim());
    setSending(false);
    if (result.ok) {
      setDraft("");
      setIsDraft(false);
      refreshConversations(); // will pick up the new conversation via the useEffect above
    }
    return;
  }

  if (!activeConversation?.applicationId) return;
  setSending(true);
  const result = await messageApi_Real.sendMessage(activeConversation.applicationId, draft.trim());
  setSending(false);
  if (result.ok) {
    setDraft("");
    refreshMessages();
  }
}

  async function handleDelete(conv: RealConversation) {
    const result = await messageApi_Real.deleteConversation(conv.id);
    if (result.ok) {
      setConversations((prev) => prev.filter((c) => c.id !== conv.id));
      if (activeId === conv.id) setActiveId(null);
    }
  }

  if (loading && initialLoad) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-gray-100 bg-white">
        <p className="text-sm text-gray-400">Loading conversations…</p>
      </div>
    );
  }

  if (loadError || conversations.length === 0 && !isDraft) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-6 text-center">
        <p className="text-sm text-gray-400">
          {loadError ? "Couldn't load conversations." : "No conversations yet."}
        </p>
        {loadError && <p className="text-xs text-gray-300">{loadError}</p>}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white sm:h-[calc(100vh-8rem)]">
      <div
        className={`w-full shrink-0 overflow-y-auto border-r border-gray-100 sm:block sm:w-64 lg:w-72 ${
          mobileView === "list" ? "block" : "hidden sm:block"
        }`}
      >
        {isDraft && (
          <div className="flex w-full items-center gap-3 border-b border-gray-100 bg-[#EDE7F8] px-4 py-3.5 text-left sm:px-5 sm:py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm">
              {(employerNameParam ?? "?").trim()[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{employerNameParam ?? "New conversation"}</p>
              <p className="truncate text-xs text-gray-500">No messages yet</p>
            </div>
          </div>
        )}
              {conversations.map((conv) => (
          <button
            key={conv.id}
            type="button"
            onClick={() => handleSelectConversation(conv)}
            className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3.5 text-left transition-colors sm:px-5 sm:py-4 ${
              conv.id === activeId ? "bg-[#EDE7F8]" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm">
              {conv.otherPartyName.trim()[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{conv.otherPartyName}</p>
              <p className="truncate text-xs text-gray-500">{conv.lastMessage || "No messages yet"}</p>
            </div>
          </button>
        ))}
      </div>

      <div className={`flex flex-1 flex-col ${mobileView === "chat" ? "flex" : "hidden sm:flex"}`}>

        {activeConversation || isDraft ? (
  <>
    <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileView("list")}
          className="text-gray-400 hover:text-gray-600 sm:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} />
        </button>
        <p className="truncate text-sm font-bold text-gray-900 sm:text-base">
          {isDraft ? employerNameParam ?? "New conversation" : activeConversation!.otherPartyName}
        </p>
      </div>
      {!isDraft && (
        <button
          type="button"
          onClick={() => handleDelete(activeConversation!)}
          aria-label="Delete conversation"
          className="shrink-0 text-gray-400 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>

    <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 sm:px-6 sm:py-6">
      {isDraft || messages.length === 0 ? (
        <p className="text-center text-sm text-gray-400">No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === session?.email ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-md ${
                msg.senderId === session?.email ? "bg-[#8A38F5] text-white" : "bg-white text-gray-800"
              }`}>
                <p>{msg.content}</p>
                <p className={`mt-1 text-[10px] ${msg.senderId === session?.email ? "text-white/70" : "text-gray-400"}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-3 sm:px-6 sm:py-4">
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Write a message..."
        className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#8A38F5]"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={sending || !draft.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8A38F5] text-white transition-colors hover:bg-[#7226e0] disabled:opacity-50 sm:h-11 sm:w-11"
      >
        <Send size={16} className="sm:size-[18px]" />
      </button>
    </div>
  </>
) : (
  <div className="flex flex-1 items-center justify-center">
    <p className="text-sm text-gray-400">Select a conversation to start messaging.</p>
  </div>
)}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading messages…</div>}>
      <MessagesContent />
    </Suspense>
  );
}