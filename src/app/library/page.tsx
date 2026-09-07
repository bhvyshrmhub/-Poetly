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
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">
            Library
          </h1>
          <p className="text-sm text-text-secondary">
            Your saved poems and collections.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1">
          {(["saved", "collections", "writers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-full transition-all duration-200 capitalize ${
                activeTab === tab
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab === "saved" ? "Saved" : tab}
            </button>
          ))}
        </div>

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
                  <Link href="/trending" className="text-sm font-medium text-brand hover:text-brand-hover transition-colors">
                    Explore poems →
                  </Link>
                }
              />
            )}
          </div>
        )}

        {activeTab === "collections" && (
          <div>
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}

        {activeTab === "writers" && (
          <div className="space-y-1">
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
