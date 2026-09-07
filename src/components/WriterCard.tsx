"use client";

import Link from "next/link";
import { Writer } from "@/lib/types";

interface WriterCardProps {
  writer: Writer;
  showBio?: boolean;
}

export default function WriterCard({ writer, showBio = true }: WriterCardProps) {
  const initials = writer.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Link href={`/profile?id=${writer.id}`} className="group block">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
          <span className="text-accent font-serif text-sm font-semibold">
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-foreground group-hover:text-accent transition-colors truncate">
            {writer.name}
          </p>
          <p className="text-xs text-text-tertiary">{writer.handle}</p>
          {showBio && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-1">
              {writer.bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
