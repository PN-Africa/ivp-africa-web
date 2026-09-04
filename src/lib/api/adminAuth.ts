import { apiFetch } from "./httpClient";

export const adminAuthApi = {
  requestLogin: async (email: string) => {
    const result = await apiFetch<{ message: string }>("/api/v1/admin/auth/request-login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, message: result.data.message };
  },

  verifyLogin: async (token: string) => {
    const result = await apiFetch<any>("/api/v1/admin/auth/verify-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    console.log("ADMIN VERIFY LOGIN RAW:", result);

    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }

    return { ok: true as const, data: result.data };
  },
};