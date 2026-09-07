"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { Collection } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function CollectionsPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = useCallback(async () => {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    setCollections((data as Collection[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchCollections();
  }, [user, fetchCollections]);

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Collections</h1>
            <p className="text-sm text-text-secondary">Your curated groups of poems.</p>
          </div>
          <button className="text-xs font-medium text-brand hover:text-brand-hover transition-colors px-3 py-1.5 rounded-full border border-brand/30 hover:border-brand">
            + New
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded-[var(--radius-md)]" />)}
          </div>
        ) : collections.length > 0 ? (
          collections.map((c) => (
            <div key={c.id} className="py-4 border-b border-border-subtle last:border-0">
              <h3 className="font-poem text-lg font-medium text-text-primary mb-1">{c.title}</h3>
              {c.description && <p className="text-sm text-text-secondary">{c.description}</p>}
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">No collections yet.</p>
            <p className="text-sm text-text-tertiary">Create collections to organize your poems.</p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
