import type {   RealConversation,RealMessage } from "@/lib/types/message";

import { apiFetch } from "@/lib/api/httpClient";
import { session } from "@/lib/auth/session";

function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

function normalizeConversation(raw: any): RealConversation {
  return {
    id: raw.id ?? "",
    applicationId: raw.applicationId,
    otherPartyName: raw.participantName ?? "Unknown",
    otherPartyAvatar: raw.participantAvatar ?? undefined,
    lastMessage: raw.lastMessage?.content ?? "",
    unreadCount: raw.unreadCount ?? 0,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}
function normalizeMessage(raw: any): RealMessage {
  return {
    id: raw.id ?? raw._id ?? "",
    content: raw.content ?? "",
    senderId: raw.senderId ?? raw.sender?.id ?? "",
    createdAt: raw.createdAt ?? raw.sentAt ?? new Date().toISOString(),
  };
}

const PREFIX = "ivp_conversations_";
type Listener = () => void;
const listeners = new Set<Listener>();

function keyFor(email: string) {
  return PREFIX + email.toLowerCase();
}


export const messageApi_Real={
  sendMessage: async(applicationId: string, content:string)=>{
    const res = await apiFetch<{message?: string}> ("/api/v1/messaging/send", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ applicationId, content }),
    });
     return res.ok ? { ok: true as const } : { ok: false as const, message: res.message };
  },

  getConversation:async()=>{
    const res = await apiFetch<{data: any[]} |any[]>("/api/v1/messaging/conversations", {
      headers: authHeaders(),
      
    });
    if(!res.ok){
      return {ok: false as const, message: res.message}
    }
    const rawList = Array.isArray(res.data) ? res.data : res.data.data ?? [];
    console.log("Raw conversation from backend:", rawList[0]);
    return { ok: true as const, conversations: rawList.map(normalizeConversation) };
  }, 

  getMessages: async (conversationId: string) => {
    const result = await apiFetch<{ data: any[] } | any[]>(
      `/api/v1/messaging/conversations/${conversationId}/messages`,
      { headers: authHeaders() }
    );
    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }
    const rawList = Array.isArray(result.data) ? result.data : result.data.data ?? [];
    return { ok: true as const, messages: rawList.map(normalizeMessage) };
  },

  deleteConversation: async (conversationId: string) => {
    const result = await apiFetch<{ message?: string }>(`/api/v1/messaging/conversations/${conversationId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return result.ok ? { ok: true as const } : { ok: false as const, message: result.message };
  },
}


// export const messagesApi = {
//   getAll(email: string): Conversation[] {
//     const existing = readAll(email);
//     if (existing.length > 0) return existing;

//     // first-time user: seed mock data once, persist it, then return it
//     const seeded = seedConversations();
//     writeAll(email, seeded);
//     return seeded;
//   },

//   getConversation(email: string, conversationId: string): Conversation | undefined {
//     return this.getAll(email).find((c) => c.id === conversationId);
//   },

//   // Finds an existing conversation with this company/job, or creates a new
//   // one — used by the "Message employer" button on the job detail page.
//   getOrCreateForJob(
//     email: string,
//     job: { id: string; company: string; title: string; initial: string }
//   ): Conversation {
//     const conversations = readAll(email);
//     const existing = conversations.find((c) => c.jobId === job.id);
//     if (existing) return existing;

//     const newConversation: Conversation = {
//       id: crypto.randomUUID(),
//       company: job.company,
//       role: job.title,
//       initial: job.initial,
//       jobId: job.id,
//       messages: [],
//     };

//     writeAll(email, [newConversation, ...conversations]);
//     return newConversation;
//   },

//   sendMessage(email: string, conversationId: string, text: string) {
//     const conversations = readAll(email);
//     const updated = conversations.map((c) => {
//       if (c.id !== conversationId) return c;
//       const message: Message = {
//         id: crypto.randomUUID(),
//         sender: "me",
//         text,
//         sentAt: new Date().toISOString(),
//       };
//       return { ...c, messages: [...c.messages, message] };
//     });
//     writeAll(email, updated);
//   },

//   subscribe(listener: Listener) {
//     listeners.add(listener);
//     return () => {
//       listeners.delete(listener);
//     };
//   },
// };