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
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-6 md:py-10">
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Collections
        </Link>

        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem-title text-2xl md:text-3xl text-text-primary mb-2">
            {collection.title}
          </h1>
          <p className="text-sm text-text-secondary mb-3">
            {collection.description}
          </p>
          <div className="flex items-center gap-2.5 text-xs text-text-tertiary">
            <div className="w-5 h-5 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center">
              <span className="text-brand text-[9px] font-display font-medium">
                {collection.author.name[0]}
              </span>
            </div>
            <span>{collection.author.name}</span>
            <span className="w-1 h-1 rounded-full bg-text-tertiary/40" />
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
