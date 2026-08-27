import { apiFetch } from "@/lib/api/httpClient";
import { session } from "@/lib/auth/session";

// ============================================================================
// 1. REAL API (Used by your new live employer/messages/page.tsx)
// ============================================================================

export interface RealConversation {
  id: string;
  applicationId: string;
  participantName: string;
  participantAvatar: string | null;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface RealMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

export const messageApi = {
  // A: Send a Message
  sendMessage: async (content: string, params: { conversationId?: string; applicationId?: string }) => {
    const res = await apiFetch<RealMessage>("/api/v1/messaging/send", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ content, ...params }),
    });
    return res; 
  },

  // B: Get Conversations (Inbox list)
  getConversations: async (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await apiFetch<RealConversation[]>(`/api/v1/messaging/conversations${query}`, {
      method: "GET",
      headers: authHeaders(),
    });
    return res; 
  },

  // C: Get Conversation Messages (History)
  getMessages: async (conversationId: string) => {
    const res = await apiFetch<RealMessage[]>(`/api/v1/messaging/conversations/${conversationId}/messages`, {
      method: "GET",
      headers: authHeaders(),
    });
    return res;
  },

  // D: Delete / Archive Conversation
  deleteConversation: async (conversationId: string) => {
    const res = await apiFetch<{ message: string }>(`/api/v1/messaging/conversations/${conversationId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return res;
  },
};