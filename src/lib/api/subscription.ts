import { apiFetch } from "@/lib/api/httpClient";
import { session } from "@/lib/auth/session";

export type ApiResponse<T> = 
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };

// ============================================================================
// REAL API INTERFACES
// ============================================================================

export interface RealPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  benefits: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RealSubscription {
  id: string;
  employerId: string;
  planId: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string; // ISO date
  endDate: string;   // ISO date
  plan: RealPlan;
}

export interface PaymentInitResponse {
  message: string;
  paymentUrl: string;
  summary: {
    planName: string;
    amount: number;
    duration: string;
  };
}

export interface RealPaymentRecord {
  id: string;
  employerId: string;
  planId: string;
  amount: string;
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  channel: string;
  createdAt: string;
  plan: {
    name: string;
    price: number;
    durationMonths: number;
  };
}

// NEW: Interface for the usage response
export interface SubscriptionUsageResponse {
  hasActivePlan: boolean;
  message?: string;
  planName?: string;
  billingCycle?: {
    start: string;
    end: string;
  };
  limits?: {
    jobs: {
      used: number;
      total: number;
      isUnlimited: boolean;
    };
    applications: {
      total: number;
      isUnlimited: boolean;
    };
  };
}

function authHeaders(): HeadersInit {
  const current = session.get();
  return current?.accessToken ? { Authorization: `Bearer ${current.accessToken}` } : {};
}

// ============================================================================
// API CLIENT
// ============================================================================

export const subscriptionApi = {
  // 1. Fetch available plans (Pricing Table)
  getPlans: async () => {
    const res = await apiFetch<RealPlan[]>("/api/v1/subscriptions/plans", {
      method: "GET",
      headers: authHeaders(),
    });
    return res;
  },

  // 2. Get Current Subscription 
  getCurrent: async () => {
    const res = await apiFetch<RealSubscription>("/api/v1/subscriptions/current", {
      method: "GET",
      headers: authHeaders(),
    });
    return res;
  },

  // 3. Initialize Paystack Checkout
  initializePayment: async (planId: string) => {
    const res = await apiFetch<PaymentInitResponse>("/api/v1/payments/initialize", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    return res;
  },

  // 4. Get Payment History for the Invoice Table
  getPaymentHistory: async () => {
    const res = await apiFetch<RealPaymentRecord[]>("/api/v1/payments/history", {
      method: "GET",
      headers: authHeaders(),
    });
    return res;
  },

  // 5. NEW: Get Subscription Usage Details
  getUsage: async () => {
    const res = await apiFetch<SubscriptionUsageResponse>("/api/v1/subscriptions/my-usage", {
      method: "GET",
      headers: authHeaders(),
    });
    return res;
  }
};