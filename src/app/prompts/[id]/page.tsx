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
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-6 md:py-10">
        <Link
          href="/prompts"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Prompts
        </Link>

        <div className="mb-10 animate-fade-in">
          <p className="text-[11px] font-medium text-brand tracking-widest uppercase mb-4">
            Writing Prompt
          </p>
          <h1 className="font-poem-title text-2xl md:text-3xl text-text-primary mb-3 italic">
            &ldquo;{prompt.title}&rdquo;
          </h1>
          <p className="text-sm text-text-secondary mb-3 max-w-md leading-relaxed">
            {prompt.description}
          </p>
          <p className="text-sm text-text-tertiary mb-5">
            {prompt.participants} writers participated
          </p>
          <Link
            href="/write"
            className="inline-flex items-center justify-center px-5 py-2.5 gradient-brand text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Write a poem
          </Link>
        </div>

        {prompt.poems.length > 0 && (
          <section>
            <h2 className="font-poem text-lg font-medium text-text-primary mb-4">
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
