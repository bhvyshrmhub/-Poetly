"use client";

import { Collection } from "@/lib/types";
import Link from "next/link";

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link href={`/collections/${collection.id}`} className="group block">
      <div className="py-4 border-b border-border-subtle last:border-0">
        <h3 className="font-poem text-lg font-medium text-text-primary group-hover:text-brand transition-colors mb-1">{collection.title}</h3>
        {collection.description && <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{collection.description}</p>}
      </div>
    </Link>
  );
}
