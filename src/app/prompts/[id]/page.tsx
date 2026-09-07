"use client";

import { useParams } from "next/navigation";
import { prompts } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";

export default function PromptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const prompt = prompts.find((p) => p.id === id) || prompts[0];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <Link
          href="/prompts"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Prompts
        </Link>

        <div className="mb-12 animate-fade-in">
          <p className="text-xs text-text-tertiary tracking-widest uppercase mb-4">
            Writing Prompt
          </p>
          <h1 className="font-poem-title text-2xl md:text-4xl text-foreground mb-4 italic">
            &ldquo;{prompt.title}&rdquo;
          </h1>
          <p className="text-sm text-text-secondary mb-4 max-w-lg">
            {prompt.description}
          </p>
          <p className="text-sm text-text-tertiary mb-6">
            {prompt.participants} writers participated
          </p>
          <Link
            href="/write"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors"
          >
            Write a poem
          </Link>
        </div>

        {/* Submitted poems */}
        {prompt.poems.length > 0 && (
          <section>
            <h2 className="font-serif text-lg text-foreground mb-4">
              Submitted Poems
            </h2>
            <div>
              {prompt.poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
