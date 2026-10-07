"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, Prompt, Profile } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import PromptCard from "@/components/PromptCard";
import WriterCard from "@/components/WriterCard";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import TrendingTags from "@/components/home/TrendingTags";
import SuggestedWriters from "@/components/home/SuggestedWriters";

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

  const rightRailContent = (
    <div className="space-y-6">
      <TrendingTags />
      <SuggestedWriters />
    </div>
  );

  return (
    <AppShell maxWidth="feed" rightRail={rightRailContent}>
      {/* Page Header */}
      <PageHeader
        title="Explore"
        subtitle="Discover poetry, writers, and ideas."
        action={
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs text-text-tertiary bg-surface-secondary hover:text-text-primary border border-border-subtle rounded-full transition-colors"
          >
            <Search size={14} /> Search
          </Link>
        }
      />

      {/* Discovery Tabs */}
      <div className="flex gap-1 mb-8 bg-surface-secondary rounded-[var(--radius-full)] p-1 border border-border-subtle/50">
        {[
          { id: "poems" as const, label: "Poems" },
          { id: "prompts" as const, label: "Prompts" },
          { id: "writers" as const, label: "Writers" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-150 select-none ${
              activeTab === tab.id
                ? "bg-surface text-text-primary shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Discovery Content */}
      <section className="mb-12">
        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-5 border-b border-border-subtle">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full skeleton" />
                  <div className="w-28 h-3.5 skeleton rounded-full" />
                </div>
                <div className="w-48 h-5 skeleton mb-2.5 rounded" />
                <div className="space-y-2">
                  <div className="w-full h-3.5 skeleton rounded" />
                  <div className="w-3/4 h-3.5 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "poems" ? (
          poems.length > 0 ? (
            <div className="space-y-0">
              {poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-subtle">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">
                No poems published yet.
              </p>
              <p className="text-sm text-text-secondary mb-4">
                Be the first to share your words with the community.
              </p>
              <Link
                href="/write"
                className="inline-flex items-center px-4 py-2 text-xs font-medium text-white gradient-brand rounded-full hover:opacity-90 shadow-sm"
              >
                Write a poem →
              </Link>
            </div>
          )
        ) : activeTab === "prompts" ? (
          prompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prompts.map((prompt) => (
                <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                  <PromptCard prompt={prompt} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-subtle">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">
                No active prompts right now.
              </p>
              <p className="text-sm text-text-secondary">
                Writing prompts will appear here soon.
              </p>
            </div>
          )
        ) : writers.length > 0 ? (
          <div className="divide-y divide-border-subtle bg-surface border border-border-subtle rounded-[var(--radius-lg)] px-4">
            {writers.map((writer) => (
              <WriterCard key={writer.id} writer={writer} variant="row" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-subtle">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">
              No writers found yet.
            </p>
            <p className="text-sm text-text-secondary">
              Join Poetly and be one of the founding voices.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
