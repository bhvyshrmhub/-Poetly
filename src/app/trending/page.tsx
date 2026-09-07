"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, Profile } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import WriterCard from "@/components/WriterCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function TrendingPage() {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [writers, setWriters] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trending" | "mostLoved" | "rising">("trending");

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (activeTab === "rising") {
        const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(20);
        setWriters((data as Profile[]) || []);
      } else {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .eq("visibility", "public")
          .order("published_at", { ascending: false })
          .limit(30);

        const sorted = (data as PoemWithAuthor[]) || [];
        if (activeTab === "mostLoved") {
          const poemIds = sorted.map((p) => p.id);
          const { data: likeCounts } = await supabase.from("likes").select("poem_id").in("poem_id", poemIds);
          const countMap = new Map<string, number>();
          likeCounts?.forEach((l) => countMap.set(l.poem_id, (countMap.get(l.poem_id) || 0) + 1));
          sorted.sort((a, b) => (countMap.get(b.id) || 0) - (countMap.get(a.id) || 0));
        }
        setPoems(sorted);
      }
      setLoading(false);
    })();
  }, [activeTab]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Trending</h1>
          <p className="text-sm text-text-secondary">Discover what people are loving right now.</p>
        </div>

        <div className="flex gap-1 mb-8 bg-surface-secondary rounded-[var(--radius-full)] p-1">
          {[
            { id: "trending" as const, label: "Trending" },
            { id: "mostLoved" as const, label: "Most Loved" },
            { id: "rising" as const, label: "Rising Writers" },
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

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-5 border-b border-border-subtle">
                <div className="w-48 h-5 skeleton mb-2.5 rounded" />
                <div className="space-y-1.5">
                  <div className="w-full h-3 skeleton rounded" />
                  <div className="w-3/4 h-3 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "rising" ? (
          writers.length > 0 ? (
            <div className="space-y-1">
              {writers.map((writer) => <WriterCard key={writer.id} writer={writer} />)}
            </div>
          ) : (
            <div className="text-center py-16"><p className="font-poem text-xl text-text-tertiary italic">No writers yet.</p></div>
          )
        ) : poems.length > 0 ? (
          poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">No poems yet.</p>
            <p className="text-sm text-text-tertiary">Be the first to publish.</p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
