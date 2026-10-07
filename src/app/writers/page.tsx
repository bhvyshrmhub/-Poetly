"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { WriterWithStats } from "@/lib/types";
import WriterCard from "@/components/WriterCard";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

export default function WritersPage() {
  const [writers, setWriters] = useState<WriterWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWriters = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (searchQuery.trim()) {
        query = query.or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
      }

      const { data: profiles } = await query;

      if (profiles) {
        const writersWithStats: WriterWithStats[] = await Promise.all(
          profiles.map(async (p) => {
            const [{ count: followers }, { count: following }, { count: poems }] = await Promise.all([
              supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", p.id),
              supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", p.id),
              supabase.from("poems").select("*", { count: "exact", head: true }).eq("author_id", p.id).eq("status", "published"),
            ]);
            return { ...p, followerCount: followers || 0, followingCount: following || 0, poemCount: poems || 0, isFollowed: false };
          })
        );
        setWriters(writersWithStats);
      }
    } catch (error) {
      console.error("Failed to load writers:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchWriters, 300);
    return () => clearTimeout(timer);
  }, [fetchWriters]);

  return (
    <AppShell maxWidth="wide">
      <div className="animate-fade-in">
        <PageHeader
          title="Writers"
          description="Discover poets and voices to follow across Poetly"
        />

        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search writers by name or handle..."
            className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors"
          />
        </div>

        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 skeleton rounded-[var(--radius-md)]" />
              ))}
            </div>
          ) : writers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {writers.map((writer) => (
                <WriterCard key={writer.id} writer={writer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">
                {searchQuery ? "No writers found." : "No writers yet."}
              </p>
              <p className="text-xs text-text-tertiary">
                {searchQuery ? "Try a different search term." : "Be the first to join."}
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
