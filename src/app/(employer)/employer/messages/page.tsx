"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Paperclip, Send, Phone, Video, FileText } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { messageApi, RealConversation, RealMessage } from "@/lib/api/employerMessage";
import { io, Socket } from "socket.io-client";

const avatarPalette = [
  { bg: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
];

function getInitials(name: string = "Unknown") {
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

function formatTimeAgo(iso: string): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatTime(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function MessagesPage() {
  const { session } = useSession();
  const [conversations, setConversations] = useState<RealConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<RealMessage[]>([]);
  
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // 1. Initialize Socket.io connection
  useEffect(() => {
    if (!session?.accessToken) return;

    // Replace with your actual backend base URL if it's external (e.g., process.env.NEXT_PUBLIC_API_URL)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "https://your-api-url.com"; 
    
    socketRef.current = io(`${socketUrl}/chat`, {
      auth: { token: session.accessToken },
      transports: ["websocket"],
    });

    socketRef.current.on("newMessage", (newMsg: any) => {
      // If the incoming message belongs to the currently open conversation, append it
      setMessages((prev) => {
        if (newMsg.conversationId === activeConvId) {
          // Avoid duplicates just in case
          if (prev.some((m) => m.id === newMsg.messageId)) return prev;
          return [...prev, {
            id: newMsg.messageId,
            conversationId: newMsg.conversationId,
            content: newMsg.content,
            createdAt: newMsg.createdAt,
            senderId: newMsg.sender.id,
            isRead: true, // we have it open
          }];
        }
        return prev;
      });

      // Move conversation to top & update lastMessage
      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c.id === newMsg.conversationId);
        if (convIndex === -1) return prev; // If totally new conv, you might want to refetch the list
        
        const updatedList = [...prev];
        const conv = updatedList[convIndex];
        
        conv.lastMessage = { id: newMsg.messageId, content: newMsg.content, createdAt: newMsg.createdAt };
        conv.updatedAt = newMsg.createdAt;
        if (newMsg.conversationId !== activeConvId) {
          conv.unreadCount += 1; // Increment badge if we aren't looking at it
        }

        // Move to the top
        updatedList.splice(convIndex, 1);
        updatedList.unshift(conv);
        return updatedList;
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [session?.accessToken, activeConvId]);

  // 2. Fetch Conversations on Mount or Search Change
  useEffect(() => {
    if (!session?.accessToken) return;
    const fetchConvs = async () => {
      setIsLoading(true);
      const res = await messageApi.getConversations(search);
      // Ensure res is the array (handle your apiFetch wrapper's exact return shape)
      const data = Array.isArray(res) ? res : (res as any).data || [];
      setConversations(data);
      setIsLoading(false);
    };

    // Debounce search slightly
    const timer = setTimeout(fetchConvs, 300);
    return () => clearTimeout(timer);
  }, [session?.accessToken, search]);

  // 3. Fetch Messages when a conversation is selected
  useEffect(() => {
    if (!activeConvId) return;

    const fetchMessages = async () => {
      const res = await messageApi.getMessages(activeConvId);
      const data = Array.isArray(res) ? res : (res as any).data || [];
      setMessages(data);
      
      // Clear unread count locally since backend marks them as read automatically
      setConversations((prev) => 
        prev.map(c => c.id === activeConvId ? { ...c, unreadCount: 0 } : c)
      );
    };

    fetchMessages();
  }, [activeConvId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Handle Sending a Message
  const handleSend = async () => {
    if (!draft.trim() || !activeConvId) return;
    const content = draft.trim();
    setDraft(""); // Optimistic clear

    try {
      const res: any = await messageApi.sendMessage(content, { conversationId: activeConvId });
      const newMsgData = res.data || res; // depending on your api wrapper shape
      
      // Optimistically append (or rely on socket fallback)
      setMessages((prev) => [...prev, newMsgData]);
      
      // Update local conversation list
      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c.id === activeConvId);
        if (convIndex === -1) return prev;
        const updatedList = [...prev];
        updatedList[convIndex].lastMessage = {
          id: newMsgData.id,
          content: newMsgData.content,
          createdAt: newMsgData.createdAt
        };
        updatedList[convIndex].updatedAt = newMsgData.createdAt;
        const [moved] = updatedList.splice(convIndex, 1);
        updatedList.unshift(moved);
        return updatedList;
      });

    } catch (err) {
      console.error("Failed to send message", err);
      // optionally restore draft on failure
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  // Use session.user?.id or session?.id to identify if "I" am the sender
  const myUserId = (session as any)?.user?.id || (session as any)?.id; 

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-gray-100 bg-white">
        <p className="text-sm text-gray-400">Loading messages...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Messaging</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">Real-time chat connected to your applications.</p>
      </div>

      <div className="mt-4 flex h-[calc(100vh-10rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Inbox Sidebar */}
        <div className="hidden w-72 shrink-0 flex-col border-r border-gray-100 sm:flex">
          <div className="border-b border-gray-100 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-[#8A38F5]">
              <Search size={15} className="shrink-0 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv, i) => {
              const palette = avatarPalette[i % avatarPalette.length];
              const isSelected = conv.id === activeConvId;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConvId(conv.id)}
                  className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors ${
                    isSelected ? "bg-[#EDE7F8]" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${palette.bg} ${palette.text}`}>
                    {/* Fallback to initials if no participantAvatar provided by backend */}
                    {conv.participantAvatar ? (
                      <img src={conv.participantAvatar} alt="avatar" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      getInitials(conv.participantName)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm ${conv.unreadCount > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-900"}`}>
                        {conv.participantName}
                      </p>
                      {conv.lastMessage && (
                        <span className="shrink-0 text-[10px] text-gray-400">{formatTimeAgo(conv.lastMessage.createdAt)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                       <p className={`truncate text-xs ${conv.unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-400"}`}>
                        {conv.lastMessage ? conv.lastMessage.content : "No messages yet"}
                       </p>
                       {conv.unreadCount > 0 && (
                         <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                           {conv.unreadCount}
                         </span>
                       )}
                    </div>
                  </div>
                </button>
              );
            })}

            {conversations.length === 0 && search && (
              <p className="p-4 text-center text-sm text-gray-400">No conversations match &quot;{search}&quot;.</p>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex flex-1 flex-col">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                    {getInitials(activeConversation.participantName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activeConversation.participantName}</p>
                    <p className="text-xs text-gray-400">Application ID: <span className="font-medium text-[#8A38F5]">...{activeConversation.applicationId.slice(-6)}</span></p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Hi ${activeConversation.participantName}, `)}`} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Phone size={16} />
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Hi ${activeConversation.participantName}, let's set up a video call.`)}`} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Video size={16} />
                  </a>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 sm:px-6">
                {messages.length === 0 ? (
                  <p className="mt-8 text-center text-sm text-gray-400">
                    No messages yet — say hello.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === myUserId;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-md ${
                            isMe ? "bg-[#8A38F5] text-white" : "bg-white text-gray-800"
                          }`}>
                            <p>{msg.content}</p>
                            <p className={`mt-1 text-[10px] ${isMe ? "text-white/70" : "text-gray-400"}`}>
                              {formatTime(msg.createdAt)} {isMe && (msg.isRead ? " • Read" : " • Sent")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-gray-100 px-3 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Attach file" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Paperclip size={17} />
                  </button>

                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#8A38F5]"
                  />

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!draft.trim()}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#8A38F5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-gray-400">Select a conversation to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}