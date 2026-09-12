"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-8">
          <div className="w-48 h-6 skeleton rounded mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 skeleton rounded-[var(--radius-md)] mb-4" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center pb-24 md:pb-16">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">Sign in to save poems.</p>
          <Link href="/login" className="text-sm text-brand hover:text-brand-hover">Sign in →</Link>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-6 animate-fade-in">Saved Poems</h1>

        {savedPoems.length > 0 ? (
          savedPoems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">Nothing saved yet.</p>
            <p className="text-sm text-text-tertiary mb-4">Save poems you love to read them later.</p>
            <Link href="/explore" className="text-sm text-brand hover:text-brand-hover">Explore poems →</Link>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
