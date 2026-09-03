"use client";
import { type FormEvent, useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { adminAuthApi } from "@/lib/api/adminAuth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your admin email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await adminAuthApi.requestLogin(email.trim());

    setLoading(false);

    if (!result.ok) {
      setError(result.message ?? "Failed to send login link.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-[#4C20DF] to-[#6C3CFF] p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">IVP AFRICA</p>
            <p className="text-[10px] tracking-widest text-white/70">ADMIN PORTAL</p>
          </div>
        </div>

        <h2 className="text-4xl font-bold leading-loose">
          IVP&apos;S Secure Platform Management
        </h2>

        <div className="text-[10px] text-white/60">
          <p>© 2026 IVP Africa Technology. All rights reserved.</p>
          <p className="mt-0.5 tracking-wide">SECURE MANAGEMENT PROTOCOL V2.4 // AUDIT ACTIVATED</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE7F8]">
                <Mail size={20} className="text-[#8A38F5]" />
              </div>
              <h1 className="mt-4 text-xl font-bold text-gray-900">Check your email</h1>
              <p className="mt-2 text-sm text-gray-500">
                We&apos;ve sent a secure login link to{" "}
                <span className="font-medium text-gray-900">{email}</span>. Click the link to
                access your admin dashboard.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-6 text-sm font-medium text-[#8A38F5] hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin</h1>
              <p className="mt-1 text-sm text-gray-500">
                Sign in to access your secure administrative dashboard.
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Admin Email</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@ivpafrica.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm text-gray-900 outline-none transition-colors focus:border-[#8A38F5] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#8A38F5] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Sending link…" : "Send Login Link"}
                </button>

                <div className="flex items-start gap-2 rounded-xl bg-[#F5F3FA] px-4 py-3 text-xs text-gray-600">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#8A38F5]" />
                  Authorized personnel access only. Unauthorized entry attempts are strictly
                  monitored, blocked, and reported.
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}