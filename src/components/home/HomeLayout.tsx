"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";

// Desktop components
import HomeNavbar from "./HomeNavbar";
import ProfileMiniCard from "./ProfileMiniCard";
import MainNavigation from "./MainNavigation";
import TrendingTags from "./TrendingTags";
import PoemComposer from "./PoemComposer";
import DailyPoetlyMoment from "./DailyPoetlyMoment";
import FeedTabs from "./FeedTabs";
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
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("status", "published")
        .eq("visibility", "public")
        .order("published_at", { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;
      setPoems((data as PoemWithAuthor[]) || []);
    } catch (err) {
      console.error("Failed to load poems:", err);
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

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
          <FeedTabs />

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
