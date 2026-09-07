"use client";

import { Collection } from "@/lib/types";
import Link from "next/link";

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link href={`/collections/${collection.id}`} className="group block">
      <div className="py-4">
        <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-accent transition-colors mb-1">
          {collection.title}
        </h3>
        <p className="text-xs text-text-tertiary mb-2">
          {collection.poemCount} poems · {collection.author.name}
        </p>
        <p className="text-sm text-text-secondary line-clamp-2">
          {collection.description}
        </p>
      </div>
    </Link>
  );
}
