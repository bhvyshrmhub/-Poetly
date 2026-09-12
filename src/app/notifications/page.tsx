"use client";

import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Notifications</h1>
        </div>

        <div className="text-center py-16">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">No notifications yet.</p>
          <p className="text-sm text-text-tertiary">Notifications will appear here when you have activity.</p>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
