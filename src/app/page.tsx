"use client";

import Link from "next/link";
import { poems, writers } from "@/lib/mock-data";
import WriterCard from "@/components/WriterCard";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
        <div className="animate-fade-in">
          <p className="text-xs tracking-[0.3em] uppercase text-text-tertiary mb-8">
            A quiet space for poetry
          </p>
          <h1 className="font-editorial text-4xl md:text-6xl lg:text-7xl text-foreground mb-8 leading-tight">
            Words deserve
            <br />
            a place of their own.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-xl mb-12 leading-relaxed">
            A quiet space to read, write, and respond to poetry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/write"
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors"
            >
              Start Writing
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-6 py-3 border border-border text-sm font-medium rounded-full hover:border-foreground transition-colors"
            >
              Explore Poems
            </Link>
          </div>
        </div>

        <div className="mt-24 md:mt-32 animate-fade-in-up">
          <p className="text-xs text-text-tertiary tracking-widest uppercase mb-8">
            Featured Poem
          </p>
          <Link href={`/poem/${poems[3].id}`} className="group block">
            <h2 className="font-poem-title text-3xl md:text-4xl lg:text-5xl mb-6 text-foreground group-hover:text-accent transition-colors">
              {poems[3].title}
            </h2>
            <div className="poem-content-lg text-foreground/85 mb-6">
              {poems[3].content}
            </div>
            <p className="text-sm text-text-secondary">
              — {poems[3].author.name}
            </p>
          </Link>
        </div>
      </section>

      {/* What happens here */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto border-t border-border-light">
        <p className="text-xs tracking-[0.3em] uppercase text-text-tertiary mb-16 text-center">
          What happens here
        </p>
        <div className="grid md:grid-cols-3 gap-12 md:gap-16 stagger-children">
          <div className="text-center">
            <p className="font-editorial text-4xl md:text-5xl text-accent mb-4">1</p>
            <h3 className="font-serif text-2xl font-medium text-foreground mb-3">Read</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Discover poems that move you. Read them slowly, in a space designed for attention.
            </p>
          </div>
          <div className="text-center">
            <p className="font-editorial text-4xl md:text-5xl text-accent mb-4">2</p>
            <h3 className="font-serif text-2xl font-medium text-foreground mb-3">Write</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Enter a private writing space. Put words to what you carry. Let them become poems.
            </p>
          </div>
          <div className="text-center">
            <p className="font-editorial text-4xl md:text-5xl text-accent mb-4">3</p>
            <h3 className="font-serif text-2xl font-medium text-foreground mb-3">Respond</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Not with a comment. With a poem. Let one voice inspire another.
            </p>
          </div>
        </div>
      </section>

      {/* Featured writers */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto border-t border-border-light">
        <p className="text-xs tracking-[0.3em] uppercase text-text-tertiary mb-16 text-center">
          Featured Writers
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {writers.map((writer) => (
            <WriterCard key={writer.id} writer={writer} />
          ))}
        </div>
      </section>

      {/* Poetry styles preview */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto border-t border-border-light">
        <p className="text-xs tracking-[0.3em] uppercase text-text-tertiary mb-16 text-center">
          Poetry Preview
        </p>
        <div className="space-y-16 stagger-children">
          {poems.slice(0, 3).map((poem) => (
            <div key={poem.id} className="text-center">
              <Link href={`/poem/${poem.id}`} className="group block">
                <h3 className="font-poem-title text-2xl md:text-3xl mb-4 text-foreground group-hover:text-accent transition-colors">
                  {poem.title}
                </h3>
                <div className="poem-content mx-auto text-foreground/80">
                  {poem.content}
                </div>
                <p className="text-sm text-text-secondary mt-4">
                  — {poem.author.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 md:px-12 lg:px-24 text-center border-t border-border-light">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-editorial text-3xl md:text-5xl text-foreground mb-8 leading-tight">
            Write something
            <br />
            worth leaving behind.
          </h2>
          <Link
            href="/write"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors"
          >
            Start Writing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-border-light">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-serif text-sm text-text-tertiary">
            Poetry Platform
          </p>
          <div className="flex gap-6 text-xs text-text-tertiary">
            <Link href="/home" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <Link href="/write" className="hover:text-foreground transition-colors">Write</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
