"use client";

import { WritingPrompt } from "@/lib/types";
import Link from "next/link";

interface PromptCardProps {
  prompt: WritingPrompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  return (
    <Link href={`/prompts/${prompt.id}`} className="group block">
      <div className="py-5 border-b border-border-subtle last:border-0">
        <p className="text-xs text-text-tertiary mb-2">
          {prompt.participants} writers participated
        </p>
        <h3 className="font-poem text-xl font-medium text-text-primary group-hover:text-brand transition-colors mb-1.5 italic">
          &ldquo;{prompt.title}&rdquo;
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
          {prompt.description}
        </p>
      </div>
    </Link>
  );
}
