"use client";

import { writers, poems } from "@/lib/mock-data";
import { useState } from "react";
import PoemCard from "@/components/PoemCard";
import FollowButton from "@/components/FollowButton";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function ProfilePage() {
  const writer = writers[0];
  const [activeTab, setActiveTab] = useState<"poems" | "collections" | "about">("poems");
  const writerPoems = poems.filter((p) => p.author.id === writer.id);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        {/* Profile header */}
        <div className="animate-fade-in mb-8">
          <div className="flex items-start gap-4 mb-5">
            {/* Square avatar */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[var(--radius-md)] bg-brand-subtle flex items-center justify-center flex-shrink-0">
              <span className="text-brand font-display text-2xl font-medium">
                {writer.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-poem text-xl font-medium text-text-primary">
                    {writer.name}
                  </h1>
                  <p className="text-sm text-text-tertiary">{writer.handle}</p>
                </div>
                <FollowButton />
              </div>
            </div>
          </div>

          <p className="text-sm text-text-secondary italic mb-4 max-w-md">
            &ldquo;{writer.bio}&rdquo;
          </p>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-medium text-text-primary">{writer.poemCount}</span>{" "}
              <span className="text-text-tertiary">Poems</span>
            </div>
            <div>
              <span className="font-medium text-text-primary">{writer.followers}</span>{" "}
              <span className="text-text-tertiary">Followers</span>
            </div>
            <div>
              <span className="font-medium text-text-primary">{writer.following}</span>{" "}
              <span className="text-text-tertiary">Following</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1">
          {(["poems", "collections", "about"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 capitalize ${
                activeTab === tab
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
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
              <p className="text-sm text-text-tertiary py-12 text-center">
                No poems yet.
              </p>
            )}
          </div>
        )}

        {activeTab === "collections" && (
          <div>
            <p className="text-sm text-text-tertiary py-12 text-center">
              Collections coming soon.
            </p>
          </div>
        )}

        {activeTab === "about" && (
          <div className="py-4">
            <p className="font-poem text-lg text-text-primary italic mb-4">
              &ldquo;{writer.bio}&rdquo;
            </p>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md">
              {writer.name} is a poet and writer. They have published {writer.poemCount} poems
              and have {writer.followers} followers on Poetly.
            </p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
