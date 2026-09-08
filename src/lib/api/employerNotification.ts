export type EmployerNotificationType = "application" | "interview" | "message" | "subscription";

export interface EmployerNotification {
  id: string;
  type: EmployerNotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

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

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Reads access_token (snake_case) from LocalStorage
  const token = typeof window !== "undefined" 
    ? (localStorage.getItem("access_token") || localStorage.getItem("accessToken")) 
    : null;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/${cleanEndpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Network connection error:", error);
    throw new Error("Unable to reach the backend server. Please check network/backend status.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || response.statusText || "An error occurred";
    throw new Error(`[HTTP ${response.status}] ${cleanEndpoint}: ${errorMessage}`);
  }

  return response.json();
}

function transformNotification(item: BackendNotification): EmployerNotification {
  return {
    id: item.id,
    type: (item.type?.toLowerCase() as EmployerNotificationType) || "application",
    title: item.title,
    description: item.description,
    createdAt: item.createdAt,
    read: item.isRead,
  };
}

export const employerNotificationsApi = {
  async getAll(): Promise<EmployerNotification[]> {
    try {
      const data: BackendNotification[] = await fetchWithAuth("notifications", {
        method: "GET",
      });
      
      if (!Array.isArray(data)) {
        console.warn("Expected array for notifications, received:", data);
        return [];
      }
      
      return data.map(transformNotification);
    } catch (error) {
      console.error("Error fetching notifications list:", error);
      return []; // Return empty array to prevent UI crashes
    }
  },

  async markAsRead(id: string): Promise<void> {
    await fetchWithAuth(`notifications/${id}/read`, { method: "PATCH" });
  },

  async markAllAsRead(): Promise<void> {
    await fetchWithAuth("notifications/read-all", { method: "PATCH" });
  },

  async remove(id: string): Promise<void> {
    await fetchWithAuth(`notifications/${id}`, { method: "DELETE" });
  },
};