"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Prompt } from "@/lib/types";
import Navbar from "@/components/Navbar";

export default function PromptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("prompts").select("*").eq("id", id).single().then(({ data }) => {
      setPrompt(data as Prompt);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-8"><div className="w-48 h-6 skeleton rounded mb-4" /></div></div>;
  }

  if (!prompt) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center"><p className="font-poem text-xl text-text-tertiary italic">Prompt not found.</p></div></div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-6 md:py-10">
        <Link href="/prompts" className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={14} strokeWidth={1.5} /> Prompts
        </Link>

        <div className="mb-10 animate-fade-in">
          <p className="text-[11px] font-medium text-brand tracking-widest uppercase mb-4">Writing Prompt</p>
          <h1 className="font-poem-title text-2xl md:text-3xl text-text-primary mb-3 italic">&ldquo;{prompt.title}&rdquo;</h1>
          {prompt.description && <p className="text-sm text-text-secondary mb-3 max-w-md leading-relaxed">{prompt.description}</p>}
          <Link href="/write" className="inline-flex items-center justify-center px-5 py-2.5 gradient-brand text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
            Write a poem
          </Link>
        </div>
      </main>
    </div>
  );
}
