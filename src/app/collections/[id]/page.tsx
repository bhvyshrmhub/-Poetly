"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Collection, PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Toast from "@/components/Toast";

export default function CollectionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPoem, setShowAddPoem] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const { data: col } = await supabase.from("collections").select("*").eq("id", id).single();
    setCollection(col);

    if (col) {
      const { data: cp } = await supabase.from("collection_poems").select("poem_id").eq("collection_id", id);
      const poemIds = cp?.map((r) => r.poem_id) || [];
      if (poemIds.length > 0) {
        const { data } = await supabase.from("poems").select("*, profiles!inner(*)").in("id", poemIds);
        setPoems((data as PoemWithAuthor[]) || []);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddPoem = async (poemId: string) => {
    const { error } = await supabase.from("collection_poems").insert({ collection_id: id, poem_id: poemId });
    if (!error) {
      setShowAddPoem(false);
      fetchData();
      setToast("Poem added");
    }
  };

  const handleRemovePoem = async (poemId: string) => {
    await supabase.from("collection_poems").delete().eq("collection_id", id).eq("poem_id", poemId);
    setPoems(poems.filter((p) => p.id !== poemId));
  };

  if (loading) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-8"><div className="w-48 h-6 skeleton rounded mb-4" /><div className="w-64 h-4 skeleton rounded" /></div></div>;
  }

  if (!collection) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center"><p className="font-poem text-xl text-text-tertiary italic">Collection not found.</p></div></div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <Link href="/collections" className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={14} strokeWidth={1.5} /> Collections
        </Link>

        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">{collection.title}</h1>
          {collection.description && <p className="text-sm text-text-secondary mb-2">{collection.description}</p>}
          <p className="text-xs text-text-tertiary">{poems.length} {poems.length === 1 ? "poem" : "poems"}</p>
        </div>

        <button onClick={() => setShowAddPoem(!showAddPoem)} className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors mb-6">
          <Plus size={12} strokeWidth={2} /> Add poem
        </button>

        {showAddPoem && (
          <AddPoemSelector onSelect={handleAddPoem} existingIds={poems.map((p) => p.id)} onClose={() => setShowAddPoem(false)} />
        )}

        {poems.length > 0 ? (
          poems.map((poem) => (
            <div key={poem.id} className="relative">
              <PoemCard poem={poem} />
              <button onClick={() => handleRemovePoem(poem.id)} className="absolute top-3 right-3 text-xs text-text-tertiary hover:text-error transition-colors">Remove</button>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">This collection is waiting for its first poem.</p>
            <button onClick={() => setShowAddPoem(true)} className="text-sm font-medium text-brand hover:text-brand-hover transition-colors">Add a poem</button>
          </div>
        )}
      </main>
      <MobileNav />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function AddPoemSelector({ onSelect, existingIds, onClose }: { onSelect: (id: string) => void; existingIds: string[]; onClose: () => void }) {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("poems").select("*, profiles!inner(*)").eq("status", "published").order("created_at", { ascending: false }).limit(30).then(({ data }) => {
      setPoems((data as PoemWithAuthor[]) || []);
      setLoading(false);
    });
  }, []);

  const available = poems.filter((p) => !existingIds.includes(p.id));

  return (
    <div className="mb-6 p-4 bg-surface border border-border-subtle rounded-[var(--radius-lg)] animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-text-primary">Add a poem</p>
        <button onClick={onClose} className="text-xs text-text-tertiary hover:text-text-primary">Close</button>
      </div>
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 skeleton rounded" />)}</div>
      ) : available.length > 0 ? (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {available.map((poem) => (
            <button key={poem.id} onClick={() => onSelect(poem.id)} className="w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors">
              <p className="text-sm font-medium text-text-primary truncate">{poem.title}</p>
              <p className="text-xs text-text-tertiary truncate">{poem.content.slice(0, 60)}...</p>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary py-4 text-center">No more poems available.</p>
      )}
    </div>
  );
}
