export type EmployerNotificationType = "application" | "interview" | "message" | "subscription";

export interface EmployerNotification {
  id: string;
  type: EmployerNotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

// Backend DB Response Type
interface BackendNotification {
  id: string;
  userId: string;
  type: "APPLICATION" | "INTERVIEW" | "MESSAGE" | "SUBSCRIPTION" | string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ivp-backend.onrender.com";

// Helper function to handle authenticated requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Retrieve token from your preferred storage (e.g., localStorage, cookie, or session)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(`${API_BASE_URL}/api/v1/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "An error occurred while fetching data.");
  }

  return response.json();
}

// Normalizer function to map backend data model to UI interface
function transformNotification(item: BackendNotification): EmployerNotification {
  return {
    id: item.id,
    type: item.type.toLowerCase() as EmployerNotificationType,
    title: item.title,
    description: item.description,
    createdAt: item.createdAt,
    read: item.isRead,
  };
}

export const employerNotificationsApi = {
  // 1. Get all notifications
  async getAll(): Promise<EmployerNotification[]> {
    const data: BackendNotification[] = await fetchWithAuth("/notifications", {
      method: "GET",
    });
    return data.map(transformNotification);
  },

  // 2. Mark a single notification as read
  async markAsRead(id: string): Promise<void> {
    await fetchWithAuth(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  // 3. Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await fetchWithAuth("/notifications/read-all", {
      method: "PATCH",
    });
  },

  // 4. Remove a notification
  async remove(id: string): Promise<void> {
    await fetchWithAuth(`/notifications/${id}`, {
      method: "DELETE",
    });
  },
};