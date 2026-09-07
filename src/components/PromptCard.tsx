"use client";

import { WritingPrompt } from "@/lib/types";
import Link from "next/link";

interface PromptCardProps {
  prompt: WritingPrompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  return (
    <Link href={`/prompts/${prompt.id}`} className="group block">
      <div className="py-5 border-b border-border-light last:border-0">
        <p className="text-xs text-text-tertiary tracking-wide mb-2">
          {prompt.participants} writers participated
        </p>
        <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-accent transition-colors mb-2 italic">
          &ldquo;{prompt.title}&rdquo;
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2">
          {prompt.description}
        </p>
      </div>
    </Link>
  );
}
