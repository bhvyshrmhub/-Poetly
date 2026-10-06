"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5">
      <div className="text-center animate-fade-in max-w-md mx-auto">
        <p className="font-poem-title text-5xl md:text-6xl text-brand mb-4">✦</p>
        <h1 className="font-poem text-xl md:text-2xl text-text-primary mb-2">
          Something went wrong.
        </h1>
        <p className="text-sm text-text-tertiary mb-8">
          The page encountered an error. Please try again or return home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 gradient-brand text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/home"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-border-default text-text-primary text-sm font-medium rounded-[var(--radius-full)] hover:border-brand hover:text-brand transition-colors"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
