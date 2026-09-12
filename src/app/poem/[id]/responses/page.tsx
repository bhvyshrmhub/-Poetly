"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";

interface ResponseData {
  original: Record<string, unknown>;
  author: Record<string, unknown>;
}

export default function PoemResponsesPage() {
  const params = useParams();
  const poemId = params.id as string;
  const [parentPoem, setParentPoem] = useState<PoemWithAuthor | null>(null);
  const [responses, setResponses] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const { data: parent } = await supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("id", poemId)
        .single();

      setParentPoem(parent as PoemWithAuthor);

      const { data: responseData } = await supabase
        .from("responses")
        .select("*, author:profiles!inner(*), original:poems!response_id(*)")
        .eq("original_poem_id", poemId)
        .order("created_at", { ascending: false });

      if (responseData) {
        const formattedResponses: PoemWithAuthor[] = (responseData as ResponseData[]).map((r) => ({
          ...(r.original as unknown as PoemWithAuthor),
          profiles: r.author as unknown as PoemWithAuthor["profiles"],
        }));
        setResponses(formattedResponses);
      }
    } catch {
      // Failed to load responses — will show empty state
    }

    setLoading(false);
  }, [poemId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12">
        <Link href={`/poem/${poemId}`} className="text-xs text-text-tertiary hover:text-text-primary transition-colors mb-6 block">
          Back to poem
        </Link>

        <div className="mb-8">
          <h1 className="font-poem text-xl text-text-primary mb-1">Responses</h1>
          {parentPoem && (
            <p className="text-sm text-text-secondary">
              Responding to &ldquo;{parentPoem.title || "Untitled"}&rdquo; by {parentPoem.profiles.display_name}
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-[var(--radius-md)]" />)}
          </div>
        ) : responses.length > 0 ? (
          responses.map((poem) => <PoemCard key={poem.id} poem={poem} />)
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">No responses yet.</p>
            <p className="text-sm text-text-tertiary">Be the first to respond with a poem.</p>
          </div>
        )}
      </main>
    </div>
  );
}
