"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { realAuthApi } from "@/lib/api/client";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams?.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid or missing verification link.");
      return;
    }

    async function verify() {
      const result = await realAuthApi.verifyEmail(token!);
      if (result.ok) {
        setStatus("success");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.message || "Verification failed or token expired.");
      }
    }

    verify();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {status === "loading" && <p>Verifying your email, please wait...</p>}

      {status === "success" && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
          <p className="mt-2">Your email has been successfully verified. Redirecting to login...</p>
          <Link href="/login" className="mt-4 inline-block text-blue-600 underline">
            Click here if you are not redirected
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
          <Link href="/login" className="mt-4 inline-block text-blue-600 underline">
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <p>Loading…</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}