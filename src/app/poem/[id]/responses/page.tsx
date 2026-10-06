"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/shell/AppShell";

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

      const { data: responseLinks } = await supabase
        .from("responses")
        .select("response_poem_id")
        .eq("original_poem_id", poemId)
        .order("created_at", { ascending: false });

      if (responseLinks && responseLinks.length > 0) {
        const poemIds = responseLinks.map((r) => r.response_poem_id);
        const { data: poemData } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .in("id", poemIds)
          .eq("status", "published");

        // Preserve chronological order of responses
        const poemMap = new Map((poemData || []).map((p) => [p.id, p]));
        const ordered = poemIds.map((id) => poemMap.get(id)).filter(Boolean) as PoemWithAuthor[];
        setResponses(ordered);
      } else {
        setResponses([]);
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
    <AppShell>
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <Link
          href={`/poem/${poemId}`}
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to original poem
        </Link>

        <div className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Poetic Conversation</h1>
            {parentPoem && (
              <p className="text-sm text-text-secondary">
                Responses to &ldquo;{parentPoem.title || "Untitled"}&rdquo; by {parentPoem.profiles.display_name}
              </p>
            )}
          </div>
          <Link
            href={`/poem/${poemId}/respond`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white gradient-brand rounded-full hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <PenLine size={13} strokeWidth={2} /> Write a Response
          </Link>
        </div>

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 skeleton rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : responses.length > 0 ? (
          <div className="space-y-2">
            {responses.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">No responses yet.</p>
            <p className="text-sm text-text-secondary mb-6">
              A response is not a comment. It is a poem written in conversation.
            </p>
            <Link
              href={`/poem/${poemId}/respond`}
              className="inline-flex items-center gap-2 px-5 py-2.5 gradient-brand text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              <PenLine size={14} /> Be the first to respond
            </Link>
          </div>
        )}
      </main>
    </AppShell>
  );
}
