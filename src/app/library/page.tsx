"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedPoems, setSavedPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: savesData } = await supabase
        .from("saves")
        .select("poem_id")
        .eq("user_id", user.id);

      if (savesData && savesData.length > 0) {
        const poemIds = savesData.map((s) => s.poem_id);
        const { data: poemsData } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .in("id", poemIds)
          .eq("status", "published");
        setSavedPoems((poemsData as PoemWithAuthor[]) || []);
      }
    } catch {
      // Silent fail
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchSaved();
    }
  }, [authLoading, fetchSaved]);

  return (
    <AppShell maxWidth="feed">
      {/* Consistent Page Header */}
      <PageHeader
        title="Saved Poems"
        subtitle="Keep the words that stay with you."
      />

      {authLoading || loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 skeleton rounded-[var(--radius-md)]" />
          ))}
        </div>
      ) : !user ? (
        <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-subtle">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">
            Sign in to access your saved poems.
          </p>
          <p className="text-sm text-text-secondary mb-4">
            Bookmark poems you love across Poetly to revisit them anytime.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2 text-xs sm:text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-full transition-colors shadow-xs"
          >
            Sign In
          </Link>
        </div>
      ) : savedPoems.length > 0 ? (
        <div className="space-y-0">
          {savedPoems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-subtle">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">
            Nothing saved yet.
          </p>
          <p className="text-sm text-text-secondary mb-4">
            Save poems you love while browsing to read them later.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center px-4 py-2 text-xs font-medium text-white gradient-brand rounded-full hover:opacity-90 shadow-xs"
          >
            Explore poems →
          </Link>
        </div>
      )}
    </AppShell>
  );
}
