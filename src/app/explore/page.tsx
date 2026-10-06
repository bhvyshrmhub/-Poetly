"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, Prompt, Profile } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import PromptCard from "@/components/PromptCard";
import WriterCard from "@/components/WriterCard";
import AppShell from "@/components/shell/AppShell";

export default function ExplorePage() {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [writers, setWriters] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"poems" | "prompts" | "writers">("poems");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "poems") {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .limit(30);
        setPoems((data as PoemWithAuthor[]) || []);
      } else if (activeTab === "prompts") {
        const { data } = await supabase
          .from("prompts")
          .select("*")
          .order("created_at", { ascending: false });
        setPrompts((data as Prompt[]) || []);
      } else if (activeTab === "writers") {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(30);
        setWriters((data as Profile[]) || []);
      }
    } catch (error) {
      console.error("Failed to load explore content:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AppShell>
      <div className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Explore</h1>
            <p className="text-sm text-text-secondary">Discover poetry, prompts, and voices on Poetly.</p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs text-text-tertiary bg-surface-secondary hover:text-text-primary border border-border-subtle rounded-full transition-colors self-start sm:self-auto"
          >
            <Search size={14} /> Search poems & writers
          </Link>
        </div>

        <div className="flex gap-1 mb-8 bg-surface-secondary rounded-[var(--radius-full)] p-1">
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
              <div className="space-y-2">
                {poems.map((poem) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8">
                <p className="font-poem text-xl text-text-tertiary italic mb-2">No poems published yet.</p>
                <p className="text-sm text-text-secondary mb-4">Be the first to share your words with the community.</p>
                <Link
                  href="/write"
                  className="inline-flex items-center px-4 py-2 text-xs font-medium text-white gradient-brand rounded-full hover:opacity-90"
                >
                  Write a poem →
                </Link>
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
              <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8">
                <p className="font-poem text-xl text-text-tertiary italic mb-2">No active prompts right now.</p>
                <p className="text-sm text-text-secondary">Writing prompts will appear here soon.</p>
              </div>
            )
          ) : writers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {writers.map((writer) => (
                <div key={writer.id} className="p-3 bg-surface border border-border-subtle rounded-[var(--radius-md)] hover:border-brand/40 transition-colors">
                  <WriterCard writer={writer} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">No writers found yet.</p>
              <p className="text-sm text-text-secondary">Join Poetly and be one of the founding voices.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
