"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Prompt, PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function PromptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: promptData } = await supabase.from("prompts").select("*").eq("id", id).single();
    setPrompt(promptData as Prompt);

    if (promptData) {
      const { data: poemData } = await supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("prompt_id", id)
        .order("created_at", { ascending: false });
      setPoems((poemData as PoemWithAuthor[]) || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-8"><div className="w-48 h-6 skeleton rounded mb-4" /><div className="w-full h-20 skeleton rounded" /></div></div>;
  }

  if (!prompt) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center"><p className="font-poem text-xl text-text-tertiary italic">Prompt not found.</p></div></div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <Link href="/prompts" className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={14} strokeWidth={1.5} /> Prompts
        </Link>

        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              prompt.is_active ? "bg-success-subtle text-success" : "bg-surface-secondary text-text-tertiary"
            }`}>
              {prompt.is_active ? "Active" : "Ended"}
            </span>
            <span className="text-xs text-text-tertiary">{new Date(prompt.created_at).toLocaleDateString()}</span>
          </div>

          <h1 className="font-poem-title text-3xl md:text-4xl text-text-primary mb-4">{prompt.title}</h1>

          {prompt.description && (
            <p className="text-lg text-text-secondary leading-relaxed mb-6 font-poem">{prompt.description}</p>
          )}

          {prompt.is_active && (
            <Link
              href={`/write?prompt=${prompt.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 gradient-brand text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity"
            >
              <PenLine size={14} strokeWidth={2} /> Write for this Prompt
            </Link>
          )}
        </div>

        <div className="border-t border-border-subtle pt-8">
          <h2 className="font-poem text-lg font-medium text-text-primary mb-6">
            Poems inspired by this prompt
            {poems.length > 0 && <span className="text-text-tertiary ml-2">({poems.length})</span>}
          </h2>

          {poems.length > 0 ? (
            poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
          ) : (
            <div className="text-center py-12">
              <p className="font-poem text-lg text-text-tertiary italic mb-2">No poems yet for this prompt.</p>
              <p className="text-sm text-text-tertiary">Be the first to respond.</p>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
