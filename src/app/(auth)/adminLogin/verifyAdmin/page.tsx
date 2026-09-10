"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { adminAuthApi } from "@/lib/api/adminAuth";
import { session } from "@/lib/auth/session";

function AdminVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid or missing login link.");
      return;
    }

    async function verify() {
      const result = await adminAuthApi.verifyLogin(token!);

      console.log("ADMIN VERIFY LOGIN RESULT:", result);

      if (!result.ok) {
        setStatus("error");
        setErrorMessage(result.message ?? "This link is invalid or has expired.");
        return;
      }

      const { access_token, user } = result.data;

      if (!access_token) {
        setStatus("error");
        setErrorMessage("Authentication failed: No access token received.");
        return;
      }

      // 1. Store token in localStorage for httpClient/apiFetch requests
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_token", access_token);
      }

      // 2. Set the session context if your session helper supports it
      if (typeof session?.set === "function") {
        session.set({
          token: access_token,
          user: user,
        });
      }

      setStatus("success");

      // 3. Immediately redirect to the Admin Dashboard
      router.push("/adminLogin/admin");
    }

    verify();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE7F8]">
              <ShieldCheck size={20} className="text-[#8A38F5]" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">Verifying your login…</h1>
            <p className="mt-2 text-sm text-gray-500">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <ShieldCheck size={20} className="text-green-600" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">Verified! Redirecting…</h1>
            <p className="mt-2 text-sm text-gray-500">Taking you to your dashboard.</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-600">Verification failed</h1>
            <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
            <button
              type="button"
              onClick={() => router.push("/adminLogin")}
              className="mt-4 rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#6C3CFF]"
            >
              Back to admin login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      }
    >
      <AdminVerifyContent />
    </Suspense>
  );
}