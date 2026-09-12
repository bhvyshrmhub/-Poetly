"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center animate-fade-in">
        <p className="font-poem-title text-5xl md:text-6xl text-text-tertiary mb-4">✦</p>
        <h1 className="font-poem text-xl md:text-2xl text-text-primary mb-2">
          Something went wrong.
        </h1>
        <p className="text-sm text-text-tertiary mb-8 max-w-sm mx-auto">
          An unexpected error occurred. Please try again.
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
