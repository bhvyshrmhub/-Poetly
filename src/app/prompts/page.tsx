"use client";

import { prompts } from "@/lib/mock-data";
import PromptCard from "@/components/PromptCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function PromptsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16 pb-24 md:pb-16">
        <div className="mb-12 animate-fade-in">
          <h1 className="font-editorial text-3xl md:text-4xl text-foreground mb-2">
            Writing Prompts
          </h1>
          <p className="text-text-secondary">
            Find your next poem.
          </p>
        </div>

        {/* Today's prompt */}
        <div className="mb-12 py-8 px-6 bg-surface rounded-lg border border-border-light">
          <p className="text-xs text-text-tertiary tracking-widest uppercase mb-4">
            Today&apos;s Prompt
          </p>
          <p className="font-serif text-2xl italic text-foreground mb-4">
            &ldquo;{prompts[0].title}&rdquo;
          </p>
          <p className="text-sm text-text-secondary mb-4">
            {prompts[0].participants} writers participated
          </p>
          <a
            href={`/prompts/${prompts[0].id}`}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors"
          >
            Write for this prompt
          </a>
        </div>

        {/* All prompts */}
        <div className="divide-y divide-border-light">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
