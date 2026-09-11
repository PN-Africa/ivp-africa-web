"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { manrope, plusJakartaSans } from "@/app/font";
import { api, realAuthApi } from "@/lib/api/client";
import { useSession } from "@/lib/auth/useSession";
import { session as sessionStore } from "@/lib/auth/session";




export default function SettingsPage() {
  const { session } = useSession();
  const router = useRouter();

  
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "sending" | "success">("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // load saved preferences once we know who's logged in
  useEffect(() => {
    if (!session?.email) return;
  }, [session?.email]);

  async function handleRequestPasswordReset() {
    if (!session?.email) return;
    setPasswordError(null);
    setPasswordStatus("sending");
    
    const result = await realAuthApi.requestPasswordReset(session.email);
    
    if (!result.ok) {
      setPasswordStatus("idle");
      setPasswordError(result.message);
      return;
    }
    
    setPasswordStatus("success");
    setTimeout(() => setPasswordStatus("idle"), 3000);
  }

  async function handleDeleteAccount() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    if (!session?.email) return;

    setDeleting(true);
    await api.auth.deleteAccount(session.email);
    sessionStore.clear();
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <h1 className={`text-2xl font-bold text-black ${manrope.className}`}>Settings</h1>

      {/* Change password */}
      <div className="shadow-[0_1px_2px_rgba(16,15,20,0.04),0_16px_32px_-24px_rgba(16,15,20,0.12)] rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className={`text-lg font-bold text-gray-900 ${manrope.className}`}>
          Change password
        </h2>

        {passwordError && (
          <p className="mt-3 text-sm text-red-500">{passwordError}</p>
        )}

        <button
          type="button"
          onClick={handleRequestPasswordReset}
          disabled={passwordStatus === "sending"}
          className={`mt-5 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 ${manrope.className}`}
        >
          {passwordStatus === "sending"
            ? "Sending Request..."
            : passwordStatus === "success"
              ? "Reset Link Sent ✓"
              : "Request password reset"}
        </button>
      </div>

      {/* Notification preferences */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <h2 className="text-sm font-bold text-gray-900 sm:text-base">Two-Factor Authentication (2FA)</h2>
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">
            Notification preferences is coming soon.
          </p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="shadow-[0_1px_2px_rgba(16,15,20,0.04),0_16px_32px_-24px_rgba(16,15,20,0.12)] rounded-2xl border border-red-100 bg-white p-6">
        <h2 className={`text-lg font-bold text-[#C94F3D] ${manrope.className}`}>
          Danger zone
        </h2>
        <p className={`mt-2 text-sm text-gray-500 ${plusJakartaSans.className}`}>
          Deleting your account is permanent and cannot be undone.
        </p>

        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className={`mt-5 rounded-xl bg-red-50 px-6 py-3 text-sm font-semibold text-[#C94F3D] transition-colors hover:bg-red-100 disabled:opacity-50 ${manrope.className}`}
        >
          {deleting ? "Deleting…" : confirmingDelete ? "Click again to confirm" : "Delete account"}
        </button>

        {confirmingDelete && !deleting && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className={`mt-5 ml-3 rounded-xl px-6 py-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 ${manrope.className}`}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}