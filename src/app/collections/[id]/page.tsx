"use client";

import { useParams } from "next/navigation";
import { collections } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";

export default function CollectionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const collection = collections.find((c) => c.id === id) || collections[0];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Collections
        </Link>

        <div className="mb-10 animate-fade-in">
          <h1 className="font-poem-title text-3xl md:text-4xl text-foreground mb-3">
            {collection.title}
          </h1>
          <p className="text-sm text-text-secondary mb-4">
            {collection.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-text-tertiary">
            <div className="w-5 h-5 rounded-full bg-accent-muted flex items-center justify-center">
              <span className="text-accent text-[8px] font-serif font-semibold">
                {collection.author.name[0]}
              </span>
            </div>
            <span>{collection.author.name}</span>
            <span>·</span>
            <span>{collection.poemCount} poems</span>
          </div>
        </div>

        <div>
          {collection.poems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      </main>
    </div>
  );
}
