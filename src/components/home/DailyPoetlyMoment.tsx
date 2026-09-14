"use client";

import Link from "next/link";
import { dailyMoment } from "@/lib/moments";
import { useState } from "react";

export default function DailyPoetlyMoment() {
  const [moment] = useState(() => dailyMoment());

  return (
    <div className="daily-moment-card">
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
          <div>
            <p className="text-[10px] font-medium text-brand tracking-widest uppercase mb-1">
              Today&apos;s Prompt
            </p>
            <p className="text-sm text-text-secondary font-poem italic">
              &ldquo;Write about a place that feels like home.&rdquo;
            </p>
          </div>
          <Link
            href="/prompts"
            className="flex items-center gap-1 text-sm text-brand hover:text-brand-hover transition-colors"
          >
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
