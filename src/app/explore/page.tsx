"use client";

import { poems, writers, collections, moods, tags } from "@/lib/mock-data";
import PoemCard from "@/components/PoemCard";
import WriterCard from "@/components/WriterCard";
import CollectionCard from "@/components/CollectionCard";
import MoodTag from "@/components/MoodTag";
import SectionHeader from "@/components/SectionHeader";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function ExplorePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-16 pb-24 md:pb-16">
        <div className="mb-12 animate-fade-in">
          <h1 className="font-editorial text-3xl md:text-4xl text-foreground mb-2">
            Explore
          </h1>
          <p className="text-text-secondary">
            Discover poetry that moves you.
          </p>
        </div>

        {/* Trending Poems */}
        <section className="mb-16">
          <SectionHeader title="Trending Poems" />
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {poems.slice(0, 4).map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        </section>

        {/* New Poems */}
        <section className="mb-16">
          <SectionHeader title="New Poems" />
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {poems.slice(4, 8).map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        </section>

        {/* Featured Writers */}
        <section className="mb-16">
          <SectionHeader title="Featured Writers" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {writers.map((writer) => (
              <WriterCard key={writer.id} writer={writer} showBio={false} />
            ))}
          </div>
        </section>

        {/* Collections */}
        <section className="mb-16">
          <SectionHeader title="Collections" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </section>

        {/* Explore by Mood */}
        <section className="mb-16">
          <SectionHeader title="Explore by Mood" />
          <div className="flex flex-wrap gap-3">
            {moods.map((mood) => (
              <MoodTag key={mood.slug} {...mood} />
            ))}
          </div>
        </section>

        {/* Explore by Tags */}
        <section className="mb-16">
          <SectionHeader title="Explore by Tags" />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-xs text-text-secondary border border-border rounded-full hover:border-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
