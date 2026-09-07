"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Collection, PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";

export default function CollectionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: col } = await supabase.from("collections").select("*").eq("id", id).single();
    if (col) {
      setCollection(col as Collection);
      const { data: cp } = await supabase.from("collection_poems").select("poem_id").eq("collection_id", id);
      if (cp && cp.length > 0) {
        const poemIds = cp.map((c) => c.poem_id);
        const { data: poemData } = await supabase.from("poems").select("*, profiles!inner(*)").in("id", poemIds);
        setPoems((poemData as PoemWithAuthor[]) || []);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-8"><div className="w-48 h-6 skeleton rounded mb-4" /><div className="w-64 h-4 skeleton rounded" /></div></div>;
  }

  if (!collection) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center"><p className="font-poem text-xl text-text-tertiary italic">Collection not found.</p></div></div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-6 md:py-10">
        <Link href="/collections" className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={14} strokeWidth={1.5} /> Collections
        </Link>

        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem-title text-2xl md:text-3xl text-text-primary mb-2">{collection.title}</h1>
          {collection.description && <p className="text-sm text-text-secondary mb-3">{collection.description}</p>}
        </div>

        {poems.length > 0 ? (
          poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
        ) : (
          <p className="text-sm text-text-tertiary py-12 text-center">No poems in this collection yet.</p>
        )}
      </main>
    </div>
  );
}
