"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";

export default function WritingCTA() {
  return (
    <div className="space-y-6">
      <div className="writing-cta-card">
        <div className="relative z-10">
          <h3 className="font-poem text-xl text-text-primary mb-2">
            Have something to say?
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Write it.
          </p>
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity"
            style={{ background: "var(--brand-primary)" }}
          >
            <PenLine size={15} strokeWidth={2} />
            <span>Start Writing</span>
          </Link>
        </div>
      </div>

      <div className="quote-card">
        <p className="quote-text">
          &ldquo;A softer,<br />
          more honest<br />
          internet.&rdquo;
        </p>
        <p className="quote-author">— Poetly</p>
      </div>
    </div>
  );
}
