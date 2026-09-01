import { apiFetch } from "./httpClient";
import { session } from "@/lib/auth/session";

function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface AboutUsContent {
  content: string;
  mission?: string;
  [key: string]: any;
}

interface SiteContentWrapper<T> {
  id: string;
  key: string;
  value: T;
  updatedAt: string;
}

export interface ContactInfoContent {
  email: string;
  phone: string;
  address: string;
  supportHours?: string;
  [key: string]: any;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  isPublished: boolean;
  createdAt?: string;
}

export const adminContentApi = {
  // FAQs
  getFaqs: async () => {
    const result = await apiFetch<FaqItem[]>("/api/v1/admin/content/faqs", { headers: authHeaders() });
    console.log("FAQS RAW:", result);
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, faqs: result.data };
  },

  createFaq: async (question: string, answer: string) => {
    const result = await apiFetch<FaqItem>("/api/v1/admin/content/faqs", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ question, answer }),
    });
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, faq: result.data };
  },

  updateFaq: async (id: string, question: string, answer: string) => {
    const result = await apiFetch<FaqItem>(`/api/v1/admin/content/faqs/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ question, answer }),
    });
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, faq: result.data };
  },

  deleteFaq: async (id: string) => {
    const result = await apiFetch<{ message: string }>(`/api/v1/admin/content/faqs/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return result.ok ? { ok: true as const } : { ok: false as const, message: result.message };
  },

  // About Us
  getAboutUs: async () => {
    const result = await apiFetch<SiteContentWrapper<AboutUsContent> | null>(
      "/api/v1/admin/content/about-us",
      { headers: authHeaders() }
    );
    console.log("ABOUT US RAW:", result);
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, aboutUs: result.data?.value ?? null };
  },

  updateAboutUs: async (data: Partial<AboutUsContent>) => {
    const result = await apiFetch<SiteContentWrapper<AboutUsContent>>(
      "/api/v1/admin/content/about-us",
      {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }
    );
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, aboutUs: result.data.value };
  },

  // Contact Info
  getContactInfo: async () => {
    const result = await apiFetch<SiteContentWrapper<ContactInfoContent> | null>(
      "/api/v1/admin/content/contact-info",
      { headers: authHeaders() }
    );
    console.log("CONTACT INFO RAW:", result);
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, contactInfo: result.data?.value ?? null };
  },

  updateContactInfo: async (data: Partial<ContactInfoContent>) => {
    const result = await apiFetch<SiteContentWrapper<ContactInfoContent>>(
      "/api/v1/admin/content/contact-info",
      {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }
    );
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, contactInfo: result.data.value };
  },

  // Announcements
  getAnnouncements: async () => {
    const result = await apiFetch<Announcement[]>("/api/v1/admin/content/announcements", { headers: authHeaders() });
    console.log("ANNOUNCEMENTS RAW:", result);
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, announcements: result.data };
  },

  createAnnouncement: async (title: string, message: string) => {
    const result = await apiFetch<Announcement>("/api/v1/admin/content/announcements", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title, message }),
    });
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, announcement: result.data };
  },

  setAnnouncementStatus: async (id: string, isPublished: boolean) => {
    const result = await apiFetch<Announcement>(`/api/v1/admin/content/announcements/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ isPublished }),
    });
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, announcement: result.data };
  },

  deleteAnnouncement: async (id: string) => {
    const result = await apiFetch<{ message: string }>(`/api/v1/admin/content/announcements/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return result.ok ? { ok: true as const } : { ok: false as const, message: result.message };
  },
};