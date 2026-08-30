"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Mail, Lock, Building2, Eye, EyeOff, Briefcase, Hash, Users } from "lucide-react";
import { api, realAuthApi } from "@/lib/api/client";
import { RoleToggle } from "./RoleToggle";
import { session } from "@/lib/auth/session";
import { profileApi } from "@/lib/api/profile";

interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface EmployerFormData {
  companyName: string;
  contactPerson: string;
  businessEmail: string;
  password: string;
  confirmPassword: string;
  industry: string;
  companySize: string;
  rcNumber: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  submit?: string;
}

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const initialCandidateData: CandidateFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

const initialEmployerData: EmployerFormData = {
  companyName: "",
  contactPerson: "",
  businessEmail: "",
  password: "",
  confirmPassword: "",
  industry: "",
  companySize: "",
  rcNumber: "",
  agreeToTerms: false,
};

const inputClass =
  "w-full rounded-xl border border-gray-100 bg-white py-2.5 sm:py-3 md:py-3.5 pr-4 pl-11 text-sm text-black placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#8A38F5]";
const iconClass = "pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#8A38F5]";

type Step = "form" | "verify";

export default function SignUpFormSection() {
  const router = useRouter();
  const [role, setRole] = useState<"talent" | "employer">("talent");
  const [step, setStep] = useState<Step>("form");

  const [candidateData, setCandidateData] = useState<CandidateFormData>(initialCandidateData);
  const [employerData, setEmployerData] = useState<EmployerFormData>(initialEmployerData);

  const [error, setError] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingRedirect, setPendingRedirect] = useState("/talent");

  function validateCandidate(): FormErrors {
    const errors: FormErrors = {};
    if (candidateData.firstName.trim().length < 2) errors.firstName = "Enter at least 2 characters.";
    if (candidateData.lastName.trim().length < 2) errors.lastName = "Enter at least 2 characters.";
    if (!candidateData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_RULE.test(candidateData.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!PASSWORD_RULE.test(candidateData.password)) {
      errors.password = "Min 8 characters, with upper, lower, number, and special character.";
    }
    if (candidateData.confirmPassword !== candidateData.password) {
      errors.confirmPassword = "Passwords don't match.";
    }
    if (!candidateData.agreeToTerms) errors.agreeToTerms = "You must accept the Terms and Privacy Policy.";
    return errors;
  }

  function validateEmployer(): FormErrors {
    const errors: FormErrors = {};
    if (employerData.companyName.trim().length < 2) errors.companyName = "Enter your company name.";
    if (employerData.contactPerson.trim().length < 2) errors.contactPerson = "Enter contact person name.";
    if (!employerData.businessEmail.trim()) {
      errors.email = "Business email is required.";
    } else if (!EMAIL_RULE.test(employerData.businessEmail)) {
      errors.email = "Enter a valid email address.";
    }
    if (!PASSWORD_RULE.test(employerData.password)) {
      errors.password = "Min 8 characters, with upper, lower, number, and special character.";
    }
    if (employerData.confirmPassword !== employerData.password) {
      errors.confirmPassword = "Passwords don't match.";
    }
    if (!employerData.agreeToTerms) errors.agreeToTerms = "You must accept the Terms and Privacy Policy.";
    return errors;
  }

  async function handleCandidateSignUp(e: FormEvent) {
    e.preventDefault();
    const errors = validateCandidate();
    setError(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const result = await realAuthApi.registerCandidate({
      firstName: candidateData.firstName.trim(),
      lastName: candidateData.lastName.trim(),
      email: candidateData.email.trim(),
      password: candidateData.password,
      confirmPassword: candidateData.confirmPassword,
    });
    console.log("Candidate registration result:", result);
    setLoading(false);

    if (!result.ok) {
      setError({ submit: result.message });
      return;
    }

    setPendingEmail(candidateData.email.trim());
    setPendingRedirect("/talent");
    setStep("verify");
  }

  async function handleEmployerSignUp(e: FormEvent) {
    e.preventDefault();
    const errors = validateEmployer();
    setError(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const result = await realAuthApi.registerEmployer({
      companyName: employerData.companyName.trim(),
      contactPerson: employerData.contactPerson.trim(),
      email: employerData.businessEmail.trim(),
      password: employerData.password,
      confirmPassword: employerData.confirmPassword,
      industry: employerData.industry.trim() || undefined,
      companySize: employerData.companySize.trim() || undefined,
      rcNumber: employerData.rcNumber.trim() || undefined,
    });
    setLoading(false);

    if (!result.ok) {
      setError({ submit: result.message });
      return;
    }

    setPendingEmail(employerData.businessEmail.trim());
    setPendingRedirect("/employer");
    setStep("verify");
  }

  // async function handleVerify(e: FormEvent) {
  //   e.preventDefault();
  //   setOtpError(null);

  //   if (otp.trim().length !== 6) {
  //     setOtpError("Enter the full 6-digit code.");
  //     return;
  //   }

  //   setVerifying(true);
  //   const result = await realAuthApi.verifyEmail(pendingEmail);
  //   setVerifying(false);

  //   if (!result.ok) {
  //     setOtpError("Incorrect code. Please try again.");
  //     return;
  //   }

  //   const existingProfile = profileApi.get(pendingEmail);
  //   const displayName =
  //     role === "talent"
  //       ? `${candidateData.firstName.trim()} ${candidateData.lastName.trim()}`
  //       : employerData.companyName.trim();

  //   session.set({
  //     id: 
  //     email: pendingEmail,
  //     role,
  //     displayName,
  //     redirectPath: result.redirectPath || pendingRedirect,
  //     avatarUrl: existingProfile?.personalInfo?.avatarUrl,
  //   });

  //   router.push(result.redirectPath || pendingRedirect);
  // }

  // async function handleResend() {
  //   setResending(true);
  //   setResendMessage(null);
  //   await api.auth.resendOtp(pendingEmail);
  //   setResending(false);
  //   setResendMessage("A new code has been sent.");
  // }

  // ── Step 2: verify email (shared by both roles) ──
  if (step === "verify") {
    return (
      <div className="flex w-full flex-col items-center justify-center bg-[#EDE7F8] px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:ml-[45%] lg:min-h-screen lg:py-12 xl:ml-1/2">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl sm:max-w-md sm:rounded-3xl sm:p-8 md:p-9 lg:p-10">
          <h1 className="text-lg font-bold text-[#3A2680] sm:text-xl md:text-2xl">Verify your email</h1>
          <p className="mt-2 text-xs text-[#6b5a94] sm:text-sm">
            We sent a verification code to{" "}
            <span className="font-medium text-[#3A2680] break-all">{pendingEmail}</span>
          </p>

          <p className="mt-3 rounded-lg bg-[#EDE7F8] px-3 py-2 text-xs text-[#6b5a94]">
            Demo mode: use code <span className="font-mono font-semibold">123456</span>
          </p>
{/* 
          <form onSubmit={handleVerify} className="mt-5 sm:mt-6">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-gray-200 py-2.5 text-center text-base font-semibold tracking-[0.3em] text-black focus:outline-none focus:ring-2 focus:ring-[#8A38F5] sm:py-3.5 sm:text-lg sm:tracking-[0.5em]"
            />
            {otpError && <p className="mt-2 text-xs text-red-500">{otpError}</p>}

            <button
              type="submit"
              disabled={verifying}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5A31C3] py-2.5 text-sm font-semibold text-white
                         transition-all duration-150 hover:bg-[#4a2699] active:scale-[0.98]
                         disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6 sm:py-3.5 sm:text-base"
            >
              {verifying ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying…
                </>
              ) : (
                "Verify email"
              )}
            </button>
          </form> */}
{/* 
          <div className="mt-4 text-xs text-gray-500 sm:mt-5 sm:text-sm">
            {resendMessage ? (
              <p className="text-[#3A2680]">{resendMessage}</p>
            ) : (
              <>
                Didn&apos;t get a code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-semibold text-[#8A38F5] hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending…" : "Resend code"}
                </button>
              </>
            )}
          </div> */}
        </div>
      </div>
    );
  }

  // ── Step 1: sign-up form ──
  return (
    <div className="flex w-full flex-col h-screen items-center justify-center bg-[#EDE7F8] px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:ml-[45%] md:min-h-screen lg:py-12 xl:ml-1/2">
      
      {/* Mobile-only heading, hidden once the desktop branding panel takes over */}
      <div className="flex flex-col items-center gap-2 bg-[#EDE7F8] pb-2 mb-3 lg:hidden">
        <Image
          src="/img_ivp/Ivp_logo.png"
          alt="IVP Africa"
          width={60}
          height={60}
          className="h-14 w-auto object-contain"
          priority
        />
        <p className="text-lg font-semibold text-[#3A2680]">IVP Africa</p>
        <p className="text-xs text-[#6b5a94]">Connecting talent to opportunity</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-3xl sm:p-8 md:p-9 lg:p-10">
        <h1 className="text-center text-xl font-bold text-black sm:text-2xl md:text-3xl">Create Account</h1>
        <p className="mt-2 text-center text-xs text-black sm:text-sm">
          Join IVP Africa and start applying to jobs and internships
        </p>

        <div className="mt-4 sm:mt-5">
          <RoleToggle value={role} onChange={setRole} />
        </div>

        {error.submit && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 sm:text-sm">
            {error.submit}
          </div>
        )}

        {role === "employer" ? (
          <form
            onSubmit={handleEmployerSignUp}
            autoComplete="off"
            className="mt-5 w-full space-y-3 sm:mt-8 sm:space-y-4"
          >
            <div>
              <div className="relative">
                <Building2 className={iconClass} />
                <input
                  type="text"
                  placeholder="Company name"
                  value={employerData.companyName}
                  onChange={(e) => setEmployerData({ ...employerData, companyName: e.target.value })}
                  className={inputClass}
                />
              </div>
              {error.companyName && <p className="mt-1.5 text-xs text-red-500">{error.companyName}</p>}
            </div>

            <div>
              <div className="relative">
                <User className={iconClass} />
                <input
                  type="text"
                  placeholder="Contact person (Full name)"
                  value={employerData.contactPerson}
                  onChange={(e) => setEmployerData({ ...employerData, contactPerson: e.target.value })}
                  className={inputClass}
                />
              </div>
              {error.contactPerson && <p className="mt-1.5 text-xs text-red-500">{error.contactPerson}</p>}
            </div>

            <div>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  type="email"
                  placeholder="Business email"
                  value={employerData.businessEmail}
                  onChange={(e) => setEmployerData({ ...employerData, businessEmail: e.target.value })}
                  className={inputClass}
                />
              </div>
              {error.email && <p className="mt-1.5 text-xs text-red-500">{error.email}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="relative">
                  <Briefcase className={iconClass} />
                  <input
                    type="text"
                    placeholder="Industry (e.g. Fintech)"
                    value={employerData.industry}
                    onChange={(e) => setEmployerData({ ...employerData, industry: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Users className={iconClass} />
                  <select
                    value={employerData.companySize}
                    onChange={(e) => setEmployerData({ ...employerData, companySize: e.target.value })}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="" disabled>Company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <Hash className={iconClass} />
                <input
                  type="text"
                  placeholder="RC / Registration Number (e.g. RC1234567)"
                  value={employerData.rcNumber}
                  onChange={(e) => setEmployerData({ ...employerData, rcNumber: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={employerData.password}
                  autoComplete="new-password"
                  onChange={(e) => setEmployerData({ ...employerData, password: e.target.value })}
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

            <div>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={employerData.confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => setEmployerData({ ...employerData, confirmPassword: e.target.value })}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{error.confirmPassword}</p>}
            </div>

            <div>
              <label className="flex items-start gap-2 pt-1 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                <input
                  type="checkbox"
                  checked={employerData.agreeToTerms}
                  onChange={(e) => setEmployerData({ ...employerData, agreeToTerms: e.target.checked })}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-[#8A38F5] focus:ring-[#8A38F5]/30"
                />
                I agree to the{" "}
                <Link href="/terms" className="font-medium text-[#8A38F5] hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="font-medium text-[#8A38F5] hover:underline">
                  Privacy Policy
                </Link>
              </label>
              {error.agreeToTerms && <p className="mt-1 text-xs text-red-500">{error.agreeToTerms}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5A31C3] py-2.5 text-sm font-semibold text-white
                         transition-all duration-150 hover:bg-[#4a2699] active:scale-[0.98]
                         disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5 sm:text-base"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleCandidateSignUp}
            autoComplete="off"
            className="mt-5 w-full space-y-3 sm:mt-8 sm:space-y-4"
          >
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4">
              <div>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    type="text"
                    placeholder="First name"
                    value={candidateData.firstName}
                    onChange={(e) => setCandidateData({ ...candidateData, firstName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                {error.firstName && <p className="mt-1.5 text-xs text-red-500">{error.firstName}</p>}
              </div>

              <div>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={candidateData.lastName}
                    onChange={(e) => setCandidateData({ ...candidateData, lastName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                {error.lastName && <p className="mt-1.5 text-xs text-red-500">{error.lastName}</p>}
              </div>
            </div>

            <div>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={candidateData.email}
                  onChange={(e) => setCandidateData({ ...candidateData, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              {error.email && <p className="mt-1.5 text-xs text-red-500">{error.email}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={candidateData.password}
                  autoComplete="new-password"
                  onChange={(e) => setCandidateData({ ...candidateData, password: e.target.value })}
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

            <div>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={candidateData.confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => setCandidateData({ ...candidateData, confirmPassword: e.target.value })}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{error.confirmPassword}</p>}
            </div>

            <div>
              <label className="flex items-start gap-2 pt-1 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                <input
                  type="checkbox"
                  checked={candidateData.agreeToTerms}
                  onChange={(e) => setCandidateData({ ...candidateData, agreeToTerms: e.target.checked })}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-[#8A38F5] focus:ring-[#8A38F5]/30"
                />
                I agree to the{" "}
                <Link href="/terms" className="font-medium text-[#8A38F5] hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="font-medium text-[#8A38F5] hover:underline">
                  Privacy Policy
                </Link>
              </label>
              {error.agreeToTerms && <p className="mt-1 text-xs text-red-500">{error.agreeToTerms}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5A31C3] py-2.5 text-sm font-semibold text-white
                         transition-all duration-150 hover:bg-[#4a2699] active:scale-[0.98]
                         disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5 sm:text-base"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-gray-500 sm:mt-6 sm:text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#8A38F5] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}