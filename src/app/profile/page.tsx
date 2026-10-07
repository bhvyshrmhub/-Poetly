"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppShell from "@/components/layout/AppShell";

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        router.replace(`/profile/${profile.username}`);
      } else if (user && !profile) {
        router.replace("/profile/setup");
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <AppShell maxWidth="feed">
        <div className="py-8">
          <div className="w-20 h-20 skeleton rounded-[var(--radius-md)] mb-5" />
          <div className="w-48 h-6 skeleton rounded mb-3" />
          <div className="w-32 h-4 skeleton rounded" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="feed">
      <div className="py-16 text-center">
        <p className="font-poem text-xl text-text-tertiary italic">Redirecting...</p>
      </div>
    </AppShell>
  );
}
