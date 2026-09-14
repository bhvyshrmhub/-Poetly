"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, Profile } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import WriterCard from "@/components/WriterCard";
import AppShell from "@/components/shell/AppShell";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"poems" | "writers">("poems");
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [writers, setWriters] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.trim();
        if (activeTab === "poems") {
          const { data } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .eq("status", "published")
            .eq("visibility", "public")
            .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
            .order("published_at", { ascending: false })
            .limit(20);
          setPoems((data as PoemWithAuthor[]) || []);
        } else {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
            .limit(20);
          setWriters((data as Profile[]) || []);
        }
      } catch (error) {
        console.error("Failed to search:", error);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeTab]);

  return (
    <AppShell>
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-4">Search</h1>

          <div className="relative mb-6">
            <SearchIcon size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search poems, writers..."
              className="w-full bg-surface border border-border-subtle focus:border-brand rounded-[var(--radius-md)] outline-none pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1">
            {(["poems", "writers"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-full transition-all duration-200 capitalize ${
                  activeTab === tab ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded-[var(--radius-md)]" />)}
            </div>
          ) : !query.trim() ? (
            <p className="text-sm text-text-tertiary py-12 text-center">Start typing to search...</p>
          ) : activeTab === "poems" ? (
            poems.length > 0 ? (
              poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
            ) : (
              <p className="text-sm text-text-tertiary py-12 text-center">No poems found</p>
            )
          ) : writers.length > 0 ? (
            <div className="space-y-1">
              {writers.map((writer) => <WriterCard key={writer.id} writer={writer} />)}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary py-12 text-center">No writers found</p>
          )}
        </div>
      </main>
    </AppShell>
  );
}
