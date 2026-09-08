"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, Prompt } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import PromptCard from "@/components/PromptCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function ExplorePage() {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"poems" | "prompts" | "writers">("poems");

  useEffect(() => {
    (async () => {
      setLoading(true);

      if (activeTab === "poems") {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .eq("visibility", "public")
          .order("published_at", { ascending: false })
          .limit(20);
        setPoems((data as PoemWithAuthor[]) || []);
      } else if (activeTab === "prompts") {
        const { data } = await supabase
          .from("prompts")
          .select("*")
          .order("created_at", { ascending: false });
        setPrompts((data as Prompt[]) || []);
      }

      setLoading(false);
    })();
  }, [activeTab]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Explore</h1>
          <p className="text-sm text-text-secondary">Discover poetry on Poetly</p>
        </div>

        <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1">
          {[
            { id: "poems" as const, label: "Poems" },
            { id: "prompts" as const, label: "Prompts" },
            { id: "writers" as const, label: "Writers" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === tab.id ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

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
          ) : activeTab === "poems" ? (
            poems.length > 0 ? (
              poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
            ) : (
              <div className="text-center py-16">
                <p className="font-poem text-xl text-text-tertiary italic mb-2">No poems yet.</p>
                <p className="text-sm text-text-tertiary">Be the first to publish.</p>
              </div>
            )
          ) : activeTab === "prompts" ? (
            prompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prompts.map((prompt) => (
                  <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                    <PromptCard prompt={prompt} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-poem text-xl text-text-tertiary italic mb-2">No prompts yet.</p>
                <p className="text-sm text-text-tertiary">Check back soon for writing prompts.</p>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">Discover writers coming soon.</p>
              <p className="text-sm text-text-tertiary">
                <Link href="/login" className="text-brand hover:text-brand-hover">Join</Link> to find and follow poets.
              </p>
            </div>
          )}
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
