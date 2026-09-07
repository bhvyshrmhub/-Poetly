"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function LibraryPage() {
  const { user } = useAuth();
  const [savedPoems, setSavedPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    const { data: saves } = await supabase
      .from("saves")
      .select("poem_id")
      .eq("user_id", user!.id);

    if (!saves || saves.length === 0) {
      setSavedPoems([]);
      setLoading(false);
      return;
    }

    const poemIds = saves.map((s) => s.poem_id);
    const { data } = await supabase
      .from("poems")
      .select("*, profiles!inner(*)")
      .in("id", poemIds)
      .order("created_at", { ascending: false });

    setSavedPoems((data as PoemWithAuthor[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchSaved();
  }, [user, fetchSaved]);

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Library</h1>
          <p className="text-sm text-text-secondary">Your saved poems.</p>
        </div>

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-[var(--radius-md)]" />)}
          </div>
        ) : savedPoems.length > 0 ? (
          savedPoems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">Nothing saved yet.</p>
            <p className="text-sm text-text-tertiary">Save poems that speak to you.</p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
