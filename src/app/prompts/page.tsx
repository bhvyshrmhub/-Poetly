"use client";

import { prompts } from "@/lib/mock-data";
import PromptCard from "@/components/PromptCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function PromptsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">
            Writing Prompts
          </h1>
          <p className="text-sm text-text-secondary">
            Find your next poem.
          </p>
        </div>

        {/* Today's prompt */}
        <div className="mb-10 py-6 px-5 bg-surface border border-border-subtle rounded-[var(--radius-lg)] gradient-brand-soft">
          <p className="text-[11px] font-medium text-brand tracking-widest uppercase mb-3">
            Today&apos;s Prompt
          </p>
          <p className="font-poem text-xl italic text-text-primary mb-3">
            &ldquo;{prompts[0].title}&rdquo;
          </p>
          <p className="text-xs text-text-secondary mb-4">
            {prompts[0].participants} writers participated
          </p>
          <a
            href={`/prompts/${prompts[0].id}`}
            className="inline-flex items-center justify-center px-5 py-2 gradient-brand text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Write for this prompt
          </a>
        </div>

        {/* All prompts */}
        <div>
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
