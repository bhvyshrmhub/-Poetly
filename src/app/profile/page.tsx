"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-16 text-center pb-24 md:pb-16">
        <div className="animate-fade-in">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">Your profile will appear here.</p>
          <p className="text-sm text-text-tertiary mb-6">Profile pages require authentication, which will be added in a future update.</p>
          <Link href="/home" className="text-sm font-medium text-brand hover:text-brand-hover transition-colors">
            Return to Poetly →
          </Link>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
