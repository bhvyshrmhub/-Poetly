"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { PoemWithAuthor } from "@/lib/types";

// Desktop components
import HomeNavbar from "./HomeNavbar";
import ProfileMiniCard from "./ProfileMiniCard";
import MainNavigation from "./MainNavigation";
import TrendingTags from "./TrendingTags";
import PoemComposer from "./PoemComposer";
import DailyPoetlyMoment from "./DailyPoetlyMoment";
import FeedTabs, { FeedTabType } from "./FeedTabs";
import HomePoemCard from "./HomePoemCard";
import ActivityPanel from "./ActivityPanel";
import SuggestedWriters from "./SuggestedWriters";
import WritingCTA from "./WritingCTA";

// Mobile components
import MobileTopBar from "./MobileTopBar";
import MobileComposer from "./MobileComposer";
import MobileBottomNav from "./MobileBottomNav";

// States
import { PoemCardSkeleton } from "./Skeletons";
import { EmptyFeedState, ErrorFeedState } from "./States";

export default function HomeLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTabType>("for-you");
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "following") {
        if (!user) {
          setPoems([]);
          setLoading(false);
          return;
        }

        const { data: followRows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        const followingIds = followRows?.map((f) => f.following_id) || [];
        if (followingIds.length === 0) {
          setPoems([]);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .in("author_id", followingIds)
          .eq("status", "published")
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .limit(20);

        if (fetchError) throw fetchError;
        setPoems((data as PoemWithAuthor[]) || []);
      } else if (activeTab === "trending") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: likesData } = await supabase
          .from("likes")
          .select("poem_id")
          .gte("created_at", sevenDaysAgo.toISOString());

        const likeCounts: Record<string, number> = {};
        likesData?.forEach((l) => {
          likeCounts[l.poem_id] = (likeCounts[l.poem_id] || 0) + 1;
        });

        const sortedIds = Object.entries(likeCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .map(([id]) => id);

        if (sortedIds.length > 0) {
          const { data, error: fetchError } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .in("id", sortedIds)
            .eq("status", "published")
            .eq("visibility", "public");

          if (fetchError) throw fetchError;
          setPoems((data as PoemWithAuthor[]) || []);
        } else {
          // Fallback to recent poems if no recent likes
          const { data, error: fetchError } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .eq("status", "published")
            .eq("visibility", "public")
            .order("created_at", { ascending: false })
            .limit(20);

          if (fetchError) throw fetchError;
          setPoems((data as PoemWithAuthor[]) || []);
        }
      } else {
        // "for-you" and "new-voices"
        const { data, error: fetchError } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .limit(20);

        if (fetchError) throw fetchError;
        setPoems((data as PoemWithAuthor[]) || []);
      }
    } catch (err) {
      console.error("Failed to load poems:", err);
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [activeTab, user]);

  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);

  return (
    <div className="min-h-screen">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <HomeNavbar />
      </div>

      {/* Mobile Top Bar */}
      <MobileTopBar />

      {/* Main Content */}
      <div className="home-layout pt-6 pb-24 md:pb-6">
        {/* Left Sidebar */}
        <aside className="home-sidebar hidden md:block">
          <ProfileMiniCard />
          <div className="mt-6">
            <MainNavigation />
          </div>
          <div className="mt-6">
            <TrendingTags />
          </div>
        </aside>

        {/* Center Column */}
        <main className="min-w-0">
          {/* Mobile Composer */}
          <div className="md:hidden">
            <MobileComposer />
          </div>

          {/* Desktop Composer */}
          <div className="hidden md:block">
            <PoemComposer />
          </div>

          {/* Daily Moment */}
          <DailyPoetlyMoment />

          {/* Feed Tabs */}
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Feed */}
          <section>
            {loading ? (
              <div className="space-y-6">
                <PoemCardSkeleton />
                <PoemCardSkeleton />
                <PoemCardSkeleton />
              </div>
            ) : error ? (
              <ErrorFeedState onRetry={fetchPoems} />
            ) : poems.length > 0 ? (
              <div className="space-y-0">
                {poems.map((poem) => (
                  <HomePoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            ) : activeTab === "following" ? (
              <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8">
                <p className="font-poem text-xl text-text-tertiary italic mb-2">
                  {!user ? "Sign in to see your following feed." : "You haven't followed any writers yet."}
                </p>
                <p className="text-sm text-text-secondary mb-4">
                  {!user ? "Follow your favorite poets to see their poems here." : "Discover poets and follow their work."}
                </p>
                <Link
                  href={!user ? "/login" : "/writers"}
                  className="inline-flex items-center px-4 py-2 text-xs font-medium text-white gradient-brand rounded-full hover:opacity-90"
                >
                  {!user ? "Sign in →" : "Discover writers →"}
                </Link>
              </div>
            ) : (
              <EmptyFeedState />
            )}
          </section>
        </main>

        {/* Right Sidebar */}
        <aside className="home-right-sidebar hidden lg:block">
          <ActivityPanel />
          <div className="mt-6">
            <SuggestedWriters />
          </div>
          <div className="mt-6">
            <WritingCTA />
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
