"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Prompt } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("prompts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setPrompts((data as Prompt[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Writing Prompts</h1>
          <p className="text-sm text-text-secondary">Find your next poem.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-[var(--radius-md)]" />)}
          </div>
        ) : prompts.length > 0 ? (
          prompts.map((prompt) => (
            <div key={prompt.id} className="py-5 border-b border-border-subtle last:border-0">
              <h3 className="font-poem text-xl font-medium text-text-primary mb-1.5 italic">&ldquo;{prompt.title}&rdquo;</h3>
              {prompt.description && <p className="text-sm text-text-secondary leading-relaxed">{prompt.description}</p>}
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">No prompts yet.</p>
            <p className="text-sm text-text-tertiary">Prompts will inspire your writing.</p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
