"use client";

import { collections } from "@/lib/mock-data";
import CollectionCard from "@/components/CollectionCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function CollectionsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">
            Collections
          </h1>
          <p className="text-sm text-text-secondary">
            Curated groups of poems.
          </p>
        </div>

        <div>
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
