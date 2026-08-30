"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminUsersApi, type AdminUserView } from "@/lib/api/adminUsers";
import { CandidateDetailView } from "./CandidateDetailView";
import { EmployerDetailView } from "./EmployerDetailView";

export default function AdminUserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [user, setUser] = useState<AdminUserView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load(userId: string) {
      setLoading(true);
      const found = await adminUsersApi.getById(userId);
      setLoading(false);

      if (!found.ok || !found.user) {
        setNotFound(true);
        return;
      }

      setUser(found.user);
    }

    load(id);
  }, [id]);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading...</p>;
  }

  if (notFound) {
    return (
      <div>
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to User Management
        </button>
        <p className="text-sm text-gray-400">No user found with this ID.</p>
      </div>
    );
  }

  if (!user) return null;

  if (user.role === "employer") return <EmployerDetailView user={user} />;
  return <CandidateDetailView user={user} />; // talent AND admin both get the candidate-style view for now
}