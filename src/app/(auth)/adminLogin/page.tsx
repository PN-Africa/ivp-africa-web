"use client";
import { realAuthApi } from "@/lib/api/client";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { session } from "@/lib/auth/session";
import { profileApi } from "@/lib/api/profile";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "", rememberMe: true });
  const [error, setError] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  function validate(): FormErrors {
    const errors: FormErrors = {};
    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_RULE.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      errors.password = "Password is required.";
    }
    return errors;
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const errors = validate();
    setError(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const result = await realAuthApi.login(formData.email.trim(), formData.password);
    setLoading(false);

    if (!result.ok) {
      setError({ submit: result.message });
      return;
    }

    if (result.user.role !== "admin") {
      setError({ submit: "This account does not have admin access." });
      return;
    }

    localStorage.setItem("access_token", result.accessToken);
    const existingProfile = profileApi.get(result.user.email);

    session.set({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      redirectPath: result.redirectPath,
      avatarUrl: existingProfile?.personalInfo?.avatarUrl,
      accessToken: result.accessToken,
    });

    router.push(result.redirectPath);
  }

  async function handleForgotSubmit(e: FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError("Enter your admin email address.");
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotMessage(null);

    const result = await realAuthApi.requestPasswordReset(forgotEmail.trim());

    setForgotLoading(false);

    if (!result.ok) {
      setForgotError(result.message ?? "Failed to send reset link.");
      return;
    }

    setForgotMessage(result.message ?? "A password reset link has been sent to your email.");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-[#4C20DF] to-[#6C3CFF] p-10 text-white lg:flex">  <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">IVP AFRICA</p>
            <p className="text-[10px] tracking-widest text-white/70">ADMIN PORTAL</p>
          </div>
        </div>

        <h2 className="text-4xl font-bold leading-loose ">
          IVP&apos;S Secure Platform Management
        </h2>

        <div className="text-[10px] text-white/60">
          <p>© 2026 IVP Africa Technology. All rights reserved.</p>
          <p className="mt-0.5 tracking-wide">SECURE MANAGEMENT PROTOCOL V2.4 // AUDIT ACTIVATED</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {showForgot ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
              <p className="mt-1 text-sm text-gray-500">
                Enter your admin email and we&apos;ll send you a reset link.
              </p>

              {forgotError && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
                  {forgotError}
                </div>
              )}
              {forgotMessage && (
                <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-xs text-green-700">
                  {forgotMessage}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Admin Email</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="username@ivpafrica.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm text-gray-900 outline-none transition-colors focus:border-[#8A38F5] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="rounded-xl bg-[#8A38F5] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {forgotLoading ? "Sending…" : "Send reset link"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotError(null);
                    setForgotMessage(null);
                  }}
                  className="text-sm font-medium text-[#8A38F5] hover:underline"
                >
                  Back to sign in
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin</h1>
              <p className="mt-1 text-sm text-gray-500">
                Sign in to access your secure administrative dashboard.
              </p>

              {error.submit && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
                  {error.submit}
                </div>
              )}

              <form onSubmit={handleLogin} autoComplete="off" className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Admin Email</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      autoComplete="email"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="username@ivpafrica.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm text-gray-900 outline-none transition-colors focus:border-[#8A38F5] focus:bg-white"
                    />
                  </div>
                  {error.email && <p className="mt-1.5 text-xs text-red-500">{error.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-900">Security Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(formData.email);
                        setShowForgot(true);
                      }}
                      className="mb-1.5 text-xs font-medium text-[#8A38F5] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      autoComplete="current-password"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-11 text-sm text-gray-900 outline-none transition-colors focus:border-[#8A38F5] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {error.password && <p className="mt-1.5 text-xs text-red-500">{error.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-[#8A38F5] focus:ring-[#8A38F5]/30"
                    />
                    Remember this device
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#8A38F5] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign In to Console"}
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