"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";


export default function TrendingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"trending" | "mostLoved" | "rising">("trending");
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPoems = useCallback(async () => {
    setLoading(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (activeTab === "rising") {
      const { data: follows } = user
        ? await supabase.from("follows").select("following_id").eq("follower_id", user.id)
        : { data: [] };
      const followedIds = follows?.map((f) => f.following_id) || [];

      let query = supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("status", "published")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (followedIds.length > 0) {
        query = query.not("author_id", "in", `(${followedIds.join(",")})`);
      }

      const { data } = await query.limit(10);
      setPoems((data as PoemWithAuthor[]) || []);
    } else {
      const { data: likesData } = await supabase
        .from("likes")
        .select("poem_id")
        .gte("created_at", sevenDaysAgo.toISOString());

      const likeCounts: Record<string, number> = {};
      likesData?.forEach((l) => {
        likeCounts[l.poem_id] = (likeCounts[l.poem_id] || 0) + 1;
      });

      const sortedPoemIds = Object.entries(likeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([id]) => id);

      if (sortedPoemIds.length === 0) {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .eq("visibility", "public")
          .order("published_at", { ascending: false })
          .limit(10);
        setPoems((data as PoemWithAuthor[]) || []);
      } else {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .in("id", sortedPoemIds);
        setPoems((data as PoemWithAuthor[]) || []);
      }
    }
    setLoading(false);
  }, [activeTab, user]);

  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);

  const tabs = [
    { id: "trending" as const, label: "Trending" },
    { id: "mostLoved" as const, label: "Most Loved" },
    { id: "rising" as const, label: "Rising Writers" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Discover</h1>
          <p className="text-sm text-text-secondary">Poems gaining attention right now</p>
        </div>

        <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${activeTab === tab.id ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mb-12">
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-[var(--radius-md)]" />)}
            </div>
          ) : poems.length > 0 ? (
            poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
          ) : (
            <div className="text-center py-16">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">Nothing trending yet.</p>
              <p className="text-sm text-text-tertiary">Be the first to publish a poem.</p>
            </div>
          )}
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
