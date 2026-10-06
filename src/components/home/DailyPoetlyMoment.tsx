"use client";

import Link from "next/link";
import { dailyMoment } from "@/lib/moments";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DailyPoetlyMoment() {
  const [moment] = useState(() => dailyMoment());
  const [activePrompt, setActivePrompt] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("prompts")
          .select("id, title")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setActivePrompt(data);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="daily-moment-card mb-6">
      <div className="relative z-10">
        <p className="font-poem text-lg text-text-primary mb-2">
          {moment.sub}
        </p>
        <p className="font-poem text-xl text-text-primary leading-relaxed mb-4">
          {moment.line}
        </p>
        <p className="text-sm text-text-secondary italic mb-6">
          — Poetly
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <div className="min-w-0 pr-3">
            <p className="text-[10px] font-medium text-brand tracking-widest uppercase mb-1">
              Today&apos;s Prompt
            </p>
            <p className="text-sm text-text-secondary font-poem italic truncate">
              &ldquo;{activePrompt ? activePrompt.title : "Write about a place that feels like home."}&rdquo;
            </p>
          </div>
          <Link
            href={activePrompt ? `/prompts/${activePrompt.id}` : "/prompts"}
            className="flex items-center gap-1 text-sm text-brand hover:text-brand-hover transition-colors flex-shrink-0"
          >
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
