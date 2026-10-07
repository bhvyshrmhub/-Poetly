"use client";

import React from "react";
import Link from "next/link";
import { Library, BookOpen } from "lucide-react";
import { Collection } from "@/lib/types";

export interface CollectionCardProps {
  collection: Collection;
  poemCount?: number;
  className?: string;
}

export default function CollectionCard({
  collection,
  poemCount,
  className = "",
}: CollectionCardProps) {
  const count =
    poemCount !== undefined
      ? poemCount
      : ((collection as unknown as { collection_poems?: unknown[] }).collection_poems?.length) || 0;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className={`group block p-5 rounded-[var(--radius-lg)] bg-surface border border-border-subtle hover:border-brand/40 hover:bg-surface-hover/50 transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-brand">
          <Library size={18} strokeWidth={1.75} />
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
            Collection
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-text-tertiary bg-surface-secondary px-2.5 py-1 rounded-full border border-border-subtle/50">
          <BookOpen size={12} />
          <span>
            {count} {count === 1 ? "poem" : "poems"}
          </span>
        </span>
      </div>

      <h3 className="font-poem text-lg sm:text-xl font-medium text-text-primary group-hover:text-brand transition-colors mb-1.5">
        {collection.title}
      </h3>

      {collection.description && (
        <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 mb-3">
          {collection.description}
        </p>
      )}

      <p className="text-[11px] text-text-tertiary pt-2 border-t border-border-subtle/40">
        Created {new Date(collection.created_at).toLocaleDateString()}
      </p>
    </Link>
  );
}
