"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { adminAuthApi } from "@/lib/api/adminAuth";
import { session } from "@/lib/auth/session";
import { profileApi } from "@/lib/api/profile";

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

      // We don't yet know the real response shape — logging above will tell us.
      // Once confirmed, this is where we'll call session.set(...) with the
      // real accessToken/user fields and router.push to the dashboard.
      setStatus("success");
    }

    verify();
  }, [token]);

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
            <h1 className="mt-4 text-xl font-bold text-gray-900">Login verified</h1>
            <p className="mt-2 text-sm text-gray-500">
              Check the browser console — we still need to confirm the response shape before
              completing sign-in.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-600">Verification failed</h1>
            <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
            <button
              type="button"
              onClick={() => router.push("/admin-login")}
              className="mt-4 text-sm font-medium text-[#8A38F5] hover:underline"
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