"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, Bell, Shield, Users } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { session as sessionStore } from "@/lib/auth/session";
import { api, realAuthApi } from "@/lib/api/client";
import { companyProfileApi, EmployerProfile, UpdateProfileInput } from "@/lib/api/companyProfile"; 

type TabValue = "profile" | "account" | "notifications" | "security" | "team";

const tabs: { value: TabValue; label: string; icon: typeof User }[] = [
  { value: "profile", label: "Profile", icon: User },
  { value: "account", label: "Account", icon: Building2 },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "security", label: "Security", icon: Shield },
  { value: "team", label: "Team", icon: Users },
];

const inputClass =
  "w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#8A38F5] focus:bg-white sm:py-3";
const labelClass = "mb-1.5 block text-xs font-semibold text-gray-900 sm:text-sm";

function getInitials(name: string) {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("");
}

export default function EmployerSettingsPage() {
  const { session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabValue>("profile");
  
  // Using the new EmployerProfile from your companyProfileApi
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  
  // Track file and preview changes locally before saving
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [accountSaveStatus, setAccountSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "sending" | "success">("idle");

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.email) return;
      const response = await companyProfileApi.getProfile();
      
      if (response.ok && response.data) {
        setProfile(response.data);
        setLogoPreview(response.data.logoUrl);
      } else {
        // Fallback for new users without a profile yet
        setProfile({
          id: "", userId: "", companyName: "", contactPerson: session.displayName || "", phoneNumber: "", 
          industry: "", companySize: "", rcNumber: "", description: "", logoUrl: "", isProfileComplete: false, 
          website: "", location: "", officeAddress: "", verificationStatus: "PENDING", rejectionReason: null, 
          createdAt: "", updatedAt: ""
        } as EmployerProfile);
      }
      setIsLoading(false);
    }

    fetchProfile();
  }, [session?.email, session?.displayName]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 1_000_000) {
      alert("Please choose an image under 1MB.");
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setLogoFile(null);
    setLogoPreview(null);
  }

  // Save functionality mapping to Profile tab (Personal/Contact focus)
  async function handleSaveProfile() {
    if (!profile) return;
    setSaveStatus("saving");
    
    const updatePayload: UpdateProfileInput = {
      contactPerson: profile.contactPerson || undefined,
    };
    
    if (logoFile) {
      updatePayload.logo = logoFile;
    }

    const result = await companyProfileApi.updateProfile(updatePayload);
    
    if (result.ok && result.data) {
      setProfile(result.data);
      
      // FIX: Ensure session exists before saving and cast 'as any' to satisfy strict store typing
      if (session) {
        sessionStore.set({
          ...session,
          displayName: result.data.contactPerson || session.displayName,
          avatarUrl: result.data.logoUrl || session.avatarUrl,
        } as any);
      }
      
      setSaveStatus("saved");
    } else {
      setSaveStatus("idle");
      alert(result.message || "Failed to update profile.");
    }
    
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  // Save functionality mapping to Account tab (Company/General Info focus)
  async function handleSaveAccount() {
    if (!profile) return;
    setAccountSaveStatus("saving");
    
    const updatePayload: UpdateProfileInput = {
      companyName: profile.companyName,
      industry: profile.industry || undefined,
      companySize: profile.companySize || undefined,
      website: profile.website || undefined,
      location: profile.location || undefined,
      officeAddress: profile.officeAddress || undefined,
      rcNumber: profile.rcNumber || undefined,
    };

    const result = await companyProfileApi.updateProfile(updatePayload);
    
    if (result.ok && result.data) {
      setProfile(result.data);
      setAccountSaveStatus("saved");
    } else {
      setAccountSaveStatus("idle");
      alert(result.message || "Failed to update account.");
    }
    
    setTimeout(() => setAccountSaveStatus("idle"), 2000);
  }

  // Updated Password Request Flow 
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
    await api.auth.deleteAccount(session.email);
    sessionStore.clear();
    router.push("/login");
  }

  if (isLoading || !profile) return (
    <div className="flex items-center justify-center py-20 text-sm text-gray-500">
      Loading settings...
    </div>
  );

  return (
    <>
      <div>
        <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Account Settings</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Control security thresholds, user directories, and preference panels.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        {/* Sub-nav */}
        <div className="h-full rounded-2xl border border-gray-100 bg-white p-2">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full ${
                    activeTab === tab.value
                      ? "bg-[#EDE7F8] text-[#8A38F5]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
                <h2 className="text-sm font-bold text-gray-900 sm:text-base">Personal Information</h2>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE7F8] text-lg font-semibold text-[#8A38F5]">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      getInitials(profile.contactPerson || session?.displayName || "Employer")
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl bg-[#8A38F5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7226e0] sm:text-sm"
                    >
                      Upload New
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Contact Person</label>
                    <input
                      type="text"
                      value={profile.contactPerson || ""}
                      onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                      placeholder="Full Name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" value={session?.email || ""} disabled className={`${inputClass} text-gray-400`} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saveStatus === "saving"}
                  className="mt-5 rounded-xl bg-[#8A38F5] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0] disabled:opacity-70"
                >
                  {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Save Changes"}
                </button>
              </div>

              {/* Notification Preferences -> Toggles Removed & Replaced with Coming Soon */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
                <h2 className="text-sm font-bold text-gray-900 sm:text-base">Notification Preferences</h2>
                <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Advanced notification preferences are coming soon.
                  </p>
                </div>
              </div>

              {/* Danger Zone remains in Profile */}
              <div className="rounded-2xl border border-red-100 bg-white p-4 sm:p-6">
                <h2 className="text-sm font-bold text-red-600 sm:text-base">Danger Zone</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Permanently deactivate or delete {profile.contactPerson ? `${profile.contactPerson}'s` : "your"} account.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="mt-4 rounded-xl bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  {confirmingDelete ? "Click again to confirm" : "Deactivate Account"}
                </button>
                {confirmingDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="mt-4 ml-3 rounded-xl px-6 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
                <h2 className="text-sm font-bold text-gray-900 sm:text-base">General Information</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Company Name</label>
                    <input
                      type="text"
                      value={profile.companyName || ""}
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Industry</label>
                    <input
                      type="text"
                      value={profile.industry || ""}
                      onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                      placeholder="e.g. Technology, Finance"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Company Size</label>
                    <input
                      type="text"
                      value={profile.companySize || ""}
                      onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                      placeholder="e.g. 1-10, 50-200"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Website URL</label>
                    <input
                      type="url"
                      value={profile.website || ""}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      placeholder="https://example.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>RC Number</label>
                    <input
                      type="text"
                      value={profile.rcNumber || ""}
                      onChange={(e) => setProfile({ ...profile, rcNumber: e.target.value })}
                      placeholder="Registration Number"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>HQ Location (City, Country)</label>
                    <input
                      type="text"
                      value={profile.location || ""}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Office Address</label>
                    <input
                      type="text"
                      value={profile.officeAddress || ""}
                      onChange={(e) => setProfile({ ...profile, officeAddress: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAccount}
                  disabled={accountSaveStatus === "saving"}
                  className="mt-5 rounded-xl bg-[#8A38F5] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7226e0] disabled:opacity-70"
                >
                  {accountSaveStatus === "saving" ? "Saving..." : accountSaveStatus === "saved" ? "Saved ✓" : "Save General Info"}
                </button>

                {/* 2FA -> Toggles Removed & Replaced with Coming Soon */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h2 className="text-sm font-bold text-gray-900 sm:text-base">Two-Factor Authentication (2FA)</h2>
                  <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                    <p className="text-sm text-gray-500">
                      Two-Factor Authentication configuration is coming soon.
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Reset (Using Auth client flow) */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
                <h2 className="text-sm font-bold text-gray-900 sm:text-base">Password Reset</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Securely receive a password reset link at your registered email address.
                </p>
                {passwordError && <p className="mt-2 text-sm text-red-500">{passwordError}</p>}
                
                <button
                  type="button"
                  onClick={handleRequestPasswordReset}
                  disabled={passwordStatus === "sending"}
                  className="mt-4 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                >
                  {passwordStatus === "sending"
                    ? "Sending Request..."
                    : passwordStatus === "success"
                      ? "Reset Link Sent ✓"
                      : "Request Password Reset"}
                </button>
              </div>
            </>
          )}

          {/* COMING SOON TABS */}
          {(activeTab === "notifications" || activeTab === "security" || activeTab === "team") && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
              <p className="text-sm text-gray-400">
                {tabs.find((t) => t.value === activeTab)?.label} settings coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}