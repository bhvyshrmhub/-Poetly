"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d0d11] text-[#f0ede8] flex items-center justify-center px-5 font-sans">
        <div className="text-center animate-fade-in max-w-md mx-auto">
          <p className="text-5xl text-[#d67fa1] mb-4">✦</p>
          <h1 className="text-xl md:text-2xl font-serif text-[#f0ede8] mb-2">
            Something went wrong.
          </h1>
          <p className="text-sm text-[#9e9aa7] mb-8">
            An unexpected error occurred. Please try again.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#d67fa1] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
            <Link
              href="/home"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-[#33303c] text-[#f0ede8] text-sm font-medium rounded-full hover:border-[#d67fa1] transition-colors"
            >
              Return home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
