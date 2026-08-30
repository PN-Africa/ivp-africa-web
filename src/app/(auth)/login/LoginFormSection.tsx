"use client";
import { realAuthApi } from "@/lib/api/client";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api/client";
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

const initialFormData: FormData = {
  email: "",
  password: "",
  rememberMe: false,
};

const inputClass =
  "w-full rounded-xl border border-gray-100 bg-white py-3.5 pr-4 pl-11 text-sm text-black placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#8A38F5]";
const iconClass = "pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#8A38F5]";

export default function LoginFormSection() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendVisible, setResendVisible] = useState(false);
  const [resendSent, setResendSent] = useState(false);

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
  setResendVisible(false);
  setResendSent(false);

  const errors = validate();
  setError(errors);
  if (Object.keys(errors).length > 0) return;

  setLoading(true);
  const result = await realAuthApi.login(formData.email.trim(), formData.password);
  setLoading(false);

  if (!result.ok) {
    setError({ submit: result.message });
    if (result.message?.toLowerCase().includes("verify")) {
      setResendVisible(true);
    }
    return;
  }

  // 👇 ADDED THIS LINE: Save the token so API calls can use it! 👇
  localStorage.setItem("access_token", result.accessToken);

  // (Optional) If profileApi is still using mock data, you can leave this here
  // but eventually you will want to fetch this from the real backend too!
  const existingProfile = profileApi.get(result.user.email);

  session.set({
    id: result.user.id,
    email: result.user.email,
    role: result.user.role,
    redirectPath: result.redirectPath,
    avatarUrl: existingProfile?.personalInfo?.avatarUrl,
    accessToken: result.accessToken, // It's good you have it here too, but localstorage is what fetch needs
  });

  router.push(result.redirectPath);

}
  function handleResend() {
    // TODO: call api.auth.resendVerificationEmail(formData.email) once the endpoint exists.
    setResendSent(true);
  }

  return (
    <div className="bg-[#EDE7F8] sm:h-screen flex w-full flex-col items-center justify-center px-4 py-8 sm:px-8 lg:ml-[45%] lg:min-h-screen lg:py-12 xl:ml-[50%]">
      {/* Floating card */}
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl lg:p-10">
        {/* Heading — centered */}
        <h1 className="text-center text-3xl font-bold text-[#3A2680]">Welcome Back</h1>
        <p className="mt-2 text-center text-sm text-[#6b5a94]">
          Sign in to continue your journey
        </p>

        {/* Submit Error banner */}
        {error.submit && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <p>{error.submit}</p>
            {resendVisible && (
              <div className="mt-2">
                {resendSent ? (
                  <p className="text-xs text-red-500">
                    Verification email resent — check your inbox.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-xs font-medium underline underline-offset-2"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} autoComplete="off" className="mt-8 w-full space-y-4">
          {/* Email */}
          <div>
            <div className="relative">
              <User className={iconClass} />
              <input
                type="email"
                id="email"
                placeholder="Email or Username"
                value={formData.email}
                autoComplete="email"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
              />
            </div>
            {error.email && <p className="mt-1.5 text-xs text-red-500">{error.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className={iconClass} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                value={formData.password}
                autoComplete="current-password"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error.password && <p className="mt-1.5 text-xs text-red-500">{error.password}</p>}
          </div>

          {/* Remember me / Forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-500">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-[#8A38F5] focus:ring-[#8A38F5]/30"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-[#8A38F5] hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5A31C3] py-3.5 text-base font-semibold text-white
                       transition-all duration-150 hover:bg-[#4a2699] active:scale-[0.98]
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Logging in…
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signUp" className="font-semibold text-[#8A38F5] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}