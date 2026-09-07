"use client";

import { useState } from "react";
import Link from "next/link";
import { poems, writers, prompts } from "@/lib/mock-data";
import PoemCard from "@/components/PoemCard";
import WriterCard from "@/components/WriterCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");

  const hour = new Date().getHours();
  let greeting = "Good evening.";
  if (hour < 12) greeting = "Good morning.";
  else if (hour < 17) greeting = "Good afternoon.";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        {/* Greeting */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">
            {greeting}
          </h1>
          <p className="text-sm text-text-secondary">
            What are you carrying in words today?
          </p>
        </div>

        {/* Composer shortcut */}
        <Link
          href="/write"
          className="flex items-center gap-3 w-full px-4 py-3 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-text-tertiary hover:border-brand/30 hover:bg-surface-hover transition-all mb-8"
        >
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center flex-shrink-0">
            <span className="text-brand text-xs font-display">P</span>
          </div>
          <span className="text-sm">Write a poem...</span>
        </Link>

        {/* Feed tabs */}
        <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1">
          {[
            { id: "forYou" as const, label: "For You" },
            { id: "following" as const, label: "Following" },
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

        {/* Featured poem */}
        <section className="mb-10">
          <PoemCard poem={poems[3]} variant="featured" />
        </section>

        {/* Feed */}
        <section className="mb-12">
          {activeTab === "forYou" ? (
            <div>
              {poems.slice(0, 6).map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          ) : (
            <div>
              {poems.slice(0, 3).map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          )}
        </section>

        {/* Writing prompt */}
        <section className="mb-12 py-6 px-5 bg-surface border border-border-subtle rounded-[var(--radius-lg)]">
          <p className="text-[11px] font-medium text-brand tracking-widest uppercase mb-3">
            Writing Prompt
          </p>
          <p className="font-poem text-lg italic text-text-primary mb-3">
            &ldquo;{prompts[0].title}&rdquo;
          </p>
          <p className="text-xs text-text-tertiary mb-3">
            {prompts[0].participants} writers participated
          </p>
          <Link
            href={`/prompts/${prompts[0].id}`}
            className="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
          >
            Write for this prompt →
          </Link>
        </section>

        {/* Recommended writers */}
        <section>
          <h2 className="font-poem text-lg font-medium text-text-primary mb-4">
            Recommended Writers
          </h2>
          <div className="space-y-1">
            {writers.slice(0, 4).map((writer) => (
              <WriterCard key={writer.id} writer={writer} />
            ))}
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
