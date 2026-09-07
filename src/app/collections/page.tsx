"use client";

import { collections } from "@/lib/mock-data";
import CollectionCard from "@/components/CollectionCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function CollectionsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16 pb-24 md:pb-16">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-editorial text-3xl md:text-4xl text-foreground mb-2">
            Collections
          </h1>
          <p className="text-text-secondary">
            Curated groups of poems.
          </p>
        </div>

        <div className="divide-y divide-border-light">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
