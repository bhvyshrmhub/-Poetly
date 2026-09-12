"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, Prompt } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function HomePage() {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [poemsRes, promptRes] = await Promise.all([
        supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .eq("visibility", "public")
          .order("published_at", { ascending: false })
          .limit(20),
        supabase
          .from("prompts")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);
      setPoems((poemsRes.data as PoemWithAuthor[]) || []);
      setActivePrompt((promptRes.data?.[0] as Prompt) || null);
      setLoading(false);
    })();
  }, []);

  const hour = new Date().getHours();
  let greeting = "Good evening.";
  if (hour < 12) greeting = "Good morning.";
  else if (hour < 17) greeting = "Good afternoon.";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">{greeting}</h1>
          <p className="text-sm text-text-secondary">Explore the world of poetry on Poetly.</p>
        </div>

        <Link
          href="/write"
          className="flex items-center gap-3 w-full px-4 py-3 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-text-tertiary hover:border-brand/30 hover:bg-surface-hover transition-all mb-8"
        >
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center flex-shrink-0">
            <span className="text-brand text-xs font-display">P</span>
          </div>
          <span className="text-sm">Write a poem...</span>
        </Link>

        {activePrompt && (
          <Link href={`/prompts/${activePrompt.id}`} className="block mb-8 px-4 py-4 bg-surface border border-border-subtle rounded-[var(--radius-md)] hover:border-brand/30 hover:bg-surface-hover transition-all animate-fade-in">
            <p className="text-[10px] font-medium text-brand tracking-widest uppercase mb-1">Today&apos;s Prompt</p>
            <p className="font-poem-title text-lg text-text-primary italic">&ldquo;{activePrompt.title}&rdquo;</p>
            {activePrompt.description && <p className="text-sm text-text-secondary mt-1 line-clamp-1">{activePrompt.description}</p>}
          </Link>
        )}

        <section className="mb-12">
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-5 border-b border-border-subtle">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-[var(--radius-sm)] skeleton" />
                    <div className="w-24 h-3 skeleton rounded-full" />
                  </div>
                  <div className="w-48 h-5 skeleton mb-2.5 rounded" />
                  <div className="space-y-1.5">
                    <div className="w-full h-3 skeleton rounded" />
                    <div className="w-3/4 h-3 skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : poems.length > 0 ? (
            poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
          ) : (
            <div className="text-center py-16">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">
                Poetly is waiting for its first words.
              </p>
              <p className="text-sm text-text-tertiary">Be the first to publish a poem.</p>
            </div>
          )}
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
