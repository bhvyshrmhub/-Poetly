"use client";

import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function CollectionsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Collections</h1>
          <p className="text-sm text-text-secondary">Your curated groups of poems.</p>
        </div>

        <div className="text-center py-16">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">No collections yet.</p>
          <p className="text-sm text-text-tertiary">Create collections to organize your poems.</p>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
