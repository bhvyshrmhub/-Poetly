"use client";

import { useState } from "react";
import { poems, writers, moods, tags } from "@/lib/mock-data";
import PoemCard from "@/components/PoemCard";
import WriterCard from "@/components/WriterCard";
import MoodTag from "@/components/MoodTag";
import SectionHeader from "@/components/SectionHeader";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState<"trending" | "mostLoved" | "rising">("trending");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">
            Trending
          </h1>
          <p className="text-sm text-text-secondary">
            Discover what people are loving right now.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-surface-secondary rounded-[var(--radius-full)] p-1">
          {[
            { id: "trending" as const, label: "Trending" },
            { id: "mostLoved" as const, label: "Most Loved" },
            { id: "rising" as const, label: "Rising Writers" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "rising" ? (
          <section className="mb-12">
            <SectionHeader title="Rising Writers" subtitle="Poets gaining attention" />
            <div className="space-y-1">
              {writers.map((writer) => (
                <WriterCard key={writer.id} writer={writer} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="mb-12">
              <SectionHeader
                title={activeTab === "trending" ? "Trending Now" : "Most Loved"}
              />
              <div>
                {(activeTab === "mostLoved"
                  ? [...poems].sort((a, b) => b.likes - a.likes)
                  : poems
                ).map((poem) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Mood */}
        <section className="mb-12">
          <SectionHeader title="Explore by Mood" />
          <div className="flex flex-wrap gap-2.5">
            {moods.map((mood) => (
              <MoodTag key={mood.slug} {...mood} />
            ))}
          </div>
        </section>

        {/* Tags */}
        <section className="mb-12">
          <SectionHeader title="Popular Tags" />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-xs text-text-secondary bg-surface border border-border-subtle rounded-full hover:border-brand/40 hover:text-brand transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
