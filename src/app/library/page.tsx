"use client";

import { useState } from "react";
import { poems, collections, writers } from "@/lib/mock-data";
import PoemCard from "@/components/PoemCard";
import CollectionCard from "@/components/CollectionCard";
import WriterCard from "@/components/WriterCard";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<"saved" | "collections" | "writers">("saved");
  const savedPoems = poems.slice(0, 4);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16 pb-24 md:pb-16">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-editorial text-3xl md:text-4xl text-foreground mb-2">
            Library
          </h1>
          <p className="text-text-secondary">
            Your saved poems and collections.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border-light mb-8">
          {(["saved", "collections", "writers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-foreground border-foreground font-medium"
                  : "text-text-tertiary border-transparent hover:text-text-secondary"
              }`}
            >
              {tab === "saved" ? "Saved Poems" : tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "saved" && (
          <div>
            {savedPoems.length > 0 ? (
              savedPoems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))
            ) : (
              <EmptyState
                title="Nothing saved yet."
                description="The next poem that stays with you can live here."
                action={
                  <Link
                    href="/explore"
                    className="text-sm font-medium text-accent hover:text-accent-light transition-colors"
                  >
                    Explore poems →
                  </Link>
                }
              />
            )}
          </div>
        )}

        {activeTab === "collections" && (
          <div className="space-y-4">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}

        {activeTab === "writers" && (
          <div className="space-y-4">
            {writers.slice(0, 4).map((writer) => (
              <WriterCard key={writer.id} writer={writer} />
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
