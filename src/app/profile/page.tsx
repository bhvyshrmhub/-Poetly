"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

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
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-8">
          <div className="w-20 h-20 skeleton rounded-[var(--radius-md)] mb-5" />
          <div className="w-48 h-6 skeleton rounded mb-3" />
          <div className="w-32 h-4 skeleton rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-16 text-center pb-24 md:pb-16">
        <p className="font-poem text-xl text-text-tertiary italic">Redirecting...</p>
      </main>
      <MobileNav />
    </div>
  );
}
