"use client";

import { writers, poems } from "@/lib/mock-data";
import { useState } from "react";
import PoemCard from "@/components/PoemCard";
import FollowButton from "@/components/FollowButton";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function ProfilePage() {
  const writer = writers[0]; // Default to Maya
  const [activeTab, setActiveTab] = useState<"poems" | "collections" | "about">("poems");
  const writerPoems = poems.filter((p) => p.author.id === writer.id);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16 pb-24 md:pb-16">
        {/* Profile header */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-muted flex items-center justify-center">
              <span className="text-accent font-serif text-xl font-semibold">
                {writer.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <h1 className="font-serif text-xl font-medium text-foreground">
                {writer.handle}
              </h1>
              <p className="text-sm text-text-secondary italic mt-0.5">
                &ldquo;{writer.bio}&rdquo;
              </p>
            </div>
          </div>
          <FollowButton />
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-8 text-sm">
          <div>
            <span className="font-medium text-foreground">{writer.poemCount}</span>{" "}
            <span className="text-text-tertiary">Poems</span>
          </div>
          <div>
            <span className="font-medium text-foreground">{writer.followers}</span>{" "}
            <span className="text-text-tertiary">Followers</span>
          </div>
          <div>
            <span className="font-medium text-foreground">{writer.following}</span>{" "}
            <span className="text-text-tertiary">Following</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border-light mb-8">
          {(["poems", "collections", "about"] as const).map((tab) => (
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

        {/* Tab content */}
        {activeTab === "poems" && (
          <div>
            {writerPoems.length > 0 ? (
              writerPoems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))
            ) : (
              <p className="text-sm text-text-tertiary py-8 text-center">
                No poems yet.
              </p>
            )}
          </div>
        )}

        {activeTab === "collections" && (
          <div className="space-y-4">
            <p className="text-sm text-text-tertiary py-8 text-center">
              Collections coming soon.
            </p>
          </div>
        )}

        {activeTab === "about" && (
          <div className="py-4">
            <p className="font-serif text-lg text-foreground italic mb-4">
              &ldquo;{writer.bio}&rdquo;
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {writer.name} is a poet and writer. They have published {writer.poemCount} poems
              on this platform and have {writer.followers} followers.
            </p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
