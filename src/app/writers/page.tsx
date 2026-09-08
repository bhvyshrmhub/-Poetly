"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { WriterWithStats } from "@/lib/types";
import WriterCard from "@/components/WriterCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function WritersPage() {
  const { user } = useAuth();
  const [writers, setWriters] = useState<WriterWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWriters = useCallback(async () => {
    setLoading(true);
    const { data: follows } = user
      ? await supabase.from("follows").select("following_id").eq("follower_id", user.id)
      : { data: [] };
    const followedIds = follows?.map((f) => f.following_id) || [];

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
          return { ...p, followerCount: followers || 0, followingCount: following || 0, poemCount: poems || 0, isFollowed: followedIds.includes(p.id) };
        })
      );
      setWriters(writersWithStats);
    }
    setLoading(false);
  }, [user, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchWriters, 300);
    return () => clearTimeout(timer);
  }, [fetchWriters]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Writers</h1>
          <p className="text-sm text-text-secondary">Discover poets to follow</p>
        </div>

        <div className="relative mb-6">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search writers..." className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors" />
        </div>

        <section className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-32 skeleton rounded-[var(--radius-md)]" />)}
            </div>
          ) : writers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {writers.map((writer) => (
                <WriterCard key={writer.id} writer={writer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">{searchQuery ? "No writers found." : "No writers yet."}</p>
              <p className="text-sm text-text-tertiary">{searchQuery ? "Try a different search." : "Be the first to join."}</p>
            </div>
          )}
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
