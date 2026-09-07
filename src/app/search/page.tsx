"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { poems, writers, collections, tags } from "@/lib/mock-data";
import PoemCard from "@/components/PoemCard";
import WriterCard from "@/components/WriterCard";
import CollectionCard from "@/components/CollectionCard";
import Navbar from "@/components/Navbar";

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
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-editorial text-3xl md:text-4xl text-foreground mb-6">
            Search
          </h1>

          {/* Search input */}
          <div className="relative mb-8">
            <SearchIcon
              size={18}
              strokeWidth={1.5}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search poems, writers, collections..."
              className="w-full bg-transparent border-b border-border focus:border-accent outline-none pl-7 py-3 text-sm text-foreground placeholder:text-text-tertiary"
              autoFocus
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-border-light mb-8">
            {(["poems", "writers", "collections", "tags"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "text-foreground border-foreground font-medium"
                    : "text-text-tertiary border-transparent hover:text-text-secondary"
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
                  <p className="text-sm text-text-tertiary py-8 text-center">
                    Start typing to search poems...
                  </p>
                ) : filteredPoems.length > 0 ? (
                  filteredPoems.map((poem) => (
                    <PoemCard key={poem.id} poem={poem} />
                  ))
                ) : (
                  <p className="text-sm text-text-tertiary py-8 text-center">
                    No poems found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </div>
            )}

            {activeTab === "writers" && (
              <div className="space-y-4">
                {query === "" ? (
                  <p className="text-sm text-text-tertiary py-8 text-center">
                    Start typing to search writers...
                  </p>
                ) : filteredWriters.length > 0 ? (
                  filteredWriters.map((writer) => (
                    <WriterCard key={writer.id} writer={writer} />
                  ))
                ) : (
                  <p className="text-sm text-text-tertiary py-8 text-center">
                    No writers found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </div>
            )}

            {activeTab === "collections" && (
              <div className="space-y-4">
                {query === "" ? (
                  <p className="text-sm text-text-tertiary py-8 text-center">
                    Start typing to search collections...
                  </p>
                ) : filteredCollections.length > 0 ? (
                  filteredCollections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))
                ) : (
                  <p className="text-sm text-text-tertiary py-8 text-center">
                    No collections found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </div>
            )}

            {activeTab === "tags" && (
              <div className="flex flex-wrap gap-2">
                {query === "" ? (
                  <p className="text-sm text-text-tertiary py-8 text-center w-full">
                    Start typing to search tags...
                  </p>
                ) : filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-xs text-text-secondary border border-border rounded-full hover:border-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-text-tertiary py-8 text-center w-full">
                    No tags found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
