"use client";

import Link from "next/link";
import { poems, writers, prompts } from "@/lib/mock-data";
import PoemCard from "@/components/PoemCard";
import WriterCard from "@/components/WriterCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function HomePage() {
  const hour = new Date().getHours();
  let greeting = "Good evening.";
  if (hour < 12) greeting = "Good morning.";
  else if (hour < 17) greeting = "Good afternoon.";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16 pb-24 md:pb-16">
        {/* Greeting */}
        <div className="mb-12 animate-fade-in">
          <h1 className="font-editorial text-3xl md:text-4xl text-foreground mb-2">
            {greeting}
          </h1>
          <p className="text-text-secondary">
            What are you carrying in words today?
          </p>
        </div>

        {/* Featured poem */}
        <section className="mb-16 animate-fade-in-up">
          <PoemCard poem={poems[3]} variant="featured" />
        </section>

        {/* Latest from the community */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-serif text-xl text-foreground">
              Latest from the community
            </h2>
            <Link
              href="/explore"
              className="text-xs text-text-tertiary hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>
          <div>
            {poems.slice(0, 5).map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        </section>

        {/* Writing prompt */}
        <section className="mb-16 py-8 px-6 bg-surface rounded-lg border border-border-light">
          <p className="text-xs text-text-tertiary tracking-widest uppercase mb-3">
            Writing Prompt
          </p>
          <p className="font-serif text-xl italic text-foreground mb-4">
            &ldquo;{prompts[0].title}&rdquo;
          </p>
          <p className="text-sm text-text-secondary mb-4">
            {prompts[0].participants} writers participated
          </p>
          <Link
            href={`/prompts/${prompts[0].id}`}
            className="text-sm font-medium text-accent hover:text-accent-light transition-colors"
          >
            Write for this prompt →
          </Link>
        </section>

        {/* Recommended writers */}
        <section>
          <h2 className="font-serif text-xl text-foreground mb-6">
            Recommended Writers
          </h2>
          <div className="space-y-4">
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
