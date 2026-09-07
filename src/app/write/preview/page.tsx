"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

function PreviewContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "";
  const content = searchParams.get("content") || "";

  return (
    <div className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-12">
        <Link
          href="/write"
          className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Edit
        </Link>
        <div className="flex items-center gap-2">
          <button className="text-xs text-text-tertiary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full border border-border-subtle hover:border-border-default">
            Save Draft
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-hover px-4 py-2 rounded-full transition-colors">
            Publish
          </button>
        </div>
      </div>

      <div className="animate-fade-in">
        <h1 className="font-poem-title text-3xl md:text-[2.75rem] text-text-primary mb-10">
          {title || "Untitled"}
        </h1>
        <div className="poem-content-lg text-text-primary/85">
          {content || "Your poem will appear here..."}
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center">
          <p className="text-sm text-text-tertiary">Loading preview...</p>
        </div>
      }>
        <PreviewContent />
      </Suspense>
    </div>
  );
}
