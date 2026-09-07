"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/home");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  // Public discovery for logged-out users
  return <PublicDiscovery />;
}

function PublicDiscovery() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 max-w-[var(--max-width)] mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] gradient-brand flex items-center justify-center">
            <span className="text-white text-sm font-semibold">P</span>
          </div>
          <span className="font-display text-xl text-text-primary">Poetly</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5">
            Log in
          </Link>
          <Link href="/signup" className="text-sm font-medium text-white bg-brand hover:bg-brand-hover px-4 py-2 rounded-[var(--radius-full)] transition-colors">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-10 max-w-[var(--max-width)] mx-auto">
        <div className="animate-fade-in max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-brand" />
            <p className="text-xs font-medium text-brand tracking-widest uppercase">
              Write what you cannot say.
            </p>
          </div>
          <h1 className="font-editorial text-4xl md:text-6xl lg:text-[4.5rem] text-text-primary mb-6 leading-[1.1]">
            A quiet place on the
            <br />
            internet where words
            <br />
            feel <span className="gradient-text italic">beautiful</span>.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-xl mb-10 leading-relaxed">
            Poetly is a social platform for poetry, creative writing, and emotional expression.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 gradient-brand text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity shadow-sm"
            >
              Start Writing
            </Link>
            <Link
              href="/trending"
              className="inline-flex items-center justify-center px-6 py-3 border border-border-default text-text-primary text-sm font-medium rounded-[var(--radius-full)] hover:border-brand hover:text-brand transition-colors"
            >
              Explore Poems
            </Link>
          </div>
        </div>
      </section>

      {/* What happens here */}
      <section className="py-20 px-6 md:px-10 max-w-[var(--max-width)] mx-auto border-t border-border-subtle">
        <p className="text-[11px] font-medium text-brand tracking-widest uppercase mb-14 text-center">
          What happens here
        </p>
        <div className="grid md:grid-cols-3 gap-10 md:gap-14 stagger-children">
          {[
            { num: "01", title: "Read", desc: "Discover poems that move you. Read them slowly, in a space designed for attention." },
            { num: "02", title: "Write", desc: "Enter a private writing space. Put words to what you carry. Let them become poems." },
            { num: "03", title: "Respond", desc: "Not with a comment. With a poem. Let one voice inspire another." },
          ].map((item) => (
            <div key={item.num} className="text-center">
              <p className="text-xs font-medium text-brand mb-3">{item.num}</p>
              <h3 className="font-poem text-2xl font-medium text-text-primary mb-3">{item.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 md:px-10 text-center border-t border-border-subtle">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-editorial text-3xl md:text-5xl text-text-primary mb-6 leading-tight">
            Write something
            <br />
            worth leaving behind.
          </h2>
          <p className="text-text-secondary mb-8">Your words deserve a place of their own.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 gradient-brand text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity shadow-sm"
          >
            Start Writing
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 md:px-10 border-t border-border-subtle">
        <div className="max-w-[var(--max-width)] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[4px] gradient-brand flex items-center justify-center">
              <span className="text-white text-[8px] font-semibold">P</span>
            </div>
            <span className="font-display text-sm text-text-tertiary">Poetly</span>
          </div>
          <div className="flex gap-6 text-xs text-text-tertiary">
            <Link href="/trending" className="hover:text-text-primary transition-colors">Trending</Link>
            <Link href="/login" className="hover:text-text-primary transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
