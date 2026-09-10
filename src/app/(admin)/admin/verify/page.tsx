"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminAuthApi } from "@/lib/api/adminAuth";

export default function AdminVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("No token provided in verification link.");
      return;
    }

    async function handleAutoVerify() {
      try {
        const result = await adminAuthApi.verifyLogin(token as string);

        if (result.ok && result.data?.access_token) {
          // 1. Store token in localStorage or cookie for future API requests
          localStorage.setItem("admin_token", result.data.access_token);

          // 2. Redirect straight to the admin dashboard
          router.replace("/adminLogin/admin");
        } else {
          setError(result.message || "Invalid or expired link.");
        }
      } catch (err) {
        setError("An unexpected error occurred during verification: " + (err as Error).message);
      }
    }

    handleAutoVerify();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="rounded-2xl bg-white p-6 text-center shadow-md sm:p-8">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            onClick={() => router.push("/adminLogin")}
            className="mt-4 rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#6C3CFF]"
          >
            Return to Admin Login
          </button>
        </div>
      </div>
    );
  }

  // Brief loading indicator while verifying and redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8A38F5] border-t-transparent" />
        <p className="text-sm font-medium text-gray-700">Verifying session...</p>
      </div>
    </div>
  );
}