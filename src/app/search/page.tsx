"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { poems, writers, collections, tags } from "@/lib/mock-data";
import PoemCard from "@/components/PoemCard";
import WriterCard from "@/components/WriterCard";
import CollectionCard from "@/components/CollectionCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"poems" | "writers" | "collections" | "tags">("poems");

  const filteredPoems = poems.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.content.toLowerCase().includes(query.toLowerCase())
  );

  const filteredWriters = writers.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.handle.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCollections = collections.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTags = tags.filter((t) =>
    t.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-4">
            Search
          </h1>

          {/* Search input */}
          <div className="relative mb-6">
            <SearchIcon
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search poems, writers, collections..."
              className="w-full bg-surface border border-border-subtle focus:border-brand rounded-[var(--radius-md)] outline-none pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors"
              autoFocus
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1">
            {(["poems", "writers", "collections", "tags"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-full transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Results */}
          <div>
            {activeTab === "poems" && (
              <div>
                {query === "" ? (
                  <p className="text-sm text-text-tertiary py-12 text-center">
                    Start typing to search poems...
                  </p>
                ) : filteredPoems.length > 0 ? (
                  filteredPoems.map((poem) => (
                    <PoemCard key={poem.id} poem={poem} />
                  ))
                ) : (
                  <p className="text-sm text-text-tertiary py-12 text-center">
                    No poems found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </div>
            )}

            {activeTab === "writers" && (
              <div className="space-y-1">
                {query === "" ? (
                  <p className="text-sm text-text-tertiary py-12 text-center">
                    Start typing to search writers...
                  </p>
                ) : filteredWriters.length > 0 ? (
                  filteredWriters.map((writer) => (
                    <WriterCard key={writer.id} writer={writer} />
                  ))
                ) : (
                  <p className="text-sm text-text-tertiary py-12 text-center">
                    No writers found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </div>
            )}

            {activeTab === "collections" && (
              <div>
                {query === "" ? (
                  <p className="text-sm text-text-tertiary py-12 text-center">
                    Start typing to search collections...
                  </p>
                ) : filteredCollections.length > 0 ? (
                  filteredCollections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))
                ) : (
                  <p className="text-sm text-text-tertiary py-12 text-center">
                    No collections found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </div>
            )}

            {activeTab === "tags" && (
              <div className="flex flex-wrap gap-2">
                {query === "" ? (
                  <p className="text-sm text-text-tertiary py-12 text-center w-full">
                    Start typing to search tags...
                  </p>
                ) : filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-xs text-text-secondary bg-surface border border-border-subtle rounded-full hover:border-brand/40 hover:text-brand transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-text-tertiary py-12 text-center w-full">
                    No tags found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
