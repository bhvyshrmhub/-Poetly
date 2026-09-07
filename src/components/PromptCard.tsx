"use client";

import { Prompt } from "@/lib/types";

interface PromptCardProps {
  prompt: Prompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  return (
    <div className="py-5 border-b border-border-subtle last:border-0">
      <h3 className="font-poem text-xl font-medium text-text-primary mb-1.5 italic">&ldquo;{prompt.title}&rdquo;</h3>
      {prompt.description && <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{prompt.description}</p>}
    </div>
  );
}
